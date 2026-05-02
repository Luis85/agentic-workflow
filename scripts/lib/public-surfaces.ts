import fs from "node:fs";
import path from "node:path";
import type { Diagnostic } from "./diagnostics.js";
import { readText, relativeToRoot, repoRoot } from "./repo.js";

export type PublicSurfaceInventory = {
  version: string;
  agents: string[];
  skills: string[];
};

export const PUBLIC_SURFACE_DIAGNOSTIC_CODES = {
  ReadmeVersion: "PUBLIC_README_VERSION",
  SpecoratorVersion: "PUBLIC_SPECORATOR_VERSION",
  ChangelogVersion: "PUBLIC_CHANGELOG_VERSION",
  SiteVersion: "PUBLIC_SITE_VERSION",
  SiteAgents: "PUBLIC_SITE_AGENTS",
  SiteSkills: "PUBLIC_SITE_SKILLS",
} as const;

/**
 * Validate adopter-facing public surfaces against repository source data.
 *
 * @param {string} [root=repoRoot] - Repository root to inspect.
 * @returns {Diagnostic[]} Public-surface drift diagnostics.
 */
export function publicSurfaceDiagnostics(root = repoRoot): Diagnostic[] {
  const inventory = publicSurfaceInventory(root);
  const diagnostics: Diagnostic[] = [];

  const readmePath = path.join(root, "README.md");
  const specoratorPath = path.join(root, "docs", "specorator.md");
  const changelogPath = path.join(root, "CHANGELOG.md");
  const sitePath = path.join(root, "sites", "index.html");

  const readme = readIfExists(readmePath);
  const specorator = readIfExists(specoratorPath);
  const changelog = readIfExists(changelogPath);
  const site = readIfExists(sitePath);

  requireIncludes(
    diagnostics,
    readmePath,
    readme,
    `version-v${inventory.version}-blue`,
    PUBLIC_SURFACE_DIAGNOSTIC_CODES.ReadmeVersion,
    `README version badge must match package.json version v${inventory.version}`,
  );
  requireIncludes(
    diagnostics,
    readmePath,
    readme,
    `**Status:** v${inventory.version}`,
    PUBLIC_SURFACE_DIAGNOSTIC_CODES.ReadmeVersion,
    `README status line must match package.json version v${inventory.version}`,
  );
  requireIncludes(
    diagnostics,
    specoratorPath,
    specorator,
    `**Version:** ${inventory.version}`,
    PUBLIC_SURFACE_DIAGNOSTIC_CODES.SpecoratorVersion,
    `docs/specorator.md version must match package.json version ${inventory.version}`,
  );

  for (const release of ["v0.5.0", "v0.4.0", "v0.3.0"]) {
    requireIncludes(
      diagnostics,
      changelogPath,
      changelog,
      `## [${release}]`,
      PUBLIC_SURFACE_DIAGNOSTIC_CODES.ChangelogVersion,
      `CHANGELOG.md must include curated ${release} section`,
    );
  }

  requireIncludes(
    diagnostics,
    sitePath,
    site,
    `v${inventory.version}`,
    PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteVersion,
    `sites/index.html must show package version v${inventory.version}`,
  );
  requireIncludes(
    diagnostics,
    sitePath,
    site,
    `${inventory.agents.length} agents`,
    PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteAgents,
    `sites/index.html must show current agent count: ${inventory.agents.length} agents`,
  );
  requireIncludes(
    diagnostics,
    sitePath,
    site,
    `${inventory.skills.length} skills`,
    PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteSkills,
    `sites/index.html must show current skill count: ${inventory.skills.length} skills`,
  );

  for (const agent of inventory.agents) {
    requireIncludes(
      diagnostics,
      sitePath,
      site,
      `<code>${agent}</code>`,
      PUBLIC_SURFACE_DIAGNOSTIC_CODES.SiteAgents,
      `sites/index.html roster must list agent: ${agent}`,
    );
  }

  return diagnostics;
}

/**
 * Collect source-of-truth version, agent, and skill inventory.
 *
 * @param {string} [root=repoRoot] - Repository root to inspect.
 * @returns {PublicSurfaceInventory} Public-surface source data.
 */
export function publicSurfaceInventory(root = repoRoot): PublicSurfaceInventory {
  const packageJson = JSON.parse(readText(path.join(root, "package.json"))) as { version?: string };
  return {
    version: String(packageJson.version || ""),
    agents: markdownBasenames(path.join(root, ".claude", "agents")).filter((name) => name !== "README"),
    skills: skillNames(path.join(root, ".claude", "skills")),
  };
}

function markdownBasenames(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""))
    .sort((a, b) => a.localeCompare(b));
}

function skillNames(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(directory, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readIfExists(filePath: string): string {
  return fs.existsSync(filePath) ? readText(filePath) : "";
}

function requireIncludes(
  diagnostics: Diagnostic[],
  filePath: string,
  text: string,
  needle: string,
  code: string,
  message: string,
) {
  if (text.includes(needle)) return;
  diagnostics.push({
    code,
    path: relativeToRoot(filePath),
    message,
  });
}
