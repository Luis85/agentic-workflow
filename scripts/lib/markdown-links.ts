import type { Diagnostic } from "./diagnostics.js";

export type LinkDiagnosticCode = "LINK_URI" | "LINK_FILE" | "LINK_ANCHOR";

/**
 * Build a structured Markdown link diagnostic.
 *
 * @param {LinkDiagnosticCode} code - Stable diagnostic code for the link failure.
 * @param {string} filePath - Repository-relative Markdown file path.
 * @param {number} line - One-based line number.
 * @param {string} target - Link target that failed validation.
 * @returns {Diagnostic} Structured diagnostic for check output.
 */
export function linkDiagnostic(
  code: LinkDiagnosticCode,
  filePath: string,
  line: number,
  target: string,
): Diagnostic {
  return {
    code,
    path: filePath,
    line,
    message: linkDiagnosticMessage(code, target),
  };
}

export function safeDecode(value: string | undefined): { ok: boolean; value: string } {
  if (value === undefined) return { ok: true, value: "" };
  try {
    return { ok: true, value: decodeURIComponent(value) };
  } catch {
    return { ok: false, value };
  }
}

function linkDiagnosticMessage(code: LinkDiagnosticCode, target: string): string {
  if (code === "LINK_URI") return `has invalid URI escape in link ${target}`;
  if (code === "LINK_FILE") return `links to missing file ${target}`;
  return `links to missing anchor ${target}`;
}

/**
 * Replace fenced code blocks and inline code spans with whitespace so the link
 * scanner does not match path-like substrings inside code examples. Newlines
 * and total character offsets within a line are preserved, so diagnostic line
 * numbers continue to match the original source.
 */
export function stripCodeRegions(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let fenceChar: "`" | "~" | null = null;
  let fenceLen = 0;
  for (const line of lines) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceChar !== null) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fenceChar &&
        fenceMatch[1].length >= fenceLen &&
        line.slice(fenceMatch[0].length).trim() === ""
      ) {
        fenceChar = null;
        fenceLen = 0;
      }
      out.push("");
      continue;
    }
    if (fenceMatch) {
      const info = line.slice(fenceMatch[0].length);
      const isBacktickFence = fenceMatch[1][0] === "`";
      if (isBacktickFence && info.includes("`")) {
        out.push(stripInlineCodeSpans(line));
        continue;
      }
      fenceChar = fenceMatch[1][0] as "`" | "~";
      fenceLen = fenceMatch[1].length;
      out.push("");
      continue;
    }
    out.push(stripInlineCodeSpans(line));
  }
  return out.join("\n");
}

function stripInlineCodeSpans(line: string): string {
  let result = "";
  let i = 0;
  while (i < line.length) {
    if (line[i] !== "`") {
      result += line[i];
      i += 1;
      continue;
    }
    let runLen = 0;
    while (i + runLen < line.length && line[i + runLen] === "`") runLen += 1;
    const closeIdx = findClosingBackticks(line, i + runLen, runLen);
    if (closeIdx === -1) {
      result += line.slice(i, i + runLen);
      i += runLen;
      continue;
    }
    const spanLen = closeIdx + runLen - i;
    result += " ".repeat(spanLen);
    i = closeIdx + runLen;
  }
  return result;
}

function findClosingBackticks(line: string, start: number, runLen: number): number {
  let i = start;
  while (i < line.length) {
    if (line[i] !== "`") {
      i += 1;
      continue;
    }
    let len = 0;
    while (i + len < line.length && line[i + len] === "`") len += 1;
    if (len === runLen) return i;
    i += len;
  }
  return -1;
}

export function shouldIgnoreTarget(target: string): boolean {
  if (!target || target.startsWith("#")) return false;
  if (/^(https?:|mailto:|app:|plugin:)/.test(target)) return true;
  if (target.includes("<") || target.includes(">")) return true;
  if (target.includes("$")) return true;
  if (target.includes("feature-slug") || target.includes("sprint-slug")) return true;
  if (target.includes("slug/") || target.includes("slug.md")) return true;
  return false;
}

export function collectAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  const used = new Map<string, number>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    for (const base of slugVariants(match[2])) {
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }
  }
  return anchors;
}

export function slugVariants(heading: string): Set<string> {
  const cleaned = heading
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .toLowerCase();

  return new Set<string>([
    githubSlug(cleaned),
    githubSlug(cleaned.replace(/[‑‒–—―]/gu, "-")),
    githubSlug(cleaned.replace(/[‑‒–—―]/gu, "")),
  ]);
}

export function githubSlug(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s/gu, "-");
}
