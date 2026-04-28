import type { Diagnostic } from "./diagnostics.js";
import { extractFrontmatter, relativeToRoot, readText } from "./repo.js";

export type ObsidianDiagnosticCode =
  | "OBS_FRONTMATTER_CLOSE"
  | "OBS_FRONTMATTER_JSON"
  | "OBS_FRONTMATTER_TAB"
  | "OBS_PROPERTY_SYNTAX"
  | "OBS_PROPERTY_NAME"
  | "OBS_PROPERTY_DUPLICATE"
  | "OBS_PROPERTY_INDENT"
  | "OBS_PROPERTY_LINK_QUOTE";

const propertyNamePattern = /^[A-Za-z0-9_-]+$/;

/**
 * Validate Markdown frontmatter against this repository's Obsidian compatibility rules.
 *
 * The check is intentionally conservative: files without frontmatter are valid,
 * but frontmatter that exists must be top-of-file YAML, use unique readable
 * property names, avoid JSON-only syntax, and quote Obsidian wikilinks in scalar
 * values so the Properties UI can round-trip them predictably.
 *
 * @param {string} filePath - Absolute Markdown file path to validate.
 * @returns {Diagnostic[]} Obsidian compatibility diagnostics for the file.
 */
export function obsidianDiagnosticsForFile(filePath: string): Diagnostic[] {
  const rel = relativeToRoot(filePath);
  const text = readText(filePath);
  const normalized = text.replace(/\r\n/g, "\n");

  if (normalized.startsWith("---\n") && !extractFrontmatter(text)) {
    return [obsidianDiagnostic("OBS_FRONTMATTER_CLOSE", rel, 1, "frontmatter must close with a standalone --- line")];
  }

  const frontmatter = extractFrontmatter(text);
  if (!frontmatter) return [];

  return obsidianDiagnosticsForFrontmatter(rel, frontmatter.raw);
}

/**
 * Validate a raw frontmatter block against Obsidian compatibility rules.
 *
 * @param {string} filePath - Repository-relative Markdown file path for diagnostics.
 * @param {string} raw - Raw frontmatter without delimiter lines.
 * @returns {Diagnostic[]} Obsidian compatibility diagnostics for the block.
 */
export function obsidianDiagnosticsForFrontmatter(filePath: string, raw: string): Diagnostic[] {
  const errors: Diagnostic[] = [];
  const seen = new Map<string, number>();
  const lines = raw.split("\n");

  if (/^\s*[\[{]/.test(raw)) {
    errors.push(
      obsidianDiagnostic(
        "OBS_FRONTMATTER_JSON",
        filePath,
        2,
        "frontmatter must use readable YAML properties, not JSON-style metadata",
      ),
    );
    return errors;
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 2;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (line.includes("\t")) {
      errors.push(obsidianDiagnostic("OBS_FRONTMATTER_TAB", filePath, lineNumber, "frontmatter must use spaces, not tabs"));
    }

    if (line.startsWith("  ")) return;

    if (/^\s/.test(line)) {
      errors.push(
        obsidianDiagnostic(
          "OBS_PROPERTY_INDENT",
          filePath,
          lineNumber,
          "top-level Obsidian properties must not be indented",
        ),
      );
      return;
    }

    const match = line.match(/^([^:#]+):(.*)$/);
    if (!match) {
      errors.push(
        obsidianDiagnostic(
          "OBS_PROPERTY_SYNTAX",
          filePath,
          lineNumber,
          "property lines must use `name: value` or `name:` YAML syntax",
        ),
      );
      return;
    }

    const [, rawName, rawValue] = match;
    const name = rawName.trim();
    if (name !== rawName || !propertyNamePattern.test(name)) {
      errors.push(
        obsidianDiagnostic(
          "OBS_PROPERTY_NAME",
          filePath,
          lineNumber,
          "property names must use only letters, numbers, underscores, or hyphens",
        ),
      );
    }

    const previousLine = seen.get(name);
    if (previousLine !== undefined) {
      errors.push(
        obsidianDiagnostic(
          "OBS_PROPERTY_DUPLICATE",
          filePath,
          lineNumber,
          `property ${name} duplicates the property on line ${previousLine}`,
        ),
      );
    } else {
      seen.set(name, lineNumber);
    }

    if (rawValue !== "" && !rawValue.startsWith(" ")) {
      errors.push(
        obsidianDiagnostic(
          "OBS_PROPERTY_SYNTAX",
          filePath,
          lineNumber,
          "property names must be followed by a colon and a space",
        ),
      );
    }

    validateScalarWikilink(errors, filePath, lineNumber, rawValue.trim());
  });

  return errors;
}

function validateScalarWikilink(errors: Diagnostic[], filePath: string, lineNumber: number, value: string): void {
  if (!value.includes("[[")) return;
  if (value.startsWith("\"") || value.startsWith("'")) return;
  if (!value.startsWith("[[") && (value.startsWith("[") || value.startsWith("{"))) return;

  errors.push(
    obsidianDiagnostic(
      "OBS_PROPERTY_LINK_QUOTE",
      filePath,
      lineNumber,
      "internal links in property values must be quoted for Obsidian Properties",
    ),
  );
}

function obsidianDiagnostic(code: ObsidianDiagnosticCode, filePath: string, line: number, message: string): Diagnostic {
  return {
    code,
    path: filePath,
    line,
    message,
  };
}
