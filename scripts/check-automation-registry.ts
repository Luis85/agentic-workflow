import { loadAutomationRegistry, validateAutomationRegistry } from "./lib/automation-registry.js";
import { failIfErrors } from "./lib/repo.js";

failIfErrors(validateAutomationRegistry(loadAutomationRegistry()), "check:automation-registry");
