import { spawnSync } from "node:child_process";

/**
 * Run a list of Node-backed repository tasks in sequence.
 *
 * Each task is executed with the current Node binary. The runner prints a
 * concise reproduce command when a task fails, which keeps `npm run verify`
 * output actionable.
 *
 * @param {{ name: string, label: string, script: string }[]} tasks - Tasks to execute.
 * @param {{ heading?: string, stopOnFailure?: boolean }} [options] - Runner behavior.
 * @param {string} [options.heading="runner"] - Prefix for progress messages.
 * @param {boolean} [options.stopOnFailure=true] - Exit immediately when a task fails.
 */
export function runNodeTasks(tasks, options = {}) {
  const { heading = "runner", stopOnFailure = true } = options;
  const startedAt = Date.now();

  for (const task of tasks) {
    const taskStartedAt = Date.now();
    console.log(`${heading}: ${task.name} (${task.label})`);
    const result = spawnSync(process.execPath, [task.script], {
      stdio: "inherit",
      windowsHide: true,
    });

    const elapsed = formatDuration(Date.now() - taskStartedAt);
    if (result.status !== 0) {
      console.error(`${heading}: failed at ${task.name} after ${elapsed}`);
      console.error(`reproduce: npm run ${task.name}`);
      if (stopOnFailure) process.exit(result.status || 1);
      continue;
    }

    console.log(`${heading}: ${task.name} passed in ${elapsed}`);
  }

  console.log(`${heading}: ok in ${formatDuration(Date.now() - startedAt)}`);
}

function formatDuration(milliseconds) {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
}
