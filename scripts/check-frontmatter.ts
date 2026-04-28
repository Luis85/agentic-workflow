import path from "node:path";
import {
  FrontmatterBlock,
  extractFrontmatter,
  failIfErrors,
  markdownFiles,
  parseSimpleYaml,
  readText,
  relativeToRoot,
} from "./lib/repo.js";
import { artifactStatuses, workflowStages, workflowStatuses } from "./lib/workflow-schema.js";

const errors: string[] = [];
const readmeDirs = new Map<string, string[]>();

for (const filePath of markdownFiles()) {
  const rel = relativeToRoot(filePath);
  const text = readText(filePath);
  const frontmatter = extractFrontmatter(text);
  const basename = path.basename(rel);
  const dirname = path.dirname(rel) === "." ? "." : path.dirname(rel);

  if (basename.toLowerCase() === "readme.md") {
    const siblings = readmeDirs.get(dirname) || [];
    siblings.push(rel);
    readmeDirs.set(dirname, siblings);

    if (basename !== "README.md") {
      errors.push(`${rel} must be named README.md`);
    } else {
      requireFrontmatter(rel, frontmatter);
      if (frontmatter) validateReadme(rel, parseSimpleYaml(frontmatter.raw));
    }
  }

  if (isAdr(rel)) {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateAdr(rel, parseSimpleYaml(frontmatter.raw));
  }

  if (rel.endsWith("workflow-state.md")) {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateWorkflowState(rel, parseSimpleYaml(frontmatter.raw));
  }

  if (isTrackState(rel)) {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateTrackState(rel, parseSimpleYaml(frontmatter.raw));
  }

  if (rel.startsWith("docs/daily-reviews/") && path.basename(rel) !== "README.md") {
    requireFrontmatter(rel, frontmatter);
    if (frontmatter) validateDailyReview(rel, parseSimpleYaml(frontmatter.raw));
  }
}

for (const [dirname, readmes] of readmeDirs) {
  if (readmes.length > 1) {
    errors.push(`${dirname} has multiple README files: ${readmes.join(", ")}`);
  }
}

failIfErrors(errors, "check:frontmatter");

function isAdr(rel: string): boolean {
  return /^docs\/adr\/0\d{3}-.+\.md$/.test(rel);
}

function requireFrontmatter(rel: string, frontmatter: FrontmatterBlock | null): void {
  if (!frontmatter) errors.push(`${rel} is missing YAML frontmatter`);
}

function validateReadme(rel: string, data: Record<string, unknown>): void {
  const required = ["title", "folder", "description", "entry_point"];
  for (const key of required) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }

  const expectedFolder = path.dirname(rel) === "." ? "." : path.dirname(rel);
  if (data.folder !== undefined && String(data.folder) !== expectedFolder) {
    errors.push(`${rel} frontmatter folder must be ${expectedFolder}`);
  }

  if (data.entry_point !== undefined && String(data.entry_point) !== "true") {
    errors.push(`${rel} frontmatter entry_point must be true`);
  }
}

function validateAdr(rel: string, data: Record<string, unknown>): void {
  const required = ["id", "title", "status", "date"];
  for (const key of required) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }

  const fileNumber = path.basename(rel).slice(0, 4);
  if (data.id !== `ADR-${fileNumber}`) {
    errors.push(`${rel} frontmatter id must be ADR-${fileNumber}`);
  }

  const status = String(data.status || "").toLowerCase();
  if (!["proposed", "accepted", "deprecated"].includes(status) && !status.startsWith("superseded")) {
    errors.push(`${rel} has unsupported ADR status: ${data.status}`);
  }
}

function validateWorkflowState(rel: string, data: Record<string, unknown>): void {
  for (const key of ["current_stage", "status", "last_updated", "last_agent", "artifacts"]) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }

  if (data.current_stage && !workflowStages.has(String(data.current_stage))) {
    errors.push(`${rel} has unsupported current_stage: ${data.current_stage}`);
  }
  if (data.status && !workflowStatuses.has(String(data.status))) {
    errors.push(`${rel} has unsupported status: ${data.status}`);
  }
  if (data.artifacts && typeof data.artifacts === "object") {
    for (const [artifact, status] of Object.entries(data.artifacts)) {
      if (!artifactStatuses.has(String(status))) {
        errors.push(`${rel} artifact ${artifact} has unsupported status: ${status}`);
      }
    }
  }
}

function validateDailyReview(rel: string, data: Record<string, unknown>): void {
  for (const key of ["date", "head_sha", "issue", "finding_count"]) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }
  if (data.head_sha && !/^[0-9a-f]{40}$/i.test(String(data.head_sha))) {
    errors.push(`${rel} head_sha must be a 40-character SHA`);
  }
  if (data.issue !== null && !/^#\d+$/.test(String(data.issue))) {
    errors.push(`${rel} issue must be #NNN or null`);
  }
  if (data.finding_count !== undefined && !Number.isInteger(Number(data.finding_count))) {
    errors.push(`${rel} finding_count must be an integer`);
  }
}

function isTrackState(rel: string): boolean {
  return /(^|\/)(discovery-state|stock-taking-state|scaffolding-state|project-state|portfolio-state|deal-state)\.md$/.test(rel);
}

function validateTrackState(rel: string, data: Record<string, unknown>): void {
  const required = ["status", "last_updated", "last_agent", "artifacts"];
  for (const key of required) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }
  if (data.artifacts && typeof data.artifacts === "object") {
    for (const [artifact, status] of Object.entries(data.artifacts)) {
      if (!artifactStatuses.has(String(status))) {
        errors.push(`${rel} artifact ${artifact} has unsupported status: ${status}`);
      }
    }
  }
}
