import { obsidianAssetDiagnostics } from "./lib/obsidian-assets.js";
import { failIfErrors } from "./lib/repo.js";

failIfErrors(obsidianAssetDiagnostics(), "check:obsidian-assets");
