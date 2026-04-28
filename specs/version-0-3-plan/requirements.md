---
id: PRD-V03-001
title: Version 0.3 release plan
stage: requirements
feature: version-0-3-plan
status: accepted
owner: pm
inputs:
  - IDEA-V03-001
  - RESEARCH-V03-001
created: 2026-04-28
updated: 2026-04-28
---

# PRD — Version 0.3 release plan

## Summary

Plan v0.3 as an adoption-confidence release: one complete end-to-end example plus deterministic artifact validation that helps contributors catch workflow drift locally.

## Goals

- Make the lifecycle concrete with a complete, readable example.
- Expand validation around workflow artifacts without changing the lifecycle model.
- Keep v0.3 small enough to ship as independent PRs.

## Non-goals

- No CI quality-gate rollout; v0.4 owns CI gates.
- No maturity model or metrics dashboard; v0.4 owns those.
- No new mandatory lifecycle stage.
- No constitution changes.

## Functional requirements (EARS)

### REQ-V03-001 — Complete a worked example

- **Pattern:** ubiquitous
- **Statement:** The template shall include one worked example that demonstrates all 11 lifecycle stages from idea through retrospective.
- **Acceptance:** `examples/cli-todo` or its chosen replacement has every canonical artifact, a complete workflow state, and a reader-oriented example overview.
- **Priority:** must
- **Satisfies:** IDEA-V03-001

### REQ-V03-002 — Validate artifact completeness

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide a deterministic check that validates required artifact presence and workflow-state consistency for specs and examples.
- **Acceptance:** `npm run verify` fails when a workflow state marks an artifact complete or in-progress but the artifact is missing, malformed, or inconsistent with the stage table.
- **Priority:** must
- **Satisfies:** RESEARCH-V03-001

### REQ-V03-003 — Validate traceability coverage

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide deterministic traceability checks that detect unresolved requirement, spec, task, and test references in workflow artifacts.
- **Acceptance:** Checks report stable diagnostics for unknown IDs, wrong area codes, duplicate IDs, and missing required trace fields.
- **Priority:** must
- **Satisfies:** RESEARCH-V03-001

### REQ-V03-004 — Document the v0.3 user path

- **Pattern:** ubiquitous
- **Statement:** The template shall document how readers use the completed example and how contributors run artifact validation.
- **Acceptance:** README, examples documentation, and script documentation point to the example and validation commands.
- **Priority:** must
- **Satisfies:** RESEARCH-V03-001

### REQ-V03-005 — Keep release scope bounded

- **Pattern:** unwanted behavior
- **Statement:** When contributors plan or implement v0.3 work, the template shall keep CI gates, metrics, and maturity model work outside the v0.3 scope.
- **Acceptance:** v0.3 tasks name CI gates, metrics, and maturity model as deferred v0.4 work.
- **Priority:** must
- **Satisfies:** RESEARCH-V03-001

### REQ-V03-006 — Review public positioning

- **Pattern:** event-driven
- **Statement:** When the v0.3 example and artifact validation are implemented, the release shall review the public product page for stale positioning.
- **Acceptance:** The release PR either updates `sites/index.html` or records why the product page is unaffected.
- **Priority:** should
- **Satisfies:** RESEARCH-V03-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-V03-001 | maintainability | Validation code must follow the existing TypeScript script conventions. | Shared logic under `scripts/lib/` when reusable; tests under `tests/scripts/` where behavior is non-trivial. |
| NFR-V03-002 | usability | Example artifacts must stay concise and navigable for first-time readers. | Example overview explains reading order and artifact purpose. |
| NFR-V03-003 | compatibility | v0.3 must not break active incremental specs. | Validators account for pending, in-progress, complete, skipped, blocked, active, paused, done states. |

## Success metrics

- A new reader can follow a complete lifecycle in `examples/` without opening template internals first.
- `npm run verify` catches missing or inconsistent workflow artifacts.
- v0.3 implementation can be split into small PRs without stacked branches.

## Quality gate

- [x] Functional requirements use EARS and stable IDs.
- [x] Acceptance criteria are testable.
- [x] Non-goals and deferred v0.4 scope are explicit.
