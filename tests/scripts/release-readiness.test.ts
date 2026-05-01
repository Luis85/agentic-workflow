import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXPECTED_PACKAGE_NAME,
  EXPECTED_PACKAGE_REGISTRY,
  EXPECTED_PACKAGE_REPOSITORY,
  RELEASE_READINESS_DIAGNOSTIC_CODES,
  checkReleaseReadiness,
  parseReleaseReadinessArgs,
  type GitInterface,
  type QualitySignals,
} from "../../scripts/lib/release-readiness.js";
import { RELEASE_PACKAGE_DIAGNOSTIC_CODES } from "../../scripts/lib/release-package-contract.js";

const SCRIPT_PATH = fileURLToPath(
  new URL("../../scripts/check-release-readiness.ts", import.meta.url),
);

// Resolve `tsx` to an absolute file URL once so spawnSync can invoke the CLI
// from any working directory — bare `--import tsx` would resolve relative to
// the spawned child's cwd and fail when cwd is outside the repo (the case the
// CWD regression test deliberately exercises).
const TSX_LOADER_URL = import.meta.resolve("tsx");

interface RunCliOptions {
  env?: NodeJS.ProcessEnv;
  cwd?: string;
}

function runCli(args: readonly string[], opts: RunCliOptions = {}) {
  return spawnSync(
    process.execPath,
    ["--import", TSX_LOADER_URL, SCRIPT_PATH, ...args],
    {
      encoding: "utf8",
      windowsHide: true,
      env: { ...process.env, ...(opts.env ?? {}) },
      cwd: opts.cwd,
    },
  );
}

const VERSION = "0.5.0";
const TAG_SHA = "0123456789abcdef0123456789abcdef01234567";

const VALID_PACKAGE_JSON = {
  name: EXPECTED_PACKAGE_NAME,
  version: VERSION,
  publishConfig: { registry: EXPECTED_PACKAGE_REGISTRY },
  repository: EXPECTED_PACKAGE_REPOSITORY,
  files: ["scripts/", "templates/", "README.md"],
};

const VALID_RELEASE_YML = `
changelog:
  exclude:
    labels:
      - release
      - chore-release
    authors:
      - dependabot
  categories:
    - title: Features
      labels: [feat]
    - title: Bug Fixes
      labels: [fix]
    - title: Other Changes
      labels: ["*"]
`;

const VALID_RELEASE_WORKFLOW = `
name: Release
on:
  workflow_dispatch:
    inputs:
      version:
        required: true
permissions:
  contents: write
  packages: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - run: echo release
`;

const VALID_CHANGELOG = `# Changelog

## [v${VERSION}] — 2026-05-04

### Added
- v0.5 release readiness check.
`;

const GREEN_QUALITY: QualitySignals = {
  ciStatus: "green",
  validationStatus: "green",
  openBlockers: 0,
  openClarifications: 0,
  maturityLevel: 4,
};

const STUB_GIT: GitInterface = {
  resolveRef(ref) {
    if (ref === `v${VERSION}`) return TAG_SHA;
    if (ref === "refs/heads/main" || ref === "main") return TAG_SHA;
    return null;
  },
};

interface FixtureOverrides {
  packageJson?: unknown;
  changelog?: string | null;
  releaseYml?: string | null;
  releaseWorkflow?: string | null;
}

function createFixture(overrides: FixtureOverrides = {}): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-readiness-"));
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(overrides.packageJson ?? VALID_PACKAGE_JSON, null, 2),
  );
  if (overrides.changelog !== null) {
    fs.writeFileSync(path.join(dir, "CHANGELOG.md"), overrides.changelog ?? VALID_CHANGELOG);
  }
  fs.mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  if (overrides.releaseYml !== null) {
    fs.writeFileSync(path.join(dir, ".github", "release.yml"), overrides.releaseYml ?? VALID_RELEASE_YML);
  }
  if (overrides.releaseWorkflow !== null) {
    fs.writeFileSync(
      path.join(dir, ".github", "workflows", "release.yml"),
      overrides.releaseWorkflow ?? VALID_RELEASE_WORKFLOW,
    );
  }
  return dir;
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

function run(repoRoot: string, archive?: string, signals: QualitySignals = GREEN_QUALITY) {
  return checkReleaseReadiness({
    version: VERSION,
    repoRoot,
    archive,
    git: STUB_GIT,
    qualitySignals: signals,
  });
}

