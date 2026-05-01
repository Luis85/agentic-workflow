import test from "node:test";
import assert from "node:assert/strict";
import { tasksForChangedFiles } from "../../scripts/lib/changed-checks.js";

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
  assert.deepEqual(taskNames(["docs/verify-gate.md"]), [
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
