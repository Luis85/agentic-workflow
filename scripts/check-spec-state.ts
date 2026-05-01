import fs from "node:fs";
import path from "node:path";
import { failIfErrors, readText, relativeToRoot, repoRoot, walkFiles } from "./lib/repo.js";
import { examplesCoverageDiagnostics, specStateDiagnosticsForText } from "./lib/spec-state.js";

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

errors.push(...examplesCoverageDiagnostics(exampleSubdirsMissingWorkflowState()));

failIfErrors(errors, "check:specs");

function workflowStateFiles(): string[] {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath: string): boolean {
  return path.basename(filePath) === "workflow-state.md";
}

function exampleSubdirsMissingWorkflowState(): string[] {
  const examplesRoot = path.join(repoRoot, "examples");
  if (!fs.existsSync(examplesRoot)) return [];

  const missing: string[] = [];
  for (const entry of fs.readdirSync(examplesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const subdir = path.join(examplesRoot, entry.name);
    if (fs.existsSync(path.join(subdir, "workflow-state.md"))) continue;
    missing.push(relativeToRoot(subdir));
  }
  return missing;
}

export { parseStageProgressTable } from "./lib/spec-state.js";
