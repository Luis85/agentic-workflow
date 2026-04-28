---
id: TASKS-QMR-001
title: Quality metrics reporting tasks
stage: tasks
feature: quality-metrics-reporting
status: complete
owner: planner
inputs:
  - PRD-QMR-001
  - SPECDOC-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# Tasks - Quality metrics reporting

### T-QMR-001 - Add quality metrics script

- **Description:** Implement the read-only CLI and reusable metrics library.
- **Satisfies:** REQ-QMR-001, REQ-QMR-002, REQ-QMR-003, NFR-QMR-001, SPEC-QMR-001, SPEC-QMR-002
- **Owner:** dev

### T-QMR-002 - Add quality metrics skill

- **Description:** Add the Claude skill and connect it from the existing quality-assurance skill catalog.
- **Satisfies:** REQ-QMR-004, NFR-QMR-002, SPEC-QMR-003
- **Owner:** dev

### T-QMR-003 - Document and generate references

- **Description:** Update quality framework, script docs, generated TypeDoc references, and package scripts.
- **Satisfies:** REQ-QMR-001, REQ-QMR-004, NFR-QMR-001, SPEC-QMR-004
- **Owner:** dev

### T-QMR-004 - Verify quality metrics reporting

- **Description:** Add tests, run the scoped metrics command, and run `npm run verify`.
- **Satisfies:** REQ-QMR-001, REQ-QMR-002, REQ-QMR-003, NFR-QMR-001, SPEC-QMR-001, SPEC-QMR-002
- **Owner:** qa
