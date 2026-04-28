import { spawnSync } from "node:child_process";
import { relativeToRoot, walkFiles } from "./lib/repo.js";

const testFiles = walkFiles("tests/scripts", (file) => file.endsWith(".test.ts")).map(relativeToRoot);

if (testFiles.length === 0) {
  console.error("test:scripts: no test files found under tests/scripts");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", "--import", "tsx", ...testFiles], {
  stdio: "inherit",
  windowsHide: true,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.signal) {
  console.error(`test:scripts terminated by signal ${result.signal}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
