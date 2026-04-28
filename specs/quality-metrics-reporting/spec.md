---
id: SPECDOC-QMR-001
title: Quality metrics reporting specification
stage: specification
feature: quality-metrics-reporting
status: accepted
owner: architect
inputs:
  - DESIGN-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# Specification - Quality metrics reporting

### SPEC-QMR-001 - Metrics command

- **Behavior:** Add `npm run quality:metrics` as a read-only command.
- **Satisfies:** REQ-QMR-001, REQ-QMR-002, REQ-QMR-003, NFR-QMR-001

### SPEC-QMR-002 - Metrics model

- **Behavior:** Collect repository summary metrics, per-workflow metrics, and attention signals for blockers, clarifications, and missing required frontmatter.
- **Satisfies:** REQ-QMR-001, REQ-QMR-003, NFR-QMR-002

### SPEC-QMR-003 - Agent skill

- **Behavior:** Add a Claude skill that triggers on quality status/KPI requests and tells agents to run and summarize the metrics command.
- **Satisfies:** REQ-QMR-004, NFR-QMR-002

### SPEC-QMR-004 - Documentation

- **Behavior:** Update quality framework and script documentation, including generated script references.
- **Satisfies:** REQ-QMR-001, REQ-QMR-004, NFR-QMR-001
