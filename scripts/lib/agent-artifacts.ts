import fs from "node:fs";
import path from "node:path";
import { DiagnosticInput } from "./diagnostics.js";
import { extractFrontmatter, parseSimpleYaml, readText, relativeToRoot, repoRoot, toPosix, walkFiles } from "./repo.js";

type AgentArtifactRecord = {
  path: string;
  text: string;
};

/**
 * Validate agent-facing Markdown artifacts as product automation surfaces.
 *
 * @param {string} [root=repoRoot] - Repository root.
 * @returns {DiagnosticInput[]} Validation diagnostics.
 */
export function validateAgentArtifacts(root = repoRoot): DiagnosticInput[] {
  const errors: DiagnosticInput[] = [];
  const records: AgentArtifactRecord[] = [];
  validateLifecycleAgents(root, errors, records);
  validateSkills(root, errors, records);
  validateOperationalAgents(root, errors, records);
  validateArtifactReferences(root, records, errors);
  return errors;
}

function validateLifecycleAgents(root: string, errors: DiagnosticInput[], records: AgentArtifactRecord[] = []): void {
  const agentsRoot = path.join(root, ".claude", "agents");
  if (!fs.existsSync(agentsRoot)) return;

  for (const file of listFiles(agentsRoot, ".md", root).filter((item) => !item.endsWith("/README.md"))) {
    const absolute = path.join(root, file);
    const text = readText(absolute);
    records.push({ path: file, text });
    const frontmatter = extractFrontmatter(text);
    if (!frontmatter) {
      errors.push({ path: file, code: "AGENT_FRONTMATTER", message: "agent must start with YAML frontmatter" });
      continue;
    }
    const data = parseSimpleYaml(frontmatter.raw);
    requireFrontmatterString(data, "name", file, "AGENT_NAME", errors);
    requireFrontmatterString(data, "description", file, "AGENT_DESCRIPTION", errors);
    requireFrontmatterArray(data, "tools", file, "AGENT_TOOLS", errors);

    for (const heading of ["## Scope"]) {
      if (!frontmatter.body.includes(heading)) {
        errors.push({ path: file, code: "AGENT_SECTION", message: `agent is missing ${heading}` });
      }
    }
  }
}

function validateSkills(root: string, errors: DiagnosticInput[], records: AgentArtifactRecord[] = []): void {
  const skillsRoot = path.join(root, ".claude", "skills");
  if (!fs.existsSync(skillsRoot)) return;

  for (const file of listFiles(skillsRoot, "SKILL.md", root)) {
    const text = readText(path.join(root, file));
    records.push({ path: file, text });
    const frontmatter = extractFrontmatter(text);
    const body = frontmatter?.body || text;
    const data = frontmatter ? parseSimpleYaml(frontmatter.raw) : {};
    const hasDescription =
      (typeof data.description === "string" && String(data.description).trim() !== "") ||
      Boolean(frontmatter?.raw.match(/^description:\s*(?:>|[^\s].*)/m));
    const hasTitle = /^#\s+\S/m.test(body);
    if (frontmatter) requireFrontmatterString(data, "name", file, "SKILL_NAME", errors);
    if (!hasDescription && !hasTitle) {
      errors.push({
        path: file,
        code: "SKILL_DISCOVERY",
        message: "skill must define a frontmatter description or top-level heading",
      });
    }
  }
}

function validateOperationalAgents(root: string, errors: DiagnosticInput[], records: AgentArtifactRecord[] = []): void {
  const operationalRoot = path.join(root, "agents", "operational");
  if (!fs.existsSync(operationalRoot)) return;

  for (const entry of fs.readdirSync(operationalRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(operationalRoot, entry.name);
    const relDirectory = repoRelative(root, directory);
    const promptPath = path.join(directory, "PROMPT.md");
    const readmePath = path.join(directory, "README.md");
    if (!fs.existsSync(promptPath)) {
      errors.push({ path: relDirectory, code: "OP_AGENT_PROMPT", message: "operational agent is missing PROMPT.md" });
      continue;
    }
    if (!fs.existsSync(readmePath)) {
      errors.push({ path: relDirectory, code: "OP_AGENT_README", message: "operational agent is missing README.md" });
      continue;
    }

    const prompt = readText(promptPath);
    const readme = readText(readmePath);
    records.push({ path: repoRelative(root, promptPath), text: prompt });
    records.push({ path: repoRelative(root, readmePath), text: readme });
    for (const heading of ["## Role", "## Scope", "## Output"]) {
      if (!prompt.includes(heading)) {
        errors.push({ path: repoRelative(root, promptPath), code: "OP_AGENT_SECTION", message: `PROMPT.md is missing ${heading}` });
      }
    }
    if (!readme.includes("entry_point: true")) {
      errors.push({
        path: repoRelative(root, readmePath),
        code: "OP_AGENT_README_FRONTMATTER",
        message: "operator README must be a folder entry point",
      });
    }
  }
}

function validateArtifactReferences(root: string, records: AgentArtifactRecord[], errors: DiagnosticInput[]): void {
  const scripts = packageScripts(root);
  for (const record of records) {
    const text = stripFencedBlocks(record.text);
    validateNpmRunReferences(record, text, scripts, errors);
    validateInlinePathReferences(root, record, text, errors);
  }
}

function validateNpmRunReferences(
  record: AgentArtifactRecord,
  text: string,
  scripts: Set<string>,
  errors: DiagnosticInput[],
): void {
  for (const match of text.matchAll(/\bnpm\s+run\s+([A-Za-z0-9:_-]+)/g)) {
    const script = match[1];
    if (!scripts.has(script)) {
      errors.push({
        path: record.path,
        line: lineNumberAt(text, match.index || 0),
        code: "AGENT_COMMAND",
        message: `agent artifact references undefined npm script: npm run ${script}`,
      });
    }
  }
}

function validateInlinePathReferences(
  root: string,
  record: AgentArtifactRecord,
  text: string,
  errors: DiagnosticInput[],
): void {
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const candidate = normalizeInlinePathCandidate(match[1]);
    if (!candidate || !isConcretePathReference(candidate)) continue;
    if (isDocumentedExampleReference(candidate, text, match.index || 0)) continue;
    const resolved = resolveReferencePath(root, record.path, candidate);
    if (!fs.existsSync(resolved)) {
      errors.push({
        path: record.path,
        line: lineNumberAt(text, match.index || 0),
        code: "AGENT_PATH",
        message: `agent artifact references missing path: ${candidate}`,
      });
    }
  }
}

