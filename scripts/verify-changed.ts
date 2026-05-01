import { fastCheckTasks } from "./lib/tasks.js";
import { runNodeTasks } from "./lib/runner.js";

runNodeTasks(fastCheckTasks, { heading: "verify:changed" });
