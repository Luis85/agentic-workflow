---
feature: cli-todo
area: CLI
current_stage: research
status: active
last_updated: 2026-04-27
last_agent: analyst
artifacts:
  idea.md: complete
  research.md: in-progress
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
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | in-progress |
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

```
2026-04-27 (analyst): research.md (RESEARCH-CLI-001) drafted and quality gate
                      passed. Recommended stack: Go + JSON file + XDG data dir
                      (~/.local/share/todo/tasks.json) + $TODO_FILE env-var
                      override + go install distribution.

                      v1 scope floor: five commands — add, list, done, rm,
                      help. No due dates, priorities, tags, or search.

                      Two items deferred to pm:
                      (1) Confirm that five commands yield ≥ 7 functional
                          requirements; if not, add `todo list --all` to show
                          completed tasks.
                      (2) Decide whether Windows is explicitly in scope or
                          documented as a gap (affects CI matrix and XDG
                          path-handling test coverage).

                      pm should now produce requirements.md, starting from
                      the five commands, the atomic-write constraint, the
                      XDG data-file location, and the cross-platform install
                      requirement.
```

## Open clarifications

> Add and resolve as they come up. Unresolved clarifications block stage transitions.

- [x] CLAR-001 — Confirm primary readership (template contributors vs. real CLI todo users) — affects how much we lean on didactic clarity vs. product polish.

  **Resolved 2026-04-27 (analyst):** Research confirms both audiences are real and compatible. The primary user (solo terminal engineer) drives the functional requirements; the secondary user (spec-kit contributor reading the worked example) drives the didactic constraints (single file / minimal deps / inline requirement cross-references). These constraints are additive, not conflicting. No further clarification needed before Requirements.
