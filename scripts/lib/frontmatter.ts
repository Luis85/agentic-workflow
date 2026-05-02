import type { Diagnostic } from "./diagnostics.js";

export type FrontmatterDiagnosticCode =
  | "FRONTMATTER_FUTURE_DATE"
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

/**
 * Validate repository-maintained frontmatter date fields against the current UTC day.
 *
 * @param {string} filePath - Repository-relative Markdown file path.
 * @param {string} raw - Raw frontmatter without delimiter lines.
 * @param {Date} [today=new Date()] - Date used for UTC comparison.
 * @returns {Diagnostic[]} Future-date diagnostics.
 */
export function futureDateDiagnostics(filePath: string, raw: string, today = new Date()): Diagnostic[] {
  const todayKey = utcDateKey(today);
  return raw
    .split("\n")
    .flatMap((line, index) => {
      const match = line.match(/^(last_updated|updated):\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*(?:#.*)?$/);
      if (!match || match[2] <= todayKey) return [];

      return [
        {
          ...frontmatterDiagnostic(
            "FRONTMATTER_FUTURE_DATE",
            filePath,
            `${match[1]} must not be later than today's UTC date (${todayKey}): ${match[2]}`,
          ),
          line: index + 2,
        },
      ];
    });
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
