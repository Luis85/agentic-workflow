import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  branchReadinessCheck,
  dependencyReadinessCheck,
  workflowReadinessChecks,
  worktreeHygieneCheck,
} from "../../scripts/lib/doctor.js";

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
    fs.writeFileSync(path.join(workflowDir, "verify.yml"), validVerifyWorkflow(), "utf8");
    fs.writeFileSync(
      path.join(workflowDir, "pages.yml"),
      [
        "steps:",
        "  - uses: actions/checkout@v6",
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
      ".github/workflows/verify.yml missing pull_request:, - main, actions/checkout, actions/setup-node, cache: npm, npm ci, npm run verify, actions/checkout SHA-pinned, actions/setup-node SHA-pinned",
    );
    assert.equal(results[1].status, "fail");
    assert.equal(results[1].detail, ".github/workflows/pages.yml missing");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks fails when verify.yml lacks the pull_request trigger", () => {
  const root = tempRepo();
  try {
    const workflowDir = path.join(root, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(
      path.join(workflowDir, "verify.yml"),
      validVerifyWorkflow().replace("pull_request:\n  ", ""),
      "utf8",
    );
    fs.writeFileSync(path.join(workflowDir, "pages.yml"), validPagesWorkflow(), "utf8");

    const results = workflowReadinessChecks(root);
    assert.equal(results[0].status, "fail");
    assert.equal(results[0].detail, ".github/workflows/verify.yml missing pull_request:");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks fails when verify.yml does not push to main", () => {
  const root = tempRepo();
  try {
    const workflowDir = path.join(root, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(
      path.join(workflowDir, "verify.yml"),
      validVerifyWorkflow().replace("- main", "- develop"),
      "utf8",
    );
    fs.writeFileSync(path.join(workflowDir, "pages.yml"), validPagesWorkflow(), "utf8");

    const results = workflowReadinessChecks(root);
    assert.equal(results[0].status, "fail");
    assert.equal(results[0].detail, ".github/workflows/verify.yml missing - main");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks fails when actions/checkout is not SHA-pinned in verify.yml", () => {
  const root = tempRepo();
  try {
    const workflowDir = path.join(root, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(
      path.join(workflowDir, "verify.yml"),
      validVerifyWorkflow().replace(
        "actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd",
        "actions/checkout@v6",
      ),
      "utf8",
    );
    fs.writeFileSync(path.join(workflowDir, "pages.yml"), validPagesWorkflow(), "utf8");

    const results = workflowReadinessChecks(root);
    assert.equal(results[0].status, "fail");
    assert.equal(results[0].detail, ".github/workflows/verify.yml missing actions/checkout SHA-pinned");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks fails when actions/setup-node is not SHA-pinned in verify.yml", () => {
  const root = tempRepo();
  try {
    const workflowDir = path.join(root, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    fs.writeFileSync(
      path.join(workflowDir, "verify.yml"),
      validVerifyWorkflow().replace(
        "actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
        "actions/setup-node@v6",
      ),
      "utf8",
    );
    fs.writeFileSync(path.join(workflowDir, "pages.yml"), validPagesWorkflow(), "utf8");

    const results = workflowReadinessChecks(root);
    assert.equal(results[0].status, "fail");
    assert.equal(results[0].detail, ".github/workflows/verify.yml missing actions/setup-node SHA-pinned");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("workflowReadinessChecks requires checkout before uploading Pages artifacts", () => {
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

    const results = workflowReadinessChecks(root);
    assert.equal(results[1].status, "fail");
    assert.equal(results[1].detail, ".github/workflows/pages.yml missing actions/checkout");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("branchReadinessCheck passes a clean tracked branch", () => {
  assert.deepEqual(
    branchReadinessCheck({
      branchName: "feat/example",
      upstreamName: "origin/feat/example",
      ahead: 0,
      behind: 0,
    }),
    {
      name: "branch",
      status: "pass",
      detail: "feat/example -> origin/feat/example",
    },
  );
});

test("branchReadinessCheck warns when a branch is behind upstream", () => {
  assert.deepEqual(
    branchReadinessCheck({
      branchName: "main",
      upstreamName: "origin/main",
      ahead: 0,
      behind: 3,
    }),
    {
      name: "branch",
      status: "warn",
      detail: "main -> origin/main; behind 3",
      hint: "run git pull --ff-only",
    },
  );
});

test("branchReadinessCheck fails when an integration branch is ahead", () => {
  assert.deepEqual(
    branchReadinessCheck({
      branchName: "develop",
      upstreamName: "origin/develop",
      ahead: 1,
      behind: 0,
    }),
    {
      name: "branch",
      status: "fail",
      detail: "develop -> origin/develop; ahead 1",
      hint: "preserve any work on a topic branch, then reset develop only after confirming it is safe",
    },
  );
});

test("worktreeHygieneCheck warns for unregistered .worktrees directories", () => {
  const result = worktreeHygieneCheck({
    registeredWorktrees: ["/repo", "/repo/.worktrees/active"],
    worktreeDirectories: ["active", "stale-empty"],
    mergedBranches: ["main"],
    currentBranch: "feat/current",
  });

  assert.equal(result.status, "warn");
  assert.equal(result.detail, "2 registered; 1 hygiene warning(s)");
  assert.match(result.hint || "", /\.worktrees\/stale-empty is not registered/);
});

test("worktreeHygieneCheck warns for merged local branches", () => {
  const result = worktreeHygieneCheck({
    registeredWorktrees: ["/repo"],
    worktreeDirectories: [],
    mergedBranches: ["main", "feat/old", "feat/current"],
    currentBranch: "feat/current",
  });

  assert.equal(result.status, "warn");
  assert.equal(result.detail, "1 registered; 1 hygiene warning(s)");
  assert.match(result.hint || "", /feat\/old is already merged into origin\/main/);
});

function tempRepo(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agentic-workflow-doctor-test-"));
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function validVerifyWorkflow(): string {
  return [
    "on:",
    "  pull_request:",
    "  push:",
    "    branches:",
    "      - main",
    "jobs:",
    "  verify:",
    "    steps:",
    "      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd",
    "      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
    "        with:",
    "          cache: npm",
    "      - run: npm ci",
    "      - run: npm run verify",
    "",
  ].join("\n");
}

function validPagesWorkflow(): string {
  return [
    "steps:",
    "  - uses: actions/checkout@v6",
    "  - uses: actions/configure-pages@v6",
    "  - uses: actions/upload-pages-artifact@v5",
    "    with:",
    "      path: sites",
    "  - uses: actions/deploy-pages@v5",
    "",
  ].join("\n");
}
