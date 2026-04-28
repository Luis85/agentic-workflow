import { checkTasks } from "./lib/tasks.js";
import { runNodeTasks } from "./lib/runner.js";

runNodeTasks(checkTasks, { heading: "verify" });
