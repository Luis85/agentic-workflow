import fs from "node:fs";
import path from "node:path";
import {
  extractFrontmatter,
  markdownFiles,
  parseSimpleYaml,
  readText,
  relativeToRoot,
  repoRoot,
  walkFiles,
} from "./repo.js";
import {
  canonicalArtifacts,
  traceabilityIdPattern,
  traceabilityItemHeadingPattern,
} from "./workflow-schema.js";

export type QualityMetricOptions = {
  feature?: string;
};

export type WorkflowMetric = {
  feature: string;
  area: string;
  path: string;
  status: string;
  currentStage: string;
  artifactCompletion: number;
  artifactPresence: number;
  frontmatterCoverage: number;
  requirementCoverage: number;
  testCoverage: number;
  earsCoverage: number;
  openClarifications: number;
  blockers: number;
  counts: {
    artifactsExpected: number;
    artifactsComplete: number;
    artifactsPresent: number;
    artifactsWithFrontmatter: number;
    requirements: number;
    requirementsWithSpec: number;
    requirementsWithTasks: number;
    requirementsWithTests: number;
    tests: number;
  };
};

export type QualityMetrics = {
  generatedAt: string;
  root: string;
  scope: string;
  summary: {
    workflowCount: number;
    markdownFiles: number;
    docsWithFrontmatter: number;
    qualityReviews: number;
    checklistItems: number;
    checklistGaps: number;
    overallScore: number;
  };
  workflows: WorkflowMetric[];
  signals: {
    missingFrontmatter: string[];
    activeBlockers: string[];
    openClarifications: string[];
  };
};

type WorkflowArtifacts = Record<string, string>;

type IdRegistry = {
  reqs: Set<string>;
  specsByReq: Map<string, Set<string>>;
  tasksByReq: Map<string, Set<string>>;
  testsByReq: Map<string, Set<string>>;
  tests: Set<string>;
};

const linkFieldPattern = /^-\s+\*\*(Satisfies|Requirement):\*\*\s+(.+)$/gim;
const checklistItemPattern = /^\s*-\s+\[[ xX-]\]\s+QA-[A-Z][A-Z0-9]*-\d{3}\b/gm;
const checklistGapPattern = /^\s*-\s+Status:\s+(gap|nonconformity)\b/gim;

/**
 * Collect deterministic quality KPIs for workflow deliverables and repository
 * documentation.
 *
 * @param options - Optional scope filters.
 * @returns Repository-level and per-workflow quality metrics.
 */
export function collectQualityMetrics(options: QualityMetricOptions = {}): QualityMetrics {
  const workflows = workflowStateFiles()
    .map(readWorkflowMetric)
    .filter((metric): metric is WorkflowMetric => Boolean(metric))
    .filter((metric) => !options.feature || metric.feature === options.feature);

  const docs = markdownFiles();
  const metadataDocs = docs.filter(requiresFrontmatterForMetrics);
  const missingFrontmatter = docs
    .filter(requiresFrontmatterForMetrics)
    .filter((file) => !extractFrontmatter(readText(file)))
    .map(relativeToRoot);

  const qualityFiles = walkFiles("quality", (file) => file.endsWith(".md"));
  const checklistText = qualityFiles.map(readText).join("\n");
  const checklistItems = [...checklistText.matchAll(checklistItemPattern)].length;
  const checklistGaps = [...checklistText.matchAll(checklistGapPattern)].length;

  const activeBlockers = workflows
    .filter((workflow) => workflow.blockers > 0 || workflow.status === "blocked")
    .map((workflow) => `${workflow.feature} (${workflow.path})`);
  const openClarifications = workflows
    .filter((workflow) => workflow.openClarifications > 0)
    .map((workflow) => `${workflow.feature} (${workflow.path})`);

  return {
    generatedAt: new Date().toISOString(),
    root: repoRoot,
    scope: options.feature ? `feature:${options.feature}` : "repository",
    summary: {
      workflowCount: workflows.length,
      markdownFiles: docs.length,
      docsWithFrontmatter: metadataDocs.length - missingFrontmatter.length,
      qualityReviews: qualityReviewCount(),
      checklistItems,
      checklistGaps,
      overallScore: average(
        workflows.flatMap((workflow) => [
          workflow.artifactCompletion,
          workflow.artifactPresence,
          workflow.frontmatterCoverage,
          workflow.requirementCoverage,
          workflow.testCoverage,
          workflow.earsCoverage,
        ]),
      ),
    },
    workflows,
    signals: {
      missingFrontmatter,
      activeBlockers,
      openClarifications,
    },
  };
}