test("Scenario 1 — valid release passes with no diagnostics", () => {
  const repoRoot = createFixture();
  try {
    const report = run(repoRoot);
    assert.deepEqual(
      report.diagnostics,
      [],
      `expected zero diagnostics, got: ${JSON.stringify(report.diagnostics, null, 2)}`,
    );
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 2 — missing CHANGELOG entry fails with stable diagnostic", () => {
  const repoRoot = createFixture({ changelog: "# Changelog\n\n## [v0.4.0] — 2026-04-01\n" });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.ChangelogMissing,
    );
    assert.ok(d, "expected RELEASE_READINESS_CHANGELOG_MISSING diagnostic");
    assert.match(d.message, /\[v0\.5\.0\]/);
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 2b — absent CHANGELOG.md file also fails with the same code", () => {
  const repoRoot = createFixture({ changelog: null });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.ChangelogMissing,
    );
    assert.ok(d, "expected RELEASE_READINESS_CHANGELOG_MISSING diagnostic for absent file");
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 3 — missing lifecycle release notes fails with stable diagnostic", () => {
  const repoRoot = createFixture({ releaseYml: null });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesMissing,
    );
    assert.ok(d, "expected RELEASE_READINESS_RELEASE_YML_MISSING diagnostic");
    assert.equal(d.path, ".github/release.yml");
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 3b — release.yml missing changelog block fails ReleaseNotesShape", () => {
  const repoRoot = createFixture({ releaseYml: "# empty\n" });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.ReleaseNotesShape,
    );
    assert.ok(d, "expected RELEASE_READINESS_RELEASE_YML_SHAPE diagnostic");
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 4 — package metadata drift fails per drifting field", () => {
  const repoRoot = createFixture({
    packageJson: {
      name: "@someone-else/agentic-workflow",
      version: VERSION,
      publishConfig: { registry: "https://registry.npmjs.org" },
      repository: "https://github.com/someone-else/agentic-workflow",
      files: ["README.md"],
    },
  });
  try {
    const report = run(repoRoot);
    const codes = new Set(report.diagnostics.map((d) => d.code));
    assert.ok(codes.has(RELEASE_READINESS_DIAGNOSTIC_CODES.PkgName), "expected PkgName drift");
    assert.ok(
      codes.has(RELEASE_READINESS_DIAGNOSTIC_CODES.PkgRegistry),
      "expected PkgRegistry drift",
    );
    assert.ok(
      codes.has(RELEASE_READINESS_DIAGNOSTIC_CODES.PkgRepository),
      "expected PkgRepository drift",
    );
    // version still aligned, but PkgFiles only fails if expectedFiles supplied OR files empty
    // — here files is non-empty, so PkgFiles should NOT fire by default
    assert.ok(
      !codes.has(RELEASE_READINESS_DIAGNOSTIC_CODES.PkgFiles),
      "PkgFiles should not fire when files array is non-empty and no expected list given",
    );
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 4b — empty package.json#files fails PkgFiles", () => {
  const repoRoot = createFixture({
    packageJson: { ...VALID_PACKAGE_JSON, files: [] },
  });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.PkgFiles,
    );
    assert.ok(d, "expected RELEASE_READINESS_PKG_FILES diagnostic when files is empty");
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 4c — version mismatch fails Version code", () => {
  const repoRoot = createFixture({
    packageJson: { ...VALID_PACKAGE_JSON, version: "0.4.9" },
  });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.Version,
    );
    assert.ok(d, "expected RELEASE_READINESS_VERSION_MISMATCH diagnostic");
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 5 — unsafe workflow permissions fail with stable diagnostic", () => {
  const unsafeWorkflow = `
name: Release
on: workflow_dispatch
permissions:
  contents: write
  packages: write
  actions: write
  id-token: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - run: echo release
`;
  const repoRoot = createFixture({ releaseWorkflow: unsafeWorkflow });
  try {
    const report = run(repoRoot);
    const perms = report.diagnostics.filter(
      (d) => d.code === RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
    );
    assert.ok(perms.length >= 2, "expected diagnostics for both disallowed scopes");
    assert.ok(
      perms.some((d) => /actions/.test(d.message)),
      "expected diagnostic naming `actions`",
    );
    assert.ok(
      perms.some((d) => /id-token/.test(d.message)),
      "expected diagnostic naming `id-token`",
    );
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 5b — `permissions: write-all` fails", () => {
  const repoRoot = createFixture({
    releaseWorkflow: `
name: Release
on: workflow_dispatch
permissions: write-all
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - run: echo release
`,
  });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions,
    );
    assert.ok(d, "expected WorkflowPermissions diagnostic for write-all");
    assert.match(d.message, /write-all/);
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 5c — workflow file absent fails WorkflowMissing", () => {
  const repoRoot = createFixture({ releaseWorkflow: null });
  try {
    const report = run(repoRoot);
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowMissing,
    );
    assert.ok(d, "expected WorkflowMissing diagnostic");
  } finally {
    cleanup(repoRoot);
  }
});

