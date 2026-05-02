import fs from "node:fs";
import path from "node:path";
import {
  checkReleasePackageContents,
  parseReleasePackageArgs,
} from "./lib/release-package-contract.js";
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

const args = parseReleasePackageArgs(process.argv.slice(2));
const heading = "check:release-package-contents";

if (args.archiveSource === "argv-empty") {
  failIfErrors(
    [
      {
        code: "RELEASE_PKG_ARCHIVE",
        message: `\`${args.rawFlag}\` requires a non-empty value (path to candidate archive directory). Refusing to fall through to the skip path so release automation cannot silently bypass the fresh-surface assertions.`,
      },
    ],
    heading,
  );
  process.exit(1); // unreachable: failIfErrors exits on non-empty diagnostics; kept for control-flow narrowing.
}

if (args.archiveSource === "none") {
  console.log(
    `${heading}: skipped (no candidate archive provided; pass --archive <dir> or set RELEASE_PACKAGE_ARCHIVE)`,
  );
  process.exit(0);
}

const rawArchive = args.archive;
const archivePath = path.isAbsolute(rawArchive)
  ? rawArchive
  : path.resolve(repoRoot, rawArchive);

if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isDirectory()) {
  failIfErrors(
    [
      {
        code: "RELEASE_PKG_ARCHIVE",
        path: rawArchive,
        message: `candidate archive does not exist or is not a directory (resolved: ${archivePath})`,
      },
    ],
    heading,
  );
}

const report = checkReleasePackageContents(archivePath);
failIfErrors(report.diagnostics, heading);
