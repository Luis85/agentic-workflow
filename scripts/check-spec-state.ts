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
  artifactSet,
  artifactStatuses,
  canonicalArtifacts,
  requiredWorkflowStateSections,
  stageArtifacts,
  workflowStages,
  workflowStatuses,
} from "./lib/workflow-schema.js";

const errors: string[] = [];

for (const filePath of workflowStateFiles()) {
  validateWorkflowState(filePath);
}

failIfErrors(errors, "check:specs");

function workflowStateFiles(): string[] {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath: string): boolean {
  return path.basename(filePath) === "workflow-state.md";
}

function validateWorkflowState(filePath: string): void {
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

function validateRequiredFields(rel: string, data: Record<string, unknown>): void {
  for (const key of ["feature", "area", "current_stage", "status", "last_updated", "last_agent", "artifacts"]) {
    if (data[key] === undefined || data[key] === "") errors.push(`${rel} missing frontmatter key: ${key}`);
  }

  if (data.area && !/^[A-Z][A-Z0-9]*$/.test(String(data.area))) {
    errors.push(`${rel} area must be an uppercase alphanumeric code`);
  }
  if (data.current_stage && !workflowStages.has(String(data.current_stage))) {
    errors.push(`${rel} has unsupported current_stage: ${data.current_stage}`);
  }
  if (data.status && !workflowStatuses.has(String(data.status))) {
    errors.push(`${rel} has unsupported status: ${data.status}`);
  }
  if (data.last_updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.last_updated))) {
    errors.push(`${rel} last_updated must use YYYY-MM-DD`);
  }
}

function validateFeatureIdentity(rel: string, featureDir: string, data: Record<string, unknown>): void {
  if (data.feature && data.feature !== featureDir) {
    errors.push(`${rel} feature must match its folder name: ${featureDir}`);
  }
}

function validateArtifactMap(rel: string, filePath: string, data: Record<string, unknown>): void {
  if (!data.artifacts || typeof data.artifacts !== "object" || Array.isArray(data.artifacts)) {
    errors.push(`${rel} artifacts must be a YAML map`);
    return;
  }

  const artifacts = data.artifacts as Record<string, unknown>;
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

function validateCurrentStageArtifact(
  rel: string,
  currentStage: unknown,
  workflowStatus: unknown,
  artifacts: Record<string, unknown>,
): void {
  if (!workflowStages.has(String(currentStage)) || !workflowStatuses.has(String(workflowStatus))) return;

  const stageName = String(currentStage);
  const currentArtifacts = stageArtifacts.find(([stage]) => stage === stageName)?.[1] || [];
  if (workflowStatus === "active") {
    const hasOpenArtifact = currentArtifacts.some((artifact) =>
      ["pending", "in-progress"].includes(String(artifacts[artifact])),
    );
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

function validateDoneState(rel: string, workflowStatus: unknown, artifacts: Record<string, unknown>): void {
  if (workflowStatus !== "done") return;
  for (const artifact of canonicalArtifacts) {
    if (!isDoneArtifactStatus(artifact, artifacts[artifact])) {
      errors.push(`${rel} status is done, but ${artifact} is ${artifacts[artifact]}`);
    }
  }
}

function isDoneArtifactStatus(artifact: string, status: unknown): boolean {
  if (artifact === "retrospective.md") return status === "complete";
  return status === "complete" || status === "skipped";
}

function validateStageProgress(rel: string, body: string, data: Record<string, unknown>): void {
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

export function parseStageProgressTable(body: string): Map<string, string> {
  const statuses = new Map<string, string>();
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

function validateRequiredSections(rel: string, body: string): void {
  for (const heading of requiredWorkflowStateSections) {
    if (!new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m").test(body)) {
      errors.push(`${rel} missing section: ${heading}`);
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
