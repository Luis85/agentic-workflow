import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Marker file written at the root of a built staging directory so subsequent
 * tooling can prove a directory is the output of `npm run build:release-archive`
 * (T-V05-013) and not an arbitrary path that happens to exist.
 *
 * Two consumers rely on the marker:
 *
 * 1. {@link assertSafeOutDir} refuses to recursively delete an existing
 *    `--out` target unless the dir is empty, non-existent, or contains the
 *    marker (P1 finding on PR #202: a mistyped `--out .` could otherwise
 *    erase the repo).
 * 2. `scripts/release-prepack-guard.mjs` blocks `npm pack` of the
 *    `@luis85/agentic-workflow` package from any cwd that lacks the marker
 *    (P2 finding on PR #202: top-level `.npmignore` cannot remove paths
 *    that the `package.json#files` allowlist explicitly includes, so bare
 *    `npm pack` from the repo root would otherwise ship numbered ADRs).
 */
export const STAGING_MARKER_FILE = ".release-staging-marker";

const MARKER_BODY =
  "build:release-archive marker — directory is safe to clean / publish.\n";

/** Write the staging marker at `dir/.release-staging-marker`. */
export function writeStagingMarker(dir: string): void {
  fs.writeFileSync(path.join(dir, STAGING_MARKER_FILE), MARKER_BODY, "utf8");
}

/** True when `dir/.release-staging-marker` exists. */
export function hasStagingMarker(dir: string): boolean {
  return fs.existsSync(path.join(dir, STAGING_MARKER_FILE));
}

/**
 * Refuse to use `outDir` as a destructive `--out` target unless the path is
 * obviously disposable.
 *
 * Rejects (in order):
 * - the filesystem root, the user home, the repo root, or the repo parent;
 * - any directory that is an ancestor of the repo root (would delete the
 *   repo itself on clean);
 * - an existing path that is not a directory;
 * - an existing directory that contains a `.git` entry (almost certainly a
 *   real repository, never a disposable stage);
 * - an existing non-empty directory that lacks the staging marker (could be
 *   any maintainer's working dir; refuse to recursively delete it).
 *
 * Empty directories, non-existent paths, and previously-staged dirs (marker
 * present) all pass.
 */
export function assertSafeOutDir(outDir: string, repoRoot: string): void {
  const resolvedOut = path.resolve(outDir);
  const resolvedRepo = path.resolve(repoRoot);
  const fsRoot = path.parse(resolvedOut).root;
  const home = os.homedir();

  if (
    resolvedOut === fsRoot ||
    resolvedOut === resolvedRepo ||
    resolvedOut === path.dirname(resolvedRepo) ||
    resolvedOut === home
  ) {
    throw new Error(
      `release-staging-safety: refusing to use \`${resolvedOut}\` as --out — resolves to the filesystem root, repo root, repo parent, or user home.`,
    );
  }

  const repoRel = path.relative(resolvedOut, resolvedRepo);
  if (repoRel !== "" && !repoRel.startsWith("..") && !path.isAbsolute(repoRel)) {
    throw new Error(
      `release-staging-safety: refusing to use \`${resolvedOut}\` as --out — it is an ancestor of the repo root (${resolvedRepo}).`,
    );
  }

  if (!fs.existsSync(resolvedOut)) return;

  const stat = fs.statSync(resolvedOut);
  if (!stat.isDirectory()) {
    throw new Error(
      `release-staging-safety: refusing to use \`${resolvedOut}\` as --out — exists but is not a directory.`,
    );
  }

  if (fs.existsSync(path.join(resolvedOut, ".git"))) {
    throw new Error(
      `release-staging-safety: refusing to clean \`${resolvedOut}\` — contains a \`.git\` entry; not a disposable staging directory.`,
    );
  }

  const entries = fs.readdirSync(resolvedOut);
  if (entries.length === 0) return;
  if (entries.includes(STAGING_MARKER_FILE)) return;

  throw new Error(
    `release-staging-safety: refusing to clean \`${resolvedOut}\` — non-empty and missing staging marker (\`${STAGING_MARKER_FILE}\`). Pass \`--no-clean\`, choose a fresh dir, or remove the contents manually.`,
  );
}
