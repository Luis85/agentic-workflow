import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { runNodeTasks, runNodeTasksJson } from "../../scripts/lib/runner.js";

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

test("runNodeTasksJson emits rerun commands for machine consumers", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-runner-json-test-"));
  const scriptPath = path.join(tempDir, "failing-check.ts");
  const logs: string[] = [];
  const originalLog = console.log;
  const originalExit = process.exit;

  fs.writeFileSync(
    scriptPath,
    [
      "console.log(JSON.stringify({",
      "  check: 'check:fixture',",
      "  status: 'fail',",
      "  errors: [{ code: 'FIXTURE', message: 'fixture failed' }]",
      "}));",
      "process.exit(1);",
    ].join("\n"),
    "utf8",
  );

  try {
    console.log = (message?: unknown) => {
      logs.push(String(message));
    };
    process.exit = ((code?: string | number | null) => {
      throw new Error(`exit:${code}`);
    }) as typeof process.exit;

    assert.throws(
      () =>
        runNodeTasksJson(
          [{ name: "check:fixture", label: "Fixture check", script: scriptPath, jsonDiagnostics: true }],
          { heading: "verify" },
        ),
      /exit:1/,
    );
  } finally {
    console.log = originalLog;
    process.exit = originalExit;
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const output = JSON.parse(logs.join("\n")) as {
    check: string;
    status: string;
    results: Array<{ rerun: string; errors: Array<{ rerun: string }> }>;
  };
  assert.equal(output.check, "verify");
  assert.equal(output.status, "fail");
  assert.equal(output.results[0].rerun, "npm run check:fixture");
  assert.equal(output.results[0].errors[0].rerun, "npm run check:fixture");
});

test("runNodeTasksJson falls back when JSON diagnostics have the wrong shape", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-runner-bad-json-test-"));
  const scriptPath = path.join(tempDir, "bad-json-check.ts");
  const logs: string[] = [];
  const originalLog = console.log;
  const originalExit = process.exit;

  fs.writeFileSync(
    scriptPath,
    [
      "console.log(JSON.stringify({ check: 'check:fixture', status: 'fail' }));",
      "process.exit(1);",
    ].join("\n"),
    "utf8",
  );

  try {
    console.log = (message?: unknown) => {
      logs.push(String(message));
    };
    process.exit = ((code?: string | number | null) => {
      throw new Error(`exit:${code}`);
    }) as typeof process.exit;

    assert.throws(
      () =>
        runNodeTasksJson(
          [{ name: "check:fixture", label: "Fixture check", script: scriptPath, jsonDiagnostics: true }],
          { heading: "verify" },
        ),
      /exit:1/,
    );
  } finally {
    console.log = originalLog;
    process.exit = originalExit;
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const output = JSON.parse(logs.join("\n")) as {
    status: string;
    results: Array<{
      errors: Array<{ code: string; message: string; rerun: string; stdout_tail: string; command: string; exit_code: number }>;
    }>;
  };
  assert.equal(output.status, "fail");
  assert.equal(output.results[0].errors[0].code, "TASK_FAILED");
  assert.match(output.results[0].errors[0].message, /"status":"fail"/);
  assert.equal(output.results[0].errors[0].rerun, "npm run check:fixture");
  assert.match(output.results[0].errors[0].stdout_tail, /"status":"fail"/);
  assert.match(output.results[0].errors[0].command, /bad-json-check/);
  assert.equal(output.results[0].errors[0].exit_code, 1);
});
