import test from "node:test";
import assert from "node:assert/strict";
import {
  assessMaturity,
  compareQualityMetrics,
  collectQualityMetrics,
  completeCanonicalArtifacts,
  expectedArtifactsForStage,
  markdownTableCells,
  qualityMetricsSnapshotPath,
  renderQualityMetrics,
  renderQualityTrend,
  rtmLinksFromRow,
  stageTraceabilityCoverage,
  traceabilityExpectation,
} from "../../scripts/lib/quality-metrics.js";

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
  const metrics = collectQualityMetrics({ feature: "version-0-4-plan" });
  const workflow = metrics.workflows[0];
  assert.equal(workflow.currentStage, "implementation");
  assert.equal(workflow.testCoverageExpected, false);
  assert.equal(workflow.testCoverage, 0);
  assert.equal(workflow.requirementCoverage, 100);
  assert.equal(workflow.stageScore > workflow.artifactCompletion, true);
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
