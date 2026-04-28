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
  stageArtifacts,
  traceabilityIdPattern,
  traceabilityItemHeadingPattern,
} from "./workflow-schema.js";

export type QualityMetricOptions = {
  feature?: string;
};

export type MaturityAssessment = {
  level: number;
  name: string;
  summary: string;
  evidence: string[];
  gaps: string[];
  nextStep: string;
};

export type WorkflowMetric = {
  feature: string;
  area: string;
  path: string;
  status: string;
  currentStage: string;
  stageScore: number;
  artifactCompletion: number;
  artifactPresence: number;
  expectedArtifactCompletion: number;
  expectedArtifactPresence: number;
  frontmatterCoverage: number;
  requirementCoverage: number;
  stageTraceabilityCoverage: number;
  testCoverage: number;
  testCoverageExpected: boolean;
  earsCoverage: number;
  earsExpected: boolean;
  openClarifications: number;
  blockers: number;
  counts: {
    artifactsExpected: number;
    artifactsExpectedForStage: number;
    artifactsComplete: number;
    artifactsCompleteForStage: number;
    artifactsPresent: number;
    artifactsPresentForStage: number;
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
    maturity: MaturityAssessment;
  };
  workflows: WorkflowMetric[];
  signals: {
    missingFrontmatter: string[];
    activeBlockers: string[];
    openClarifications: string[];
  };
};

