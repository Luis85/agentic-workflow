---
id: SPECDOC-V03-001
title: Version 0.3 release plan — Specification
stage: specification
feature: version-0-3-plan
status: accepted
owner: architect
inputs:
  - DESIGN-V03-001
created: 2026-04-28
updated: 2026-04-28
---

# Specification — Version 0.3 release plan

### SPEC-V03-001 — Complete lifecycle example

- **Satisfies:** REQ-V03-001, NFR-V03-002
- **Behavior:** The selected example contains canonical lifecycle artifacts for stages 1-11 and a `workflow-state.md` that marks the example done only when all artifacts are complete or validly skipped.
- **Acceptance:** Example artifacts are concise, linked from `examples/README.md`, and ordered for first-time readers.

### SPEC-V03-002 — Artifact state validation

- **Satisfies:** REQ-V03-002, NFR-V03-003
- **Behavior:** Workflow-state validation checks required frontmatter, artifact statuses, current-stage consistency, table consistency, and required body sections for both `specs/` and `examples/`.
- **Acceptance:** The check emits stable file-path diagnostics and fails `npm run verify` on invalid states.

### SPEC-V03-003 — Traceability validation

- **Satisfies:** REQ-V03-003, NFR-V03-001
- **Behavior:** Traceability validation builds an ID registry per workflow area and reports duplicate IDs, mismatched area codes, unknown references, missing required trace fields, and invalid reference kinds.
- **Acceptance:** The check covers requirement, NFR, spec, task, and test IDs in existing workflow artifacts.

### SPEC-V03-004 — Documentation path

- **Satisfies:** REQ-V03-004, REQ-V03-006, NFR-V03-002
- **Behavior:** README and examples documentation explain the v0.3 plan, the complete example, and artifact validation commands. The product page is reviewed when implementation changes user-visible positioning.
- **Acceptance:** Links resolve under `npm run check:links`; product-page impact is either patched or explicitly recorded.

### SPEC-V03-005 — Scope guard

- **Satisfies:** REQ-V03-005
- **Behavior:** v0.3 planning and implementation artifacts identify CI gates, metrics, and maturity model work as v0.4 deferrals.
- **Acceptance:** v0.3 task and release notes separate shipped v0.3 work from deferred v0.4 work.

### SPEC-V03-006 — Validation baseline handoff

- **Satisfies:** REQ-V03-007, NFR-V03-004
- **Behavior:** The v0.3 release readiness artifact records required checks, advisory checks, known false-positive risks, and recommended v0.4 CI promotion candidates.
- **Acceptance:** v0.4 planning can consume the handoff without re-auditing every validator from scratch.

## Test scenarios

| ID | Requirement | Scenario | Expected result |
|---|---|---|---|
| TEST-V03-001 | REQ-V03-001 | Inspect the selected example after implementation. | All canonical lifecycle artifacts are present or validly skipped, with workflow state complete. |
| TEST-V03-002 | REQ-V03-002 | Run validation against a workflow state that marks a missing artifact complete. | Validation fails with a stable diagnostic. |
| TEST-V03-003 | REQ-V03-003 | Run validation against an artifact that references an unknown requirement ID. | Validation fails with a stable diagnostic. |
| TEST-V03-004 | REQ-V03-004 | Run link checks after docs updates. | README and examples links resolve. |
| TEST-V03-005 | REQ-V03-005 | Review v0.3 tasks and release notes. | CI gates, metrics, and maturity model remain deferred. |
| TEST-V03-006 | REQ-V03-007 | Review v0.3 release readiness notes. | Required and advisory validation checks are separated for v0.4 handoff. |
