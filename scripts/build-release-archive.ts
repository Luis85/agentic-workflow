import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { buildReleaseArchive } from "./lib/release-archive-builder.js";
import { repoRoot, toPosix } from "./lib/repo.js";
import { wantsJson } from "./lib/diagnostics.js";

/**
 * CLI for the build-time release-archive transform (T-V05-013).
 *
 * Stages a transformed copy of the repository into a runner-local directory
 * ready for `npm pack`. The transform satisfies the fresh-surface contract
 * (ADR-0021 / SPEC-V05-010): numbered ADRs are filtered, every shipping
 * `docs/**\/*.md` page is replaced with the stub form from
 * `release-stubify.ts`, every other file mirrors the codebase form.
 *
 * Usage:
 *
 * ```bash
 * # default — stage under .release-staging in the repo root
 * npm run build:release-archive
 *
 * # explicit output directory
 * npm run build:release-archive -- --out /tmp/release-staging
 *
 * # JSON output for CI / agent consumption
 * npm run build:release-archive -- --json
 * ```
 *
 * The CLI computes the file allowlist by running `npm pack --dry-run --json`
 * from `repoRoot`, then dispatches each path to `buildReleaseArchive`. The
 * single source of truth for "what ships" remains `package.json#files` —
 * this script is only the transform layer.
 */

type ParsedArgs = {
  outDir: string;
  cleanFirst: boolean;
};

function parseArgs(argv: readonly string[]): ParsedArgs {
  const defaults: ParsedArgs = {
    outDir: path.join(repoRoot, ".release-staging"),
    cleanFirst: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out") {
      const value = argv[i + 1];
      if (value === undefined || value === "" || value.startsWith("--")) {
        throw new Error("`--out` requires a non-empty directory path");
      }
      defaults.outDir = path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
      i += 1;
      continue;
    }
    if (arg.startsWith("--out=")) {
      const value = arg.slice("--out=".length);
      if (value === "") throw new Error("`--out=` requires a non-empty directory path");
      defaults.outDir = path.isAbsolute(value) ? value : path.resolve(repoRoot, value);
      continue;
    }
    if (arg === "--no-clean") {
      defaults.cleanFirst = false;
      continue;
    }
    if (arg === "--json") continue; // recognised by wantsJson()
  }

  return defaults;
}

type NpmPackEntry = { path?: string };
type NpmPackOutput = Array<{ files?: NpmPackEntry[] }>;

function enumerateFilesViaNpmPack(): string[] {
  // Static literal command, no user input — safe to run via the platform shell
  // so the npm `.cmd` shim resolves on Windows without an EINVAL spawn from
  // execFileSync.
  const stdout = execSync("npm pack --dry-run --json", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const parsed = JSON.parse(stdout) as NpmPackOutput;
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("`npm pack --dry-run --json` returned no packages");
  }
  const files = parsed[0].files ?? [];
  return files
    .map((entry) => entry.path)
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .map((p) => toPosix(p));
}

const heading = "build:release-archive";
let parsed: ParsedArgs;
try {
  parsed = parseArgs(process.argv.slice(2));
} catch (err) {
  console.error(`${heading}: ${(err as Error).message}`);
  process.exit(1);
}

if (parsed.cleanFirst && fs.existsSync(parsed.outDir)) {
  fs.rmSync(parsed.outDir, { recursive: true, force: true });
}
fs.mkdirSync(parsed.outDir, { recursive: true });

let files: string[];
try {
  files = enumerateFilesViaNpmPack();
} catch (err) {
  console.error(`${heading}: failed to enumerate files via \`npm pack --dry-run --json\``);
  console.error(String((err as Error).message ?? err));
  process.exit(1);
}

const report = buildReleaseArchive({
  repoRoot,
  outDir: parsed.outDir,
  files,
});

if (wantsJson()) {
  console.log(
    JSON.stringify(
      {
        check: heading,
        outDir: parsed.outDir,
        written: report.written.length,
        skipped: report.skipped,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`${heading}: ok`);
  console.log(`  out:     ${parsed.outDir}`);
  console.log(`  written: ${report.written.length} files`);
  console.log(`  skipped: ${report.skipped.length} (numbered ADRs)`);
  for (const entry of report.skipped) console.log(`    - ${entry}`);
}
