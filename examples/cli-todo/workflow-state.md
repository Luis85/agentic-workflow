---
feature: cli-todo
area: CLI
current_stage: idea
status: active
last_updated: 2026-04-27
last_agent: analyst
artifacts:
  idea.md: in-progress
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

# Workflow state — cli-todo

> A worked example of the spec-kit, walked through every stage. Built incrementally so each stage can be reviewed before the next one builds on it.

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | in-progress |
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

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`. Use the bare enum value in frontmatter; document skip reasons in **Skips** below and blockers in **Blocks**.

## Skips

> None yet. The retrospective is never skipped.

## Blocks

> None.

## Hand-off notes

Free-form. What does the next agent / human need to know?

```
2026-04-27 (analyst): Scaffold + draft idea.md created as the first commit
                      of the worked example. Awaiting human acceptance of
                      idea.md before invoking /spec:research.
```

## Open clarifications

> Add and resolve as they come up. Unresolved clarifications block stage transitions.

- [ ] CLAR-001 — Confirm primary readership (template contributors vs. real CLI todo users) — affects how much we lean on didactic clarity vs. product polish.
