import test from "node:test";
import assert from "node:assert/strict";
import { collectQualityMetrics, renderQualityMetrics } from "../../scripts/lib/quality-metrics.js";

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
