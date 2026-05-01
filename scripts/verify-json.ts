import { checkTasks } from "./lib/tasks.js";
import { runNodeTasksJson } from "./lib/runner.js";

runNodeTasksJson(checkTasks, { heading: "verify" });