test("Scenario 6 — fresh-surface composition surfaces RELEASE_PKG_* unchanged", () => {
  const repoRoot = createFixture();
  const archive = fs.mkdtempSync(path.join(os.tmpdir(), "release-readiness-archive-"));
  try {
    // Stub template (precondition for assertion 3)
    fs.mkdirSync(path.join(archive, "templates"), { recursive: true });
    fs.writeFileSync(
      path.join(archive, "templates", "release-package-stub.md"),
      "stub template body",
    );
    // Numbered ADR — violates assertion 1
    fs.mkdirSync(path.join(archive, "docs", "adr"), { recursive: true });
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "0099-leaked.md"),
      "# leaked ADR\n",
    );
    // Built-up doc that ADR README would need — violates assertion 3
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      "# ADR Index\n\nbuilt-up content with no TODO marker\n",
    );
    // Per-feature spec — violates assertion 2
    fs.mkdirSync(path.join(archive, "specs", "version-x"), { recursive: true });
    fs.writeFileSync(path.join(archive, "specs", "version-x", "tasks.md"), "# tasks\n");

    const report = run(repoRoot, archive);

    const codes = new Set(report.diagnostics.map((d) => d.code));
    assert.ok(
      codes.has(RELEASE_PACKAGE_DIAGNOSTIC_CODES.Adr),
      "fresh-surface ADR diagnostic must surface unchanged",
    );
    assert.ok(
      codes.has(RELEASE_PACKAGE_DIAGNOSTIC_CODES.Intake),
      "fresh-surface Intake diagnostic must surface unchanged",
    );
    assert.ok(
      codes.has(RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub),
      "fresh-surface DocStub diagnostic must surface unchanged",
    );
    assert.ok(report.freshSurface, "report must expose the fresh-surface sub-report");
    assert.equal(report.freshSurface.archive, archive);
  } finally {
    cleanup(archive);
    cleanup(repoRoot);
  }
});

test("quality signals: missing signals fail closed with Quality code", () => {
  const repoRoot = createFixture();
  try {
    const report = checkReleaseReadiness({
      version: VERSION,
      repoRoot,
      git: STUB_GIT,
      qualitySignals: undefined,
    });
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
    );
    assert.ok(d, "expected Quality diagnostic when signals absent");
  } finally {
    cleanup(repoRoot);
  }
});

test("quality signals: red CI status fails Quality", () => {
  const repoRoot = createFixture();
  try {
    const report = run(repoRoot, undefined, { ...GREEN_QUALITY, ciStatus: "red" });
    const d = report.diagnostics.find(
      (x) =>
        x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.Quality && /CI status/.test(x.message),
    );
    assert.ok(d, "expected Quality diagnostic for red CI status");
  } finally {
    cleanup(repoRoot);
  }
});

test("quality signals: explicit operator waiver bypasses Quality assertions", () => {
  const repoRoot = createFixture();
  try {
    const report = run(repoRoot, undefined, {
      ...GREEN_QUALITY,
      ciStatus: "red",
      validationStatus: "red",
      openBlockers: 5,
      maturityLevel: 0,
      waiver: "release-operator: rolling forward despite known issues",
    });
    const quality = report.diagnostics.filter(
      (d) => d.code === RELEASE_READINESS_DIAGNOSTIC_CODES.Quality,
    );
    assert.equal(quality.length, 0, "waiver must suppress Quality diagnostics");
  } finally {
    cleanup(repoRoot);
  }
});

test("tag readiness: missing tag fails TagMissing", () => {
  const repoRoot = createFixture();
  try {
    const report = checkReleaseReadiness({
      version: VERSION,
      repoRoot,
      git: { resolveRef: () => null },
      qualitySignals: GREEN_QUALITY,
    });
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.TagMissing,
    );
    assert.ok(d, "expected RELEASE_READINESS_TAG_MISSING when tag absent");
  } finally {
    cleanup(repoRoot);
  }
});

test("tag readiness: tag SHA differs from main HEAD fails TagNotAtMain", () => {
  const repoRoot = createFixture();
  try {
    const report = checkReleaseReadiness({
      version: VERSION,
      repoRoot,
      git: {
        resolveRef(ref) {
          if (ref === `v${VERSION}`) return "a".repeat(40);
          if (ref === "refs/heads/main" || ref === "main") return "b".repeat(40);
          return null;
        },
      },
      qualitySignals: GREEN_QUALITY,
    });
    const d = report.diagnostics.find(
      (x) => x.code === RELEASE_READINESS_DIAGNOSTIC_CODES.TagNotAtMain,
    );
    assert.ok(d, "expected TagNotAtMain when tag SHA != main HEAD");
  } finally {
    cleanup(repoRoot);
  }
});

