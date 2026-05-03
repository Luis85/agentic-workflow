/**
 * Serialize values for the local issues/ frontmatter mirror.
 *
 * The serializer only covers the schema shapes written by sync:issues:
 * nulls, string arrays, strings, numbers, and booleans.
 */
export function serializeIssueFrontmatterValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[${value.map((item) => `"${escapeYamlDoubleQuoted(String(item))}"`).join(", ")}]`;
  }
  if (typeof value === "string") {
    return needsYamlQuoting(value) ? `"${escapeYamlDoubleQuoted(value)}"` : value;
  }
  return String(value);
}

export function isMissingGitHubIssueError(stderr: string): boolean {
  return (
    /could not resolve to an issue or pull request with the number of \d+/i.test(stderr) ||
    /\bno issues match\b/i.test(stderr) ||
    /\bissue\b.*\bnot found\b/i.test(stderr) ||
    /\bnot found\b.*\bissue\b/i.test(stderr)
  );
}

function needsYamlQuoting(s: string): boolean {
  return /[\s:#[\]{}"]/.test(s);
}

function escapeYamlDoubleQuoted(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