export type WorkflowArtifacts = Record<string, string>;

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
  const workflowStatePaths = workflowStateFiles();
  const scopedWorkflowStatePaths = workflowStatePaths.filter(
    (statePath) => !options.feature || path.basename(path.dirname(statePath)) === options.feature,
  );
  const unreadableWorkflowStates = scopedWorkflowStatePaths
    .filter((statePath) => !extractFrontmatter(readText(statePath)))
    .map(relativeToRoot);
  const workflows = workflowStatePaths
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
  const maturity = assessMaturity({
    workflows,
    workflowStateFiles: scopedWorkflowStatePaths.map(relativeToRoot),
    unreadableWorkflowStates,
    missingFrontmatter,
    checklistGaps,
    qualityReviews: qualityReviewCount(),
  });

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
      overallScore: average(workflows.map((workflow) => workflow.stageScore)),
      maturity,
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
    "## Maturity assessment",
    "",
    `Level ${metrics.summary.maturity.level} - ${metrics.summary.maturity.name}: ${metrics.summary.maturity.summary}`,
    "",
    "### Evidence",
    "",
    ...renderList(metrics.summary.maturity.evidence),
    "",
    "### Gaps",
    "",
    ...renderList(metrics.summary.maturity.gaps),
    "",
    `Next step: ${metrics.summary.maturity.nextStep}`,
    "",
    "## Workflow deliverables",
    "",
    "| Feature | Stage | Status | Stage score | Lifecycle artifacts | Expected artifacts | Frontmatter | Req chain | Test coverage | EARS | Blocks | Clarifications |",
    "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];

  if (metrics.workflows.length === 0) {
    lines.push("| _None found_ |  |  |  |  |  |  |  |  |  |  |  |");
  } else {
    for (const workflow of metrics.workflows) {
      lines.push(
        [
          workflow.feature,
          workflow.currentStage,
          workflow.status,
          formatPercent(workflow.stageScore),
          formatPercent(workflow.artifactCompletion),
          formatPercent(workflow.expectedArtifactCompletion),
          formatPercent(workflow.frontmatterCoverage),
          formatPercent(workflow.requirementCoverage),
          workflow.testCoverageExpected ? formatPercent(workflow.testCoverage) : "not expected yet",
          workflow.earsExpected ? formatPercent(workflow.earsCoverage) : "not expected yet",
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

export type MaturityInput = {
  workflows: WorkflowMetric[];
  workflowStateFiles?: string[];
  unreadableWorkflowStates?: string[];
  missingFrontmatter: string[];
  checklistGaps: number;
  qualityReviews: number;
};

const maturityLevels = [
  {
    level: 0,
    name: "Uninstrumented",
    summary: "No workflow evidence is available yet.",
    nextStep: "Create at least one workflow-state.md through the relevant track.",
  },
  {
    level: 1,
    name: "Documented",
    summary: "Workflow state exists and required metadata is mechanically readable.",
    nextStep: "Keep workflow state current and run the metrics report regularly.",
  },
  {
    level: 2,
    name: "Managed",
    summary: "Active work is stage-aware and current-stage evidence is mostly present.",
    nextStep: "Close blockers and clarifications, then strengthen traceability.",
  },
  {
    level: 3,
    name: "Traceable",
    summary: "Requirements have expected downstream links for the current stages.",
    nextStep: "Drive completed workflows through testing and review evidence.",
  },
  {
    level: 4,
    name: "Verified",
    summary: "Completed workflows include downstream test evidence.",
    nextStep: "Add QA reviews and corrective-action evidence for continual improvement.",
  },
  {
    level: 5,
    name: "Improving",
    summary: "Quality reviews exist and open QA gaps are visible or cleared.",
    nextStep: "Use trend snapshots or periodic reviews to watch quality drift.",
  },
] as const;

/**
 * Assess repository maturity from observable quality-metrics evidence.
 *
 * @param input - Workflow, metadata, and QA evidence.
 * @returns Evidence-backed maturity assessment.
 */
export function assessMaturity(input: MaturityInput): MaturityAssessment {
  const evidence: string[] = [];
  const gaps: string[] = [];
  const workflowStateCount = input.workflowStateFiles?.length ?? input.workflows.length;
  const unreadableWorkflowStates = input.unreadableWorkflowStates ?? [];
  const doneWorkflows = input.workflows.filter((workflow) => workflow.status === "done");
  const averageStageScore = average(input.workflows.map((workflow) => workflow.stageScore));
  const averageTraceability = average(input.workflows.map((workflow) => workflow.requirementCoverage));
  let level = 0;

  if (input.workflows.length === 0) {
    if (workflowStateCount > 0) {
      evidence.push(`${workflowStateCount} workflow state file(s) found.`);
      gaps.push(
        `${unreadableWorkflowStates.length || workflowStateCount} workflow-state.md file(s) could not be read as workflow evidence.`,
      );
      return maturityResult(
        level,
        evidence,
        gaps,
        "Fix workflow-state.md YAML frontmatter so the quality metrics script can read it.",
      );
    }

    gaps.push("No workflow-state.md files were found under specs/ or examples/.");
    return maturityResult(level, evidence, gaps);
  }

  level = 1;
  evidence.push(`${input.workflows.length} workflow state file(s) found.`);
  if (unreadableWorkflowStates.length > 0) {
    gaps.push(`${unreadableWorkflowStates.length} workflow-state.md file(s) could not be read as workflow evidence.`);
  }
  if (input.missingFrontmatter.length === 0) {
    evidence.push("Required Markdown frontmatter is complete.");
  } else {
    gaps.push(`${input.missingFrontmatter.length} required Markdown frontmatter gap(s) remain.`);
  }

  if (unreadableWorkflowStates.length === 0 && input.missingFrontmatter.length === 0 && averageStageScore >= 80) {
    level = 2;
    evidence.push(`Average stage score is ${formatPercent(averageStageScore)}.`);
  } else {
    gaps.push("Average stage score is below 80%, unreadable workflow states exist, or metadata gaps remain.");
  }

  if (level >= 2 && averageTraceability >= 80) {
    level = 3;
    evidence.push(`Average stage-aware requirement chain coverage is ${formatPercent(averageTraceability)}.`);
  } else if (level >= 2) {
    gaps.push("Stage-aware requirement chain coverage is below 80%.");
  }

  if (level >= 3 && doneWorkflows.length > 0 && doneWorkflows.every((workflow) => workflow.testCoverage >= 100)) {
    level = 4;
    evidence.push(`${doneWorkflows.length} completed workflow(s) include downstream test evidence.`);
  } else if (level >= 3) {
    gaps.push("No completed workflow has complete downstream test evidence yet.");
  }

  if (level >= 4 && input.qualityReviews > 0 && input.checklistGaps === 0) {
    level = 5;
    evidence.push(`${input.qualityReviews} quality review(s) found with no open checklist gaps.`);
  } else if (level >= 4) {
    gaps.push("No clean QA review evidence is present under quality/.");
  }

  return maturityResult(level, evidence, gaps);
}

function maturityResult(level: number, evidence: string[], gaps: string[], nextStep?: string): MaturityAssessment {
  const definition = maturityLevels[level];
  return {
    level: definition.level,
    name: definition.name,
    summary: definition.summary,
    evidence,
    gaps: gaps.length === 0 ? ["No maturity gaps detected for this level."] : gaps,
    nextStep: nextStep ?? definition.nextStep,
  };
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
  const currentStage = String(state.current_stage || "unknown");
  const workflowStatus = String(state.status || "unknown");
  const expectedArtifacts = expectedArtifactsForStage(currentStage, workflowStatus);
  const existingArtifacts = artifactNames.filter((artifact) => fs.existsSync(path.join(featureDir, artifact)));
  const existingExpectedArtifacts = expectedArtifacts.filter((artifact) => fs.existsSync(path.join(featureDir, artifact)));
  const artifactsWithFrontmatter = existingArtifacts.filter((artifact) =>
    Boolean(extractFrontmatter(readText(path.join(featureDir, artifact)))),
  );
  const completeArtifacts = completeCanonicalArtifacts(artifacts);
  const completeExpectedArtifacts = completeArtifactsFor(expectedArtifacts, artifacts);
  const registry = collectTraceability(featureDir);
  const requirements = [...registry.reqs];
  const requirementsWithSpec = requirements.filter((id) => (registry.specsByReq.get(id)?.size || 0) > 0);
  const requirementsWithTasks = requirements.filter((id) => (registry.tasksByReq.get(id)?.size || 0) > 0);
  const requirementsWithTests = requirements.filter((id) => (registry.testsByReq.get(id)?.size || 0) > 0);
  const expectation = traceabilityExpectation(currentStage, workflowStatus);
  const requirementCoverage = stageTraceabilityCoverage({
    requirements,
    requirementsWithSpec,
    requirementsWithTasks,
    requirementsWithTests,
    expectation,
  });
  const testCoverageExpected = expectation.tests;
  const earsExpected = stageReached(currentStage, workflowStatus, "requirements");
  const expectedArtifactCompletion = ratio(completeExpectedArtifacts, expectedArtifacts.length);
  const expectedArtifactPresence = ratio(existingExpectedArtifacts.length, expectedArtifacts.length);
  const earsCoverage = collectEarsCoverage(featureDir);
  const scoredSignals = [
    expectedArtifactCompletion,
    expectedArtifactPresence,
    ratio(artifactsWithFrontmatter.length, existingArtifacts.length),
    requirementCoverage,
  ];
  if (earsExpected) scoredSignals.push(earsCoverage);

  return {
    feature,
    area,
    path: relativeToRoot(statePath),
    status: workflowStatus,
    currentStage,
    stageScore: average(scoredSignals),
    artifactCompletion: ratio(completeArtifacts, artifactNames.length),
    artifactPresence: ratio(existingArtifacts.length, artifactNames.length),
    expectedArtifactCompletion,
    expectedArtifactPresence,
    frontmatterCoverage: ratio(artifactsWithFrontmatter.length, existingArtifacts.length),
    requirementCoverage,
    stageTraceabilityCoverage: requirementCoverage,
    testCoverage: ratio(requirementsWithTests.length, requirements.length),
    testCoverageExpected,
    earsCoverage,
    earsExpected,
    openClarifications: sectionItemCount(text, "Open clarifications"),
    blockers: sectionItemCount(text, "Blocks"),
    counts: {
      artifactsExpected: artifactNames.length,
      artifactsExpectedForStage: expectedArtifacts.length,
      artifactsComplete: completeArtifacts,
      artifactsCompleteForStage: completeExpectedArtifacts,
      artifactsPresent: existingArtifacts.length,
      artifactsPresentForStage: existingExpectedArtifacts.length,
      artifactsWithFrontmatter: artifactsWithFrontmatter.length,
      requirements: requirements.length,
      requirementsWithSpec: requirementsWithSpec.length,
      requirementsWithTasks: requirementsWithTasks.length,
      requirementsWithTests: requirementsWithTests.length,
      tests: registry.tests.size,
    },
  };
}

export type TraceabilityExpectation = {
  specs: boolean;
  tasks: boolean;
  tests: boolean;
};

export type TraceabilityCoverageInput = {
  requirements: string[];
  requirementsWithSpec: string[];
  requirementsWithTasks: string[];
  requirementsWithTests: string[];
  expectation: TraceabilityExpectation;
};

/**
 * Return canonical artifacts expected by the current workflow stage.
 *
 * @param currentStage - Workflow state's current stage.
 * @param workflowStatus - Workflow state's status.
 * @returns Canonical artifacts expected at or before the current stage.
 */
export function expectedArtifactsForStage(currentStage: string, workflowStatus: string): string[] {
  if (workflowStatus === "done") return [...canonicalArtifacts];
  const stageIndex = stageIndexOf(currentStage);
  if (stageIndex === -1) return [...canonicalArtifacts];
  return stageArtifacts.slice(0, stageIndex + 1).flatMap(([, artifacts]) => artifacts);
}

/**
 * Count expected artifacts marked complete or skipped.
 *
 * @param expectedArtifacts - Stage-aware artifact names.
 * @param artifacts - Workflow-state artifact status map.
 * @returns Count of expected artifacts marked `complete` or `skipped`.
 */
export function completeArtifactsFor(expectedArtifacts: string[], artifacts: WorkflowArtifacts): number {
  return expectedArtifacts.filter((artifact) => {
    const status = artifacts[artifact];
    return status === "complete" || status === "skipped";
  }).length;
}

/**
 * Decide which traceability links are expected at the current stage.
 *
 * @param currentStage - Workflow state's current stage.
 * @param workflowStatus - Workflow state's status.
 * @returns Expected downstream traceability surfaces.
 */
export function traceabilityExpectation(currentStage: string, workflowStatus: string): TraceabilityExpectation {
  return {
    specs: stageReached(currentStage, workflowStatus, "specification"),
    tasks: stageReached(currentStage, workflowStatus, "tasks"),
    tests: stageReached(currentStage, workflowStatus, "testing"),
  };
}

/**
 * Score only the traceability links expected by the current workflow stage.
 *
 * @param input - Requirement coverage counts and stage expectation flags.
 * @returns Stage-aware traceability coverage percentage.
 */
export function stageTraceabilityCoverage(input: TraceabilityCoverageInput): number {
  const scores: number[] = [];
  if (input.expectation.specs) scores.push(ratio(input.requirementsWithSpec.length, input.requirements.length));
  if (input.expectation.tasks) scores.push(ratio(input.requirementsWithTasks.length, input.requirements.length));
  if (input.expectation.tests) scores.push(ratio(input.requirementsWithTests.length, input.requirements.length));
  return scores.length === 0 ? 100 : average(scores);
}

function stageReached(currentStage: string, workflowStatus: string, targetStage: string): boolean {
  if (workflowStatus === "done") return true;
  const currentIndex = stageIndexOf(currentStage);
  const targetIndex = stageIndexOf(targetStage);
  if (currentIndex === -1 || targetIndex === -1) return false;
  return currentIndex >= targetIndex;
}

function stageIndexOf(stage: string): number {
  return stageArtifacts.findIndex(([stageName]) => stageName === stage);
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
    const links = rtmLinksFromRow(line);
    if (!links) continue;
    registry.reqs.add(links.reqId);
    addLinks(registry.specsByReq, [links.reqId], links.specIds);
    addLinks(registry.tasksByReq, [links.reqId], links.taskIds);
    addLinks(registry.testsByReq, [links.reqId], links.testIds);
  }
}

/**
 * Count completed lifecycle artifacts from canonical artifact names only.
 *
 * @param artifacts - Workflow-state artifact status map.
 * @returns Count of canonical artifacts marked `complete` or `skipped`.
 */
export function completeCanonicalArtifacts(artifacts: WorkflowArtifacts): number {
  return canonicalArtifacts.filter((artifact) => {
    const status = artifacts[artifact];
    return status === "complete" || status === "skipped";
  }).length;
}

/**
 * Parse a Markdown table row while preserving intentionally blank interior cells.
 *
 * @param line - Raw Markdown table row.
 * @returns Trimmed cell values, excluding only the border pipes.
 */
export function markdownTableCells(line: string): string[] {
  const cells = line.split("|");
  if (cells[0]?.trim() === "") cells.shift();
  if (cells[cells.length - 1]?.trim() === "") cells.pop();
  return cells.map((cell) => cell.trim());
}

/**
 * Extract requirement, spec, task, and test links from one RTM table row.
 *
 * @param line - Raw Markdown table row from `traceability.md`.
 * @returns Parsed row links, or null for header/separator/non-RTM rows.
 */
export function rtmLinksFromRow(
  line: string,
): { reqId: string; specIds: string[]; taskIds: string[]; testIds: string[] } | null {
  const cells = markdownTableCells(line);
  if (cells.length < 4 || !/^REQ-|^NFR-/.test(cells[0])) return null;

  const reqId = cells[0];
  const testCell = cells.length >= 5 ? cells[4] : cells[3];
  return {
    reqId,
    specIds: idsIn(cells[1] || "").filter((id) => id.startsWith("SPEC-")),
    taskIds: idsIn(cells[2] || "").filter((id) => id.startsWith("T-")),
    testIds: idsIn(testCell || "").filter((id) => id.startsWith("TEST-")),
  };
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

function renderList(values: string[]): string[] {
  return values.length === 0 ? ["- None."] : values.map((value) => `- ${value}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
