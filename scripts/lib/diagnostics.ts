export type Diagnostic = {
  message: string;
  path?: string;
  line?: number;
  code?: string;
  rerun?: string;
};

export type CheckResult = {
  check: string;
  status: "pass" | "fail";
  errors: Diagnostic[];
  rerun?: string;
};

export type DiagnosticInput = string | Diagnostic;

/**
 * Convert a plain string or structured diagnostic into a consistent shape.
 *
 * @param {DiagnosticInput} diagnostic - Diagnostic string or object.
 * @returns {Diagnostic} Structured diagnostic.
 */
export function normalizeDiagnostic(diagnostic: DiagnosticInput): Diagnostic {
  if (typeof diagnostic !== "string") return diagnostic;

  const location = diagnostic.match(/^([^:\n]+):(\d+)\s+(.+)$/);
  if (location) {
    return {
      path: location[1],
      line: Number(location[2]),
      message: location[3],
    };
  }

  return { message: diagnostic };
}

/**
 * Build the serializable result for a repository check.
 *
 * @param {string} heading - Check name.
 * @param {DiagnosticInput[]} errors - Accumulated diagnostics.
 * @returns {CheckResult} Result suitable for human or JSON rendering.
 */
export function checkResult(heading: string, errors: DiagnosticInput[]): CheckResult {
  const normalized = errors.map(normalizeDiagnostic);
  return {
    check: heading,
    status: normalized.length === 0 ? "pass" : "fail",
    errors: normalized,
  };
}

/**
 * Render a diagnostic for the existing line-oriented CLI output.
 *
 * @param {Diagnostic} diagnostic - Structured diagnostic.
 * @returns {string} Human-readable diagnostic line.
 */
export function formatDiagnostic(diagnostic: Diagnostic): string {
  const location = diagnostic.path
    ? diagnostic.line !== undefined
      ? `${diagnostic.path}:${diagnostic.line} `
      : `${diagnostic.path} `
    : "";
  const code = diagnostic.code ? `[${diagnostic.code}] ` : "";
  return `${location}${code}${diagnostic.message}`;
}

/**
 * Render a diagnostic as a GitHub Actions workflow annotation.
 *
 * @param {Diagnostic} diagnostic - Structured diagnostic.
 * @returns {string} GitHub Actions annotation command.
 */
export function formatGitHubAnnotation(diagnostic: Diagnostic): string {
  const properties = [
    diagnostic.path ? `file=${escapeAnnotationProperty(diagnostic.path)}` : "",
    diagnostic.line !== undefined ? `line=${diagnostic.line}` : "",
    diagnostic.code ? `title=${escapeAnnotationProperty(diagnostic.code)}` : "",
  ].filter(Boolean);
  const propertySuffix = properties.length > 0 ? ` ${properties.join(",")}` : "";
  return `::error${propertySuffix}::${escapeAnnotationData(diagnostic.message)}`;
}

/**
 * Detect whether the current CLI invocation requested JSON diagnostics.
 *
 * @param {string[]} [argv=process.argv] - Process arguments.
 * @returns {boolean} True when JSON output is requested.
 */
export function wantsJson(argv: string[] = process.argv): boolean {
  return argv.includes("--json");
}

function escapeAnnotationData(value: string): string {
  return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function escapeAnnotationProperty(value: string): string {
  return escapeAnnotationData(value).replace(/:/g, "%3A").replace(/,/g, "%2C");
}
