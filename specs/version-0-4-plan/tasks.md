---
id: TASKS-V04-001
title: Version 0.4 release plan — Tasks
stage: tasks
feature: version-0-4-plan
status: complete
owner: planner
inputs:
  - PRD-V04-001
  - SPECDOC-V04-001
created: 2026-04-28
updated: 2026-04-28
---

# Tasks — Version 0.4 release plan

### T-V04-001 — Confirm v0.3 validation baseline

- **Description:** Review the completed v0.3 example and validation work; document which checks are stable enough to become CI gates.
- **Satisfies:** REQ-V04-001, REQ-V04-002, REQ-V04-008, SPEC-V04-001, SPEC-V04-007
- **Owner:** planner
- **Estimate:** S

### T-V04-002 — Define CI gate contract

- **Description:** Decide required versus advisory PR checks and document the local reproduction commands.
- **Satisfies:** REQ-V04-001, REQ-V04-002, REQ-V04-008, NFR-V04-001, SPEC-V04-001, SPEC-V04-002, SPEC-V04-007
- **Depends on:** T-V04-001
- **Owner:** architect
- **Estimate:** S

### T-V04-003 — Implement PR CI quality gate

- **Description:** Add or update GitHub Actions workflow files so pull requests run the documented deterministic gate.
- **Satisfies:** REQ-V04-001, REQ-V04-002, NFR-V04-001, SPEC-V04-001
- **Depends on:** T-V04-002
- **Owner:** dev
- **Estimate:** M

### T-V04-004 — Extend CI readiness checks

- **Description:** Update `doctor` or related workflow-readiness checks to validate the CI gate contract.
- **Satisfies:** REQ-V04-001, REQ-V04-002, NFR-V04-002, SPEC-V04-002
- **Depends on:** T-V04-003
- **Owner:** dev
- **Estimate:** M

### T-V04-005 — Add workflow metrics report

- **Description:** Add a deterministic local metrics report for workflow health, with human-readable output and JSON output if useful.
- **Satisfies:** REQ-V04-003, REQ-V04-004, REQ-V04-009, NFR-V04-002, NFR-V04-003, NFR-V04-005, SPEC-V04-003, SPEC-V04-008
- **Depends on:** T-V04-001
- **Owner:** dev
- **Estimate:** M

### T-V04-006 — Test CI readiness and metrics behavior

- **Description:** Add focused tests for CI readiness checks and metrics generation, including active, blocked, done, skipped, and open-clarification states.
- **Satisfies:** REQ-V04-001, REQ-V04-003, REQ-V04-004, REQ-V04-008, REQ-V04-009, NFR-V04-001, NFR-V04-002, NFR-V04-005, SPEC-V04-002, SPEC-V04-003, SPEC-V04-007, SPEC-V04-008
- **Depends on:** T-V04-004, T-V04-005
- **Owner:** qa
- **Estimate:** M

### T-V04-007 — Document metrics interpretation

- **Description:** Add documentation for each metric, including what decision it supports and what it must not be used to infer.
- **Satisfies:** REQ-V04-004, NFR-V04-003, SPEC-V04-004
- **Depends on:** T-V04-005
- **Owner:** release-manager
- **Estimate:** S

### T-V04-008 — Add maturity model documentation

- **Description:** Add a lightweight maturity model with levels, entry criteria, evidence examples, and next-step guidance.
- **Satisfies:** REQ-V04-005, REQ-V04-006, NFR-V04-004, SPEC-V04-005
- **Owner:** pm
- **Estimate:** M

### T-V04-009 — Update public release documentation

- **Description:** Update README, `docs/specorator.md`, workflow docs, and release notes when v0.4 implementation lands.
- **Satisfies:** REQ-V04-007, SPEC-V04-006
- **Depends on:** T-V04-003, T-V04-005, T-V04-008
- **Owner:** release-manager
- **Estimate:** S

### T-V04-010 — Review product page positioning

- **Description:** Review `sites/index.html` after CI gates, metrics, and maturity model are implemented; update it only if public positioning, onboarding, or CTAs are stale.
- **Satisfies:** REQ-V04-007, SPEC-V04-006
- **Depends on:** T-V04-009
- **Owner:** release-manager
- **Estimate:** S

### T-V04-011 — Verify v0.4 release readiness

- **Description:** Run targeted tests, CI-readiness checks, metrics checks, link checks, and `npm run verify`; document skipped checks and any deferred scheduled automation.
- **Satisfies:** REQ-V04-001, REQ-V04-002, REQ-V04-003, REQ-V04-007, REQ-V04-008, REQ-V04-009, NFR-V04-005, SPEC-V04-001, SPEC-V04-002, SPEC-V04-003, SPEC-V04-006, SPEC-V04-007, SPEC-V04-008
- **Depends on:** T-V04-006, T-V04-007, T-V04-008, T-V04-010
- **Owner:** qa
- **Estimate:** S

### T-V04-012 — Record v0.5 release-quality handoff

- **Description:** Document the machine-readable quality signals v0.5 should consume before GitHub Release or Package publication.
- **Satisfies:** REQ-V04-009, NFR-V04-005, SPEC-V04-008
- **Depends on:** T-V04-011
- **Owner:** release-manager
- **Estimate:** S
