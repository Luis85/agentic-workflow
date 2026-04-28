import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DiagnosticInput, checkResult, formatDiagnostic, wantsJson } from "./diagnostics.js";

export type FrontmatterBlock = {
  raw: string;
  body: string;
};

export type SimpleYaml = Record<string, unknown>;

/**
 * Absolute filesystem path to the repository root.
 *
 * Script helpers resolve all checked and generated paths from this directory so
 * commands behave the same regardless of the caller's current working directory.
 */
export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const ignoredDirs = new Set([
  ".git",
  ".worktrees",
  "node_modules",
  "dist",
  "build",
  "target",
  "coverage",
]);

/**
 * Parsed frontmatter from a Markdown document.
 *
 * @typedef {object} FrontmatterBlock
 * @property {string} raw - YAML text between delimiter lines.
 * @property {string} body - Markdown content after the frontmatter block.
 */

/**
 * Convert a platform-specific path to a slash-delimited path for Markdown output.
 *
 * @param {string} filePath - Path using the current operating system separator.
 * @returns {string} The same path using `/` separators.
 */
export function toPosix(filePath: string): string {
  return filePath.replace(/[\\/]+/g, "/");
}

/**
 * Format an absolute repository path as a stable path relative to the repo root.
 *
 * @param {string} filePath - Absolute or repository-root-relative path.
 * @returns {string} POSIX-style path relative to {@link repoRoot}.
 */
export function relativeToRoot(filePath: string): string {
  return toPosix(path.relative(repoRoot, filePath));
}

/**
 * Read a UTF-8 text file.
 *
 * @param {string} filePath - File path to read.
 * @returns {string} File contents.
 */
export function readText(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Write a UTF-8 text file.
 *
 * @param {string} filePath - File path to write.
 * @param {string} text - Complete replacement contents.
 */
export function writeText(filePath: string, text: string): void {
  fs.writeFileSync(filePath, text, "utf8");
}

/**
 * Recursively list files below a repository directory while skipping generated
 * and dependency folders.
 *
 * @param {string} startDir - Directory to walk, relative to {@link repoRoot}.
 * @param {(filePath: string) => boolean} [predicate] - Optional file filter.
 * @returns {string[]} Absolute file paths sorted by repository-relative path.
 */
export function walkFiles(startDir: string, predicate: (filePath: string) => boolean = () => true): string[] {
  const results: string[] = [];
  const root = path.join(repoRoot, startDir);
  if (!fs.existsSync(root)) return results;

  function walk(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) walk(full);
        continue;
      }
      if (entry.isFile() && predicate(full)) results.push(full);
    }
  }

  walk(root);
  return results.sort((a, b) => relativeToRoot(a).localeCompare(relativeToRoot(b)));
}

/**
 * List all Markdown files tracked by repository checks.
 *
 * @returns {string[]} Absolute paths to Markdown files.
 */
export function markdownFiles(): string[] {
  return walkFiles(".", (file) => file.endsWith(".md"));
}

/**
 * Print accumulated validation errors and terminate the current Node process.
 *
 * @param {DiagnosticInput[]} errors - Human-readable or structured validation errors.
 * @param {string} heading - Check name shown before the result.
 */
export function failIfErrors(errors: DiagnosticInput[], heading: string): void {
  const result = checkResult(heading, errors);
  if (wantsJson()) {
    console.log(JSON.stringify(result, null, 2));
  }

  if (result.status === "pass") {
    if (!wantsJson()) {
      console.log(`${heading}: ok`);
    }
    return;
  }

  if (!wantsJson()) {
    console.error(`${heading}: ${result.errors.length} error(s)`);
    for (const error of result.errors) console.error(`- ${formatDiagnostic(error)}`);
  }

  process.exit(1);
}

/**
 * Extract YAML frontmatter from a Markdown document.
 *
 * @param {string} text - Markdown document contents.
 * @returns {FrontmatterBlock | null} Frontmatter and body, or null when no frontmatter block exists.
 */
export function extractFrontmatter(text: string): FrontmatterBlock | null {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return null;
  const normalized = text.replace(/\r\n/g, "\n");
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return {
    raw: normalized.slice(4, end),
    body: normalized.slice(end + 5),
  };
}

/**
 * Parse the small YAML subset used by repository state files.
 *
 * This parser intentionally supports only the structures needed by local
 * checks: scalar keys, one-level nested maps, inline arrays, quoted strings,
 * integers, and null markers.
 *
 * @param {string} raw - Raw frontmatter without delimiter lines.
 * @returns {Record<string, unknown>} Parsed YAML data.
 */
export function parseSimpleYaml(raw: string): SimpleYaml {
  const data: SimpleYaml = {};
  const lines = raw.split("\n");
  let currentKey: string | null = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const nested = line.match(/^  ([^:]+):\s*(.*)$/);
    if (nested && currentKey) {
      if (typeof data[currentKey] !== "object" || Array.isArray(data[currentKey])) {
        data[currentKey] = {};
      }
      (data[currentKey] as Record<string, unknown>)[nested[1].trim()] = parseYamlScalar(
        stripInlineComment(nested[2]).trim(),
      );
      continue;
    }

    const match = line.match(/^([^:\s][^:]*):\s*(.*)$/);
    if (!match) continue;

    currentKey = match[1].trim();
    const value = stripInlineComment(match[2]).trim();
    data[currentKey] = value === "" ? {} : parseYamlScalar(value);
  }

  return data;
}

function stripInlineComment(value: string): string {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const previous = value[index - 1];
    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote || char;
      continue;
    }
    if (char === "#" && !quote && (index === 0 || /\s/.test(previous))) {
      return value.slice(0, index);
    }
  }
  return value;
}

function parseYamlScalar(value: string): unknown {
  if (value === "~" || value === "null") return null;
  if (value === "[]" || value === "{}") return value === "[]" ? [] : {};
  if (/^\d+$/.test(value)) return Number(value);
  if (/^\[.*\]$/.test(value)) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseYamlScalar(item.trim()));
  }
  return value.replace(/^["']|["']$/g, "");
}

/**
 * Replace a named generated Markdown block.
 *
 * @param {string} text - Source document containing generated block markers.
 * @param {string} name - Marker name from `BEGIN GENERATED: <name>`.
 * @param {string} content - Generated content to place between markers.
 * @returns {string} Updated document contents.
 * @throws {Error} When the named block markers are missing.
 */
export function replaceGeneratedBlock(text: string, name: string, content: string): string {
  const begin = `<!-- BEGIN GENERATED: ${name} -->`;
  const end = `<!-- END GENERATED: ${name} -->`;
  const pattern = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`);
  if (!pattern.test(text)) {
    throw new Error(`Missing generated block markers for ${name}`);
  }
  return text.replace(pattern, `${begin}\n${content.trimEnd()}\n${end}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
