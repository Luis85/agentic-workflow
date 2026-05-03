import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { repoRoot } from "../../scripts/lib/repo.js";
import {
  ADR_NUMBERED_PATTERN,
  DOC_STUB_REQUIRED_FRONTMATTER_KEYS,
  INTAKE_FOLDERS,
  RELEASE_PACKAGE_DIAGNOSTIC_CODES,
  checkReleasePackageContents,
  parseReleasePackageArgs,
} from "../../scripts/lib/release-package-contract.js";

const STUB_DOC = `---
title: "Example"
folder: "docs"
description: "Example stub"
entry_point: false
---

# Example

<!-- TODO: replace with consumer-facing intent paragraph -->

## Section

<!-- TODO: fill in -->
`;

function createCleanArchive(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-package-contract-"));
  // Stub template (precondition for assertion 3)
  fs.mkdirSync(path.join(dir, "templates"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "templates", "release-package-stub.md"),
    "stub template body",
  );
  // docs/adr/README.md ships as a stub per ADR-0021 §Decision.2
  fs.mkdirSync(path.join(dir, "docs", "adr"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs", "adr", "README.md"), STUB_DOC);
  // Intake folders may contain only README.md
  fs.mkdirSync(path.join(dir, "specs"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "specs", "README.md"),
    "# specs\n\nIntake folder README.\n",
  );
  return dir;
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

test("ADR_NUMBERED_PATTERN matches the canonical glob shape", () => {
  assert.match("0001-record-architecture-decisions.md", ADR_NUMBERED_PATTERN);
  assert.match("0021-release-package-fresh-surface.md", ADR_NUMBERED_PATTERN);
  assert.doesNotMatch("README.md", ADR_NUMBERED_PATTERN);
  assert.doesNotMatch("123-too-short.md", ADR_NUMBERED_PATTERN);
  assert.doesNotMatch("0001-no-extension", ADR_NUMBERED_PATTERN);
});

test("INTAKE_FOLDERS enumerates the 11 intake folders from ADR-0021 §Decision.3 and ADR-0030", () => {
  assert.deepEqual(INTAKE_FOLDERS, [
    "inputs",
    "specs",
    "discovery",
    "projects",
    "portfolio",
    "roadmaps",
    "quality",
    "scaffolding",
    "stock-taking",
    "sales",
    "issues",
  ]);
});

test("clean fresh-surface archive passes all three assertions", () => {
  const archive = createCleanArchive();
  try {
    const report = checkReleasePackageContents(archive);
    assert.deepEqual(report.diagnostics, []);
  } finally {
    cleanup(archive);
  }
});

test("numbered ADR file fails assertion 1 with a deterministic diagnostic", () => {
  const archive = createCleanArchive();
  try {
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "0021-leftover.md"),
      "# ADR-0021 leaked\n",
    );
    const report = checkReleasePackageContents(archive);
    const adr = report.diagnostics.find(
      (d) => d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.Adr,
    );
    assert.ok(adr, "expected RELEASE_PKG_ADR diagnostic");
    assert.equal(adr.path, "docs/adr/0021-leftover.md");
    assert.match(adr.message, /numbered ADR file must not ship/);
    assert.match(adr.message, /assertion 1/);
  } finally {
    cleanup(archive);
  }
});

test("non-empty intake folder fails assertion 2 with a deterministic diagnostic", () => {
  const archive = createCleanArchive();
  try {
    fs.mkdirSync(path.join(archive, "specs", "version-x-plan"), { recursive: true });
    fs.writeFileSync(
      path.join(archive, "specs", "version-x-plan", "tasks.md"),
      "# tasks\n",
    );
    const report = checkReleasePackageContents(archive);
    const intake = report.diagnostics.find(
      (d) => d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.Intake,
    );
    assert.ok(intake, "expected RELEASE_PKG_INTAKE diagnostic");
    assert.equal(intake.path, "specs/version-x-plan/");
    assert.match(intake.message, /intake folder `specs\/`/);
    assert.match(intake.message, /assertion 2/);
  } finally {
    cleanup(archive);
  }
});

test("non-README file directly under an intake folder fails assertion 2", () => {
  const archive = createCleanArchive();
  try {
    fs.mkdirSync(path.join(archive, "sales"), { recursive: true });
    fs.writeFileSync(path.join(archive, "sales", "deal-state.md"), "leftover");
    const report = checkReleasePackageContents(archive);
    const intake = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.Intake &&
        d.path === "sales/deal-state.md",
    );
    assert.ok(intake, "expected RELEASE_PKG_INTAKE diagnostic for sales/deal-state.md");
  } finally {
    cleanup(archive);
  }
});

