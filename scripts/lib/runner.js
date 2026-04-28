import { spawnSync } from "node:child_process";

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
