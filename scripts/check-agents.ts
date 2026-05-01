import { validateAgentArtifacts } from "./lib/agent-artifacts.js";
import { failIfErrors } from "./lib/repo.js";

failIfErrors(validateAgentArtifacts(), "check:agents");
