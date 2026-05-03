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

test("check:issues accepts documented spec stage alias", () => {
  fs.writeFileSync(
    tempIssue,
    [
      "---",
      "issue_number: null",
      'title: "[RFC] Spec Alias Test"',
      "feature_slug: spec-alias-test",
      "type: feature",
      "roadmap_status: planned",
      "stage: spec",
      "github_url: null",
      "labels: []",
      "milestone: null",
      "assignees: []",
      "created_at: 2026-05-03",
      "updated_at: 2026-05-03",
      "---",
      "",
      "# [RFC] Spec Alias Test",
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
