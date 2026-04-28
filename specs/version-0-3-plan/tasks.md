---
id: TASKS-V03-001
title: Version 0.3 release plan — Tasks
stage: tasks
feature: version-0-3-plan
status: complete
owner: planner
inputs:
  - PRD-V03-001
  - SPECDOC-V03-001
created: 2026-04-28
updated: 2026-04-28
---

# Tasks — Version 0.3 release plan

### T-V03-001 — Complete the CLI todo worked example

- **Description:** Finish `examples/cli-todo` through tasks, implementation log, test plan, test report, review, traceability, release notes, and retrospective.
- **Satisfies:** REQ-V03-001, SPEC-V03-001
- **Owner:** dev
- **Estimate:** M

### T-V03-002 — Add example reading guidance

- **Description:** Update `examples/README.md` and any example-local overview so first-time readers can follow the completed lifecycle in order.
- **Satisfies:** REQ-V03-001, REQ-V03-004, NFR-V03-002, SPEC-V03-001, SPEC-V03-004
- **Depends on:** T-V03-001
- **Owner:** dev
- **Estimate:** S

### T-V03-003 — Harden artifact state validation

- **Description:** Extend or confirm workflow-state checks for required fields, current-stage consistency, complete/in-progress artifact presence, skipped-stage documentation, done-state rules, and examples coverage.
- **Satisfies:** REQ-V03-002, NFR-V03-001, NFR-V03-003, SPEC-V03-002
- **Owner:** dev
- **Estimate:** M

### T-V03-004 — Harden traceability validation

- **Description:** Extend or confirm traceability checks for duplicate IDs, area mismatches, unknown references, invalid reference kinds, missing required trace fields, and test scenario coverage.
- **Satisfies:** REQ-V03-003, NFR-V03-001, NFR-V03-003, SPEC-V03-003
- **Owner:** dev
- **Estimate:** M

### T-V03-005 — Add validator regression tests

- **Description:** Add focused tests for artifact-state and traceability validation edge cases, including pending, skipped, active, done, missing artifact, duplicate ID, and unknown reference cases.
- **Satisfies:** REQ-V03-002, REQ-V03-003, NFR-V03-003, NFR-V03-004, SPEC-V03-002, SPEC-V03-003
- **Depends on:** T-V03-003, T-V03-004
- **Owner:** qa
- **Estimate:** M

### T-V03-006 — Update release documentation

- **Description:** Update README roadmap details, scripts documentation if command behavior changes, examples documentation, and v0.3 release notes when implementation lands.
- **Satisfies:** REQ-V03-004, REQ-V03-005, SPEC-V03-004, SPEC-V03-005
- **Depends on:** T-V03-001, T-V03-003, T-V03-004
- **Owner:** release-manager
- **Estimate:** S

### T-V03-007 — Review product page positioning

- **Description:** Review `sites/index.html` after the example and validation work lands; update it only if v0.3 changes user-visible positioning, onboarding, or CTAs.
- **Satisfies:** REQ-V03-006, SPEC-V03-004
- **Depends on:** T-V03-006
- **Owner:** release-manager
- **Estimate:** S

### T-V03-008 — Verify v0.3 release readiness

- **Description:** Run targeted validator tests, `npm run check:links`, `npm run check:specs`, `npm run check:traceability`, and `npm run verify`; document any skipped checks or deferred v0.4 work.
- **Satisfies:** REQ-V03-002, REQ-V03-003, REQ-V03-005, REQ-V03-007, NFR-V03-004, SPEC-V03-002, SPEC-V03-003, SPEC-V03-005, SPEC-V03-006
- **Depends on:** T-V03-005, T-V03-006, T-V03-007
- **Owner:** qa
- **Estimate:** S

### T-V03-009 — Record v0.4 validation handoff

- **Description:** Add a short handoff note that lists required validators, advisory validators, false-positive risks, and recommended v0.4 CI promotion candidates.
- **Satisfies:** REQ-V03-007, NFR-V03-004, SPEC-V03-006
- **Depends on:** T-V03-008
- **Owner:** release-manager
- **Estimate:** S
