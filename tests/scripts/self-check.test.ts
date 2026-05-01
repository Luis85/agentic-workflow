import test from "node:test";
import assert from "node:assert/strict";
import { collectSelfCheckReport, renderSelfCheckReport } from "../../scripts/lib/self-check.js";

test("self-check reports pass with deterministic gate, metrics, and learning signals", () => {
  const report = collectSelfCheckReport({
    feature: "quality-metrics-reporting",
    runner: () => ({
      status: 0,
      stdout: [
        "> agentic-workflow@0.2.0 verify:json",
        "> tsx scripts/verify-json.ts",
        JSON.stringify({
          check: "verify",
          status: "pass",
          results: [{ check: "check:example", status: "pass", errors: [], rerun: "npm run check:example" }],
        }),
      ].join("\n"),
      stderr: "",
    }),
  });

  assert.equal(report.tools[0].status, "pass");
  assert.equal(report.metrics.scope, "feature:quality-metrics-reporting");
  assert.equal(report.learning.adrCount > 0, true);
  assert.match(report.summary, /Deterministic gate: pass/);
});

test("self-check fails when verify json reports failures", () => {
  const report = collectSelfCheckReport({
    feature: "quality-metrics-reporting",
    runner: () => ({
      status: 1,
      stdout: JSON.stringify({
        check: "verify",
        status: "fail",
        results: [
          {
            check: "check:links",
            status: "fail",
            errors: [{ path: "docs/example.md", line: 7, code: "LINK_FILE", message: "missing file" }],
            rerun: "npm run check:links",
          },
        ],
      }),
      stderr: "",
    }),
  });

  assert.equal(report.status, "fail");
  assert.equal(report.tools[0].diagnostics[0].rerun, "npm run check:links");
  assert.match(renderSelfCheckReport(report), /docs\/example\.md:7 \[LINK_FILE\] missing file/);
});

test("self-check fails with a stable diagnostic when verify json is malformed", () => {
  const report = collectSelfCheckReport({
    feature: "quality-metrics-reporting",
    runner: () => ({
      status: 1,
      stdout: "not json",
      stderr: "boom",
    }),
  });

  assert.equal(report.status, "fail");
  assert.equal(report.tools[0].diagnostics[0].code, "SELF_VERIFY_JSON");
  assert.equal(report.tools[0].diagnostics[0].rerun, "npm run verify:json");
});
