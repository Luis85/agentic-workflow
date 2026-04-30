import fs from "node:fs";
import path from "node:path";
import { failIfErrors, readText, relativeToRoot, walkFiles } from "./lib/repo.js";
import { type ArtifactRecord, traceabilityDiagnosticsForFeature } from "./lib/traceability.js";
import { workflowArtifacts } from "./lib/workflow-schema.js";

const errors: string[] = [];

for (const statePath of workflowStateFiles()) {
  const stateRel = relativeToRoot(statePath);
  const featureDir = path.dirname(statePath);
  const records = existingArtifactRecords(featureDir);
  errors.push(...traceabilityDiagnosticsForFeature(stateRel, readText(statePath), records));
}

failIfErrors(errors, "check:traceability");

function workflowStateFiles(): string[] {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath: string): boolean {
  return path.basename(filePath) === "workflow-state.md";
}

function existingArtifactRecords(featureDir: string): ArtifactRecord[] {
  return workflowArtifacts
    .map((artifact) => path.join(featureDir, artifact))
    .filter((filePath) => fs.existsSync(filePath))
    .map((filePath) => ({
      rel: relativeToRoot(filePath),
      artifact: path.basename(filePath),
      text: readText(filePath),
    }));
}

export { idsIn, splitItemSections, type ArtifactRecord, type ItemSection } from "./lib/traceability.js";
