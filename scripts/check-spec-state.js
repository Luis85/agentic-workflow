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

const stageArtifacts = [
  ["idea", ["idea.md"]],
  ["research", ["research.md"]],
  ["requirements", ["requirements.md"]],
  ["design", ["design.md"]],
  ["specification", ["spec.md"]],
  ["tasks", ["tasks.md"]],
  ["implementation", ["implementation-log.md"]],
  ["testing", ["test-plan.md", "test-report.md"]],
  ["review", ["review.md", "traceability.md"]],
  ["release", ["release-notes.md"]],
  ["learning", ["retrospective.md"]],
];

const canonicalArtifacts = stageArtifacts.flatMap(([, artifacts]) => artifacts);
const artifactSet = new Set(canonicalArtifacts);
const stages = new Set(stageArtifacts.map(([stage]) => stage));
const artifactStatuses = new Set(["pending", "in-progress", "complete", "skipped", "blocked"]);
const workflowStatuses = new Set(["active", "blocked", "paused", "done"]);
const requiredSections = ["Stage progress", "Skips", "Blocks", "Hand-off notes", "Open clarifications"];
const errors = [];

for (const filePath of workflowStateFiles()) {
  validateWorkflowState(filePath);
}

failIfErrors(errors, "check:specs");

function workflowStateFiles() {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath) {
  return path.basename(filePath) === "workflow-state.md";
}

function validateWorkflowState(filePath) {
  const rel = relativeToRoot(filePath);
  const featureDir = path.basename(path.dirname(filePath));
  const text = readText(filePath);
  const frontmatter = extractFrontmatter(text);

  if (!frontmatter) {
    errors.push(`${rel} is missing YAML frontmatter`);
    return;
  }

  const data = parseSimpleYaml(frontmatter.raw);
  validateRequiredFields(rel, data);
  validateFeatureIdentity(rel, featureDir, data);
  validateArtifactMap(rel, filePath, data);
  validateStageProgress(rel, frontmatter.body, data);
  validateRequiredSections(rel, frontmatter.body);
}

function validateRequiredFields(rel, data) {
  for (const key of ["feature", "area", "current_stage", "status", "last_updated", "last_agent", "artifacts"]) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }

  if (data.area && !/^[A-Z][A-Z0-9]*$/.test(String(data.area))) {
    errors.push(`${rel} area must be an uppercase alphanumeric code`);
  }
  if (data.current_stage && !stages.has(String(data.current_stage))) {
    errors.push(`${rel} has unsupported current_stage: ${data.current_stage}`);
  }
  if (data.status && !workflowStatuses.has(String(data.status))) {
    errors.push(`${rel} has unsupported status: ${data.status}`);
  }
  if (data.last_updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.last_updated))) {
    errors.push(`${rel} last_updated must use YYYY-MM-DD`);
  }
}

function validateFeatureIdentity(rel, featureDir, data) {
  if (data.feature && data.feature !== featureDir) {
    errors.push(`${rel} feature must match its folder name: ${featureDir}`);
  }
}

function validateArtifactMap(rel, filePath, data) {
  if (!data.artifacts || typeof data.artifacts !== "object" || Array.isArray(data.artifacts)) {
    errors.push(`${rel} artifacts must be a YAML map`);
    return;
  }

  const artifacts = data.artifacts;
  for (const artifact of canonicalArtifacts) {
    if (artifacts[artifact] === undefined) errors.push(`${rel} artifacts missing ${artifact}`);
  }
  for (const artifact of Object.keys(artifacts)) {
    if (!artifactSet.has(artifact)) errors.push(`${rel} artifacts includes unknown artifact ${artifact}`);
  }

  for (const [artifact, status] of Object.entries(artifacts)) {
    if (!artifactStatuses.has(String(status))) {
      errors.push(`${rel} artifact ${artifact} has unsupported status: ${status}`);
      continue;
    }

    const artifactPath = path.join(path.dirname(filePath), artifact);
    if ((status === "complete" || status === "in-progress") && !fs.existsSync(artifactPath)) {
      errors.push(`${rel} marks ${artifact} as ${status}, but ${artifact} does not exist`);
    }
  }

  if (artifacts["retrospective.md"] === "skipped") {
    errors.push(`${rel} must not skip retrospective.md`);
  }

  validateCurrentStageArtifact(rel, data.current_stage, data.status, artifacts);
  validateDoneState(rel, data.status, artifacts);
}

function validateCurrentStageArtifact(rel, currentStage, workflowStatus, artifacts) {
  if (!stages.has(String(currentStage)) || !workflowStatuses.has(String(workflowStatus))) return;

  const currentArtifacts = stageArtifacts.find(([stage]) => stage === currentStage)?.[1] || [];
  if (workflowStatus === "active") {
    const hasOpenArtifact = currentArtifacts.some((artifact) => ["pending", "in-progress"].includes(artifacts[artifact]));
    if (!hasOpenArtifact) {
      errors.push(`${rel} status is active, but no ${currentStage} artifact is pending or in-progress`);
    }
  }

  if (workflowStatus === "blocked") {
    const hasBlockedArtifact = currentArtifacts.some((artifact) => artifacts[artifact] === "blocked");
    if (!hasBlockedArtifact) {
      errors.push(`${rel} status is blocked, but no ${currentStage} artifact is blocked`);
    }
  }
}

function validateDoneState(rel, workflowStatus, artifacts) {
  if (workflowStatus !== "done") return;
  for (const artifact of canonicalArtifacts) {
    if (!isDoneArtifactStatus(artifact, artifacts[artifact])) {
      errors.push(`${rel} status is done, but ${artifact} is ${artifacts[artifact]}`);
    }
  }
}

function isDoneArtifactStatus(artifact, status) {
  if (artifact === "retrospective.md") return status === "complete";
  return status === "complete" || status === "skipped";
}

function validateStageProgress(rel, body, data) {
  const tableStatuses = parseStageProgressTable(body);
  if (tableStatuses.size === 0) {
    errors.push(`${rel} missing Stage progress artifact table`);
    return;
  }

  for (const [artifact, frontmatterStatus] of Object.entries(data.artifacts || {})) {
    const tableStatus = tableStatuses.get(artifact);
    if (!tableStatus) {
      errors.push(`${rel} Stage progress table missing ${artifact}`);
      continue;
    }
    if (String(frontmatterStatus) !== tableStatus) {
      errors.push(`${rel} Stage progress table has ${artifact} as ${tableStatus}, but frontmatter says ${frontmatterStatus}`);
    }
  }
}

function parseStageProgressTable(body) {
  const statuses = new Map();
  for (const line of body.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 3 || cells[0] === "Stage" || /^-+$/.test(cells[0])) continue;

    const artifacts = [...cells[1].matchAll(/`([^`]+\.md)`/g)].map((match) => match[1]);
    for (const artifact of artifacts) statuses.set(artifact, cells[2]);
  }
  return statuses;
}

function validateRequiredSections(rel, body) {
  for (const heading of requiredSections) {
    if (!new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m").test(body)) {
      errors.push(`${rel} missing section: ${heading}`);
    }
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
