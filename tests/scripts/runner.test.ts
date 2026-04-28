import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { runNodeTasks } from "../../scripts/lib/runner.js";

test("runNodeTasks emits GitHub Actions annotations for JSON diagnostics", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-runner-test-"));
  const scriptPath = path.join(tempDir, "failing-check.ts");
  const previousActions = process.env.GITHUB_ACTIONS;
  const errors: string[] = [];
  const logs: string[] = [];
  const originalError = console.error;
  const originalLog = console.log;

  fs.writeFileSync(
    scriptPath,
    [
      "if (!process.argv.includes('--json')) process.exit(2);",
      "console.log(JSON.stringify({",
      "  check: 'check:fixture',",
      "  status: 'fail',",
      "  errors: [{",
      "    path: 'docs/example.md',",
      "    line: 3,",
      "    code: 'LINK_FILE',",
      "    message: 'links to missing file ./missing.md'",
      "  }]",
      "}));",
      "process.exit(1);",
    ].join("\n"),
    "utf8",
  );

  try {
    process.env.GITHUB_ACTIONS = "true";
    console.error = (message?: unknown) => {
      errors.push(String(message));
    };
    console.log = (message?: unknown) => {
      logs.push(String(message));
    };

    runNodeTasks(
      [{ name: "check:fixture", label: "Fixture check", script: scriptPath, jsonDiagnostics: true }],
      { heading: "test", stopOnFailure: false },
    );
  } finally {
    console.error = originalError;
    console.log = originalLog;
    if (previousActions === undefined) {
      delete process.env.GITHUB_ACTIONS;
    } else {
      process.env.GITHUB_ACTIONS = previousActions;
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  assert.equal(logs.some((line) => line.includes("test: check:fixture (Fixture check)")), true);
  assert.equal(
    logs.includes(
      "::error file=docs/example.md,line=3,title=LINK_FILE::links to missing file ./missing.md",
    ),
    true,
  );
  assert.equal(errors.includes("- docs/example.md:3 [LINK_FILE] links to missing file ./missing.md"), true);
});
