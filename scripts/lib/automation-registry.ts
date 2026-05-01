import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { Diagnostic, DiagnosticInput } from "./diagnostics.js";
import { readText, repoRoot, toPosix, walkFiles } from "./repo.js";

export const automationKinds = new Set([
  "script",
  "check",
  "fix",
  "workflow",
  "skill",
  "agent",
  "operational-agent",
]);

export type AutomationKind =
  | "script"
  | "check"
  | "fix"
  | "workflow"
  | "skill"
  | "agent"
  | "operational-agent";

export type AutomationRegistryEntry = {
  id: string;
  kind: AutomationKind;
  command?: string;
  path?: string;
  purpose: string;
  read_only: boolean;
  safe_to_run_locally: boolean;
  emits_json: boolean;
  used_by: string[];
  rerun_command: string;
};

export type AutomationRegistry = {
  version: number;
  entries: AutomationRegistryEntry[];
};

export type AutomationRegistryDiscovery = {
  missing: AutomationRegistryEntry[];
};

type PackageJson = {
  scripts?: Record<string, string>;
};

/**
 * Read and parse the repository automation registry.
 *
 * @param {string} [root=repoRoot] - Repository root.
 * @returns {AutomationRegistry} Parsed registry.
 */
export function loadAutomationRegistry(root = repoRoot): AutomationRegistry {
  const registryPath = path.join(root, "tools", "automation-registry.yml");
  return YAML.parse(readText(registryPath)) as AutomationRegistry;
}

/**
 * Validate the automation registry against repository automation surfaces.
 *
 * @param {AutomationRegistry} registry - Parsed automation registry.
 * @param {string} [root=repoRoot] - Repository root.
 * @returns {DiagnosticInput[]} Validation diagnostics.
 */
export function validateAutomationRegistry(
  registry: AutomationRegistry,
  root = repoRoot,
): DiagnosticInput[] {
  const errors: Diagnostic[] = [];
  const registryPath = "tools/automation-registry.yml";
  if (!registry || typeof registry !== "object") {
    return [{ path: registryPath, code: "AUTO_REGISTRY", message: "registry must be an object" }];
  }
  const entries = Array.isArray(registry.entries) ? registry.entries : [];
  const ids = new Set<string>();
  const commands = new Set<string>();
  const paths = new Set<string>();

  if (registry.version !== 1) {
    errors.push({ path: registryPath, code: "AUTO_VERSION", message: "version must be 1" });
  }

  if (!Array.isArray(registry.entries)) {
    errors.push({ path: registryPath, code: "AUTO_ENTRIES", message: "entries must be an array" });
    return errors;
  }

  entries.forEach((entry, index) => {
    const prefix = `entries[${index}]`;
    if (!entry || typeof entry !== "object") {
      errors.push({ path: registryPath, code: "AUTO_ENTRY", message: `${prefix} must be an object` });
      return;
    }

    if (!entry.id) {
      errors.push({ path: registryPath, code: "AUTO_ID", message: `${prefix} is missing id` });
    } else if (ids.has(entry.id)) {
      errors.push({ path: registryPath, code: "AUTO_ID", message: `duplicate id: ${entry.id}` });
    } else {
      ids.add(entry.id);
    }

    if (!automationKinds.has(entry.kind)) {
      errors.push({
        path: registryPath,
        code: "AUTO_KIND",
        message: `${entry.id || prefix} has invalid kind: ${String(entry.kind)}`,
      });
    }

    validateRequiredString(entry, "purpose", registryPath, errors);
    validateRequiredString(entry, "rerun_command", registryPath, errors);
    validateRequiredBoolean(entry, "read_only", registryPath, errors);
    validateRequiredBoolean(entry, "safe_to_run_locally", registryPath, errors);
    validateRequiredBoolean(entry, "emits_json", registryPath, errors);
    validateHumanAnnotation(entry, registryPath, errors);

    if (!Array.isArray(entry.used_by) || entry.used_by.length === 0) {
      errors.push({
        path: registryPath,
        code: "AUTO_USED_BY",
        message: `${entry.id || prefix} must list at least one used_by value`,
      });
    }

    const command = typeof entry.command === "string" ? entry.command : null;
    const entryPath = typeof entry.path === "string" ? entry.path : null;

    if (entry.command !== undefined && !command) {
      errors.push({
        path: registryPath,
        code: "AUTO_COMMAND",
        message: `${entry.id || prefix} command must be a string`,
      });
    }

    if (entry.path !== undefined && !entryPath) {
      errors.push({
        path: registryPath,
        code: "AUTO_PATH",
        message: `${entry.id || prefix} path must be a string`,
      });
    }

    if (!command && !entryPath) {
      errors.push({
        path: registryPath,
        code: "AUTO_TARGET",
        message: `${entry.id || prefix} must define command or path`,
      });
    }

    if (command) commands.add(command);
    if (entryPath) {
      paths.add(entryPath);
      if (!fs.existsSync(path.join(root, entryPath))) {
        errors.push({
          path: registryPath,
          code: "AUTO_PATH",
          message: `${entry.id || prefix} references missing path: ${entryPath}`,
        });
      }
    }
  });

  for (const script of packageScripts(root)) {
    if (!commands.has(`npm run ${script}`)) {
      errors.push({
        path: "package.json",
        code: "AUTO_PACKAGE_SCRIPT",
        message: `automation registry is missing npm script: npm run ${script}`,
      });
    }
  }

  for (const workflow of listedFiles(".github/workflows", root, ".yml", ".yaml")) {
    if (!paths.has(workflow)) {
      errors.push({
        path: workflow,
        code: "AUTO_WORKFLOW",
        message: "automation registry is missing GitHub workflow",
      });
    }
  }

  for (const skill of listedFiles(".claude/skills", root, "SKILL.md")) {
    if (!paths.has(skill)) {
      errors.push({ path: skill, code: "AUTO_SKILL", message: "automation registry is missing skill" });
    }
  }

  for (const operationalAgent of listedFiles("agents/operational", root, "PROMPT.md")) {
    const directory = operationalAgent.replace(/\/PROMPT\.md$/, "");
    if (!paths.has(directory)) {
      errors.push({
        path: directory,
        code: "AUTO_OPERATIONAL_AGENT",
        message: "automation registry is missing operational agent",
      });
    }
  }

  return errors;
}

