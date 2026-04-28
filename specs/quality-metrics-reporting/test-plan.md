---
id: TESTPLAN-QMR-001
title: Quality metrics reporting test plan
stage: testing
feature: quality-metrics-reporting
status: complete
owner: qa
inputs:
  - SPECDOC-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# Test plan - Quality metrics reporting

### TEST-QMR-001 - Collect scoped workflow KPIs

- **Requirement:** REQ-QMR-001, REQ-QMR-002
- **Method:** Unit test `collectQualityMetrics({ feature })` against repository fixtures.

### TEST-QMR-002 - Render human-readable KPI report

- **Requirement:** REQ-QMR-001
- **Method:** Unit test `renderQualityMetrics` for report sections and attention signals.

### TEST-QMR-003 - Verify command and generated references

- **Requirement:** REQ-QMR-003, REQ-QMR-004, NFR-QMR-001, NFR-QMR-002
- **Method:** Run scoped CLI output and `npm run verify`.