function packageScripts(root: string): Set<string> {
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(packagePath)) return new Set();
  const parsed = JSON.parse(readText(packagePath)) as { scripts?: unknown };
  if (!parsed.scripts || typeof parsed.scripts !== "object" || Array.isArray(parsed.scripts)) return new Set();
  return new Set(Object.keys(parsed.scripts));
}

function stripFencedBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, (block) => "\n".repeat(block.split(/\r?\n/).length - 1));
}

function normalizeInlinePathCandidate(value: string): string | null {
  const candidate = value.trim().replace(/[.,;:]+$/g, "");
  if (!candidate || candidate.includes(" ")) return null;
  return candidate;
}

function isConcretePathReference(candidate: string): boolean {
  if (!candidate.includes("/") && !candidate.startsWith(".")) return false;
  if (/^(https?:|mailto:|#|\/)/.test(candidate)) return false;
  if (/[<>{}*$]/.test(candidate)) return false;
  if (candidate.includes("*")) return false;
  if (candidate.startsWith("npm ")) return false;
  return Boolean(
    candidate.startsWith("../") ||
      candidate.startsWith("./") ||
      candidate.startsWith(".claude/") ||
      candidate.startsWith(".codex/") ||
      candidate.startsWith(".github/") ||
      candidate.startsWith("agents/") ||
      candidate.startsWith("discovery/") ||
      candidate.startsWith("docs/") ||
      candidate.startsWith("memory/") ||
      candidate.startsWith("portfolio/") ||
      candidate.startsWith("projects/") ||
      candidate.startsWith("quality/") ||
      candidate.startsWith("roadmaps/") ||
      candidate.startsWith("scaffolding/") ||
      candidate.startsWith("scripts/") ||
      candidate.startsWith("sites/") ||
      candidate.startsWith("specs/") ||
      candidate.startsWith("templates/") ||
      candidate.startsWith("tools/"),
  );
}

function isDocumentedExampleReference(candidate: string, text: string, index: number): boolean {
  if (isOptionalLegacyReference(candidate)) return true;
  if (candidate.endsWith("/")) return true;
  if (hasPlaceholderSegment(candidate)) return true;
  if (/(^|\/)(foo|bar|example|sample)(\.|\/|$)/i.test(candidate)) return true;
  const context = lineContextAt(text, index, 2);
  return /\b(e\.g\.|example|sample|placeholder|template|lazy|lazily|if present|not included|not checked|does not|expected to rot|link rot|create|creates|created|scaffold|produces?|outputs?)\b/i.test(
    context,
  );
}

function hasPlaceholderSegment(candidate: string): boolean {
  return candidate.split("/").some((segment) => /(YYYY|MM|DD|NNNN|\d{4}-\d{2}-\d{2})/.test(segment));
}

function isOptionalLegacyReference(candidate: string): boolean {
  return candidate === "docs/CONTEXT.md" || candidate === "docs/CONTEXT-MAP.md" || candidate === "docs/UBIQUITOUS_LANGUAGE.md";
}

function resolveReferencePath(root: string, sourcePath: string, candidate: string): string {
  if (candidate.startsWith("../") || candidate.startsWith("./")) {
    return path.resolve(path.join(root, path.dirname(sourcePath)), candidate);
  }
  return path.join(root, candidate);
}

function lineNumberAt(text: string, index: number): number {
  return text.slice(0, index).split(/\r?\n/).length;
}

function lineContextAt(text: string, index: number, radius: number): string {
  const lines = text.split(/\r?\n/);
  const lineIndex = lineNumberAt(text, index) - 1;
  return lines.slice(Math.max(0, lineIndex - radius), lineIndex + radius + 1).join("\n");
}

function requireFrontmatterString(
  data: Record<string, unknown>,
  key: string,
  file: string,
  code: string,
  errors: DiagnosticInput[],
): void {
  if (typeof data[key] !== "string" || String(data[key]).trim() === "") {
    errors.push({ path: file, code, message: `frontmatter must define ${key}` });
  }
}

function requireFrontmatterArray(
  data: Record<string, unknown>,
  key: string,
  file: string,
  code: string,
  errors: DiagnosticInput[],
): void {
  if (!Array.isArray(data[key]) || (data[key] as unknown[]).length === 0) {
    errors.push({ path: file, code, message: `frontmatter must define non-empty ${key}` });
  }
}

function listFiles(rootDirectory: string, suffix: string, root: string): string[] {
  if (root === repoRoot) {
    return walkFiles(relativeToRoot(rootDirectory), (file) => file.endsWith(suffix)).map(relativeToRoot);
  }

  const results: string[] = [];
  function walk(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.isFile() && full.endsWith(suffix)) results.push(repoRelative(root, full));
    }
  }
  walk(rootDirectory);
  return results.sort();
}

function repoRelative(root: string, filePath: string): string {
  return toPosix(path.relative(root, filePath));
}
