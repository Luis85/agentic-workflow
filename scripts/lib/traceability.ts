import { extractFrontmatter, parseSimpleYaml } from "./repo.js";
import {
  traceabilityIdDefinitionPattern,
  traceabilityIdPattern,
  traceabilityItemHeadingPattern,
  traceabilityTableItemPattern,
} from "./workflow-schema.js";

const fieldPattern = /^-\s+\*\*(Satisfies|Depends on|Links|Requirement):\*\*\s+(.+)$/gim;

export type ArtifactRecord = {
  rel: string;
  artifact: string;
  text: string;
};

export type ItemSection = {
  id: string;
  kind: string;
  body: string;
};

type DefinitionRecord = ArtifactRecord & {
  id: string;
  kind: string;
};

/**
 * Validate the traceability graph for one feature.
 *
 * The function is pure: callers walk the filesystem, build {@link ArtifactRecord}s
 * for each existing artifact, and pass everything in. The validator parses the
 * workflow-state YAML, builds the ID registry from frontmatter / headings /
 * tables, and reports broken references and area mismatches.
 *
 * @param stateRel - Repository-relative POSIX path to the workflow-state file.
 * @param stateText - Raw workflow-state contents including frontmatter.
 * @param artifactRecords - Records for each existing artifact in the feature.
 * @returns Diagnostic messages, one per failure.
 */
export function traceabilityDiagnosticsForFeature(
  stateRel: string,
  stateText: string,
  artifactRecords: ArtifactRecord[],
): string[] {
  const errors: string[] = [];
  const stateFrontmatter = extractFrontmatter(stateText);
  if (!stateFrontmatter) {
    errors.push(`${stateRel} is missing YAML frontmatter`);
    return errors;
  }

  const state = parseSimpleYaml(stateFrontmatter.raw);
  const area = String(state.area || "");
  if (!area) {
    errors.push(`${stateRel} missing frontmatter key: area`);
    return errors;
  }

  const registry = new Map<string, DefinitionRecord>();

  for (const record of artifactRecords) {
    validateDocumentFrontmatter(record, state, errors);
    collectDocumentDefinition(record, area, registry, errors);
    collectHeadingDefinitions(record, area, registry, errors);
    collectTableDefinitions(record, area, registry, errors);
    validateIdAreas(record, area, errors);
  }

  for (const record of artifactRecords) {
    validateTraceFields(record, registry, errors);
  }

  validateTestCoverage(artifactRecords, registry, errors);

  return errors;
}

/**
 * Split an artifact body into sections, one per traceability heading.
 *
 * @param record - Artifact record whose `text` contains traceability headings.
 * @returns Sections keyed by heading-defined ID.
 */
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

/**
 * Extract every traceability ID from a free-form value.
 *
 * @param value - Markdown line content following a `**Field:**` label.
 * @returns Matched IDs in document order; may be empty.
 */
export function idsIn(value: string): string[] {
  return [...value.matchAll(traceabilityIdPattern)].map((match) => match[0]);
}

function validateDocumentFrontmatter(
  record: ArtifactRecord,
  state: Record<string, unknown>,
  errors: string[],
): void {
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
  area: string,
  registry: Map<string, DefinitionRecord>,
  errors: string[],
): void {
  const frontmatter = extractFrontmatter(record.text);
  if (!frontmatter) return;

  const data = parseSimpleYaml(frontmatter.raw);
  if (!data.id) return;

  const match = String(data.id).match(traceabilityIdDefinitionPattern);
  if (!match) return;

  const [, kind, idArea] = match;
  if (idArea !== area) return;
  addDefinition(registry, String(data.id), kind, record, errors);
}

function collectHeadingDefinitions(
  record: ArtifactRecord,
  area: string,
  registry: Map<string, DefinitionRecord>,
  errors: string[],
): void {
  for (const match of record.text.matchAll(traceabilityItemHeadingPattern)) {
    const [, , id, kind, idArea] = match;
    if (idArea !== area) {
      errors.push(`${record.rel} defines ${id}, but workflow area is ${area}`);
      continue;
    }

    addDefinition(registry, id, kind, record, errors);
  }
}

function collectTableDefinitions(
  record: ArtifactRecord,
  area: string,
  registry: Map<string, DefinitionRecord>,
  errors: string[],
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
    addDefinition(registry, id, kind, record, errors);
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
  id: string,
  kind: string,
  record: ArtifactRecord,
  errors: string[],
): void {
  const previous = registry.get(id);
  if (previous) {
    if (previous.rel !== record.rel) errors.push(`${record.rel} duplicates ${id}; first defined in ${previous.rel}`);
    return;
  }
  registry.set(id, { ...record, id, kind });
}

function validateIdAreas(record: ArtifactRecord, area: string, errors: string[]): void {
  for (const match of record.text.matchAll(traceabilityIdPattern)) {
    const [id, , idArea] = match;
    if (idArea !== area) errors.push(`${record.rel} references ${id}, but workflow area is ${area}`);
  }
}

function validateTraceFields(
  record: ArtifactRecord,
  registry: Map<string, DefinitionRecord>,
  errors: string[],
): void {
  const sections = splitItemSections(record);
  for (const section of sections) {
    validateSectionFields(record, section, registry, errors);
  }
}

function validateTestCoverage(
  records: ArtifactRecord[],
  registry: Map<string, DefinitionRecord>,
  errors: string[],
): void {
  const coveredTests = new Set<string>();
  const testRowPattern = /^\|\s*(TEST-[A-Z][A-Z0-9]*-\d{3})\s*\|/gm;

  for (const record of records) {
    for (const section of splitItemSections(record)) {
      if (section.kind !== "TEST") continue;
      if (mentionsReqOrNfr(section.body)) coveredTests.add(section.id);
    }

    for (const line of record.text.split(/\r?\n/)) {
      testRowPattern.lastIndex = 0;
      const match = testRowPattern.exec(line);
      if (!match) continue;
      if (mentionsReqOrNfr(line)) coveredTests.add(match[1]);
    }
  }

  for (const [id, definition] of registry) {
    if (definition.kind !== "TEST") continue;
    if (coveredTests.has(id)) continue;
    errors.push(`${definition.rel} ${id} has no covering REQ or NFR reference`);
  }
}

function mentionsReqOrNfr(text: string): boolean {
  return idsIn(text).some((id) => id.startsWith("REQ-") || id.startsWith("NFR-"));
}

function validateSectionFields(
  record: ArtifactRecord,
  section: ItemSection,
  registry: Map<string, DefinitionRecord>,
  errors: string[],
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
      validateReference(record, section, fieldName, id, registry, errors);
    }
  }
}

function requiresSatisfies(kind: string): boolean {
  return kind === "REQ" || kind === "NFR" || kind === "SPEC" || kind === "T";
}

function validateReference(
  record: ArtifactRecord,
  section: ItemSection,
  fieldName: string,
  id: string,
  registry: Map<string, DefinitionRecord>,
  errors: string[],
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