test("non-directory intake path fails assertion 2 (Codex P2 regression)", () => {
  const archive = createCleanArchive();
  try {
    // Adversary case: an archive ships `sales` as a file rather than a folder.
    // Without the fix, statSync().isDirectory() === false skipped silently.
    fs.writeFileSync(path.join(archive, "sales"), "not a directory");
    const report = checkReleasePackageContents(archive);
    const intake = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.Intake && d.path === "sales",
    );
    assert.ok(
      intake,
      "expected RELEASE_PKG_INTAKE diagnostic for non-directory intake path",
    );
    assert.match(intake.message, /must be a directory/);
  } finally {
    cleanup(archive);
  }
});

test("built-up doc (missing stub TODO marker) fails assertion 3", () => {
  const archive = createCleanArchive();
  try {
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      `---
title: "ADR Index"
folder: "docs/adr"
description: "All accepted ADRs."
entry_point: true
---

# ADR Index

Long-form built-up content that ships from the codebase form. No TODO markers anywhere.
`,
    );
    const report = checkReleasePackageContents(archive);
    const stub = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub &&
        d.path === "docs/adr/README.md" &&
        /TODO/.test(d.message),
    );
    assert.ok(stub, "expected RELEASE_PKG_DOC_STUB diagnostic citing missing TODO marker");
  } finally {
    cleanup(archive);
  }
});

test("doc missing frontmatter fails assertion 3", () => {
  const archive = createCleanArchive();
  try {
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      "# ADR Index\n\n<!-- TODO: fill in -->\n",
    );
    const report = checkReleasePackageContents(archive);
    const stub = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub &&
        /missing frontmatter\b/.test(d.message),
    );
    assert.ok(stub, "expected diagnostic for missing frontmatter");
  } finally {
    cleanup(archive);
  }
});

test("doc missing required frontmatter key fails assertion 3", () => {
  const archive = createCleanArchive();
  try {
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      `---
title: "ADR Index"
description: "All accepted ADRs."
entry_point: true
---

# ADR Index

<!-- TODO: fill in -->
`,
    );
    const report = checkReleasePackageContents(archive);
    const missingKey = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub &&
        /missing frontmatter key: folder/.test(d.message),
    );
    assert.ok(missingKey, "expected diagnostic for missing `folder` key");
    // Sanity: every required key should be enumerable
    assert.ok(DOC_STUB_REQUIRED_FRONTMATTER_KEYS.includes("folder"));
  } finally {
    cleanup(archive);
  }
});

test("doc missing top-level heading fails assertion 3", () => {
  const archive = createCleanArchive();
  try {
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      `---
title: "ADR Index"
folder: "docs/adr"
description: "All accepted ADRs."
entry_point: true
---

No heading line in this body.

<!-- TODO: fill in -->
`,
    );
    const report = checkReleasePackageContents(archive);
    const noHeading = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub &&
        /missing top-level/.test(d.message),
    );
    assert.ok(noHeading, "expected diagnostic for missing top-level heading");
  } finally {
    cleanup(archive);
  }
});

test("missing stub template fails closed before doc inspection", () => {
  const archive = createCleanArchive();
  try {
    fs.unlinkSync(path.join(archive, "templates", "release-package-stub.md"));
    // Drop a built-up doc that would also fail assertion 3 — the fail-closed
    // diagnostic should still surface in place of per-doc diagnostics.
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      "# ADR Index\n\nlots of built-up content\n",
    );
    const report = checkReleasePackageContents(archive);
    const failClosed = report.diagnostics.find(
      (d) => d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.StubTemplateMissing,
    );
    assert.ok(failClosed, "expected fail-closed diagnostic when stub template missing");
    assert.equal(failClosed.path, "templates/release-package-stub.md");
    const docStubFromAdrReadme = report.diagnostics.find(
      (d) =>
        d.code === RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub &&
        d.path === "docs/adr/README.md",
    );
    assert.equal(
      docStubFromAdrReadme,
      undefined,
      "fail-closed must short-circuit per-doc inspection",
    );
  } finally {
    cleanup(archive);
  }
});

