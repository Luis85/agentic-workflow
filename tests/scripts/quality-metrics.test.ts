import test from "node:test";
import assert from "node:assert/strict";
import {
  collectQualityMetrics,
  completeCanonicalArtifacts,
  markdownTableCells,
  renderQualityMetrics,
  rtmLinksFromRow,
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
  assert.match(report, /Workflow deliverables/);
  assert.match(report, /Attention signals/);
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
