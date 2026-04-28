---
feature: version-0-5-plan
area: V05
current_stage: implementation
status: active
last_updated: 2026-04-28
last_agent: planner
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: complete
  tasks.md: complete
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — version-0-5-plan

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- None.

## Hand-off notes

- 2026-04-28 (codex): Planned v0.5 through Stage 6. Recommended implementation order is branch strategy decision, package contract, release notes configuration, release readiness check that consumes v0.4 quality signals, manual GitHub Release workflow with release-candidate mode, package publish path, operator guide, public docs/product page update, dry run, then release readiness verification.

## Open clarifications

- [ ] CLAR-V05-001 — Confirm whether v0.5 should keep Shape A with `release/vX.Y.Z` branches or adopt Shape B with a permanent `develop` branch.
- [ ] CLAR-V05-002 — Confirm the first GitHub Package type, package name, scope, visibility, and contents.
- [ ] CLAR-V05-003 — Confirm whether the first publish should be draft/pre-release only before a stable GitHub Release and package are published.
