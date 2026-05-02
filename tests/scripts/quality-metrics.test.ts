import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  assessMaturity,
  compareQualityMetrics,
  collectQualityMetrics,
  completeCanonicalArtifacts,
  expectedArtifactsForStage,
  latestQualityMetricsSnapshot,
  markdownTableCells,
  qualityMetricsSnapshotPath,
  renderQualityMetrics,
  renderQualityTrend,
  renderQualityTrendError,
  rtmLinksFromRow,
  stageTraceabilityCoverage,
  traceabilityExpectation,
} from "../../scripts/lib/quality-metrics.js";

test("quality metrics CLI honors npm_config_feature from npm bare --feature form", () => {
  const output = execFileSync(process.execPath, ["--import", "tsx", "scripts/quality-metrics.ts", "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_feature: "quality-assurance-workflow",
    },
  });
  const metrics = JSON.parse(output);

  assert.equal(metrics.scope, "feature:quality-assurance-workflow");
  assert.equal(metrics.summary.workflowCount, 1);
});

test("collectQualityMetrics reports repository workflow KPIs", () => {
  const metrics = collectQualityMetrics({ feature: "quality-assurance-workflow" });
  assert.equal(metrics.scope, "feature:quality-assurance-workflow");
  assert.equal(metrics.summary.workflowCount, 1);
  assert.equal(metrics.workflows[0].feature, "quality-assurance-workflow");
  assert.equal(metrics.workflows[0].counts.requirements > 0, true);
  assert.equal(metrics.workflows[0].testCoverage > 0, true);
});

