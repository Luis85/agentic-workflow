import fs from "node:fs";
import path from "node:path";
import { failIfErrors, readText, relativeToRoot, walkFiles } from "./lib/repo.js";
import { specStateDiagnosticsForText } from "./lib/spec-state.js";

const errors: string[] = [];

for (const filePath of workflowStateFiles()) {
  const rel = relativeToRoot(filePath);
  const featureDir = path.basename(path.dirname(filePath));
  const dir = path.dirname(filePath);
  errors.push(
    ...specStateDiagnosticsForText(rel, featureDir, readText(filePath), {
      artifactExists: (artifact) => fs.existsSync(path.join(dir, artifact)),
    }),
  );
}

failIfErrors(errors, "check:specs");

function workflowStateFiles(): string[] {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath: string): boolean {
  return path.basename(filePath) === "workflow-state.md";
}

export { parseStageProgressTable } from "./lib/spec-state.js";
