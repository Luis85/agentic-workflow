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
 * and total character offsets are preserved, so diagnostic line numbers
 * continue to match the original source. Block-quoted fences are recognised,
 * and inline code spans may cross line boundaries.
 */
export function stripCodeRegions(text: string): string {
  return stripInlineCodeSpansGlobal(stripFencedBlocks(text));
}

function stripFencedBlocks(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let fenceChar: "`" | "~" | null = null;
  let fenceLen = 0;
  for (const line of lines) {
    const body = stripBlockQuotePrefix(line);
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(body);
    if (fenceChar !== null) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fenceChar &&
        fenceMatch[1].length >= fenceLen &&
        body.slice(fenceMatch[0].length).trim() === ""
      ) {
        fenceChar = null;
        fenceLen = 0;
      }
      out.push("");
      continue;
    }
    if (fenceMatch) {
      const info = body.slice(fenceMatch[0].length);
      const isBacktickFence = fenceMatch[1][0] === "`";
      if (isBacktickFence && info.includes("`")) {
        out.push(line);
        continue;
      }
      fenceChar = fenceMatch[1][0] as "`" | "~";
      fenceLen = fenceMatch[1].length;
      out.push("");
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

function stripBlockQuotePrefix(line: string): string {
  const match = /^(?:[ \t]{0,3}>[ \t]?)+/.exec(line);
  return match ? line.slice(match[0].length) : line;
}

function stripInlineCodeSpansGlobal(text: string): string {
  const blocks = splitIntoInlineBlocks(text);
  return blocks.map(stripInlineCodeSpansInBlock).join("\n");
}

function splitIntoInlineBlocks(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
  };
  for (const line of lines) {
    if (isBlockBoundary(line)) {
      flush();
      blocks.push(line);
    } else {
      current.push(line);
    }
  }
  flush();
  return blocks;
}

function isBlockBoundary(line: string): boolean {
  if (/^[ \t]*$/.test(line)) return true;
  if (/^[ \t]{0,3}#{1,6}([ \t]|$)/.test(line)) return true;
  if (/^[ ]{0,3}(=+|-+)[ \t]*$/.test(line)) return true;
  if (/^[ ]{0,3}(?:-[ \t]*){3,}$/.test(line)) return true;
  if (/^[ ]{0,3}(?:\*[ \t]*){3,}$/.test(line)) return true;
  if (/^[ ]{0,3}(?:_[ \t]*){3,}$/.test(line)) return true;
  if (/^(?: {4}|\t)/.test(line)) return true;
  return false;
}

function stripInlineCodeSpansInBlock(block: string): string {
  const chars = block.split("");
  let i = 0;
  while (i < chars.length) {
    if (chars[i] !== "`") {
      i += 1;
      continue;
    }
    let runLen = 0;
    while (i + runLen < chars.length && chars[i + runLen] === "`") runLen += 1;
    if (isBackslashEscaped(chars, i)) {
      i += runLen;
      continue;
    }
    const closeIdx = findClosingBackticksGlobal(chars, i + runLen, runLen);
    if (closeIdx === -1) {
      i += runLen;
      continue;
    }
    for (let k = i; k < closeIdx + runLen; k += 1) {
      if (chars[k] !== "\n" && chars[k] !== "\r") chars[k] = " ";
    }
    i = closeIdx + runLen;
  }
  return chars.join("");
}

function isBackslashEscaped(chars: string[], pos: number): boolean {
  let backslashes = 0;
  let j = pos - 1;
  while (j >= 0 && chars[j] === "\\") {
    backslashes += 1;
    j -= 1;
  }
  return backslashes % 2 === 1;
}

function findClosingBackticksGlobal(chars: string[], start: number, runLen: number): number {
  let i = start;
  while (i < chars.length) {
    if (chars[i] !== "`") {
      i += 1;
      continue;
    }
    let len = 0;
    while (i + len < chars.length && chars[i + len] === "`") len += 1;
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

export function isCodeFenceDelimiter(line: string): boolean {
  return /^(`{3,}|~{3,})/.test(line);
}

export function stripInlineCode(line: string): string {
  return line.replace(/`+[^`\n]*`+/g, "");
}
