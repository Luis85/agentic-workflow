import test from "node:test";
import assert from "node:assert/strict";
import { tasksForChangedFiles, trackedDiffFilter } from "../../scripts/lib/changed-checks.js";

function taskNames(files: string[]): string[] {
  return tasksForChangedFiles(files).map((task) => task.name);
}

test("changed script files select typecheck, tests, docs, and registry checks", () => {
  assert.deepEqual(taskNames(["scripts/lib/runner.ts"]), [
    "typecheck:scripts",
    "test:scripts",
    "check:script-docs",
  ]);
});

test("changed Markdown selects content checks", () => {
  assert.deepEqual(taskNames(["docs/quality-framework.md"]), [
    "check:links",
    "check:frontmatter",
    "check:obsidian",
  ]);
});

test("changed spec artifacts select spec and traceability checks", () => {
  assert.deepEqual(taskNames(["specs/example/workflow-state.md"]), [
    "check:links",
    "check:frontmatter",
    "check:obsidian",
    "check:specs",
    "check:traceability",
  ]);
});

test("changed workflow files select workflow and registry checks", () => {
  assert.deepEqual(taskNames([".github/workflows/verify.yml"]), [
    "check:automation-registry",
    "check:workflow-docs",
  ]);
});

test("workflow contract files select workflow-docs checks", () => {
  assert.deepEqual(taskNames([".codex/instructions.md"]), [
    "check:automation-registry",
    "check:links",
    "check:workflow-docs",
    "check:frontmatter",
    "check:obsidian",
  ]);
  assert.equal(taskNames([".codex/workflows/pr-delivery.md"]).includes("check:workflow-docs"), true);
  assert.equal(taskNames(["docs/branching.md"]).includes("check:workflow-docs"), true);
  assert.equal(taskNames(["docs/verify-gate.md"]).includes("check:workflow-docs"), true);
  assert.equal(taskNames([".github/PULL_REQUEST_TEMPLATE.md"]).includes("check:workflow-docs"), true);
});

test("deleted files select the same checks as changed files", () => {
  assert.match(trackedDiffFilter, /D/);
  assert.equal(taskNames(["docs/adr/0001-record-architecture-decisions.md"]).includes("check:adr-index"), true);
  assert.equal(taskNames([".github/workflows/verify.yml"]).includes("check:workflow-docs"), true);
});

test("changed agent artifacts select agent and automation checks", () => {
  assert.deepEqual(taskNames([".claude/skills/verify/SKILL.md"]), [
    "check:automation-registry",
    "check:agents",
    "check:links",
    "check:workflow-docs",
    "check:frontmatter",
    "check:obsidian",
  ]);
});
