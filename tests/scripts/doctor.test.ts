import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { dependencyReadinessCheck, workflowReadinessChecks } from "../../scripts/lib/doctor.js";

test("dependencyReadinessCheck points lockfile installs at npm ci", () => {
  const root = tempRepo();
  try {
    writeJson(path.join(root, "package.json"), {
      devDependencies: {
        tsx: "^4.0.0",
      },
    });
    fs.writeFileSync(path.join(root, "package-lock.json"), "{}\n", "utf8");

    assert.deepEqual(dependencyReadinessCheck(root), {
      name: "dependencies",
      status: "warn",
      detail: "node_modules missing; package-lock.json present",
      hint: "run npm ci",
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("dependencyReadinessCheck warns when dependencies lack a lockfile", () => {
  const root = tempRepo();
  try {
    writeJson(path.join(root, "package.json"), {
      dependencies: {
        typedoc: "^0.28.0",
      },
    });

    assert.deepEqual(dependencyReadinessCheck(root), {
      name: "dependencies",
      status: "warn",
      detail: "package-lock.json missing",
      hint: "run npm install to recreate the lockfile, then review the diff",
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks validates verify and Pages workflow contracts", () => {
  const root = tempRepo();
  try {
    const workflowDir = path.join(root, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(
      path.join(workflowDir, "verify.yml"),
      [
        "steps:",
        "  - uses: actions/checkout@v6",
        "  - uses: actions/setup-node@v6",
        "    with:",
        "      cache: npm",
        "  - run: npm ci",
        "  - run: npm run verify",
      ].join("\n"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(workflowDir, "pages.yml"),
      [
        "steps:",
        "  - uses: actions/configure-pages@v6",
        "  - uses: actions/upload-pages-artifact@v5",
        "    with:",
        "      path: sites",
        "  - uses: actions/deploy-pages@v5",
      ].join("\n"),
      "utf8",
    );

    assert.deepEqual(workflowReadinessChecks(root), [
      {
        name: "verify workflow",
        status: "pass",
        detail: ".github/workflows/verify.yml ready",
      },
      {
        name: "pages workflow",
        status: "pass",
        detail: ".github/workflows/pages.yml ready",
      },
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks reports missing workflow contract markers", () => {
  const root = tempRepo();
  try {
    const workflowDir = path.join(root, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(path.join(workflowDir, "verify.yml"), "steps:\n  - run: npm test\n", "utf8");

    const results = workflowReadinessChecks(root);
    assert.equal(results[0].status, "fail");
    assert.equal(
      results[0].detail,
      ".github/workflows/verify.yml missing actions/checkout, actions/setup-node, cache: npm, npm ci, npm run verify",
    );
    assert.equal(results[1].status, "fail");
    assert.equal(results[1].detail, ".github/workflows/pages.yml missing");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function tempRepo(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-doctor-test-"));
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