/**
 * Discover registry entries for automation surfaces that are not yet registered.
 *
 * The returned entries are intentionally incomplete: their `purpose` values
 * contain TODO markers that `validateAutomationRegistry` rejects. This makes
 * the output useful as a scaffold without allowing generated placeholders to
 * become accepted registry annotations.
 *
 * @param {AutomationRegistry} registry - Parsed automation registry.
 * @param {string} [root=repoRoot] - Repository root.
 * @returns {AutomationRegistryDiscovery} Missing registry entry candidates.
 */
export function discoverAutomationRegistryEntries(
  registry: AutomationRegistry,
  root = repoRoot,
): AutomationRegistryDiscovery {
  const entries = registry && Array.isArray(registry.entries) ? registry.entries : [];
  const commands = new Set(
    entries.map((entry) => entry.command).filter((command): command is string => typeof command === "string"),
  );
  const paths = new Set(
    entries.map((entry) => entry.path).filter((entryPath): entryPath is string => typeof entryPath === "string"),
  );
  const missing: AutomationRegistryEntry[] = [];

  for (const script of packageScripts(root)) {
    const command = `npm run ${script}`;
    if (!commands.has(command)) missing.push(discoveredPackageScriptEntry(script, root));
  }

  for (const workflow of listedFiles(".github/workflows", root, ".yml", ".yaml")) {
    if (!paths.has(workflow)) missing.push(discoveredWorkflowEntry(workflow));
  }

  for (const skill of listedFiles(".claude/skills", root, "SKILL.md")) {
    if (!paths.has(skill)) missing.push(discoveredSkillEntry(skill));
  }

  for (const operationalAgent of listedFiles("agents/operational", root, "PROMPT.md")) {
    const directory = operationalAgent.replace(/\/PROMPT\.md$/, "");
    if (!paths.has(directory)) missing.push(discoveredOperationalAgentEntry(directory));
  }

  return { missing };
}

function validateRequiredString(
  entry: AutomationRegistryEntry,
  key: "purpose" | "rerun_command",
  registryPath: string,
  errors: Diagnostic[],
): void {
  if (typeof entry[key] !== "string" || entry[key].trim() === "") {
    errors.push({
      path: registryPath,
      code: "AUTO_FIELD",
      message: `${entry.id || "entry"} must define non-empty ${key}`,
    });
  }
}

function validateRequiredBoolean(
  entry: AutomationRegistryEntry,
  key: "read_only" | "safe_to_run_locally" | "emits_json",
  registryPath: string,
  errors: Diagnostic[],
): void {
  if (typeof entry[key] !== "boolean") {
    errors.push({
      path: registryPath,
      code: "AUTO_FIELD",
      message: `${entry.id || "entry"} must define boolean ${key}`,
    });
  }
}

