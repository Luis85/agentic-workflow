import fs from "node:fs";
import path from "node:path";
import { stubifyDoc } from "./release-stubify.js";
import { ADR_NUMBERED_PATTERN } from "./release-package-contract.js";
import { toPosix } from "./repo.js";

export type ArchiveFileAction = "stubify" | "copy" | "skip";

/**
 * Path of the stub-template file. Treated as `copy` rather than `stubify`
 * because it _is_ the canonical stub shape — stubifying the template would
 * destroy the reference shipped in the released archive.
 */
const STUB_TEMPLATE_PATH = "templates/release-package-stub.md";

/**
 * Decide how a single repo-relative POSIX path should be staged into the
 * released archive.
 *
 * The returned action drives `buildReleaseArchive`:
 * - `stubify` — apply `stubifyDoc` to the file's contents (built-up `docs/`
 *   markdown).
 * - `copy` — mirror the file byte-for-byte (everything outside `docs/`, plus
 *   `templates/release-package-stub.md` itself).
 * - `skip` — the file must not ship (numbered ADRs).
 */
export function classifyFileForArchive(relPath: string): ArchiveFileAction {
  const posix = toPosix(relPath);

  if (posix === STUB_TEMPLATE_PATH) return "copy";

  if (posix.startsWith("docs/adr/")) {
    const basename = path.posix.basename(posix);
    if (ADR_NUMBERED_PATTERN.test(basename)) return "skip";
  }

  if (posix.startsWith("docs/") && posix.endsWith(".md")) return "stubify";

  return "copy";
}

export type BuildArchiveOptions = {
  /** Absolute path to the source repo. */
  repoRoot: string;
  /** Absolute path to the staging directory. Created if missing. */
  outDir: string;
  /**
   * Repo-relative POSIX paths to stage. Typically the file list reported by
   * `npm pack --dry-run --json`.
   */
  files: readonly string[];
};

export type BuildArchiveReport = {
  /** Files staged into `outDir` (POSIX-relative). */
  written: string[];
  /** Files filtered out per the fresh-surface contract (POSIX-relative). */
  skipped: string[];
};

/**
 * Stage a transformed copy of the source repository into a runner-local
 * directory ready for `npm pack`.
 *
 * The transform satisfies the fresh-surface contract from ADR-0021 /
 * SPEC-V05-010: numbered ADRs are filtered, every shipping `docs/**\/*.md`
 * page is replaced with the stub form from `release-stubify.ts`, and every
 * other file mirrors the codebase form.
 *
 * The function is pure with respect to `repoRoot` (read-only) and idempotent
 * with respect to `outDir` (last write wins).
 */
export function buildReleaseArchive(opts: BuildArchiveOptions): BuildArchiveReport {
  const repoRoot = path.resolve(opts.repoRoot);
  const outDir = path.resolve(opts.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const written: string[] = [];
  const skipped: string[] = [];

  for (const file of opts.files) {
    const posix = toPosix(file);
    const sourceAbs = path.resolve(repoRoot, posix);
    const sourceRel = path.relative(repoRoot, sourceAbs);
    if (sourceRel.startsWith("..") || path.isAbsolute(sourceRel)) {
      throw new Error(
        `release-archive-builder: file \`${posix}\` escapes the repo root (resolved: ${sourceAbs}); refusing to stage outside repo`,
      );
    }

    const action = classifyFileForArchive(posix);
    if (action === "skip") {
      skipped.push(posix);
      continue;
    }

    const destAbs = path.join(outDir, posix);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });

    if (action === "stubify") {
      const text = fs.readFileSync(sourceAbs, "utf8");
      const result = stubifyDoc({ path: posix, text });
      fs.writeFileSync(destAbs, result.text, "utf8");
    } else {
      fs.copyFileSync(sourceAbs, destAbs);
    }
    written.push(posix);
  }

  return { written, skipped };
}
