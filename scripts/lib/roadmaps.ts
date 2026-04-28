import fs from "node:fs";
import path from "node:path";
import type { Diagnostic } from "./diagnostics.js";
import {
  extractFrontmatter,
  parseSimpleYaml,
  readText,
  relativeToRoot,
  repoRoot,
  walkFiles,
} from "./repo.js";

export const roadmapStatuses = new Set(["active", "paused", "done"]);
export const roadmapScopeTypes = new Set(["product", "project", "program", "mixed"]);
export const roadmapDocumentStatuses = new Set(["pending", "in-progress", "complete"]);
export const roadmapDocuments = [
  ["strategy", "roadmap-strategy.md"],
  ["board", "roadmap-board.md"],
  ["delivery_plan", "delivery-plan.md"],
  ["stakeholders", "stakeholder-map.md"],
  ["communication_log", "communication-log.md"],
  ["decision_log", "decision-log.md"],
] as const;
export const requiredRoadmapStateSections = ["Roadmap", "Documents", "Review history", "Hand-off notes"];

export type RoadmapEvidenceArtifact = {
  path: string;
  exists: boolean;
  kind: string;
  title: string;
  status?: string;
  stage?: string;
  lastUpdated?: string;
  summary: string;
};

export type RoadmapEvidenceReport = {
  roadmap: string;
  strategyPath: string;
  generatedAt: string;
  linkedArtifacts: string[];
  artifacts: RoadmapEvidenceArtifact[];
  warnings: string[];
};

/**
 * Find roadmap state files under `roadmaps/<slug>/`.
 *
 * @returns {string[]} Repository-absolute roadmap state file paths.
 */
export function roadmapStateFiles(): string[] {
  return walkFiles("roadmaps", (filePath) => path.basename(filePath) === "roadmap-state.md");
}

/**
 * Validate every roadmap state file in the repository.
 *
 * The check is intentionally read-only. It only validates roadmap state
 * contracts once a roadmap exists; repositories with no `roadmaps/` directory
 * pass so the track stays opt-in.
 *
 * @returns {Diagnostic[]} Structured validation diagnostics.
 */
export function roadmapStateDiagnostics(): Diagnostic[] {
  return roadmapStateFiles().flatMap((filePath) => validateRoadmapStateFile(filePath));
}

/**
 * Collect linked artifact evidence for a roadmap.
 *
 * The collector reads `roadmaps/<slug>/roadmap-strategy.md`, extracts
 * repository-local artifact links from backticked paths, and summarizes each
 * linked file without modifying it.
 *
 * @param slug - Roadmap folder slug.
 * @returns Evidence report for the roadmap.
 */
export function collectRoadmapEvidence(slug: string): RoadmapEvidenceReport {
  const strategyPath = path.join(repoRoot, "roadmaps", slug, "roadmap-strategy.md");
  const strategyRel = relativeToRoot(strategyPath);
  const warnings: string[] = [];

  if (!fs.existsSync(strategyPath)) {
    return {
      roadmap: slug,
      strategyPath: strategyRel,
      generatedAt: new Date().toISOString(),
      linkedArtifacts: [],
      artifacts: [],
      warnings: [`${strategyRel} is missing`],
    };
  }

  const strategyText = readText(strategyPath);
  const linkedArtifacts = linkedArtifactPathsFromStrategy(strategyText);
  const artifacts = linkedArtifacts.map((artifactPath) => summarizeEvidenceArtifact(artifactPath));
  for (const artifact of artifacts) {
    if (!artifact.exists) warnings.push(`${artifact.path} is linked but missing`);
  }

  return {
    roadmap: slug,
    strategyPath: strategyRel,
    generatedAt: new Date().toISOString(),
    linkedArtifacts,
    artifacts,
    warnings,
  };
}

/**
 * Extract repository-local artifact paths from a roadmap strategy document.
 *
 * @param text - Roadmap strategy Markdown.
 * @returns Unique linked artifact paths.
 */
