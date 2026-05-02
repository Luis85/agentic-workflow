import { publicSurfaceDiagnostics } from "./lib/public-surfaces.js";
import { failIfErrors } from "./lib/repo.js";

failIfErrors(publicSurfaceDiagnostics(), "check:public-surfaces");
