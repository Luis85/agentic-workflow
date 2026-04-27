---
feature: cli-todo
area: CLI
current_stage: design
status: active
last_updated: 2026-04-27
last_agent: ui-designer
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: in-progress
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
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | in-progress |
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

```
2026-04-27 (pm):      requirements.md (PRD-CLI-001) drafted; quality gate
                      passes (the /spec:clarify checkbox stays unticked
                      because no open questions remain — see note in the
                      file). 13 functional requirements landed (REQ-CLI-001
                      through REQ-CLI-013): five command requirements
                      (add, list, list --all, done, rm), one help
                      requirement, one persistence requirement, one
                      atomic-write requirement, one data-file-location
                      requirement, and four error-handling requirements
                      (unknown-id × 2, corrupt-file, empty-add).
                      REQ-CLI-003 (`todo list --all`) added as `should`
                      to give review-of-completed-work and lift FR count
                      well above the 7-requirement floor.

                      Windows decision: explicit non-goal for v1
                      (NG10). Linux + macOS only. Rationale: keeps the
                      example tight, single CI target, no Windows-rename
                      edge cases — directly serves the didactic goal.
                      A hypothetical v2 example could add Windows.

                      7 NFRs cover performance (≤ 1s on 10k tasks),
                      reliability (atomic writes), portability
                      (Linux/macOS), privacy (zero network), maintainability
                      (≤ 500 LOC counter-metric), installability (single
                      command), and traceability.

                      No new CLAR entries — analyst's CLAR-001 stays
                      resolved and nothing new surfaced.

                      Hand-off to design (stage 4): ux-designer should
                      cover the user flows for the 5 commands, error
                      states (unknown ID, corrupt file, empty add),
                      and `--help` content. ui-designer should pick the
                      output format / colour conventions / spacing. The
                      didactic constraint (G4) means visual choices stay
                      minimal — terminal output, no colour by default
                      unless trivially justified.
```

```
2026-04-27 (ui-designer): Part B — UI drafted in design.md. All 18 output
                          states inventoried (covering all 13 FRs). Format
                          conventions defined for task-line layout (list and
                          list --all), confirmation lines (add / done / rm),
                          and error lines. Full microcopy written for every
                          state: 3 confirmation messages, 2 empty-list
                          messages, 7 error messages, 5 help text blocks.

                          One decision worth flagging to architect:
                          The `done` confirmation uses `Done: task [id] [text]`
                          (no colon between id and text), while `add` and `rm`
                          use a colon (`Added task [id]: [text]`). This
                          asymmetry is intentional — it matches Part A's
                          prescribed strings exactly. The spec should test
                          against the exact microcopy strings here, not
                          infer them from a pattern.

                          Exit-code decision point from Part A (whether to
                          distinguish I/O failure vs. validation failure with
                          separate exit codes) is still open — flagged for
                          architect to resolve in Part C.

                          Hand-off to architect: Part C should cover
                          data model, storage format, atomic-write
                          mechanism, and the data-file-path resolution
                          (XDG default vs. TODO_FILE env var).
```

## Open clarifications

> Add and resolve as they come up. Unresolved clarifications block stage transitions.

- [x] CLAR-001 — Confirm primary readership (template contributors vs. real CLI todo users) — affects how much we lean on didactic clarity vs. product polish.

  **Resolved 2026-04-27 (analyst):** Research confirms both audiences are real and compatible. The primary user (solo terminal engineer) drives the functional requirements; the secondary user (spec-kit contributor reading the worked example) drives the didactic constraints (single file / minimal deps / inline requirement cross-references). These constraints are additive, not conflicting. No further clarification needed before Requirements.