/**
 * Render quality metrics as a compact Markdown report.
 *
 * @param metrics - Metrics returned by {@link collectQualityMetrics}.
 * @returns Markdown report suitable for terminal display or pasting into a status note.
 */
export function renderQualityMetrics(metrics: QualityMetrics): string {
  const lines = [
    `# Quality metrics - ${metrics.scope}`,
    "",
    `Generated: ${metrics.generatedAt}`,
    "",
    "## KPI summary",
    "",
    "| KPI | Value |",
    "|---|---:|",
    `| Overall workflow score | ${formatPercent(metrics.summary.overallScore)} |`,
    `| Workflow states scanned | ${metrics.summary.workflowCount} |`,
    `| Markdown files scanned | ${metrics.summary.markdownFiles} |`,
    `| Markdown files with required frontmatter | ${metrics.summary.docsWithFrontmatter} |`,
    `| Quality reviews found | ${metrics.summary.qualityReviews} |`,
    `| QA checklist items | ${metrics.summary.checklistItems} |`,
    `| QA checklist gaps/nonconformities | ${metrics.summary.checklistGaps} |`,
    "",
    "## Workflow deliverables",
    "",
    "| Feature | Stage | Status | Artifacts | Presence | Frontmatter | Req chain | Test coverage | EARS | Blocks | Clarifications |",
    "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];

  if (metrics.workflows.length === 0) {
    lines.push("| _None found_ |  |  |  |  |  |  |  |  |  |  |");
  } else {
    for (const workflow of metrics.workflows) {
      lines.push(
        [
          workflow.feature,
          workflow.currentStage,
          workflow.status,
          formatPercent(workflow.artifactCompletion),
          formatPercent(workflow.artifactPresence),
          formatPercent(workflow.frontmatterCoverage),
          formatPercent(workflow.requirementCoverage),
          formatPercent(workflow.testCoverage),
          formatPercent(workflow.earsCoverage),
          String(workflow.blockers),
          String(workflow.openClarifications),
        ].join(" | ").replace(/^/, "| ").replace(/$/, " |"),
      );
    }
  }

  lines.push("", "## Attention signals", "");
  lines.push(renderSignal("Active blockers", metrics.signals.activeBlockers));
  lines.push(renderSignal("Open clarifications", metrics.signals.openClarifications));
  lines.push(renderSignal("Markdown missing required frontmatter", metrics.signals.missingFrontmatter.slice(0, 20)));
  if (metrics.signals.missingFrontmatter.length > 20) {
    lines.push(`- ...and ${metrics.signals.missingFrontmatter.length - 20} more.`);
  }

  return `${lines.join("\n")}\n`;
}

function workflowStateFiles(): string[] {
  return [...walkFiles("specs", isWorkflowState), ...walkFiles("examples", isWorkflowState)];
}

function isWorkflowState(filePath: string): boolean {
  return path.basename(filePath) === "workflow-state.md";
}

function readWorkflowMetric(statePath: string): WorkflowMetric | null {
  const text = readText(statePath);
  const frontmatter = extractFrontmatter(text);
  if (!frontmatter) return null;

  const state = parseSimpleYaml(frontmatter.raw);
  const feature = String(state.feature || path.basename(path.dirname(statePath)));
  const area = String(state.area || "");
  const artifacts = (state.artifacts || {}) as WorkflowArtifacts;
  const featureDir = path.dirname(statePath);
  const artifactNames = canonicalArtifacts;
  const existingArtifacts = artifactNames.filter((artifact) => fs.existsSync(path.join(featureDir, artifact)));
  const artifactsWithFrontmatter = existingArtifacts.filter((artifact) =>
    Boolean(extractFrontmatter(readText(path.join(featureDir, artifact)))),
  );
  const completeArtifacts = Object.values(artifacts).filter((status) => status === "complete" || status === "skipped");
  const registry = collectTraceability(featureDir);
  const requirements = [...registry.reqs];
  const requirementsWithSpec = requirements.filter((id) => (registry.specsByReq.get(id)?.size || 0) > 0);
  const requirementsWithTasks = requirements.filter((id) => (registry.tasksByReq.get(id)?.size || 0) > 0);
  const requirementsWithTests = requirements.filter((id) => (registry.testsByReq.get(id)?.size || 0) > 0);

  return {
    feature,
    area,
    path: relativeToRoot(statePath),
    status: String(state.status || "unknown"),
    currentStage: String(state.current_stage || "unknown"),
    artifactCompletion: ratio(completeArtifacts.length, artifactNames.length),
    artifactPresence: ratio(existingArtifacts.length, artifactNames.length),
    frontmatterCoverage: ratio(artifactsWithFrontmatter.length, existingArtifacts.length),
    requirementCoverage: average([
      ratio(requirementsWithSpec.length, requirements.length),
      ratio(requirementsWithTasks.length, requirements.length),
      ratio(requirementsWithTests.length, requirements.length),
    ]),
    testCoverage: ratio(requirementsWithTests.length, requirements.length),
    earsCoverage: collectEarsCoverage(featureDir),
    openClarifications: sectionItemCount(text, "Open clarifications"),
    blockers: sectionItemCount(text, "Blocks"),
    counts: {
      artifactsExpected: artifactNames.length,
      artifactsComplete: completeArtifacts.length,
      artifactsPresent: existingArtifacts.length,
      artifactsWithFrontmatter: artifactsWithFrontmatter.length,
      requirements: requirements.length,
      requirementsWithSpec: requirementsWithSpec.length,
      requirementsWithTasks: requirementsWithTasks.length,
      requirementsWithTests: requirementsWithTests.length,
      tests: registry.tests.size,
    },
  };
}

function collectTraceability(featureDir: string): IdRegistry {
  const registry: IdRegistry = {
    reqs: new Set(),
    specsByReq: new Map(),
    tasksByReq: new Map(),
    testsByReq: new Map(),
    tests: new Set(),
  };

  for (const artifact of canonicalArtifacts) {
    const filePath = path.join(featureDir, artifact);
    if (!fs.existsSync(filePath)) continue;
    const text = readText(filePath);
    collectRequirementIds(text, registry);
    collectTestIds(text, registry);
    collectTraceLinks(text, registry);
    collectRtmLinks(artifact, text, registry);
  }

  return registry;
}

function collectRequirementIds(text: string, registry: IdRegistry): void {
  for (const match of text.matchAll(traceabilityItemHeadingPattern)) {
    const id = match[2];
    const kind = match[3];
    if (kind === "REQ" || kind === "NFR") registry.reqs.add(id);
  }
  for (const match of text.matchAll(traceabilityIdPattern)) {
    const id = match[0];
    if (id.startsWith("NFR-")) registry.reqs.add(id);
  }
}

function collectTestIds(text: string, registry: IdRegistry): void {
  for (const match of text.matchAll(traceabilityIdPattern)) {
    const id = match[0];
    if (id.startsWith("TEST-")) registry.tests.add(id);
  }
}

function collectTraceLinks(text: string, registry: IdRegistry): void {
  const sections = [...text.matchAll(traceabilityItemHeadingPattern)];
  for (let index = 0; index < sections.length; index += 1) {
    const match = sections[index];
    const next = sections[index + 1];
    const id = match[2];
    const kind = match[3];
    const body = text.slice(match.index, next?.index ?? text.length);
    const fields = [...body.matchAll(linkFieldPattern)];
    for (const [, field, value] of fields) {
      const reqIds = idsIn(value).filter((valueId) => registry.reqs.has(valueId));
      if (kind === "SPEC" && field === "Satisfies") addLinks(registry.specsByReq, reqIds, id);
      if (kind === "T" && field === "Satisfies") addLinks(registry.tasksByReq, reqIds, id);
      if (kind === "TEST" && field === "Requirement") addLinks(registry.testsByReq, reqIds, id);
    }
  }
}

function collectRtmLinks(artifact: string, text: string, registry: IdRegistry): void {
  if (artifact !== "traceability.md") return;
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
    if (cells.length < 4 || !/^REQ-|^NFR-/.test(cells[0])) continue;
    const reqId = cells[0];
    registry.reqs.add(reqId);
    addLinks(registry.specsByReq, [reqId], idsIn(cells[1]).filter((id) => id.startsWith("SPEC-")));
    addLinks(registry.tasksByReq, [reqId], idsIn(cells[2]).filter((id) => id.startsWith("T-")));
    addLinks(registry.testsByReq, [reqId], idsIn(cells[3]).filter((id) => id.startsWith("TEST-")));
  }
}

