import fs from "node:fs";
import path from "node:path";
import { checkReleasePackageContents } from "./lib/release-package-contract.js";
import { failIfErrors, repoRoot } from "./lib/repo.js";

/**
 * CLI for the v0.5 fresh-surface packaging step (T-V05-012).
 *
 * Validates a candidate published archive against the fresh-surface contract
 * (ADR-0021 / SPEC-V05-010 / `specs/version-0-5-plan/package-contract.md`):
 *
 * 1. No file matching `docs/adr/[0-9][0-9][0-9][0-9]-*.md` ships.
 * 2. Each enumerated intake folder ships absent or with only a top-level `README.md`.
 * 3. Every shipping `docs/` page matches the stub shape from `templates/release-package-stub.md`.
 *
 * Usage:
 *
 * ```bash
 * # standalone — pass a prepared archive directory
 * npm run check:release-package-contents -- --archive <dir>
 *
 * # JSON diagnostics for CI / agent consumption
 * npm run check:release-package-contents -- --archive <dir> --json
 * ```
 *
 * The check exits 0 with a `skipped` notice when no `--archive` argument and no
 * `RELEASE_PACKAGE_ARCHIVE` environment variable are provided. The release
 * readiness check (T-V05-004) composes this script after preparing a candidate
 * archive so the readiness gate enforces both release metadata correctness and
 * the fresh-surface contract together.
 */

type ParsedArgs = {
  archive?: string;
  archiveSource: "argv" | "env" | "none";
};

function parseArgs(argv: string[]): ParsedArgs {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--archive") {
      return { archive: argv[i + 1], archiveSource: "argv" };
    }
    if (arg.startsWith("--archive=")) {
      return { archive: arg.slice("--archive=".length), archiveSource: "argv" };
    }
  }
  const envValue = process.env.RELEASE_PACKAGE_ARCHIVE;
  if (envValue) return { archive: envValue, archiveSource: "env" };
  return { archiveSource: "none" };
}

const args = parseArgs(process.argv.slice(2));
const heading = "check:release-package-contents";

if (!args.archive) {
  console.log(
    `${heading}: skipped (no candidate archive provided; pass --archive <dir> or set RELEASE_PACKAGE_ARCHIVE)`,
  );
  process.exit(0);
}

const archivePath = path.isAbsolute(args.archive)
  ? args.archive
  : path.resolve(repoRoot, args.archive);

if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isDirectory()) {
  failIfErrors(
    [
      {
        code: "RELEASE_PKG_ARCHIVE",
        path: args.archive,
        message: `candidate archive does not exist or is not a directory (resolved: ${archivePath})`,
      },
    ],
    heading,
  );
}

const report = checkReleasePackageContents(archivePath);
failIfErrors(report.diagnostics, heading);