test("renderQualityMetrics includes the headline KPIs and attention signals", () => {
  const metrics = collectQualityMetrics({ feature: "quality-assurance-workflow" });
  const report = renderQualityMetrics(metrics);
  assert.match(report, /^# Quality metrics/m);
  assert.match(report, /Overall workflow score/);
  assert.match(report, /Maturity assessment/);
  assert.match(report, /Stage score/);
  assert.match(report, /Workflow deliverables/);
  assert.match(report, /Attention signals/);
});

test("collectQualityMetrics scores active workflows by current stage", () => {
  const metrics = collectQualityMetrics({ feature: "version-0-5-plan" });
  const workflow = metrics.workflows[0];
  assert.equal(workflow.status, "active");
  // v0.5 is past Stage 9 (review.md + traceability.md complete) and currently
  // at Stage 10 (release). Expectations track the live `current_stage` so this
  // test must be updated when the feature advances.
  assert.equal(workflow.currentStage, "release");
  assert.equal(workflow.testCoverageExpected, true);
  assert.equal(workflow.testCoverage > 0, true);
  assert.equal(workflow.earsCoverage, 100);
  assert.equal(workflow.stageScore > workflow.artifactCompletion, true);
});

test("collectQualityMetrics treats done workflows as fully expected", () => {
  const metrics = collectQualityMetrics({ feature: "improve-specorator-tooling" });
  const workflow = metrics.workflows[0];
  assert.equal(workflow.status, "done");
  assert.equal(workflow.testCoverageExpected, true);
  assert.equal(workflow.earsExpected, true);
  // Expected artifacts for a done workflow include every canonical artifact regardless of currentStage.
  assert.equal(workflow.expectedArtifactPresence, 100);
  assert.equal(workflow.expectedArtifactCompletion, 100);
  // A done workflow should not surface itself as an active blocker.
  assert.equal(
    metrics.signals.activeBlockers.some((signal) => signal.includes("improve-specorator-tooling")),
    false,
  );
});

test("collectQualityMetrics counts skipped canonical artifacts as expected-complete", () => {
  const metrics = collectQualityMetrics({ feature: "project-consistency-hardening" });
  const workflow = metrics.workflows[0];
  // project-consistency-hardening intentionally skips idea.md (research-driven entry).
  // Expected stage artifacts at requirements stage = idea + research + requirements.
  // idea is skipped, research is complete, requirements is in-progress.
  // skipped and complete are both counted by completeArtifactsFor; in-progress is not.
  assert.equal(workflow.status, "active");
  assert.equal(workflow.counts.artifactsExpectedForStage, 3);
  assert.equal(workflow.counts.artifactsCompleteForStage, 2);
});

test("collectQualityMetrics surfaces open clarifications in workflow counts and signals", () => {
  const metrics = collectQualityMetrics({ feature: "project-consistency-hardening" });
  const workflow = metrics.workflows[0];
  // Two unresolved CLAR-CONS-* checklist items in workflow-state.md §Open clarifications.
  assert.equal(workflow.openClarifications >= 2, true);
  assert.equal(
    metrics.signals.openClarifications.some((signal) => signal.includes("project-consistency-hardening")),
    true,
  );
});

test("collectQualityMetrics ignores resolved clarification checklist items", () => {
  const metrics = collectQualityMetrics({ feature: "cli-todo" });
  const workflow = metrics.workflows[0];
  assert.equal(workflow.openClarifications, 0);
  assert.equal(
    metrics.signals.openClarifications.some((signal) => signal.includes("cli-todo")),
    false,
  );
});

test("expectedArtifactsForStage and traceabilityExpectation handle the blocked status", () => {
  // A blocked workflow is paused at its current stage — the expected-artifact set
  // and traceability expectation should match the active equivalent for that stage,
  // because blocked status only signals a gate, not progress past it.
  const blockedExpected = expectedArtifactsForStage("specification", "blocked");
  const activeExpected = expectedArtifactsForStage("specification", "active");
  assert.deepEqual(blockedExpected, activeExpected);
  assert.deepEqual(traceabilityExpectation("specification", "blocked"), {
    specs: true,
    tasks: false,
    tests: false,
  });
});

test("expectedArtifactsForStage with status done returns every canonical artifact regardless of currentStage", () => {
  // status=done implies every lifecycle stage was reached, so the full canonical set is expected
  // even if currentStage frozen at an early value.
  const idea = expectedArtifactsForStage("idea", "done");
  const learning = expectedArtifactsForStage("learning", "done");
  assert.deepEqual(idea, learning);
  assert.equal(idea.includes("retrospective.md"), true);
  // traceabilityExpectation echoes the same shape for done.
  assert.deepEqual(traceabilityExpectation("idea", "done"), {
    specs: true,
    tasks: true,
    tests: true,
  });
});

test("completeCanonicalArtifacts ignores non-lifecycle workflow-state keys", () => {
  assert.equal(
    completeCanonicalArtifacts({
      "idea.md": "complete",
      "research.md": "skipped",
      "custom-report.md": "complete",
    }),
    2,
  );
});

test("stage-aware helpers derive expected artifacts and traceability links", () => {
  assert.deepEqual(expectedArtifactsForStage("requirements", "active"), [
    "idea.md",
    "research.md",
    "requirements.md",
  ]);
  assert.deepEqual(traceabilityExpectation("implementation", "active"), {
    specs: true,
    tasks: true,
    tests: false,
  });
  assert.equal(
    stageTraceabilityCoverage({
      requirements: ["REQ-QMR-001"],
      requirementsWithSpec: ["REQ-QMR-001"],
      requirementsWithTasks: ["REQ-QMR-001"],
      requirementsWithTests: [],
      expectation: traceabilityExpectation("implementation", "active"),
    }),
    100,
  );
});

test("assessMaturity reports evidence-backed level and gaps", () => {
  const metrics = collectQualityMetrics({ feature: "quality-metrics-reporting" });
  const assessment = assessMaturity({
    workflows: metrics.workflows,
    missingFrontmatter: [],
    checklistGaps: 0,
    qualityReviews: 0,
  });
  assert.equal(assessment.level, 4);
  assert.equal(assessment.name, "Verified");
  assert.match(assessment.gaps.join("\n"), /No clean QA review evidence/);
});

test("assessMaturity distinguishes unreadable workflow states from missing workflows", () => {
  const assessment = assessMaturity({
    workflows: [],
    workflowStateFiles: ["specs/example/workflow-state.md"],
    unreadableWorkflowStates: ["specs/example/workflow-state.md"],
    missingFrontmatter: [],
    checklistGaps: 0,
    qualityReviews: 0,
  });
  assert.equal(assessment.level, 0);
  assert.match(assessment.evidence.join("\n"), /1 workflow state file/);
  assert.match(assessment.gaps.join("\n"), /could not be read as workflow evidence/);
  assert.match(assessment.nextStep, /Fix workflow-state.md YAML frontmatter/);
});

test("compareQualityMetrics reports trend deltas against a baseline", () => {
  const previous = collectQualityMetrics({ feature: "quality-metrics-reporting" });
  previous.generatedAt = "2026-04-01T00:00:00.000Z";
  previous.summary.overallScore = 80;
  previous.summary.maturity.level = 3;
  previous.signals.openClarifications = ["old clarification"];

  const current = collectQualityMetrics({ feature: "quality-metrics-reporting" });
  current.generatedAt = "2026-04-02T00:00:00.000Z";
  current.summary.overallScore = 90;
  current.summary.maturity.level = 4;
  current.signals.openClarifications = [];

  const trend = compareQualityMetrics(current, previous, "quality/metrics/feature-quality-metrics-reporting/baseline.json");
  assert.equal(trend.deltas.find((delta) => delta.metric === "Overall workflow score")?.delta, 10);
  assert.equal(trend.deltas.find((delta) => delta.metric === "Maturity level")?.delta, 1);
  assert.match(renderQualityTrend(trend), /Quality trend/);
  assert.match(renderQualityTrend(trend), /Overall workflow score changed by \+10.0%/);
});

test("qualityMetricsSnapshotPath uses a filesystem-safe scoped timestamp", () => {
  const metrics = collectQualityMetrics({ feature: "quality-metrics-reporting" });
  metrics.generatedAt = "2026-04-02T03:04:05.678Z";
  assert.match(
    qualityMetricsSnapshotPath(metrics).replace(/\\/g, "/"),
    /quality\/metrics\/feature-quality-metrics-reporting\/2026-04-02T03-04-05-678Z\.json$/,
  );
});

test("latestQualityMetricsSnapshot ignores non-snapshot JSON files", () => {
  const metrics = collectQualityMetrics({ feature: "quality-metrics-reporting" });
  metrics.scope = "feature:trend-filter-test";
  metrics.generatedAt = "2026-04-02T03:04:05.678Z";
  const snapshotPath = qualityMetricsSnapshotPath(metrics);
  const snapshotDirectory = path.dirname(snapshotPath);
  fs.rmSync(snapshotDirectory, { recursive: true, force: true });
  fs.mkdirSync(snapshotDirectory, { recursive: true });

  try {
    fs.writeFileSync(path.join(snapshotDirectory, "zzzz-manual-export.json"), JSON.stringify({ generatedAt: "2099" }));
    fs.writeFileSync(snapshotPath, `${JSON.stringify(metrics)}\n`);

    const snapshot = latestQualityMetricsSnapshot(metrics);
    assert.equal(snapshot?.path.replace(/\\/g, "/").endsWith("2026-04-02T03-04-05-678Z.json"), true);
    assert.equal(snapshot?.metrics?.generatedAt, "2026-04-02T03:04:05.678Z");
  } finally {
    fs.rmSync(snapshotDirectory, { recursive: true, force: true });
  }
});

test("latestQualityMetricsSnapshot reports malformed latest snapshots without throwing", () => {
  const metrics = collectQualityMetrics({ feature: "quality-metrics-reporting" });
  metrics.scope = "feature:trend-malformed-test";
  metrics.generatedAt = "2026-04-02T03:04:05.678Z";
  const snapshotPath = qualityMetricsSnapshotPath(metrics);
  const snapshotDirectory = path.dirname(snapshotPath);
  const malformedPath = path.join(snapshotDirectory, "2026-04-03T03-04-05-678Z.json");
  fs.rmSync(snapshotDirectory, { recursive: true, force: true });
  fs.mkdirSync(snapshotDirectory, { recursive: true });

  try {
    fs.writeFileSync(snapshotPath, `${JSON.stringify(metrics)}\n`);
    fs.writeFileSync(malformedPath, "{");

    const snapshot = latestQualityMetricsSnapshot(metrics);
    assert.equal(snapshot?.path.replace(/\\/g, "/").endsWith("2026-04-03T03-04-05-678Z.json"), true);
    assert.match(snapshot?.error ?? "", /JSON/);
    assert.match(renderQualityTrendError(snapshot!), /could not be read/);
  } finally {
    fs.rmSync(snapshotDirectory, { recursive: true, force: true });
  }
});

test("rtmLinksFromRow preserves blank interior cells", () => {
  assert.deepEqual(markdownTableCells("| REQ-QMR-001 | SPEC-QMR-001 |  | `src/file.ts` | TEST-QMR-001 | pass |"), [
    "REQ-QMR-001",
    "SPEC-QMR-001",
    "",
    "`src/file.ts`",
    "TEST-QMR-001",
    "pass",
  ]);

  assert.deepEqual(rtmLinksFromRow("| REQ-QMR-001 | SPEC-QMR-001 |  | `src/file.ts` | TEST-QMR-001 | pass |"), {
    reqId: "REQ-QMR-001",
    specIds: ["SPEC-QMR-001"],
    taskIds: [],
    testIds: ["TEST-QMR-001"],
  });
});
