import path from "node:path";
import {
  extractFrontmatter,
  failIfErrors,
  markdownFiles,
  parseSimpleYaml,
  readText,
  relativeToRoot,
} from "./lib/repo.js";

const artifactStatuses = new Set(["pending", "in-progress", "complete", "skipped", "blocked"]);
const workflowStages = new Set([
  "idea",
  "research",
  "requirements",
  "design",
  "specification",
  "tasks",
  "implementation",
  "testing",
  "review",
  "release",
  "learning",
]);
const workflowStatuses = new Set(["active", "blocked", "paused", "done"]);
const errors = [];

for (const filePath of markdownFiles()) {
  const rel = relativeToRoot(filePath);
  const text = readText(filePath);
  const frontmatter = extractFrontmatter(text);

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

failIfErrors(errors, "check:frontmatter");

function isAdr(rel) {
  return /^docs\/adr\/0\d{3}-.+\.md$/.test(rel);
}

function requireFrontmatter(rel, frontmatter) {
  if (!frontmatter) errors.push(`${rel} is missing YAML frontmatter`);
}

function validateAdr(rel, data) {
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

function validateWorkflowState(rel, data) {
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

function validateDailyReview(rel, data) {
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

function isTrackState(rel) {
  return /(^|\/)(discovery-state|stock-taking-state|project-state|portfolio-state|deal-state)\.md$/.test(rel);
}

function validateTrackState(rel, data) {
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
