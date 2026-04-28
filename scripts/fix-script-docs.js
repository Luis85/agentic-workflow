import { spawnSync } from "node:child_process";

const result = spawnNpm(["run", "docs:scripts"], {
  stdio: "inherit",
  windowsHide: true,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.signal) {
  console.error(`docs:scripts terminated by signal ${result.signal}`);
  process.exit(1);
}

process.exit(result.status ?? 1);

function spawnNpm(args, options) {
  if (process.env.npm_execpath) {
    return spawnSync(process.execPath, [process.env.npm_execpath, ...args], options);
  }
  return spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}
