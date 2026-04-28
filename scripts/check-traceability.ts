import fs from "node:fs";
import path from "node:path";
import {
  extractFrontmatter,
  failIfErrors,
  parseSimpleYaml,
  readText,
  relativeToRoot,
  walkFiles,
} from "./lib/repo.js";
import {
  traceabilityIdDefinitionPattern,
  traceabilityIdPattern,
  traceabilityItemHeadingPattern,
  traceabilityTableItemPattern,
  workflowArtifacts,
} from "./lib/workflow-schema.js";

const fieldPattern = /^-\s+\*\*(Satisfies|Depends on|Links|Requirement):\*\*\s+(.+)$/gim;
const errors: string[] = [];

export type ArtifactRecord = {
  filePath: string;
  rel: string;
  artifact: string;
  text: string;
};

type DefinitionRecord = ArtifactRecord & {
  id: string;
  kind: string;
};

export type ItemSection = {
  id: string;
  kind: string;
  body: string;
};

for (const statePath of workflowStateFiles()) {
  validateFeatureTraceability(statePath);
}

failIfErrors(errors, "check:traceability");

function workflowStateFiles(): string[] {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath: string): boolean {
  return path.basename(filePath) === "workflow-state.md";
}

function validateFeatureTraceability(statePath: string): void {
  const stateRel = relativeToRoot(statePath);
  const featureDir = path.dirname(statePath);
  const stateFrontmatter = extractFrontmatter(readText(statePath));
  if (!stateFrontmatter) {
    errors.push(`${stateRel} is missing YAML frontmatter`);
    return;
  }

  const state = parseSimpleYaml(stateFrontmatter.raw);
  const area = String(state.area || "");
  if (!area) {
    errors.push(`${stateRel} missing frontmatter key: area`);
    return;
  }

  const registry = new Map<string, DefinitionRecord>();
  const artifactRecords = existingArtifactRecords(featureDir);

  for (const record of artifactRecords) {
    validateDocumentFrontmatter(record, state);
    collectDocumentDefinition(record, area, registry);
    collectHeadingDefinitions(record, area, registry);
    collectTableDefinitions(record, area, registry);
    validateIdAreas(record, area);
  }

  for (const record of artifactRecords) {
    validateTraceFields(record, registry);
  }
}

function existingArtifactRecords(featureDir: string): ArtifactRecord[] {
  return workflowArtifacts
    .map((artifact) => path.join(featureDir, artifact))
    .filter((filePath) => fs.existsSync(filePath))
    .map((filePath) => ({
      filePath,
      rel: relativeToRoot(filePath),
      artifact: path.basename(filePath),
      text: readText(filePath),
    }));
}

function validateDocumentFrontmatter(record: ArtifactRecord, state: Record<string, unknown>): void {
  const frontmatter = extractFrontmatter(record.text);
  if (!frontmatter) return;

  const data = parseSimpleYaml(frontmatter.raw);
  if (data.feature && data.feature !== state.feature) {
    errors.push(`${record.rel} frontmatter feature must match workflow feature: ${state.feature}`);
  }
  if (data.id) {
    const areaMatch = String(data.id).match(/^[A-Z-]+-([A-Z][A-Z0-9]*)-\d{3}$/);
    if (areaMatch && areaMatch[1] !== state.area) {
      errors.push(`${record.rel} frontmatter id area ${areaMatch[1]} must match workflow area ${state.area}`);
    }
  }
}

function collectDocumentDefinition(
  record: ArtifactRecord,
  area: unknown,
  registry: Map<string, DefinitionRecord>,
): void {
  const frontmatter = extractFrontmatter(record.text);
  if (!frontmatter) return;

  const data = parseSimpleYaml(frontmatter.raw);
  if (!data.id) return;

  const match = String(data.id).match(traceabilityIdDefinitionPattern);
  if (!match) return;

  const [, kind, idArea] = match;
  if (idArea !== area) return;
  addDefinition(registry, data.id, kind, record);
}

function collectHeadingDefinitions(
  record: ArtifactRecord,
  area: string,
  registry: Map<string, DefinitionRecord>,
): void {
  for (const match of record.text.matchAll(traceabilityItemHeadingPattern)) {
    const [, , id, kind, idArea] = match;
    if (idArea !== area) {
      errors.push(`${record.rel} defines ${id}, but workflow area is ${area}`);
      continue;
    }

    addDefinition(registry, id, kind, record);
  }
}