function validateHumanAnnotation(
  entry: AutomationRegistryEntry,
  registryPath: string,
  errors: Diagnostic[],
): void {
  if (typeof entry.purpose === "string" && /\bTODO\b/i.test(entry.purpose)) {
    errors.push({
      path: registryPath,
      code: "AUTO_ANNOTATION",
      message: `${entry.id || "entry"} purpose must be human-authored before registration`,
    });
  }
}

function packageScripts(root: string): string[] {
  const packageJson = JSON.parse(readText(path.join(root, "package.json"))) as PackageJson;
  if (!packageJson.scripts || typeof packageJson.scripts !== "object" || Array.isArray(packageJson.scripts)) {
    return [];
  }
  return Object.keys(packageJson.scripts).sort();
}

function discoveredPackageScriptEntry(script: string, root: string): AutomationRegistryEntry {
  const scriptCommand = packageScriptCommand(root, script);
  const discoveredPath = scriptPath(scriptCommand);
  return {
    id: discoveredPackageScriptId(script),
    kind: packageScriptKind(script),
    command: `npm run ${script}`,
    ...(discoveredPath ? { path: discoveredPath } : {}),
    purpose: `TODO: describe npm script ${script}.`,
    read_only: !(script === "fix" || script.startsWith("fix:") || script.startsWith("docs:")),
    safe_to_run_locally: true,
    emits_json: script.endsWith(":json"),
    used_by: ["human", "agent"],
    rerun_command: `npm run ${script}`,
  };
}

function discoveredWorkflowEntry(workflow: string): AutomationRegistryEntry {
  const name = path.basename(workflow).replace(/\.(ya?ml)$/i, "");
  return {
    id: `workflow:${name}`,
    kind: "workflow",
    path: workflow,
    purpose: `TODO: describe GitHub workflow ${workflow}.`,
    read_only: workflow !== ".github/workflows/pages.yml",
    safe_to_run_locally: false,
    emits_json: false,
    used_by: ["ci"],
    rerun_command: `gh run list --workflow ${path.basename(workflow)}`,
  };
}

function discoveredSkillEntry(skill: string): AutomationRegistryEntry {
  const name = skill.replace(/^\.claude\/skills\//, "").replace(/\/SKILL\.md$/, "");
  return {
    id: `skill:${name}`,
    kind: "skill",
    path: skill,
    purpose: `TODO: describe agent-facing skill ${name}.`,
    read_only: true,
    safe_to_run_locally: true,
    emits_json: false,
    used_by: ["agent"],
    rerun_command: `open ${skill}`,
  };
}

function discoveredOperationalAgentEntry(directory: string): AutomationRegistryEntry {
  const name = directory.replace(/^agents\/operational\//, "");
  return {
    id: `operational-agent:${name}`,
    kind: "operational-agent",
    path: directory,
    purpose: `TODO: describe operational agent ${name}.`,
    read_only: true,
    safe_to_run_locally: false,
    emits_json: false,
    used_by: ["agent", "human"],
    rerun_command: `open ${directory}/PROMPT.md`,
  };
}

function discoveredPackageScriptId(script: string): string {
  if (script.startsWith("check:")) return script;
  if (script === "fix") return "fix:generated";
  if (script.startsWith("fix:")) return script;
  if (script === "docs:scripts") return script;
  return `script:${script.replace(/:/g, "-")}`;
}

function packageScriptKind(script: string): AutomationKind {
  if (script.startsWith("check:")) return "check";
  if (script === "fix" || script.startsWith("fix:")) return "fix";
  return "script";
}

function packageScriptCommand(root: string, script: string): string {
  const packageJson = JSON.parse(readText(path.join(root, "package.json"))) as PackageJson;
  return packageJson.scripts?.[script] || "";
}

function scriptPath(command: string): string | undefined {
  const match =
    command.match(/\btsx\s+(scripts\/[^\s]+\.ts)\b/) ||
    command.match(/\bnode\s+(scripts\/[^\s]+\.js)\b/);
  return match?.[1];
}

function listedFiles(startDir: string, root: string, ...suffixes: string[]): string[] {
  const absoluteStart = path.join(root, startDir);
  if (!fs.existsSync(absoluteStart)) return [];
  const previousRoot = repoRoot;
  if (root === previousRoot) {
    return walkFiles(startDir, (file) => suffixes.some((suffix) => toPosix(file).endsWith(suffix))).map((file) =>
      toPosix(path.relative(root, file)),
    );
  }
  const results: string[] = [];
  function walk(current: string): void {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.isFile() && suffixes.some((suffix) => toPosix(full).endsWith(suffix))) {
        results.push(toPosix(path.relative(root, full)));
      }
    }
  }
  walk(absoluteStart);
  return results.sort();
}