test("parseReleaseReadinessArgs accepts --version and --archive in argv and env", () => {
  assert.deepEqual(parseReleaseReadinessArgs(["--version", "0.5.0", "--archive", "/tmp/pkg"], {}), {
    kind: "args",
    version: "0.5.0",
    versionSource: "argv",
    archive: "/tmp/pkg",
    archiveSource: "argv",
  });
  assert.deepEqual(parseReleaseReadinessArgs(["--version=0.5.0"], {}), {
    kind: "args",
    version: "0.5.0",
    versionSource: "argv",
  });
  assert.deepEqual(parseReleaseReadinessArgs([], { RELEASE_VERSION: "0.5.0" }), {
    kind: "args",
    version: "0.5.0",
    versionSource: "env",
  });
});

test("parseReleaseReadinessArgs flags empty --version value (Codex P1 regression)", () => {
  assert.deepEqual(parseReleaseReadinessArgs(["--version"], {}), {
    kind: "argv-empty",
    rawFlag: "--version",
  });
  assert.deepEqual(parseReleaseReadinessArgs(["--version", ""], {}), {
    kind: "argv-empty",
    rawFlag: "--version",
  });
  assert.deepEqual(parseReleaseReadinessArgs(["--version", "--archive"], {}), {
    kind: "argv-empty",
    rawFlag: "--version",
  });
  assert.deepEqual(parseReleaseReadinessArgs(["--version="], {}), {
    kind: "argv-empty",
    rawFlag: "--version=",
  });
});

test("parseReleaseReadinessArgs returns no version when nothing provided (skip path)", () => {
  const out = parseReleaseReadinessArgs([], {});
  assert.equal(out.kind, "args");
  assert.equal((out as { version?: string }).version, undefined);
});

test("CLI: archive without version fails closed (Codex P1 PR #158 regression)", () => {
  // Adversary case: release automation passes only `--archive` (or only the
  // RELEASE_PACKAGE_ARCHIVE env). The CLI must NOT silently skip — supplying
  // an archive implies a release context, so readiness must run end-to-end.
  const result = runCli(["--archive", "/nonexistent-archive"], {
    env: {
      RELEASE_VERSION: "",
      RELEASE_PACKAGE_ARCHIVE: "",
    },
  });
  assert.equal(
    result.status,
    1,
    `expected non-zero exit, got status=${result.status}; stdout=${result.stdout}; stderr=${result.stderr}`,
  );
  assert.match(result.stderr + result.stdout, /RELEASE_READINESS_ARG/);
  assert.match(
    result.stderr + result.stdout,
    /`--archive` provided without `--version`/,
  );
});

test("CLI: relative archive path resolves against repoRoot, not caller CWD (Codex P2 PR #158 regression)", () => {
  // Adversary case: caller invokes from a non-repo working directory with a
  // relative archive path. `check-release-package-contents` resolves relative
  // paths against repoRoot; this CLI must do the same so Layer 2 behaviour
  // does not depend on caller CWD.
  //
  // Codex round 2 (PR #158) flagged that the original test inherited the
  // test-process cwd (the repo root), making it pass even if the CLI
  // regressed to `process.cwd()`. The fix passes `cwd: tmpCwd` to spawnSync
  // so the CLI runs from a directory that is NOT the repo root, then asserts
  // the resolved path contains the repo root and is invariant to the cwd.
  const tmpCwd = fs.mkdtempSync(path.join(os.tmpdir(), "release-readiness-cwd-"));
  try {
    const result = runCli(["--version", "0.5.0", "--archive", "./does-not-exist-here"], {
      cwd: tmpCwd,
      env: {
        RELEASE_VERSION: "",
        RELEASE_PACKAGE_ARCHIVE: "",
      },
    });
    const combined = result.stdout + result.stderr;
    assert.equal(result.status, 1, `expected non-zero exit; combined=${combined}`);
    assert.match(combined, /RELEASE_READINESS_ARG/);
    assert.match(combined, /resolved:.*does-not-exist-here/);
    // If the CLI regresses to `process.cwd()`, the resolved path will start
    // with `tmpCwd`. Assert that `tmpCwd` does NOT appear in the diagnostic
    // and that the resolved path is in fact the worktree root + relative path.
    assert.doesNotMatch(
      combined,
      new RegExp(tmpCwd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `resolved path must not be relative to caller CWD (${tmpCwd})`,
    );
  } finally {
    fs.rmSync(tmpCwd, { recursive: true, force: true });
  }
});