test("parseReleasePackageArgs accepts `--archive <dir>` and `--archive=<dir>`", () => {
  assert.deepEqual(parseReleasePackageArgs(["--archive", "/tmp/pkg"], {}), {
    archive: "/tmp/pkg",
    archiveSource: "argv",
  });
  assert.deepEqual(parseReleasePackageArgs(["--archive=/tmp/pkg"], {}), {
    archive: "/tmp/pkg",
    archiveSource: "argv",
  });
});

test("TEST-GRAPH-008: graph directory is excluded from package files", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  ) as { files?: string[] };
  const includesGraphDirectory = (entry: string) => {
    const normalized = entry
      .replace(/\\/g, "/")
      .replace(/\/+$/, "")
      .replace(/^(\.\/)+/, "")
      .replace(/^\/+/, "");
    return normalized === "graph" || normalized.startsWith("graph/");
  };

  assert.ok(Array.isArray(packageJson.files));
  assert.equal(packageJson.files.some(includesGraphDirectory), false);
  assert.equal(includesGraphDirectory("graph"), true);
  assert.equal(includesGraphDirectory("graph/"), true);
  assert.equal(includesGraphDirectory("./graph"), true);
  assert.equal(includesGraphDirectory("/graph"), true);
  assert.equal(includesGraphDirectory("graph/graph.json"), true);
  assert.equal(includesGraphDirectory("./graph/graph.json"), true);
  assert.equal(includesGraphDirectory("/graph/graph.json"), true);
});

test("parseReleasePackageArgs falls back to RELEASE_PACKAGE_ARCHIVE env", () => {
  assert.deepEqual(
    parseReleasePackageArgs([], { RELEASE_PACKAGE_ARCHIVE: "/tmp/env-pkg" }),
    { archive: "/tmp/env-pkg", archiveSource: "env" },
  );
});

test("parseReleasePackageArgs returns `none` when nothing is provided", () => {
  assert.deepEqual(parseReleasePackageArgs([], {}), { archiveSource: "none" });
});

test("parseReleasePackageArgs flags empty `--archive` value (Codex P1 regression)", () => {
  // Trailing flag: argv variant
  assert.deepEqual(parseReleasePackageArgs(["--archive"], {}), {
    archiveSource: "argv-empty",
    rawFlag: "--archive",
  });
  // Empty value via shell expansion: --archive ""
  assert.deepEqual(parseReleasePackageArgs(["--archive", ""], {}), {
    archiveSource: "argv-empty",
    rawFlag: "--archive",
  });
  // Followed by another flag: --archive --json
  assert.deepEqual(parseReleasePackageArgs(["--archive", "--json"], {}), {
    archiveSource: "argv-empty",
    rawFlag: "--archive",
  });
  // `--archive=` with empty RHS
  assert.deepEqual(parseReleasePackageArgs(["--archive="], {}), {
    archiveSource: "argv-empty",
    rawFlag: "--archive=",
  });
});

test("parseReleasePackageArgs argv beats env", () => {
  assert.deepEqual(
    parseReleasePackageArgs(["--archive", "/tmp/argv"], {
      RELEASE_PACKAGE_ARCHIVE: "/tmp/env",
    }),
    { archive: "/tmp/argv", archiveSource: "argv" },
  );
});

test("violations across all three assertions are reported together", () => {
  const archive = createCleanArchive();
  try {
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "0099-leftover.md"),
      "# leak\n",
    );
    fs.mkdirSync(path.join(archive, "discovery", "old-sprint"), { recursive: true });
    fs.writeFileSync(
      path.join(archive, "discovery", "old-sprint", "frame.md"),
      "leftover",
    );
    fs.writeFileSync(
      path.join(archive, "docs", "adr", "README.md"),
      `---
title: "ADR Index"
folder: "docs/adr"
description: "Stub"
entry_point: true
---

# ADR Index

Built-up content with no TODO marker.
`,
    );
    const report = checkReleasePackageContents(archive);
    const codes = new Set(report.diagnostics.map((d) => d.code));
    assert.ok(codes.has(RELEASE_PACKAGE_DIAGNOSTIC_CODES.Adr));
    assert.ok(codes.has(RELEASE_PACKAGE_DIAGNOSTIC_CODES.Intake));
    assert.ok(codes.has(RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub));
  } finally {
    cleanup(archive);
  }
});
