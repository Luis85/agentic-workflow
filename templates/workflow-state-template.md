---
feature: <feature-slug>
area: <AREA>            # short uppercase code; used in IDs (REQ-<AREA>-NNN)
current_stage: idea     # idea | research | requirements | design | specification | tasks | implementation | testing | review | release | learning
status: active          # active | blocked | paused | done
last_updated: YYYY-MM-DD
last_agent: <role>
artifacts:              # canonical machine-readable map; the table below is its human view
  idea.md: pending              # pending | in-progress | complete | skipped | blocked
  research.md: pending
  requirements.md: pending
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

# Workflow state — <feature-slug>

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | pending |
| 2. Research | `research.md` | pending |
| 3. Requirements | `requirements.md` | pending |
| 4. Design | `design.md` | pending |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` (with reason) | `blocked` (with blocker)

## Skips

> Document any skipped stages and why. Trivial work may skip stages; retrospective is never skipped.

- e.g., `idea.md: skipped — trivial copy fix`

## Blocks

> Anything blocking progress.

- e.g., `requirements.md blocked — awaiting compliance signoff from <name>`

## Hand-off notes

Free-form. What does the next agent / human need to know? Where did the previous agent stop?

```
2026-04-26 (analyst): Research complete. RECommend Alternative B (event-sourced).
                      PM should treat as starting point; revisit RISK-003 in PRD.
2026-04-27 (pm):     Drafting REQ-* now. Will run /spec:clarify before handoff.
```

## Open clarifications

> Add and resolve as they come up. Unresolved clarifications block stage transitions.

- [ ] CLAR-001 — …
- [x] CLAR-002 — …  *(resolved YYYY-MM-DD: …)*
