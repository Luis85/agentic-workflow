import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "../../scripts/lib/repo.js";

const tempIssue = path.join(repoRoot, "issues", "0-blank-required-test.md");

test("check:issues rejects blank required frontmatter values", () => {
  fs.writeFileSync(
    tempIssue,
    [
      "---",
      "issue_number: null",
      "title:",
      "feature_slug:",
      "type: feature",
      "roadmap_status: planned",
      "stage: idea",
      "github_url: null",
      "labels: []",
      "milestone: null",
      "assignees: []",
      "created_at:",
      "updated_at:",
      "---",
      "",
      "# Blank Required Test",
      "",
    ].join("\n"),
    "utf8",
  );

  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-issues.ts", "--json"], {
      cwd: repoRoot,
      encoding: "utf8",
      windowsHide: true,
    });

    assert.notEqual(result.status, 0);
    const output = JSON.parse(result.stdout) as { errors: string[] };
    assert.ok(output.errors.some((error) => error.includes('missing required frontmatter key "title"')));
    assert.ok(output.errors.some((error) => error.includes('missing required frontmatter key "feature_slug"')));
    assert.ok(output.errors.some((error) => error.includes('missing required frontmatter key "created_at"')));
    assert.ok(output.errors.some((error) => error.includes('missing required frontmatter key "updated_at"')));
  } finally {
    fs.rmSync(tempIssue, { force: true });
  }
});

test("check:issues rejects malformed required frontmatter value types", () => {
  fs.writeFileSync(
    tempIssue,
    [
      "---",
      "issue_number: null",
      "title: []",
      "feature_slug: {x: y}",
      "type: feature",
      "roadmap_status: planned",
      "stage: idea",
      "github_url: null",
      "labels: []",
      "milestone: null",
      "assignees: []",
      "created_at: []",
      "updated_at: 2026-05-03",
      "---",
      "",
      "# Malformed Required Test",
      "",
    ].join("\n"),
    "utf8",
  );

  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-issues.ts", "--json"], {
      cwd: repoRoot,
      encoding: "utf8",
      windowsHide: true,
    });

    assert.notEqual(result.status, 0);
    const output = JSON.parse(result.stdout) as { errors: string[] };
    assert.ok(output.errors.some((error) => error.includes("title must be a string scalar")));
    assert.ok(output.errors.some((error) => error.includes("feature_slug must be a string scalar")));
    assert.ok(output.errors.some((error) => error.includes("created_at must be a string scalar")));
  } finally {
    fs.rmSync(tempIssue, { force: true });
  }
});

test("check:issues accepts canonical specification stage value", () => {
  fs.writeFileSync(
    tempIssue,
    [
      "---",
      "issue_number: null",
      'title: "[RFC] Spec Stage Test"',
      "feature_slug: blank-required-test",
      "type: feature",
      "roadmap_status: planned",
      "stage: specification",
      "github_url: null",
      "labels: []",
      "milestone: null",
      "assignees: []",
      "created_at: 2026-05-03",
      "updated_at: 2026-05-03",
      "---",
      "",
      "# [RFC] Spec Stage Test",
      "",
    ].join("\n"),
    "utf8",
  );

  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-issues.ts", "--json"], {
      cwd: repoRoot,
      encoding: "utf8",
      windowsHide: true,
    });

    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout) as { errors: string[] };
    assert.deepEqual(output.errors, []);
  } finally {
    fs.rmSync(tempIssue, { force: true });
  }
});

test("check:issues rejects feature_slug that does not match filename slug", () => {
  const mismatchFile = path.join(repoRoot, "issues", "0-slug-mismatch-test.md");
  const specDir = path.join(repoRoot, "specs", "slug-mismatch-test");
  fs.writeFileSync(
    mismatchFile,
    [
      "---",
      "issue_number: null",
      'title: "Slug Mismatch Test"',
      "feature_slug: wrong-slug",
      "type: feature",
      "roadmap_status: planned",
      "stage: idea",
      "github_url: null",
      "labels: []",
      "milestone: null",
      "assignees: []",
      "created_at: 2026-05-03",
      "updated_at: 2026-05-03",
      "---",
      "",
      "# Slug Mismatch Test",
      "",
    ].join("\n"),
    "utf8",
  );
  fs.mkdirSync(specDir, { recursive: true });

  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/check-issues.ts", "--json"], {
      cwd: repoRoot,
      encoding: "utf8",
      windowsHide: true,
    });

    assert.notEqual(result.status, 0);
    const output = JSON.parse(result.stdout) as { errors: string[]; warnings: string[] };
    assert.ok(output.errors.some((e) => e.includes('feature_slug "wrong-slug" does not match filename slug "slug-mismatch-test"')));
    // The spec whose name matches the filename should NOT also produce a "no linked issue" warning.
    assert.ok(!output.warnings.some((w) => w.includes("specs/slug-mismatch-test/")));
  } finally {
    fs.rmSync(mismatchFile, { force: true });
    fs.rmSync(specDir, { recursive: true, force: true });
  }
});
