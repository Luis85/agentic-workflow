import { spawnSync } from "node:child_process";
import type { CheckResult } from "./diagnostics.js";
import { formatDiagnostic, formatGitHubAnnotation } from "./diagnostics.js";

export type NodeTask = {
  name: string;
  label: string;
  script?: string;
  command?: string[];
  jsonDiagnostics?: boolean;
};

/**
 * Run a list of Node-backed repository tasks in sequence.
 *
 * Each task is executed with the current Node binary. The runner prints a
 * concise reproduce command when a task fails, which keeps `npm run verify`
 * output actionable.
 *
 * @param {NodeTask[]} tasks - Tasks to execute.
 * @param {{ heading?: string, stopOnFailure?: boolean }} [options] - Runner behavior.
 * @param {string} [options.heading="runner"] - Prefix for progress messages.
 * @param {boolean} [options.stopOnFailure=true] - Exit immediately when a task fails.
 */
export function runNodeTasks(
  tasks: NodeTask[],
  options: { heading?: string; stopOnFailure?: boolean } = {},
) {
  const { heading = "runner", stopOnFailure = true } = options;
  const startedAt = Date.now();

  for (const task of tasks) {
    const taskStartedAt = Date.now();
    console.log(`${heading}: ${task.name} (${task.label})`);
    const invocation = taskInvocation(task);
    const annotate = shouldAnnotate(task);
    const result = spawnSync(invocation.command, annotate ? [...invocation.args, "--json"] : invocation.args, {
      encoding: annotate ? "utf8" : undefined,
      stdio: annotate ? "pipe" : "inherit",
      windowsHide: true,
    });

    const elapsed = formatDuration(Date.now() - taskStartedAt);
    if (result.status !== 0) {
      if (annotate) renderAnnotatedFailure(task, result.stdout, result.stderr);
      console.error(`${heading}: failed at ${task.name} after ${elapsed}`);
      console.error(`reproduce: npm run ${task.name}`);
      if (stopOnFailure) process.exit(result.status || 1);
      continue;
    }

    console.log(`${heading}: ${task.name} passed in ${elapsed}`);
  }

  console.log(`${heading}: ok in ${formatDuration(Date.now() - startedAt)}`);
}

function taskInvocation(task: NodeTask): { command: string; args: string[] } {
  if (task.command) {
    const [command, ...args] = task.command;
    return commandInvocation(command, args);
  }
  if (!task.script) throw new Error(`Task ${task.name} has no command or script`);
  return { command: process.execPath, args: ["--import", "tsx", task.script] };
}

function shouldAnnotate(task: NodeTask): boolean {
  return process.env.GITHUB_ACTIONS === "true" && task.jsonDiagnostics === true && task.script !== undefined;
}

function renderAnnotatedFailure(task: NodeTask, stdout: string | Buffer | null, stderr: string | Buffer | null): void {
  const rawStdout = String(stdout || "").trim();
  const rawStderr = String(stderr || "").trim();
  const result = parseCheckResult(rawStdout);

  if (!result) {
    if (rawStdout) console.error(rawStdout);
    if (rawStderr) console.error(rawStderr);
    console.error(`${task.name}: could not parse JSON diagnostics for GitHub Actions annotations`);
    return;
  }

  console.error(`${task.name}: ${result.errors.length} error(s)`);
  for (const error of result.errors) {
    console.log(formatGitHubAnnotation(error));
    console.error(`- ${formatDiagnostic(error)}`);
  }
}

function parseCheckResult(raw: string): CheckResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckResult;
  } catch {
    return null;
  }
}

function commandInvocation(command: string | undefined, args: string[]): { command: string; args: string[] } {
  if (!command) throw new Error("Missing command");
  if (command === "node") return { command: process.execPath, args };
  if (command === "npm" && process.env.npm_execpath) {
    return { command: process.execPath, args: [process.env.npm_execpath, ...args] };
  }
  if (command === "npm" && process.platform === "win32") return { command: "npm.cmd", args };
  return { command, args };
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
}
