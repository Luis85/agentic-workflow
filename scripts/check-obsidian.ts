import { obsidianDiagnosticsForFile } from "./lib/obsidian.js";
import { failIfErrors, markdownFiles } from "./lib/repo.js";

const errors = markdownFiles().flatMap(obsidianDiagnosticsForFile);

failIfErrors(errors, "check:obsidian");