export function linkedArtifactPathsFromStrategy(text: string): string[] {
  const paths = new Set<string>();
  for (const match of text.matchAll(/`((?:specs|projects|portfolio|discovery|quality)\/[^`]+\.md)`/g)) {
    const safePath = safeRepositoryArtifactPath(match[1]);
    if (safePath) paths.add(safePath);
  }
  return [...paths].sort();
}

/**
 * Summarize one linked roadmap evidence artifact.
 *
 * @param artifactPath - Repository-relative artifact path.
 * @returns Summary for the artifact.
 */
export function summarizeEvidenceArtifact(artifactPath: string): RoadmapEvidenceArtifact {
  const safePath = safeRepositoryArtifactPath(artifactPath);
  if (!safePath) {
    return {
      path: artifactPath,
      exists: false,
      kind: "invalid-artifact",
      title: path.basename(artifactPath),
      summary: "Rejected unsafe linked artifact path.",
    };
  }

  const absolutePath = path.join(repoRoot, safePath);
  if (!fs.existsSync(absolutePath)) {
    return {
      path: safePath,
      exists: false,
      kind: evidenceKind(safePath),
      title: path.basename(safePath),
      summary: "Missing linked artifact.",
    };
  }

  const text = readText(absolutePath);
  const frontmatter = extractFrontmatter(text);
  const data = frontmatter ? parseSimpleYaml(frontmatter.raw) : {};
  const title = firstHeading(text) || String(data.title || path.basename(safePath));
  const kind = evidenceKind(safePath);

  if (safePath.endsWith("workflow-state.md")) {
    const artifacts = data.artifacts && typeof data.artifacts === "object" ? (data.artifacts as Record<string, unknown>) : {};
    const complete = Object.values(artifacts).filter((status) => status === "complete" || status === "skipped").length;
    const total = Object.keys(artifacts).length;
    const stage = String(data.current_stage || "unknown");
    const status = String(data.status || "unknown");
    const lastUpdated = String(data.last_updated || "unknown");
    return {
      path: safePath,
      exists: true,
      kind,
      title,
      status,
      stage,
      lastUpdated,
      summary: `${status} at ${stage}; ${complete}/${total} lifecycle artifacts complete; last updated ${lastUpdated}.`,
    };
  }

  const status = scalarString(data.status);
  const phase = scalarString(data.phase) || scalarString(data.current_phase);
  const lastUpdated = scalarString(data.last_updated) || scalarString(data.date);
  const summaryParts = [
    status ? `status ${status}` : "",
    phase ? `phase ${phase}` : "",
    lastUpdated ? `updated ${lastUpdated}` : "",
  ].filter(Boolean);

  return {
    path: safePath,
    exists: true,
    kind,
    title,
    status,
    stage: phase,
    lastUpdated,
    summary: summaryParts.length > 0 ? `${summaryParts.join("; ")}.` : "Linked artifact exists; no state frontmatter summary available.",
  };
}

/**
 * Render a roadmap evidence report as Markdown.
 *
 * @param report - Evidence report.
 * @returns Markdown report.
 */
export function renderRoadmapEvidence(report: RoadmapEvidenceReport): string {
  const lines = [
    `# Roadmap evidence - ${report.roadmap}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Strategy: \`${report.strategyPath}\``,
    "",
    "## Linked artifacts",
    "",
    "| Path | Kind | Status | Stage / phase | Last updated | Summary |",
    "|---|---|---|---|---|---|",
  ];

  if (report.artifacts.length === 0) {
    lines.push("| _None found_ |  |  |  |  |  |");
  } else {
    for (const artifact of report.artifacts) {
      lines.push(
        [
          artifact.exists ? `\`${artifact.path}\`` : `\`${artifact.path}\` (missing)`,
          artifact.kind,
          artifact.status || "-",
          artifact.stage || "-",
          artifact.lastUpdated || "-",
          artifact.summary,
        ].join(" | ").replace(/^/, "| ").replace(/$/, " |"),
      );
    }
  }

  lines.push("", "## Warnings", "");
  if (report.warnings.length === 0) {
    lines.push("- None.");
  } else {
    lines.push(...report.warnings.map((warning) => `- ${warning}`));
  }

  return `${lines.join("\n")}\n`;
}

/**
 * Validate one roadmap state file.
 *
 * @param {string} filePath - Absolute path to `roadmap-state.md`.
 * @returns {Diagnostic[]} Structured validation diagnostics.
 */
export function validateRoadmapStateFile(filePath: string): Diagnostic[] {
  const rel = relativeToRoot(filePath);
  const roadmapDir = path.basename(path.dirname(filePath));
  const frontmatter = extractFrontmatter(readText(filePath));

  if (!frontmatter) {
    return [diagnostic(rel, "ROADMAP_STATE_FRONTMATTER", "is missing YAML frontmatter")];
  }

  const data = parseSimpleYaml(frontmatter.raw);
  return [
    ...validateRoadmapStateData(rel, roadmapDir, data, path.dirname(filePath)),
    ...validateRoadmapStateSections(rel, frontmatter.body),
  ];
}

/**
 * Validate parsed roadmap state frontmatter.
 *
 * @param {string} rel - Repository-relative state file path.
 * @param {string} roadmapDir - Roadmap folder slug.
 * @param {Record<string, unknown>} data - Parsed frontmatter.
 * @param {string} dirPath - Absolute roadmap directory path.
 * @returns {Diagnostic[]} Structured validation diagnostics.
 */
