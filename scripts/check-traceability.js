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

const idPattern =
  /\b(IDEA|RESEARCH|PRD|REQ|NFR|DESIGN|SPECDOC|SPEC|TASKS|T|IMPL-LOG|TESTPLAN|TESTREPORT|TEST|REVIEW|R|RTM|RELEASE|RETRO|CHECKLIST)-([A-Z][A-Z0-9]*)-(\d{3})\b/g;
const idDefinitionPattern =
  /^(IDEA|RESEARCH|PRD|REQ|NFR|DESIGN|SPECDOC|SPEC|TASKS|T|IMPL-LOG|TESTPLAN|TESTREPORT|TEST|REVIEW|R|RTM|RELEASE|RETRO|CHECKLIST)-([A-Z][A-Z0-9]*)-(\d{3})$/;
const itemHeadingPattern = /^(#{2,4})\s+((REQ|NFR|SPEC|T|TEST)-([A-Z][A-Z0-9]*)-(\d{3}))\b/gm;
const tableItemPattern =
  /^\|\s*((REQ|NFR|SPEC|T|TEST)-([A-Z][A-Z0-9]*)-(\d{3}))\s*\|/gm;
const fieldPattern = /^-\s+\*\*(Satisfies|Depends on|Links|Requirement):\*\*\s+(.+)$/gim;
const workflowArtifacts = [
  "idea.md",
  "research.md",
  "requirements.md",
  "design.md",
  "spec.md",
  "tasks.md",
  "implementation-log.md",
  "test-plan.md",
  "test-report.md",
  "review.md",
  "traceability.md",
];
const errors = [];

for (const statePath of workflowStateFiles()) {
  validateFeatureTraceability(statePath);
}

failIfErrors(errors, "check:traceability");

function workflowStateFiles() {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath) {
  return path.basename(filePath) === "workflow-state.md";
}

function validateFeatureTraceability(statePath) {
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

  const registry = new Map();
  const artifactRecords = existingArtifactRecords(featureDir);

  for (const record of artifactRecords) {
    validateDocumentFrontmatter(record, state);
    collectDocumentDefinition(record, state.area, registry);
    collectHeadingDefinitions(record, area, registry);
    collectTableDefinitions(record, area, registry);
    validateIdAreas(record, area);
  }

  for (const record of artifactRecords) {
    validateTraceFields(record, registry);
  }
}

function existingArtifactRecords(featureDir) {
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

function validateDocumentFrontmatter(record, state) {
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

function collectDocumentDefinition(record, area, registry) {
  const frontmatter = extractFrontmatter(record.text);
  if (!frontmatter) return;

  const data = parseSimpleYaml(frontmatter.raw);
  if (!data.id) return;

  const match = String(data.id).match(idDefinitionPattern);
  if (!match) return;

  const [, kind, idArea] = match;
  if (idArea !== area) return;
  addDefinition(registry, data.id, kind, record);
}

function collectHeadingDefinitions(record, area, registry) {
  for (const match of record.text.matchAll(itemHeadingPattern)) {
    const [, , id, kind, idArea] = match;
    if (idArea !== area) {
      errors.push(`${record.rel} defines ${id}, but workflow area is ${area}`);
      continue;
    }

    addDefinition(registry, id, kind, record);
  }
}

function collectTableDefinitions(record, area, registry) {
  const tableKinds = definitionTableKinds(record.artifact);
  if (tableKinds.size === 0) return;

  for (const match of record.text.matchAll(tableItemPattern)) {
    const [, id, kind, idArea] = match;
    if (!tableKinds.has(kind)) continue;
    if (idArea !== area) {
      errors.push(`${record.rel} defines ${id}, but workflow area is ${area}`);
      continue;
    }
    addDefinition(registry, id, kind, record);
  }
}

function definitionTableKinds(artifact) {
  if (artifact === "requirements.md") return new Set(["NFR"]);
  if (artifact === "spec.md") return new Set(["TEST"]);
  if (artifact === "test-plan.md" || artifact === "test-report.md") return new Set(["TEST"]);
  return new Set();
}

function addDefinition(registry, id, kind, record) {
  const previous = registry.get(id);
  if (previous) {
    if (previous.rel !== record.rel) errors.push(`${record.rel} duplicates ${id}; first defined in ${previous.rel}`);
    return;
  }
  registry.set(id, { ...record, id, kind });
}

function validateIdAreas(record, area) {
  for (const match of record.text.matchAll(idPattern)) {
    const [id, , idArea] = match;
    if (idArea !== area) errors.push(`${record.rel} references ${id}, but workflow area is ${area}`);
  }
}

function validateTraceFields(record, registry) {
  const sections = splitItemSections(record);
  for (const section of sections) {
    validateSectionFields(record, section, registry);
  }
}

function splitItemSections(record) {
  const matches = [...record.text.matchAll(itemHeadingPattern)];
  const sections = [];
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

function validateSectionFields(record, section, registry) {
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

function requiresSatisfies(kind) {
  return kind === "REQ" || kind === "NFR" || kind === "SPEC" || kind === "T";
}

function idsIn(value) {
  return [...value.matchAll(idPattern)].map((match) => match[0]);
}

function validateReference(record, section, fieldName, id, registry) {
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
