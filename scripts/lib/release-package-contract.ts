import fs from "node:fs";
import path from "node:path";
import type { Diagnostic } from "./diagnostics.js";
import { extractFrontmatter, parseSimpleYaml, toPosix } from "./repo.js";

/**
 * Intake folders enumerated in ADR-0021 §Decision.3 and the package contract.
 *
 * Each folder must ship either absent from the released archive or contain only
 * a top-level `README.md`. Order matches the enumeration in
 * `docs/release-package-contents.md`.
 */
export const INTAKE_FOLDERS: readonly string[] = [
  "inputs",
  "specs",
  "discovery",
  "projects",
  "portfolio",
  "roadmaps",
  "quality",
  "scaffolding",
  "stock-taking",
  "sales",
];

/**
 * Filename pattern for numbered ADR records (`0001-*.md` ... `9999-*.md`).
 *
 * Matches the unambiguous shell glob `[0-9][0-9][0-9][0-9]-*.md` recorded in
 * SPEC-V05-010 and ADR-0021's Errata.
 */
export const ADR_NUMBERED_PATTERN = /^[0-9]{4}-.+\.md$/;

/**
 * Required frontmatter keys on every shipping `docs/` page.
 *
 * Matches `templates/release-package-stub.md`.
 */
export const DOC_STUB_REQUIRED_FRONTMATTER_KEYS: readonly string[] = [
  "title",
  "folder",
  "description",
  "entry_point",
];

/**
 * Substring that signals an unfilled stub section on a shipping doc.
 *
 * Built-up codebase docs do not contain this marker; stubified docs do.
 */
export const DOC_STUB_TODO_MARKER = "<!-- TODO:";

/**
 * Diagnostic codes emitted by {@link checkReleasePackageContents}.
 */
export const RELEASE_PACKAGE_DIAGNOSTIC_CODES = {
  Adr: "RELEASE_PKG_ADR",
  Intake: "RELEASE_PKG_INTAKE",
  DocStub: "RELEASE_PKG_DOC_STUB",
  StubTemplateMissing: "RELEASE_PKG_STUB_TEMPLATE_MISSING",
} as const;

export type ReleasePackageReport = {
  archive: string;
  diagnostics: Diagnostic[];
};

/**
 * Validate a candidate published archive against the fresh-surface contract
 * (ADR-0021 / SPEC-V05-010 / `package-contract.md`).
 *
 * Three deterministic assertions are evaluated in fixed order: numbered ADRs
 * must not ship, intake folders must be empty (or contain only `README.md`),
 * and every shipping `docs/` page must match the stub shape from
 * `templates/release-package-stub.md`.
 *
 * @param archive Absolute path to the directory holding the candidate archive.
 * @returns Report with the archive path and all violations found.
 */
export function checkReleasePackageContents(archive: string): ReleasePackageReport {
  const diagnostics: Diagnostic[] = [];
  diagnostics.push(...checkNoNumberedAdrs(archive));
  diagnostics.push(...checkIntakeFoldersEmpty(archive));
  diagnostics.push(...checkDocsAreStubs(archive));
  return { archive, diagnostics };
}

function checkNoNumberedAdrs(archive: string): Diagnostic[] {
  const adrDir = path.join(archive, "docs", "adr");
  if (!fs.existsSync(adrDir) || !fs.statSync(adrDir).isDirectory()) return [];

  const diagnostics: Diagnostic[] = [];
  const entries = fs
    .readdirSync(adrDir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.isFile() && ADR_NUMBERED_PATTERN.test(entry.name)) {
      diagnostics.push({
        code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.Adr,
        path: toPosix(path.join("docs", "adr", entry.name)),
        message:
          "numbered ADR file must not ship in released package (ADR-0021 §Decision.2 / SPEC-V05-010 assertion 1)",
      });
    }
  }
  return diagnostics;
}

function checkIntakeFoldersEmpty(archive: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const folder of INTAKE_FOLDERS) {
    const folderPath = path.join(archive, folder);
    if (!fs.existsSync(folderPath)) continue;
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const entries = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isFile() && entry.name === "README.md") continue;
      const relPath =
        toPosix(path.join(folder, entry.name)) + (entry.isDirectory() ? "/" : "");
      diagnostics.push({
        code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.Intake,
        path: relPath,
        message: `intake folder \`${folder}/\` must be empty or contain only \`README.md\` (ADR-0021 §Decision.3 / SPEC-V05-010 assertion 2)`,
      });
    }
  }
  return diagnostics;
}

function checkDocsAreStubs(archive: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  const stubTemplate = path.join(archive, "templates", "release-package-stub.md");
  if (!fs.existsSync(stubTemplate)) {
    diagnostics.push({
      code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.StubTemplateMissing,
      path: "templates/release-package-stub.md",
      message:
        "stub template missing from archive — assertion 3 fails closed (SPEC-V05-010 edge case)",
    });
    return diagnostics;
  }

  const docsDir = path.join(archive, "docs");
  if (!fs.existsSync(docsDir) || !fs.statSync(docsDir).isDirectory()) return diagnostics;

  const docs = walkDirectory(docsDir).filter((file) => file.endsWith(".md"));
  for (const file of docs) {
    const rel = toPosix(path.relative(archive, file));
    const text = fs.readFileSync(file, "utf8");
    const fm = extractFrontmatter(text);
    if (!fm) {
      diagnostics.push({
        code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub,
        path: rel,
        message:
          "missing frontmatter — shipping doc must match `templates/release-package-stub.md` (SPEC-V05-010 assertion 3)",
      });
      continue;
    }
    const data = parseSimpleYaml(fm.raw);
    for (const key of DOC_STUB_REQUIRED_FRONTMATTER_KEYS) {
      if (!(key in data)) {
        diagnostics.push({
          code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub,
          path: rel,
          message: `missing frontmatter key: ${key} (SPEC-V05-010 assertion 3)`,
        });
      }
    }
    if (!/^# /m.test(fm.body)) {
      diagnostics.push({
        code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub,
        path: rel,
        message:
          "missing top-level `# ` heading — stub shape requires title heading (SPEC-V05-010 assertion 3)",
      });
    }
    if (!fm.body.includes(DOC_STUB_TODO_MARKER)) {
      diagnostics.push({
        code: RELEASE_PACKAGE_DIAGNOSTIC_CODES.DocStub,
        path: rel,
        message:
          "missing stub marker `<!-- TODO:` — built-up content must be replaced with TODO markers per `templates/release-package-stub.md` (SPEC-V05-010 assertion 3)",
      });
    }
  }
  return diagnostics;
}

function walkDirectory(start: string): string[] {
  const out: string[] = [];
  function walk(current: string): void {
    const entries = fs
      .readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  walk(start);
  return out;
}