export function validateRoadmapStateData(
  rel: string,
  roadmapDir: string,
  data: Record<string, unknown>,
  dirPath: string,
): Diagnostic[] {
  const errors: Diagnostic[] = [];

  for (const key of [
    "roadmap",
    "status",
    "scope_type",
    "last_review",
    "next_review",
    "last_updated",
    "last_agent",
    "documents",
  ]) {
    if (isMissingScalar(data[key])) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_KEY", `missing frontmatter key: ${key}`));
    }
  }

  if (data.roadmap !== undefined && data.roadmap !== roadmapDir) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_ID", `roadmap must match its folder name: ${roadmapDir}`));
  }
  if (data.status !== undefined && !roadmapStatuses.has(String(data.status))) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_STATUS", `has unsupported status: ${data.status}`));
  }
  if (data.scope_type !== undefined && !roadmapScopeTypes.has(String(data.scope_type))) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_SCOPE", `has unsupported scope_type: ${data.scope_type}`));
  }
  validateIsoDate(rel, data.last_review, "last_review", errors, { nullable: true });
  validateIsoDate(rel, data.next_review, "next_review", errors, { nullable: true });
  validateIsoDate(rel, data.last_updated, "last_updated", errors, { nullable: false });
  validateDocumentMap(rel, data.documents, dirPath, errors);

  return errors;
}

function validateIsoDate(
  rel: string,
  value: unknown,
  key: string,
  errors: Diagnostic[],
  options: { nullable: boolean },
): void {
  if (value === null && options.nullable) return;
  if (value === undefined || value === "") return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_DATE", `${key} must use YYYY-MM-DD`));
  }
}

function isMissingScalar(value: unknown): boolean {
  return (
    value === undefined ||
    value === "" ||
    (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0)
  );
}

function validateDocumentMap(rel: string, value: unknown, dirPath: string, errors: Diagnostic[]): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENTS", "documents must be a YAML map"));
    return;
  }

  const documents = value as Record<string, unknown>;
  const knownDocuments = new Set<string>(roadmapDocuments.map(([key]) => key));

  for (const [key, fileName] of roadmapDocuments) {
    if (documents[key] === undefined) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENTS", `documents missing ${key}`));
      continue;
    }

    const status = String(documents[key]);
    if (!roadmapDocumentStatuses.has(status)) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENT_STATUS", `document ${key} has unsupported status: ${status}`));
      continue;
    }

    const documentPath = path.join(dirPath, fileName);
    if ((status === "complete" || status === "in-progress") && !fs.existsSync(documentPath)) {
      errors.push(
        diagnostic(rel, "ROADMAP_STATE_DOCUMENT_EXISTS", `marks ${fileName} as ${status}, but it does not exist`),
      );
    }
  }

  for (const key of Object.keys(documents)) {
    if (!knownDocuments.has(key)) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_DOCUMENTS", `documents includes unknown document ${key}`));
    }
  }
}

function validateRoadmapStateSections(rel: string, body: string): Diagnostic[] {
  const errors: Diagnostic[] = [];
  for (const heading of requiredRoadmapStateSections) {
    if (!new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m").test(body)) {
      errors.push(diagnostic(rel, "ROADMAP_STATE_SECTION", `missing section: ${heading}`));
    }
  }
  return errors;
}

function diagnostic(pathName: string, code: string, message: string): Diagnostic {
  return { path: pathName, code, message };
}

function safeRepositoryArtifactPath(artifactPath: string): string | null {
  const normalized = artifactPath.replace(/\\/g, "/");
  if (!/^(specs|projects|portfolio|discovery|quality)\//.test(normalized)) return null;
  if (path.posix.isAbsolute(normalized) || normalized.split("/").includes("..")) return null;
  const absolutePath = path.resolve(repoRoot, ...normalized.split("/"));
  const relative = path.relative(repoRoot, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return normalized;
}

function evidenceKind(artifactPath: string): string {
  if (artifactPath.startsWith("specs/")) return artifactPath.endsWith("workflow-state.md") ? "feature-state" : "feature-artifact";
  if (artifactPath.startsWith("projects/")) return artifactPath.endsWith("project-state.md") ? "project-state" : "project-artifact";
  if (artifactPath.startsWith("portfolio/")) return "portfolio-artifact";
  if (artifactPath.startsWith("discovery/")) return "discovery-artifact";
  if (artifactPath.startsWith("quality/")) return "quality-artifact";
  return "artifact";
}

function firstHeading(text: string): string | undefined {
  const heading = text.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim();
}

function scalarString(value: unknown): string | undefined {
  if (value === undefined || value === null || typeof value === "object") return undefined;
  return String(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
