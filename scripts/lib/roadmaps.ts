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

export type RoadmapDigestSection = {
  title: string;
  sourcePath: string;
  content: string;
};

export type RoadmapDigestReport = {
  roadmap: string;
  audience: string;
  generatedAt: string;
  subject: string;
  emphasis: string[];
  sources: string[];
  sections: RoadmapDigestSection[];
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
 * Generate an audience-specific roadmap communication digest.
 *
 * The digest is read-only. It summarizes selected roadmap artifacts into a
 * draft update that a human can review before copying into `communication-log.md`.
 *
 * @param slug - Roadmap folder slug.
 * @param audience - Intended audience, such as `leadership` or `delivery-team`.
 * @returns Digest report for the roadmap and audience.
 */
export function collectRoadmapDigest(slug: string, audience: string): RoadmapDigestReport {
  const generatedAt = new Date().toISOString();
  const audienceKey = normalizeAudience(audience);
  const profile = roadmapAudienceProfile(audienceKey);
  const documents = [
    roadmapDocument(slug, "roadmap-strategy.md"),
    roadmapDocument(slug, "roadmap-board.md"),
    roadmapDocument(slug, "delivery-plan.md"),
    roadmapDocument(slug, "stakeholder-map.md"),
  ];
  const warnings = documents
    .filter((document) => !document.exists)
    .map((document) => `${document.relativePath} is missing`);
  const existingDocuments = documents.filter((document) => document.exists);
  const sourcePaths = existingDocuments.map((document) => document.relativePath);
  const sections = existingDocuments.flatMap((document) => digestSectionsForDocument(document, audienceKey));

  if (sections.length === 0) {
    warnings.push("No digest-ready roadmap sections were found.");
  }

  return {
    roadmap: slug,
    audience: audienceKey,
    generatedAt,
    subject: `Roadmap update for ${slug}`,
    emphasis: profile.emphasis,
    sources: sourcePaths,
    sections,
    warnings,
  };
}

/**
 * Render a roadmap communication digest as Markdown.
 *
 * @param report - Digest report.
 * @returns Markdown digest draft.
 */
export function renderRoadmapDigest(report: RoadmapDigestReport): string {
  const lines = [
    `# Roadmap digest - ${report.roadmap}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Audience: ${report.audience}`,
    `Subject: ${report.subject}`,
    "",
    "## Audience emphasis",
    "",
    ...report.emphasis.map((item) => `- ${item}`),
    "",
    "## Draft update",
    "",
    `Subject: ${report.subject}`,
    "",
  ];

  if (report.sections.length === 0) {
    lines.push("_No roadmap content available for this audience yet._");
  } else {
    for (const section of report.sections) {
      lines.push(`### ${section.title}`, "", section.content, "", `Source: \`${section.sourcePath}\``, "");
    }
  }

  lines.push("## Source artifacts", "");
  if (report.sources.length === 0) {
    lines.push("- None found.");
  } else {
    lines.push(...report.sources.map((source) => `- \`${source}\``));
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

type RoadmapDigestDocument = {
  relativePath: string;
  exists: boolean;
  text: string;
};

function roadmapDocument(slug: string, fileName: string): RoadmapDigestDocument {
  const filePath = path.join(repoRoot, "roadmaps", slug, fileName);
  const relativePath = relativeToRoot(filePath);
  if (!fs.existsSync(filePath)) return { relativePath, exists: false, text: "" };
  return { relativePath, exists: true, text: readText(filePath) };
}

function digestSectionsForDocument(document: RoadmapDigestDocument, audience: string): RoadmapDigestSection[] {
  const fileName = path.basename(document.relativePath);
  if (fileName === "roadmap-strategy.md") {
    return compactSections(document, [
      ["Why this roadmap matters", ["Purpose", "Goals", "Outcomes", "Business outcomes"]],
      ["Audience and constraints", ["Audiences", "Stakeholders", "Constraints", "Non-goals"]],
    ]);
  }
  if (fileName === "roadmap-board.md") {
    return compactSections(document, [
      ["Now", ["Now"]],
      ["Next", ["Next"]],
      ["Later", ["Later"]],
      ["What changed", ["Change Summary", "Change summary", "Changes"]],
    ]);
  }
  if (fileName === "delivery-plan.md") {
    return compactSections(document, [
      ["Delivery confidence", ["Confidence", "Milestones", "Target windows", "Capacity assumptions"]],
      ["Dependencies and risks", ["Dependencies", "Risks", "Risk register", "Escalation path"]],
    ]);
  }
  if (fileName === "stakeholder-map.md") {
    return compactSections(document, [
      ["Stakeholder notes", [audience, titleCase(audience), "Stakeholders", "Decision owners", "Alignment risks"]],
      ["Communication guidance", ["Communication", "Team communication", "Cadence", "Approval notes"]],
    ]);
  }
  return [];
}

function compactSections(
  document: RoadmapDigestDocument,
  candidates: Array<[string, string[]]>,
): RoadmapDigestSection[] {
  const sections: RoadmapDigestSection[] = [];
  for (const [title, headings] of candidates) {
    const content = firstSectionSnippet(document.text, headings);
    if (!content) continue;
    sections.push({ title, sourcePath: document.relativePath, content });
  }
  return sections;
}

function firstSectionSnippet(text: string, headings: string[]): string | null {
  const body = stripFrontmatter(text);
  for (const heading of headings) {
    const section = markdownSection(body, heading);
    if (section) return section;
  }
  return null;
}

function markdownSection(text: string, heading: string): string | null {
  const pattern = new RegExp(`^#{2,4}\\s+${escapeRegExp(heading)}\\s*$`, "im");
  const match = pattern.exec(text);
  if (!match || match.index === undefined) return null;
  const afterHeading = text.slice(match.index + match[0].length);
  const nextHeading = afterHeading.search(/\n#{1,4}\s+/);
  const raw = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() && !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim()));
  if (lines.length === 0) return null;
  return lines.slice(0, 12).join("\n");
}

function stripFrontmatter(text: string): string {
  return extractFrontmatter(text)?.body || text;
}

function normalizeAudience(audience: string): string {
  return audience.trim().toLowerCase().replace(/[_\s]+/g, "-") || "general";
}

function roadmapAudienceProfile(audience: string): { emphasis: string[] } {
  const profiles: Record<string, string[]> = {
    leadership: ["outcomes", "trade-offs", "risk", "investment", "decisions needed"],
    "delivery-team": ["priority", "sequence", "scope boundaries", "dependencies", "open questions"],
    team: ["priority", "sequence", "scope boundaries", "dependencies", "open questions"],
    customers: ["approved direction", "value", "caveats", "externally safe commitments"],
    clients: ["approved direction", "value", "caveats", "externally safe commitments"],
    "sales-support": ["what can be said", "what must not be promised", "escalation path"],
    sales: ["what can be said", "what must not be promised", "escalation path"],
    support: ["what can be said", "what must not be promised", "escalation path"],
  };
  return { emphasis: profiles[audience] || ["what changed", "why it changed", "confidence", "decisions needed"] };
}

function titleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
