import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./lib/repo.js";

const checks = [
  checkCommand("Node", "node", ["--version"], { required: true, validate: validateNodeVersion }),
  checkCommand("npm", "npm", ["--version"], { required: true }),
  checkCommand("git", "git", ["--version"], { required: true }),
  checkGitBranch(),
  checkGitStatus(),
  checkWorktrees(),
  checkDependencies(),
  checkTask("ADR index", "npm", ["run", "check:adr-index"]),
  checkTask("command inventories", "npm", ["run", "check:commands"]),
  checkTask("verify gate", "npm", ["run", "verify"]),
];

let failures = 0;
for (const check of checks) {
  const result = check.run();
  printResult(result);
  if (result.status === "fail") failures += 1;
}

if (failures > 0) {
  console.error(`doctor: ${failures} failed check(s)`);
  process.exit(1);
}

console.log("doctor: ok");

function checkCommand(name, command, args, options = {}) {
  return {
    run() {
      const result = run(command, args);
      if (result.status !== 0) {
        return {
          name,
          status: options.required ? "fail" : "warn",
          detail: `${command} unavailable`,
          hint: installHint(command),
        };
      }

      const output = firstLine(result.stdout);
      const validation = options.validate?.(output);
      if (validation) return { name, ...validation };
      return { name, status: "pass", detail: output };
    },
  };
}

function checkGitBranch() {
  return {
    run() {
      const branch = run("git", ["branch", "--show-current"]);
      const upstream = run("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
      if (branch.status !== 0) {
        return { name: "branch", status: "fail", detail: "not in a git checkout" };
      }

      const branchName = firstLine(branch.stdout);
      const upstreamName = upstream.status === 0 ? firstLine(upstream.stdout) : "no upstream";
      return { name: "branch", status: "pass", detail: `${branchName} -> ${upstreamName}` };
    },
  };
}

function checkGitStatus() {
  return {
    run() {
      const result = run("git", ["status", "--short"]);
      if (result.status !== 0) return { name: "working tree", status: "fail", detail: "git status failed" };

      const dirtyLines = result.stdout.trim().split(/\r?\n/).filter(Boolean);
      if (dirtyLines.length > 0) {
        return {
          name: "working tree",
          status: "warn",
          detail: `${dirtyLines.length} changed path(s)`,
          hint: "review git status before committing or switching worktrees",
        };
      }
      return { name: "working tree", status: "pass", detail: "clean" };
    },
  };
}

function checkWorktrees() {
  return {
    run() {
      const result = run("git", ["worktree", "list", "--porcelain"]);
      if (result.status !== 0) return { name: "worktrees", status: "fail", detail: "git worktree list failed" };

      const worktreeCount = result.stdout.split(/\r?\n/).filter((line) => line.startsWith("worktree ")).length;
      return { name: "worktrees", status: "pass", detail: `${worktreeCount} registered` };
    },
  };
}

function checkDependencies() {
  return {
    run() {
      const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
      const dependencyCount = ["dependencies", "devDependencies", "optionalDependencies"]
        .flatMap((key) => Object.keys(packageJson[key] || {}))
        .length;
      if (dependencyCount === 0) return { name: "dependencies", status: "pass", detail: "no external packages" };

      const nodeModules = path.join(repoRoot, "node_modules");
      if (fs.existsSync(nodeModules)) return { name: "dependencies", status: "pass", detail: "node_modules present" };

      return {
        name: "dependencies",
        status: "warn",
        detail: "node_modules missing",
        hint: "run npm install or npm ci",
      };
    },
  };
}

function checkTask(name, command, args) {
  return {
    run() {
      const result = run(command, args);
      if (result.status !== 0) {
        return {
          name,
          status: "fail",
          detail: `${command} ${args.join(" ")} failed`,
          hint: failureHint(name),
        };
      }
      return { name, status: "pass", detail: "ok" };
    },
  };
}

function run(command, args) {
  const resolved = commandInvocation(command, args);
  return spawnSync(resolved.command, resolved.args, {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
  });
}

function commandInvocation(command, args) {
  if (command === "node") return { command: process.execPath, args };
  if (command === "npm" && process.env.npm_execpath) {
    return { command: process.execPath, args: [process.env.npm_execpath, ...args] };
  }
  return { command, args };
}

function printResult(result) {
  const marker = result.status === "pass" ? "ok" : result.status;
  console.log(`${marker}: ${result.name} - ${result.detail}`);
  if (result.hint) console.log(`hint: ${result.hint}`);
}

function validateNodeVersion(output) {
  const major = Number(output.replace(/^v/, "").split(".")[0]);
  if (major < 20) {
    return {
      status: "fail",
      detail: `${output} does not satisfy >=20`,
      hint: "install Node 20 or newer",
    };
  }
  return null;
}

function firstLine(value) {
  return String(value || "").trim().split(/\r?\n/)[0] || "(no output)";
}

function installHint(command) {
  if (command === "node") return "install Node 20 or newer";
  if (command === "npm") return "install npm with Node";
  if (command === "git") return "install Git";
  return undefined;
}

function failureHint(name) {
  if (name === "ADR index") return "run npm run fix:adr-index, review the diff, then run npm run doctor again";
  if (name === "command inventories") return "run npm run fix:commands, review the diff, then run npm run doctor again";
  if (name === "verify gate") return "run npm run verify for the focused failure command";
  return undefined;
}
