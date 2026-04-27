---
feature: cli-todo
area: CLI
current_stage: specification
status: active
last_updated: 2026-04-27
last_agent: architect
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: in-progress
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

> A worked example of the specorator, walked through every stage. Built incrementally so each stage can be reviewed before the next one builds on it.

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | in-progress |
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

```
2026-04-27 (architect):   Part C — Architecture and the cross-cutting section
                          drafted in design.md; design.md left in-progress
                          pending human acceptance. Quality gate ticked.

                          System shape: 9 in-process components (entry,
                          dispatcher, 5 handlers, storage layer, path
                          resolver, task model). No network, no daemon,
                          no shared state beyond the on-disk store. Two
                          data flows (write path: load -> mutate ->
                          atomic save; read path: load -> filter -> render).
                          Help path never touches the store.

                          Data model: task (id, text, done, created_at)
                          plus a store envelope (version, tasks, next_id).
                          The next_id field carries the never-reused-ID
                          property across file round-trips. version=1
                          from day one per RISK-006.

                          Decisions resolved:
                          - Exit-code scheme: single non-zero (exit 1)
                            for every error, exit 0 for success including
                            empty list and help. Resolves the open question
                            handed off from Part A. Recorded in the
                            key-decisions table with rationale.
                          - Atomic-write pattern: temp file in the
                            target's directory + fsync + rename. Single
                            mutation entry point in the storage layer.
                          - Concurrency posture: no lockfile;
                            last-writer-wins for the update-update race;
                            partial-write race eliminated.
                          - ID scheme: sequential positive integers,
                            never reused after rm.
                          - Data file location: XDG default + TODO_FILE
                            override (full path, not just a directory).
                          - Help handlers do not read the data store.

                          ADRs created:
                          - ADR-CLI-0001 — Use atomic temp-file rename
                            for writes; no lockfile in v1. Covers the
                            durability + concurrency trade-off (the only
                            architecturally load-bearing, hard-to-reverse
                            decision in this design). Other decisions
                            stay in the key-decisions table.

                          New architecture-level risks (added to research
                          carry-overs RISK-001..004):
                          - RISK-CLI-ARCH-001 — cross-filesystem temp file
                            silently breaks atomicity (mitigated by
                            placing the temp file in the target's
                            directory).
                          - RISK-CLI-ARCH-002 — missing parent directory
                            on first run (mitigated by path resolver
                            creating it).

                          All 13 REQ-CLI-NNN appear in the requirements
                          coverage table with at least one section each.
                          No new CLAR entries opened.

                          Hand-off to spec (stage 5): the architect-side
                          inputs are settled. spec.md should now turn the
                          interaction grammar into a per-subcommand
                          contract (signature, pre/post-conditions, error
                          codes mapped to the exit-1-for-everything rule,
                          edge cases including the SIGKILL-mid-write
                          scenario, the cross-filesystem TODO_FILE
                          scenario, and the empty/missing-parent-dir
                          first-run scenario). The exact serialisation
                          format for the data store is the spec stage's
                          call — Part C names only the field set and
                          invariants, not the on-disk encoding. The QA
                          agent will need a SIGKILL-mid-write test
                          scenario to discharge ADR-CLI-0001's
                          compliance clause.
```

```
2026-04-27 (architect):   spec.md (SPECDOC-CLI-001) drafted; design.md
                          marked complete; spec.md left in-progress
                          pending human acceptance. Quality gate ticked.

                          What spec.md covers:
                          - 9 SPEC-CLI-NNN interface entries: one per
                            subcommand (add, list/list --all, done, rm,
                            help, bare-todo, unknown-subcommand) plus
                            two internal interfaces called out by name
                            — the storage write helper (atomic-rename
                            contract from ADR-CLI-0001) and the
                            data-store path resolver (TODO_FILE +
                            XDG default).
                          - On-disk JSON encoding for Task and Store
                            envelope, with cross-field invariants
                            (no duplicate ids, every id < next_id,
                            version == 1, next_id never decremented).
                          - Verbatim output strings (confirmation
                            lines, empty-list messages, every error
                            message, all five help blocks) lifted from
                            design Part B and pinned for byte-exact
                            tests.
                          - 21 edge cases (EC-CLI-001..021) including
                            first-run, missing parent dir, empty/missing
                            text, unknown id, corrupt store (invalid
                            JSON, version 2, zero-byte, directory),
                            SIGKILL-mid-write, cross-filesystem
                            TODO_FILE, idempotent done, help-when-
                            corrupt, and next_id overflow boundary.
                          - 33 test scenarios (TEST-CLI-001..033)
                            including the ADR-CLI-0001 compliance gate
                            (TEST-CLI-018: SIGKILL-mid-write) and the
                            cross-filesystem rename test (TEST-CLI-033).
                          - State-transition diagram + table, validation
                            rules at three boundaries (argv / load /
                            save), stderr-only observability surface,
                            performance budget (NFR-CLI-001 inherited
                            verbatim), compatibility note on the
                            version: 1 + next_id round-trip invariant,
                            and the ADR-CLI-0001 concurrency note in
                            plain language (last-writer-wins for the
                            update-update race; no partial writes).
                          - Requirements coverage table maps every
                            REQ-CLI-NNN to its spec items, edge cases,
                            and tests.

                          Illustrative-not-prescriptive policy applied
                          throughout: pseudocode for signatures, no
                          library or package names, JSON named
                          explicitly (format decision, not a library
                          choice).

                          One spec-stage clarification recorded that
                          wasn't in design Part C: empty-string
                          TODO_FILE (EC-CLI-021) is treated as unset
                          and falls back to XDG default. Justified by
                          REQ-CLI-009 statement wording ("set to a
                          non-empty value"). No new ADR — this is a
                          clarification of an existing requirement,
                          not a new architectural choice.

                          No new CLAR entries; no open clarifications.

                          Hand-off to planner (stage 6, tasks): the
                          spec is ready to decompose into T-CLI-NNN
                          tasks. Suggested decomposition follows the
                          9-component architecture from design Part C:
                          - one task per handler (add, list, done,
                            rm, help) — each with its own signature,
                            success path, and error paths;
                          - two tasks for the storage layer, split as
                            (a) load + validation and (b) atomic-
                            rename save (the latter is the single
                            most load-bearing task in the feature —
                            ADR-CLI-0001 compliance);
                          - one task for the path resolver
                            (TODO_FILE + XDG);
                          - one task for the dispatcher (argv parsing,
                            unknown-subcommand error, missing-
                            argument errors, --help routing);
                          - one task for the entry point (exit-code
                            translation, output flushing).

                          The 33 test scenarios in spec.md §6 cover
                          every requirement and edge case; QA can
                          derive its test plan directly. TEST-CLI-018
                          (SIGKILL mid-write) is the compliance gate
                          for ADR-CLI-0001 and must be in the test
                          plan regardless of how planner decomposes
                          the implementation tasks.
```

## Open clarifications

> Add and resolve as they come up. Unresolved clarifications block stage transitions.

- [x] CLAR-001 — Confirm primary readership (template contributors vs. real CLI todo users) — affects how much we lean on didactic clarity vs. product polish.

  **Resolved 2026-04-27 (analyst):** Research confirms both audiences are real and compatible. The primary user (solo terminal engineer) drives the functional requirements; the secondary user (specorator contributor reading the worked example) drives the didactic constraints (single file / minimal deps / inline requirement cross-references). These constraints are additive, not conflicting. No further clarification needed before Requirements.
