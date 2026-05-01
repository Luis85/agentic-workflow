import { workflowCheckTasks } from "./lib/tasks.js";
import { runNodeTasks } from "./lib/runner.js";

runNodeTasks(workflowCheckTasks, { heading: "check:workflow" });
