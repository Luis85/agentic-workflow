import path from "node:path";
import { extractFrontmatter, parseSimpleYaml, toPosix } from "./repo.js";

/**
 * Required frontmatter keys on a stubified shipping doc.
 *
 * Mirrors `DOC_STUB_REQUIRED_FRONTMATTER_KEYS` in `release-package-contract.ts`
 * — the Layer 2 fresh-surface check enforces the same set, so any drift would
 * silently break the release pipeline (T-V05-013 invariant).
 */
export const STUB_FRONTMATTER_KEYS = [
  "title",
  "folder",
  "description",
  "entry_point",
] as const;

/**
 * Stub TODO marker substring required by the Layer 2 fresh-surface check.
 *
 * Mirrors `DOC_STUB_TODO_MARKER` in `release-package-contract.ts`.
 */
export const STUB_TODO_MARKER = "<!-- TODO:";

// Trailer appended to every stubified doc. Mirrors
// `templates/release-package-stub.md` but uses plain prose instead of inline
// Markdown links so the same string is safe to paste into any stub doc
// regardless of folder depth — `check:links` would otherwise reject a
// fixed relative path from a doc deeper than `docs/<file>.md`.
const STUB_TRAILER = `---

## How to use this stub

This file shipped in the released Specorator template package as a **stub** — a structural placeholder, not finished content. The codebase form (in the Specorator template repository) carries built-up examples and version-specific commentary that are intentionally omitted from the released package per the fresh-surface contract.

To fill it in:

1. Read the document title and frontmatter to confirm the document's purpose for your project.
2. Replace each \`<!-- TODO: ... -->\` marker with content that fits your product, your domain, and your team.
3. Keep the section structure unless your product genuinely needs different sections — the structure is what makes the cross-references in the rest of the template work.
4. Remove this "How to use this stub" trailer once the stub has been filled in.

The reference shape for stubs is \`templates/release-package-stub.md\`. The methodology page that documents how content is stubified is \`docs/release-package-contents.md\`.
`;

export type StubifyInput = {
  /** Repository-relative POSIX path of the source file. */
  path: string;
  /** Codebase-form Markdown contents. */
  text: string;
};

export type StubifyOutput = {
  /** Stubified Markdown ready to ship in the released archive. */
  text: string;
};

const INTENT_TODO = `<!-- TODO: One short paragraph (1-3 sentences) that names this document's purpose for the consumer. Replace built-up content from the codebase form with this stub paragraph. -->`;
const SECTION_TODO = `<!-- TODO: replace with consumer-facing content for this section -->`;

/**
 * Convert a single Markdown document from codebase form to released stub form.
 *
 * The transform is a pure function: codebase contents in, stub contents out.
 * No filesystem access. The caller (release-archive-builder) is responsible
 * for reading and writing files.
 *
 * @param input Source path (relative to repo root, POSIX) and Markdown text.
 * @returns Stubified Markdown text that satisfies SPEC-V05-010 assertion 3.
 */
export function stubifyDoc(input: StubifyInput): StubifyOutput {
  const normalized = input.text.replace(/\r\n/g, "\n");
  const fm = extractFrontmatter(normalized);
  const codebaseFrontmatter = fm ? parseSimpleYaml(fm.raw) : {};
  const body = fm ? fm.body : normalized;

  const stripped = stripFencedCodeBlocks(body);
  const sections = collectSectionHeadings(stripped);
  const firstH1 = findFirstH1(stripped);

  const title = computeTitle({
    frontmatterTitle: stringFrom(codebaseFrontmatter.title),
    bodyHeading: firstH1,
    sourcePath: input.path,
  });
  const folder = computeFolder(input.path);
  const description = computeDescription({
    frontmatterDescription: stringFrom(codebaseFrontmatter.description),
    title,
  });
  const entryPoint = computeEntryPoint(codebaseFrontmatter.entry_point);

  const lines: string[] = [];
  lines.push("---");
  lines.push(`title: ${title}`);
  lines.push(`folder: ${folder}`);
  lines.push(`description: ${description}`);
  lines.push(`entry_point: ${entryPoint ? "true" : "false"}`);
  lines.push("---");
  lines.push("");
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(INTENT_TODO);

  for (const heading of sections) {
    lines.push("");
    lines.push(`## ${heading}`);
    lines.push("");
    lines.push(SECTION_TODO);
  }

  lines.push("");
  lines.push(STUB_TRAILER.trimEnd());
  lines.push("");

  return { text: lines.join("\n") };
}

function stringFrom(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function computeTitle(args: {
  frontmatterTitle: string | null;
  bodyHeading: string | null;
  sourcePath: string;
}): string {
  if (args.frontmatterTitle) return args.frontmatterTitle;
  if (args.bodyHeading) return args.bodyHeading;
  return titleFromFilename(args.sourcePath);
}

function titleFromFilename(sourcePath: string): string {
  const base = path.basename(toPosix(sourcePath), ".md");
  if (!base) return "Untitled";
  const words = base.replace(/[-_]+/g, " ").trim().split(/\s+/);
  if (words.length === 0) return "Untitled";
  const [first, ...rest] = words;
  const head = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  const tail = rest.map((word) => word.toLowerCase());
  return [head, ...tail].join(" ");
}

function computeFolder(sourcePath: string): string {
  const dir = path.posix.dirname(toPosix(sourcePath));
  if (!dir || dir === ".") return "docs";
  return dir;
}

function computeDescription(args: {
  frontmatterDescription: string | null;
  title: string;
}): string {
  if (args.frontmatterDescription) return args.frontmatterDescription;
  return `Stub for "${args.title}" — fill in for your project.`;
}

function computeEntryPoint(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
  }
  return false;
}

/**
 * Replace fenced code blocks with empty lines so that downstream heading and
 * section detection cannot misinterpret a `# ` line inside a shell example as
 * a Markdown heading.
 */
function stripFencedCodeBlocks(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let fenceMarker: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const isFence = /^(`{3,}|~{3,})/.test(trimmed);
    if (isFence) {
      if (fenceMarker === null) {
        fenceMarker = trimmed.match(/^(`{3,}|~{3,})/)![0];
        out.push("");
        continue;
      }
      if (trimmed.startsWith(fenceMarker)) {
        fenceMarker = null;
      }
      out.push("");
      continue;
    }
    if (fenceMarker !== null) {
      out.push("");
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

function findFirstH1(text: string): string | null {
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/^# (.+)$/);
    if (match) return match[1].trim();
  }
  return null;
}

function collectSectionHeadings(text: string): string[] {
  const lines = text.split("\n");
  const headings: string[] = [];
  for (const line of lines) {
    const match = line.match(/^## (.+)$/);
    if (match) headings.push(match[1].trim());
  }
  return headings;
}
