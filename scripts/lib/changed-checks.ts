import { spawnSync } from "node:child_process";
import { NodeTask } from "./runner.js";
import { checkTasks } from "./tasks.js";
import { repoRoot, toPosix } from "./repo.js";

export type ChangedCheckPlan = {
  files: string[];
  tasks: NodeTask[];
};

const taskByName = new Map(checkTasks.map((task) => [task.name, task]));

/**
 * Build the changed-file verification plan for the current git checkout.
 *
 * @param {string} [baseRef="origin/main"] - Base ref for committed branch changes.
 * @returns {ChangedCheckPlan} Changed files and selected tasks.
 */
export function changedCheckPlan(baseRef = "origin/main"): ChangedCheckPlan {
  const files = changedFiles(baseRef);
  return { files, tasks: tasksForChangedFiles(files) };
}

/**
 * Select the smallest safe local check set for changed repository paths.
 *
 * @param {string[]} files - POSIX-style repository-relative paths.
 * @returns {NodeTask[]} Ordered tasks to run.
 */
export function tasksForChangedFiles(files: string[]): NodeTask[] {
  const selected = new Set<string>();

  for (const file of files.map(toPosix)) {
    if (isScriptSurface(file)) {
      add(selected, "typecheck:scripts", "test:scripts");
      if (file.startsWith("scripts/")) add(selected, "check:script-docs");
    }

    if (isAutomationRegistrySurface(file)) add(selected, "check:automation-registry");
    if (isAgentSurface(file)) add(selected, "check:agents", "check:automation-registry", "check:workflow-docs");
    if (isContentSurface(file)) add(selected, "check:links", "check:frontmatter", "check:obsidian");
    if (isObsidianAsset(file)) add(selected, "check:obsidian-assets");
    if (isProductPageSurface(file)) add(selected, "check:product-page");
    if (isGeneratedOrCommandSurface(file)) add(selected, "check:commands", "check:script-docs");
    if (isWorkflowSurface(file)) add(selected, "check:workflow-docs", "check:automation-registry");
    if (isSpecSurface(file)) add(selected, "check:specs", "check:traceability");
    if (isRoadmapSurface(file)) add(selected, "check:roadmaps");
  }

  return checkTasks.filter((task) => selected.has(task.name));
}

function changedFiles(baseRef: string): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "--diff-filter=ACMRTUXB", `${baseRef}...HEAD`],
    ["diff", "--name-only", "--diff-filter=ACMRTUXB"],
    ["diff", "--cached", "--name-only", "--diff-filter=ACMRTUXB"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8", windowsHide: true });
    if (result.status !== 0) continue;
    for (const file of result.stdout.split(/\r?\n/).map((line) => toPosix(line.trim())).filter(Boolean)) {
      files.add(file);
    }
  }
  return [...files].sort();
}

function add(selected: Set<string>, ...names: string[]): void {
  for (const name of names) {
    if (taskByName.has(name)) selected.add(name);
  }
}

function isScriptSurface(file: string): boolean {
  return (
    file.startsWith("scripts/") ||
    file.startsWith("tests/scripts/") ||
    file === "package.json" ||
    file === "package-lock.json" ||
    file === "typedoc.json" ||
    file.startsWith("tsconfig")
  );
}

function isAutomationRegistrySurface(file: string): boolean {
  return file === "tools/automation-registry.yml" || file === "package.json" || file.startsWith(".github/workflows/");
}

function isAgentSurface(file: string): boolean {
  return file.startsWith(".claude/agents/") || file.startsWith(".claude/skills/") || file.startsWith("agents/operational/");
}

function isContentSurface(file: string): boolean {
  return file.endsWith(".md") || file.endsWith(".mdx");
}

function isObsidianAsset(file: string): boolean {
  return file.endsWith(".base") || file.endsWith(".canvas") || file.startsWith("docs/obsidian/");
}

function isProductPageSurface(file: string): boolean {
  return file.startsWith("sites/") || file === ".github/workflows/pages.yml";
}

function isGeneratedOrCommandSurface(file: string): boolean {
  return file.startsWith(".claude/commands/") || file.startsWith("docs/scripts/");
}

function isWorkflowSurface(file: string): boolean {
  return file.startsWith(".github/workflows/") || file === ".github/dependabot.yml" || file === "docs/ci-automation.md" || file === "docs/security-ci.md";
}

function isSpecSurface(file: string): boolean {
  return file.startsWith("specs/") || file.startsWith("discovery/") || file.startsWith("quality/");
}

function isRoadmapSurface(file: string): boolean {
  return file.startsWith("roadmaps/");
}
