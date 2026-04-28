import { fixTasks } from "./lib/tasks.js";
import { runNodeTasks } from "./lib/runner.js";

runNodeTasks(fixTasks, { heading: "fix" });