function collectEarsCoverage(featureDir: string): number {
  const requirementsPath = path.join(featureDir, "requirements.md");
  if (!fs.existsSync(requirementsPath)) return 0;
  const text = readText(requirementsPath);
  const sections = [...text.matchAll(traceabilityItemHeadingPattern)].filter((match) => match[3] === "REQ");
  if (sections.length === 0) return 0;
  const earsSections = sections.filter((match, index) => {
    const next = sections[index + 1];
    const body = text.slice(match.index, next?.index ?? text.length);
    return /\*\*Pattern:\*\*/i.test(body) || /\b(when|while|where|if|then|shall)\b/i.test(body);
  });
  return ratio(earsSections.length, sections.length);
}

function sectionItemCount(text: string, heading: string): number {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|$(?![\\s\\S]))`, "im");
  const match = text.match(pattern);
  if (!match) return 0;
  return match[1]
    .split(/\r?\n/)
    .filter((line) => /^-\s+/.test(line.trim()))
    .filter((line) => !/^-\s+None\.?$/i.test(line.trim()))
    .length;
}

function qualityReviewCount(): number {
  return walkFiles("quality", (file) => path.basename(file) === "quality-state.md").length;
}

function requiresFrontmatterForMetrics(filePath: string): boolean {
  const rel = relativeToRoot(filePath);
  const basename = path.basename(rel);
  if (basename.toLowerCase() === "readme.md" && rel !== "README.md") return true;
  if (/^docs\/adr\/0\d{3}-.+\.md$/.test(rel)) return true;
  if (rel.endsWith("workflow-state.md")) return true;
  if (/(^|\/)(discovery-state|stock-taking-state|scaffolding-state|project-state|portfolio-state|deal-state)\.md$/.test(rel)) {
    return true;
  }
  return rel.startsWith("docs/daily-reviews/") && basename !== "README.md";
}

function idsIn(value: string): string[] {
  return [...value.matchAll(traceabilityIdPattern)].map((match) => match[0]);
}

function addLinks(map: Map<string, Set<string>>, keys: string[], values: string | string[]): void {
  const valueList = Array.isArray(values) ? values : [values];
  for (const key of keys) {
    const links = map.get(key) || new Set<string>();
    for (const value of valueList) links.add(value);
    map.set(key, links);
  }
}

function ratio(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function average(values: number[]): number {
  const scored = values.filter((value) => Number.isFinite(value));
  if (scored.length === 0) return 0;
  return Math.round((scored.reduce((sum, value) => sum + value, 0) / scored.length) * 10) / 10;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function renderSignal(label: string, values: string[]): string {
  if (values.length === 0) return `### ${label}\n\n- None.\n`;
  return `### ${label}\n\n${values.map((value) => `- ${value}`).join("\n")}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
