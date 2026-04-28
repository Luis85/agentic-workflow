import type { Diagnostic } from "./diagnostics.js";

export type FrontmatterDiagnosticCode =
  | "FM_README_NAME"
  | "FM_README_DUPLICATE"
  | "FM_MISSING"
  | "FM_KEY"
  | "FM_README_FOLDER"
  | "FM_README_ENTRY_POINT"
  | "FM_ADR_ID"
  | "FM_ADR_STATUS"
  | "FM_WORKFLOW_STAGE"
  | "FM_WORKFLOW_STATUS"
  | "FM_ARTIFACT_STATUS"
  | "FM_REVIEW_SHA"
  | "FM_REVIEW_ISSUE"
  | "FM_REVIEW_FINDING_COUNT";

/**
 * Build a structured frontmatter diagnostic.
 *
 * @param {FrontmatterDiagnosticCode} code - Stable diagnostic code for the frontmatter failure.
 * @param {string} filePath - Repository-relative Markdown file path, or a directory for duplicate README failures.
 * @param {string} message - Human-readable failure message.
 * @returns {Diagnostic} Structured diagnostic for check output.
 */
export function frontmatterDiagnostic(
  code: FrontmatterDiagnosticCode,
  filePath: string,
  message: string,
): Diagnostic {
  return {
    code,
    path: filePath,
    message,
  };
}

/**
 * Build diagnostics for required frontmatter keys.
 *
 * @param {string} filePath - Repository-relative Markdown file path.
 * @param {Record<string, unknown>} data - Parsed frontmatter data.
 * @param {string[]} keys - Required frontmatter keys.
 * @returns {Diagnostic[]} Missing-key diagnostics.
 */
export function requiredKeyDiagnostics(
  filePath: string,
  data: Record<string, unknown>,
  keys: string[],
): Diagnostic[] {
  return keys
    .filter((key) => data[key] === undefined || data[key] === "")
    .map((key) => frontmatterDiagnostic("FM_KEY", filePath, `missing frontmatter key: ${key}`));
}
