/**
 * Index-bleed guard.
 *
 * Warns when the git index contains files staged for addition on any branch.
 * Staged new files carry across `git checkout` calls when they are not tracked
 * on either branch — the failure mode documented in docs/worktrees.md#common-pitfalls.
 *
 * This includes integration branches (main, develop): staged files on main bleed
 * onto a feature branch when you checkout into it, which is exactly the documented
 * pre-switch scenario.
 *
 * This check is intentionally NOT in `npm run verify`. It is a pre-switch or
 * pre-commit advisory. Run it explicitly: `npm run check:index-bleed`
 *
 * Flags:
 *   --json   Emit structured JSON instead of console output.
 */

import { spawnSync } from "node:child_process";
import { repoRoot } from "./lib/repo.js";

const wantsJson = process.argv.includes("--json");

const warnings: string[] = [];

function run(command: string, args: string[]): { ok: boolean; stdout: string } {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: "utf8", windowsHide: true });
  return { ok: result.status === 0, stdout: String(result.stdout || "").trim() };
}

const branch = run("git", ["branch", "--show-current"]);
const branchName = branch.ok ? (branch.stdout || "(detached HEAD)") : "(unknown)";

const staged = run("git", ["diff", "--name-only", "--cached", "--diff-filter=A"]);
if (staged.ok && staged.stdout) {
  for (const file of staged.stdout.split(/\r?\n/).filter(Boolean)) {
    warnings.push(
      `${file}: staged for addition on "${branchName}" — these files carry across git checkout and will bleed into the next commit on any branch (see docs/worktrees.md#common-pitfalls)`,
    );
  }
}

if (wantsJson) {
  console.log(JSON.stringify({ errors: [], warnings }, null, 2));
} else {
  for (const w of warnings) console.warn(`[warn] check:index-bleed: ${w}`);
  if (warnings.length === 0) {
    console.log("check:index-bleed: ok");
  } else {
    console.log(`check:index-bleed: ${warnings.length} warning(s) — review staged files before switching branches`);
  }
}