function collectTableDefinitions(
  record: ArtifactRecord,
  area: string,
  registry: Map<string, DefinitionRecord>,
): void {
  const tableKinds = definitionTableKinds(record.artifact);
  if (tableKinds.size === 0) return;

  for (const match of record.text.matchAll(traceabilityTableItemPattern)) {
    const [, id, kind, idArea] = match;
    if (!tableKinds.has(kind)) continue;
    if (idArea !== area) {
      errors.push(`${record.rel} defines ${id}, but workflow area is ${area}`);
      continue;
    }
    addDefinition(registry, id, kind, record);
  }
}

function definitionTableKinds(artifact: string): Set<string> {
  if (artifact === "requirements.md") return new Set(["NFR"]);
  if (artifact === "spec.md") return new Set(["TEST"]);
  if (artifact === "test-plan.md" || artifact === "test-report.md") return new Set(["TEST"]);
  return new Set();
}

function addDefinition(
  registry: Map<string, DefinitionRecord>,
  id: unknown,
  kind: string,
  record: ArtifactRecord,
): void {
  if (typeof id !== "string") return;
  const previous = registry.get(id);
  if (previous) {
    if (previous.rel !== record.rel) errors.push(`${record.rel} duplicates ${id}; first defined in ${previous.rel}`);
    return;
  }
  registry.set(id, { ...record, id, kind });
}

function validateIdAreas(record: ArtifactRecord, area: string): void {
  for (const match of record.text.matchAll(traceabilityIdPattern)) {
    const [id, , idArea] = match;
    if (idArea !== area) errors.push(`${record.rel} references ${id}, but workflow area is ${area}`);
  }
}

function validateTraceFields(record: ArtifactRecord, registry: Map<string, DefinitionRecord>): void {
  const sections = splitItemSections(record);
  for (const section of sections) {
    validateSectionFields(record, section, registry);
  }
}

export function splitItemSections(record: ArtifactRecord): ItemSection[] {
  const matches = [...record.text.matchAll(traceabilityItemHeadingPattern)];
  const sections: ItemSection[] = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    sections.push({
      id: match[2],
      kind: match[3],
      body: record.text.slice(match.index, next?.index ?? record.text.length),
    });
  }
  return sections;
}

function validateSectionFields(
  record: ArtifactRecord,
  section: ItemSection,
  registry: Map<string, DefinitionRecord>,
): void {
  const fields = [...section.body.matchAll(fieldPattern)];
  if (requiresSatisfies(section.kind) && !fields.some((field) => field[1] === "Satisfies")) {
    errors.push(`${record.rel} ${section.id} missing Satisfies field`);
  }

  for (const [, fieldName, value] of fields) {
    const ids = idsIn(value);
    if (ids.length === 0 && fieldName !== "Links") {
      errors.push(`${record.rel} ${section.id} ${fieldName} field has no traceability IDs`);
      continue;
    }

    for (const id of ids) {
      validateReference(record, section, fieldName, id, registry);
    }
  }
}

function requiresSatisfies(kind: string): boolean {
  return kind === "REQ" || kind === "NFR" || kind === "SPEC" || kind === "T";
}

export function idsIn(value: string): string[] {
  return [...value.matchAll(traceabilityIdPattern)].map((match) => match[0]);
}

function validateReference(
  record: ArtifactRecord,
  section: ItemSection,
  fieldName: string,
  id: string,
  registry: Map<string, DefinitionRecord>,
): void {
  const target = registry.get(id);
  if (!target) {
    errors.push(`${record.rel} ${section.id} ${fieldName} references unknown ${id}`);
    return;
  }

  if (section.kind === "SPEC" && fieldName === "Satisfies" && !["REQ", "NFR"].includes(target.kind)) {
    errors.push(`${record.rel} ${section.id} Satisfies should reference REQ/NFR IDs, got ${id}`);
  }
  if (section.kind === "T" && fieldName === "Satisfies" && !["REQ", "NFR", "SPEC"].includes(target.kind)) {
    errors.push(`${record.rel} ${section.id} Satisfies should reference REQ/NFR/SPEC IDs, got ${id}`);
  }
  if (section.kind === "T" && fieldName === "Depends on" && target.kind !== "T") {
    errors.push(`${record.rel} ${section.id} Depends on should reference T IDs, got ${id}`);
  }
  if (section.kind === "TEST" && fieldName === "Requirement" && !["REQ", "NFR"].includes(target.kind)) {
    errors.push(`${record.rel} ${section.id} Requirement should reference REQ/NFR IDs, got ${id}`);
  }
}
