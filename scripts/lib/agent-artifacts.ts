import fs from "node:fs";
import path from "node:path";
import { DiagnosticInput } from "./diagnostics.js";
import { extractFrontmatter, parseSimpleYaml, readText, relativeToRoot, repoRoot, toPosix, walkFiles } from "./repo.js";

/**
 * Validate agent-facing Markdown artifacts as product automation surfaces.
 *
 * @param {string} [root=repoRoot] - Repository root.
 * @returns {DiagnosticInput[]} Validation diagnostics.
 */
export function validateAgentArtifacts(root = repoRoot): DiagnosticInput[] {
  const errors: DiagnosticInput[] = [];
  validateLifecycleAgents(root, errors);
  validateSkills(root, errors);
  validateOperationalAgents(root, errors);
  return errors;
}

function validateLifecycleAgents(root: string, errors: DiagnosticInput[]): void {
  const agentsRoot = path.join(root, ".claude", "agents");
  if (!fs.existsSync(agentsRoot)) return;

  for (const file of listFiles(agentsRoot, ".md", root).filter((item) => !item.endsWith("/README.md"))) {
    const absolute = path.join(root, file);
    const text = readText(absolute);
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

function validateSkills(root: string, errors: DiagnosticInput[]): void {
  const skillsRoot = path.join(root, ".claude", "skills");
  if (!fs.existsSync(skillsRoot)) return;

  for (const file of listFiles(skillsRoot, "SKILL.md", root)) {
    const text = readText(path.join(root, file));
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

function validateOperationalAgents(root: string, errors: DiagnosticInput[]): void {
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
