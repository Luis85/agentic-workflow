import { failIfErrors } from "./lib/repo.js";
import { roadmapStateDiagnostics } from "./lib/roadmaps.js";

failIfErrors(roadmapStateDiagnostics(), "check:roadmaps");
