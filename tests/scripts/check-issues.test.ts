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
