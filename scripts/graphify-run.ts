import { spawnSync } from "node:child_process";
import type { SpawnSyncOptions, SpawnSyncReturns } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const USAGE = "Usage: tsx scripts/graphify-run.ts [--update]";

export const MISSING_GRAPHIFY_MESSAGE = [
  "graphify is not installed or not in PATH.",
  "Install it from: https://github.com/safishamsi/graphify",
  "Then re-run: npm run graph",
  "See also: docs/how-to/use-graphify.md",
].join("\n");

export type GraphifySpawn = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions,
) => SpawnSyncReturns<Buffer>;

export type GraphifyRunResult = {
  code: number;
  stderr?: string;
};

export function graphifyArgs(update: boolean): string[] {
  return update ? ["update", "."] : ["update", ".", "--force"];
}

export function runGraphifyWrapper(
  argv: readonly string[],
  spawn: GraphifySpawn = spawnSync,
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
): GraphifyRunResult {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--update")) {
    return { code: 3, stderr: USAGE };
  }

  const shell = platform === "win32";
  const availability = spawn("graphify", ["--help"], {
    stdio: "ignore",
    shell,
    windowsHide: true,
  });

  if (availability.error || availability.status !== 0) {
    return { code: 1, stderr: MISSING_GRAPHIFY_MESSAGE };
  }

  const run = spawn("graphify", graphifyArgs(argv[0] === "--update"), {
    stdio: "inherit",
    shell,
    windowsHide: true,
    env: {
      ...env,
      GRAPHIFY_OUT: "graph",
      GRAPHIFY_NO_TIPS: "1",
    },
  });

  if (run.error) {
    return { code: 3, stderr: run.error.message };
  }
  if (run.status === 0) return { code: 0 };
  return { code: 2 };
}

function isCliEntryPoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return path.resolve(entry) === fileURLToPath(import.meta.url);
}

if (isCliEntryPoint()) {
  const result = runGraphifyWrapper(process.argv.slice(2));
  if (result.stderr) console.error(result.stderr);
  process.exit(result.code);
}
