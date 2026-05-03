import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildReleaseArchive,
  classifyFileForArchive,
} from "../../scripts/lib/release-archive-builder.js";
import { checkReleasePackageContents } from "../../scripts/lib/release-package-contract.js";

function mkRepo(): { repoRoot: string; cleanup: () => void } {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "release-archive-"));
  return {
    repoRoot,
    cleanup: () => fs.rmSync(repoRoot, { recursive: true, force: true }),
  };
}

function write(root: string, relPath: string, content: string): void {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

const STUB_TEMPLATE = `---
title: <Document title>
folder: docs
description: <One-sentence description>
entry_point: false
---

# <Document title>

<!-- TODO: One short paragraph -->
`;

const BUILT_UP_BRANCHING = `# Branching model

A small, opinionated model.

## The branches

Pick one shape.
`;

const BUILT_UP_ADR_README = `---
title: ADR Index
folder: docs/adr
description: All accepted ADRs.
entry_point: true
---

# ADR Index

Long built-up content listing every ADR by number.
`;

test("classifyFileForArchive: numbered ADR is skipped", () => {
  assert.equal(classifyFileForArchive("docs/adr/0001-foo.md"), "skip");
  assert.equal(classifyFileForArchive("docs/adr/0021-release-package-fresh-surface.md"), "skip");
});

test("classifyFileForArchive: ADR README ships and is stubified", () => {
  assert.equal(classifyFileForArchive("docs/adr/README.md"), "stubify");
});

test("classifyFileForArchive: docs markdown is stubified", () => {
  assert.equal(classifyFileForArchive("docs/branching.md"), "stubify");
  assert.equal(classifyFileForArchive("docs/glossary/agent.md"), "stubify");
  assert.equal(classifyFileForArchive("docs/scripts/verify/README.md"), "stubify");
});

test("classifyFileForArchive: stub template itself is copied as-is, not stubified", () => {
  assert.equal(classifyFileForArchive("templates/release-package-stub.md"), "copy");
});

test("classifyFileForArchive: non-docs files are copied as-is", () => {
  assert.equal(classifyFileForArchive("agents/operational/foo/PROMPT.md"), "copy");
  assert.equal(classifyFileForArchive("CLAUDE.md"), "copy");
  assert.equal(classifyFileForArchive("CHANGELOG.md"), "copy");
  assert.equal(classifyFileForArchive("scripts/verify.ts"), "copy");
});

test("buildReleaseArchive mirrors non-docs files as-is", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    write(repoRoot, "CHANGELOG.md", "# Changelog\n\n## [Unreleased]\n");
    write(repoRoot, "scripts/verify.ts", "console.log('ok');\n");

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      buildReleaseArchive({
        repoRoot,
        outDir,
        files: ["templates/release-package-stub.md", "CHANGELOG.md", "scripts/verify.ts"],
      });

      assert.equal(
        fs.readFileSync(path.join(outDir, "CHANGELOG.md"), "utf8"),
        "# Changelog\n\n## [Unreleased]\n",
      );
      assert.equal(
        fs.readFileSync(path.join(outDir, "scripts/verify.ts"), "utf8"),
        "console.log('ok');\n",
      );
      assert.equal(
        fs.readFileSync(path.join(outDir, "templates/release-package-stub.md"), "utf8"),
        STUB_TEMPLATE,
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive stubifies docs markdown files", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    write(repoRoot, "docs/branching.md", BUILT_UP_BRANCHING);

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      buildReleaseArchive({
        repoRoot,
        outDir,
        files: ["templates/release-package-stub.md", "docs/branching.md"],
      });

      const stubified = fs.readFileSync(path.join(outDir, "docs/branching.md"), "utf8");
      assert.match(stubified, /^title:/m);
      assert.match(stubified, /^folder:/m);
      assert.match(stubified, /^description:/m);
      assert.match(stubified, /^entry_point:/m);
      assert.match(stubified, /^# Branching model$/m);
      assert.match(stubified, /^## The branches$/m);
      assert.ok(stubified.includes("<!-- TODO:"), "stub must contain TODO marker");
      // Original built-up content stripped.
      assert.doesNotMatch(stubified, /A small, opinionated model/);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive skips numbered ADR files", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    write(repoRoot, "docs/adr/0001-record-adr.md", "# ADR 1\n\nbody\n");
    write(repoRoot, "docs/adr/README.md", BUILT_UP_ADR_README);

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      const report = buildReleaseArchive({
        repoRoot,
        outDir,
        files: [
          "templates/release-package-stub.md",
          "docs/adr/0001-record-adr.md",
          "docs/adr/README.md",
        ],
      });

      assert.equal(
        fs.existsSync(path.join(outDir, "docs/adr/0001-record-adr.md")),
        false,
        "numbered ADR must not be staged",
      );
      assert.ok(
        fs.existsSync(path.join(outDir, "docs/adr/README.md")),
        "ADR README must be staged",
      );
      assert.ok(report.skipped.includes("docs/adr/0001-record-adr.md"));
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive output passes Layer 2 fresh-surface check", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    // Stage template (reference shape; copied as-is)
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    // Built-up docs
    write(repoRoot, "docs/branching.md", BUILT_UP_BRANCHING);
    write(repoRoot, "docs/specorator.md", "# Specorator\n\nv0.5 added the release workflow.\n");
    write(repoRoot, "docs/glossary/agent.md", "---\nterm: Agent\n---\n\n# Agent\n\nA built-up glossary entry.\n");
    write(repoRoot, "docs/adr/README.md", BUILT_UP_ADR_README);
    // Numbered ADR (must NOT ship)
    write(repoRoot, "docs/adr/0001-record-adr.md", "# ADR 1\n\nbody\n");
    // Non-doc files (copied as-is)
    write(repoRoot, "CHANGELOG.md", "# Changelog\n");
    write(repoRoot, "agents/operational/review-bot/PROMPT.md", "agent prompt body\n");

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      buildReleaseArchive({
        repoRoot,
        outDir,
        files: [
          "templates/release-package-stub.md",
          "docs/branching.md",
          "docs/specorator.md",
          "docs/glossary/agent.md",
          "docs/adr/README.md",
          "docs/adr/0001-record-adr.md",
          "CHANGELOG.md",
          "agents/operational/review-bot/PROMPT.md",
        ],
      });

      const report = checkReleasePackageContents(outDir);
      // Includes assertions 1 (no numbered ADRs), 2 (intake folders), and 3
      // (every shipping `docs/**/*.md` is in stub form). `deepEqual([], [])`
      // proves all three are clean for this fixture.
      assert.deepEqual(
        report.diagnostics,
        [],
        `expected zero Layer 2 diagnostics, got: ${JSON.stringify(report.diagnostics, null, 2)}`,
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive creates intermediate directories", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    write(repoRoot, "agents/operational/review-bot/PROMPT.md", "prompt\n");

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      buildReleaseArchive({
        repoRoot,
        outDir,
        files: ["templates/release-package-stub.md", "agents/operational/review-bot/PROMPT.md"],
      });
      assert.ok(fs.existsSync(path.join(outDir, "agents/operational/review-bot/PROMPT.md")));
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive is idempotent across re-runs", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    write(repoRoot, "docs/branching.md", BUILT_UP_BRANCHING);

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      buildReleaseArchive({
        repoRoot,
        outDir,
        files: ["templates/release-package-stub.md", "docs/branching.md"],
      });
      const first = fs.readFileSync(path.join(outDir, "docs/branching.md"), "utf8");

      buildReleaseArchive({
        repoRoot,
        outDir,
        files: ["templates/release-package-stub.md", "docs/branching.md"],
      });
      const second = fs.readFileSync(path.join(outDir, "docs/branching.md"), "utf8");

      assert.equal(first, second);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive returns written and skipped lists", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    write(repoRoot, "docs/branching.md", BUILT_UP_BRANCHING);
    write(repoRoot, "docs/adr/0001-foo.md", "# ADR 1\n");

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      const report = buildReleaseArchive({
        repoRoot,
        outDir,
        files: [
          "templates/release-package-stub.md",
          "docs/branching.md",
          "docs/adr/0001-foo.md",
        ],
      });

      assert.deepEqual(report.written.sort(), [
        "docs/branching.md",
        "templates/release-package-stub.md",
      ]);
      assert.deepEqual(report.skipped, ["docs/adr/0001-foo.md"]);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});

test("buildReleaseArchive rejects an absolute or escaping file path", () => {
  const { repoRoot, cleanup } = mkRepo();
  try {
    write(repoRoot, "templates/release-package-stub.md", STUB_TEMPLATE);
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "out-"));
    try {
      assert.throws(
        () =>
          buildReleaseArchive({
            repoRoot,
            outDir,
            files: ["../escape.md"],
          }),
        /escape|outside repo/i,
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  } finally {
    cleanup();
  }
});
