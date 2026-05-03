---
feature: project-consistency-hardening
area: CONS
current_stage: requirements
status: active
last_updated: 2026-05-02
last_agent: codex
artifacts:
  idea.md: skipped
  research.md: complete
  requirements.md: in-progress
  design.md: pending
  spec.md: pending
  tasks.md: pending
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — project-consistency-hardening

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | skipped |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | in-progress |
| 4. Design | `design.md` | pending |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- `idea.md` — request entered directly as a cross-cutting quality and consistency review from maintainer direction.

## Blocks

- None.

## Hand-off notes

```text
2026-05-01 (pm): Baseline review executed with `npm run verify` and `npm run self-check`.
                 Requirements draft tracks consistency hardening follow-ups.
2026-05-02 (Decider): CLAR-CONS-001 and CLAR-CONS-002 resolved in the cross-plan
                       clarification slate. Historical completed workflows without
                       captured test evidence are template-era exceptions, not targets
                       for invented backfill. Going forward, completed workflows need
                       explicit test-report evidence or an approved exception marker.
                       Active release-blocking clarification debt takes priority over
                       new release feature work; after this slate, resume v0.6
                       unblockers, then v0.7.1/Zod, then v0.8/v0.9 implementation.
```

## Open clarifications

- [x] CLAR-CONS-001 — Historical completed workflows without captured test evidence are intentionally marked as template-era exceptions; do not invent backfilled evidence. New completed workflows require machine-checkable test-report evidence or an approved exception marker.
- [x] CLAR-CONS-002 — Active release-blocking clarification debt takes priority over new release feature work. After this slate, sequence work as v0.6 unblockers, then v0.7.1/Zod, then v0.8/v0.9 implementation.
