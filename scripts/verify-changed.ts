import { changedCheckPlan } from "./lib/changed-checks.js";
import { runNodeTasks } from "./lib/runner.js";

const plan = changedCheckPlan();

if (plan.files.length === 0) {
  console.log("verify:changed: no changed files");
  process.exit(0);
}

if (plan.tasks.length === 0) {
  console.log(`verify:changed: no mapped checks for ${plan.files.length} changed file(s)`);
  process.exit(0);
}

console.log(`verify:changed: ${plan.files.length} changed file(s), ${plan.tasks.length} task(s)`);
runNodeTasks(plan.tasks, { heading: "verify:changed" });
