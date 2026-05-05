import fs from "node:fs";
import path from "node:path";
import { repoRoot, failIfErrors } from "./lib/repo.js";
import type { DiagnosticInput } from "./lib/diagnostics.js";

/**
 * Validate that the specorator CLI contract is intact:
 * - package.json has a bin entry pointing to scripts/cli.ts
 * - scripts/cli.ts exists and is executable
 * - tsx is in dependencies (not devDependencies) so the bin shebang works when installed
 * - every script-backed subcommand registered in cli.ts has a corresponding file on disk
 * - findRepoRoot is exported from scripts/lib/repo.ts
 * - SPECORATOR_ROOT is referenced in cli.ts (injection contract)
 */

const errors: DiagnosticInput[] = [];

const pkgPath = path.join(repoRoot, "package.json");
const cliPath = path.join(repoRoot, "scripts/cli.ts");
const repoTsPath = path.join(repoRoot, "scripts/lib/repo.ts");

// 1. package.json bin entry
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as Record<string, unknown>;

const bin = pkg["bin"] as Record<string, string> | undefined;
if (!bin || typeof bin !== "object") {
  errors.push({ path: "package.json", message: "missing bin field — specorator binary not declared" });
} else if (bin["specorator"] !== "./scripts/cli.ts") {
  errors.push({
    path: "package.json",
    message: `bin.specorator should be './scripts/cli.ts', got '${bin["specorator"]}'`,
  });
}

// 2. scripts/cli.ts exists
if (!fs.existsSync(cliPath)) {
  errors.push({ path: "scripts/cli.ts", message: "file does not exist" });
}

// 3. tsx must be in dependencies (not devDependencies only)
const deps = (pkg["dependencies"] as Record<string, string> | undefined) ?? {};
const devDeps = (pkg["devDependencies"] as Record<string, string> | undefined) ?? {};
if (!deps["tsx"]) {
  if (devDeps["tsx"]) {
    errors.push({
      path: "package.json",
      message:
        "tsx is in devDependencies but not dependencies — the specorator shebang will not work when the package is installed by consumers",
    });
  } else {
    errors.push({ path: "package.json", message: "tsx is not listed as a dependency" });
  }
}

// 4. Every script-backed subcommand in cli.ts must have its file on disk
if (fs.existsSync(cliPath)) {
  const cliSource = fs.readFileSync(cliPath, "utf8");

  // Extract script paths from cli.ts: lines like `script: "scripts/foo.ts"`
  const scriptPaths = [...cliSource.matchAll(/script:\s*"([^"]+\.ts)"/g)].map((m) => m[1]);
  for (const rel of scriptPaths) {
    const abs = path.join(repoRoot, rel!);
    if (!fs.existsSync(abs)) {
      errors.push({
        path: "scripts/cli.ts",
        message: `registered script '${rel}' does not exist on disk`,
      });
    }
  }

  // 5. SPECORATOR_ROOT env var injection must be present in cli.ts
  if (!cliSource.includes("SPECORATOR_ROOT")) {
    errors.push({
      path: "scripts/cli.ts",
      message: "SPECORATOR_ROOT env var injection not found — scripts will not receive the resolved root",
    });
  }
}

// 6. findRepoRoot must be defined in scripts/lib/find-repo-root.ts and re-exported from repo.ts
const findRepoRootPath = path.join(repoRoot, "scripts/lib/find-repo-root.ts");
if (!fs.existsSync(findRepoRootPath)) {
  errors.push({
    path: "scripts/lib/find-repo-root.ts",
    message: "file does not exist — findRepoRoot walk-up discovery is broken",
  });
} else {
  const findRepoRootSource = fs.readFileSync(findRepoRootPath, "utf8");
  if (!findRepoRootSource.includes("export function findRepoRoot")) {
    errors.push({
      path: "scripts/lib/find-repo-root.ts",
      message: "findRepoRoot is not exported — CLI walk-up discovery is broken",
    });
  }
}

if (fs.existsSync(repoTsPath)) {
  const repoSource = fs.readFileSync(repoTsPath, "utf8");
  if (!repoSource.includes("findRepoRoot")) {
    errors.push({
      path: "scripts/lib/repo.ts",
      message: "findRepoRoot is not re-exported from repo.ts — scripts that import from repo.ts will break",
    });
  }
  // repoRoot must NOT use import.meta.url (old approach that breaks in node_modules)
  if (repoSource.includes("fileURLToPath(import.meta.url)")) {
    errors.push({
      path: "scripts/lib/repo.ts",
      message:
        "repoRoot still uses import.meta.url derivation — this breaks when scripts are installed into node_modules. Use findRepoRoot() instead.",
    });
  }
}

failIfErrors(errors, "check:cli-contract");
