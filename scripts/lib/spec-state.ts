import {
  artifactSet,
  artifactStatuses,
  canonicalArtifacts,
  requiredWorkflowStateSections,
  stageArtifacts,
  workflowStages,
  workflowStatuses,
} from "./workflow-schema.js";
import { extractFrontmatter, parseSimpleYaml } from "./repo.js";

export type SpecStateOptions = {
  artifactExists?: (artifact: string) => boolean;
};

/**
 * Validate one workflow-state.md document and return diagnostic strings.
 *
 * The function is pure: filesystem reads happen via the optional
 * `artifactExists` callback so callers (and tests) can inject behaviour without
 * touching disk. Diagnostic strings are prefixed with the supplied `rel` path
 * so that the shared diagnostic normaliser can split them into path-and-message
 * pairs in the existing CLI renderer.
 *
 * @param rel - Repository-relative POSIX path of the workflow-state file.
 * @param featureDir - Containing folder name; must equal the `feature` field.
 * @param text - Raw file contents including YAML frontmatter.
 * @param options - Override the artifact-existence probe used by tests.
 * @returns Diagnostic messages, one per failure.
 */
export function specStateDiagnosticsForText(
  rel: string,
  featureDir: string,
  text: string,
  options: SpecStateOptions = {},
): string[] {
  const artifactExists = options.artifactExists ?? (() => true);
  const errors: string[] = [];
  const frontmatter = extractFrontmatter(text);

  if (!frontmatter) {
    errors.push(`${rel} is missing YAML frontmatter`);
    return errors;
  }

  const data = parseSimpleYaml(frontmatter.raw);
  validateRequiredFields(rel, data, errors);
  validateFeatureIdentity(rel, featureDir, data, errors);
  validateArtifactMap(rel, data, artifactExists, errors);
  validateStageProgress(rel, frontmatter.body, data, errors);
  validateRequiredSections(rel, frontmatter.body, errors);
  return errors;
}

/**
 * Extract artifact-status pairs from the Stage progress Markdown table.
 *
 * @param body - Markdown body after the YAML frontmatter.
 * @returns Map keyed by artifact filename with the status string from column 3.
 */
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

function validateRequiredFields(rel: string, data: Record<string, unknown>, errors: string[]): void {
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

function validateFeatureIdentity(
  rel: string,
  featureDir: string,
  data: Record<string, unknown>,
  errors: string[],
): void {
  if (data.feature && data.feature !== featureDir) {
    errors.push(`${rel} feature must match its folder name: ${featureDir}`);
  }
}

function validateArtifactMap(
  rel: string,
  data: Record<string, unknown>,
  artifactExists: (artifact: string) => boolean,
  errors: string[],
): void {
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

    if ((status === "complete" || status === "in-progress") && !artifactExists(artifact)) {
      errors.push(`${rel} marks ${artifact} as ${status}, but ${artifact} does not exist`);
    }
  }

  if (artifacts["retrospective.md"] === "skipped") {
    errors.push(`${rel} must not skip retrospective.md`);
  }

  validateCurrentStageArtifact(rel, data.current_stage, data.status, artifacts, errors);
  validateDoneState(rel, data.status, artifacts, errors);
}

function validateCurrentStageArtifact(
  rel: string,
  currentStage: unknown,
  workflowStatus: unknown,
  artifacts: Record<string, unknown>,
  errors: string[],
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

function validateDoneState(
  rel: string,
  workflowStatus: unknown,
  artifacts: Record<string, unknown>,
  errors: string[],
): void {
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

function validateStageProgress(
  rel: string,
  body: string,
  data: Record<string, unknown>,
  errors: string[],
): void {
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
      errors.push(
        `${rel} Stage progress table has ${artifact} as ${tableStatus}, but frontmatter says ${frontmatterStatus}`,
      );
    }
  }
}

function validateRequiredSections(rel: string, body: string, errors: string[]): void {
  for (const heading of requiredWorkflowStateSections) {
    if (!new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m").test(body)) {
      errors.push(`${rel} missing section: ${heading}`);
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
