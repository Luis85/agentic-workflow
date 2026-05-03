---
feature: adopt-issue-first-interaction-model
area: IFI
issue: 274
current_stage: requirements
status: active
last_updated: 2026-05-03
last_agent: pm
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
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

# Workflow state — adopt-issue-first-interaction-model

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | pending |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`. Section semantics + status enums: see [`_shared/state-file-sections.md`](./_shared/state-file-sections.md).

## Skips

_None yet._

## Blocks

_None._

## Hand-off notes

```
2026-05-03 (pm + orchestrator): /spec:clarify run. 35 CLARs + 8 gaps surfaced. 8 critical resolved
                            in-place (requirements.md patched). 3 gap REQs added (037–039).
                            21 deferrable CLARs logged above for architect.
2026-05-03 (analyst):      research.md complete. Key finding: slug should default to
                            <title-slug>-<issue-number> (e.g. adopt-issue-first-interaction-model-274)
                            to eliminate collision detection entirely. PM decides in requirements.
                            RISK-IFI-004 high (private repo `required` not enforced → must validate
                            programmatically). Mirror sync must be non-fatal (exit 0). 10 risks logged.
2026-05-03 (analyst):      idea.md complete. Problem = transcript-only intent, no durable GitHub
                            artifact. Solution = additive issue-first layer. 4 open questions feed
                            research agenda (Q1–Q4). Quality gate all green.
2026-05-03 (orchestrator): Scaffolded from issue #274 (status:ready-for-spec, depth:standard,
                            track:specorator-improvement). Issue body is source of truth for
                            idea framing — analyst reads it directly. Grill output (R1–R20)
                            is already resolved; PM should treat decisions as locked inputs.
                            ADR required before Design (issue body §"Does this touch the constitution?").
```

## Open clarifications

> Run by `/spec:clarify` — 2026-05-03. 35 items + 8 gaps. Grouped by priority.

### Critical — must resolve before Design

- [x] CLAR-IFI-002 — resolved 2026-05-03: exact h3 headings locked per template in REQ-IFI-001/002/003.
- [x] CLAR-IFI-004 — resolved 2026-05-03: status labels = 6 named values (not per-stage); added to REQ-IFI-006.
- [x] CLAR-IFI-006 — resolved 2026-05-03: canonical label file = `.github/labels.yml`; REQ-IFI-006/007 updated.
- [x] CLAR-IFI-012 — resolved 2026-05-03: area = first 3 chars of first slug word (existing rule); track maps to commit-type only. REQ-IFI-013 rewritten.
- [x] CLAR-IFI-017 — resolved 2026-05-03: acceptance criterion fixed — conflict scenario uses `issue: 42` in existing dir vs. `/spec:start 99`. REQ-IFI-017 updated.
- [x] CLAR-IFI-020 — resolved 2026-05-03: mapping table added inline in REQ-IFI-013; full table to live in `docs/issue-first-interaction.md`.
- [x] CLAR-IFI-021 — resolved 2026-05-03: gate labels opt-in only; REQ-IFI-020 rewritten with v1 gate label set.
- [x] CLAR-IFI-034 — resolved 2026-05-03: errors → stderr; NFR-IFI-003 fixed to match NFR-IFI-008.

### Important — resolve before Design or accept as spec-level

- [ ] CLAR-IFI-004 [REQ-IFI-006] — "at least one status label per stage" is ambiguous: one per stage entry, one per exit, or both?
- [ ] CLAR-IFI-010 [REQ-IFI-011] — slug normalization unspecified: consecutive non-alphanumeric collapse, leading/trailing hyphen handling, Unicode letters.
- [ ] CLAR-IFI-014 [REQ-IFI-015] — "required fields" differs per form type; form-type detection before field validation not specified.
- [ ] CLAR-IFI-016 [REQ-IFI-016] — "resume" undefined: print current stage + exit, or dispatch next pending stage command?
- [ ] CLAR-IFI-024 [REQ-IFI-023] — on first scaffold, "last completed gate" value is undefined; no gate has been completed yet.
- [ ] CLAR-IFI-026 [REQ-IFI-024] — sync invocation on slug-mode (no `issue:` field) not specified: silently skip or script handles null arg?
- [ ] CLAR-IFI-027 [REQ-IFI-029] — exact `workflow-state.status` → label name mapping is undefined; "or equivalent" makes the acceptance criterion untestable.
- [ ] Gap-1 — No requirement for non-existent issue number (404): error message, exit code, no scaffold.
- [ ] Gap-4 — No requirement for empty or whitespace-only issue title (produces empty slug before suffix).
- [ ] Gap-6 — No requirement for null/empty issue body at sentinel block append time.

### Deferrable to spec.md

- CLAR-IFI-001, 003, 005, 007, 008, 009, 011, 013, 015, 018, 019, 022, 023, 025, 028, 029, 030, 031, 032, 033, 035
- Gaps 2 (closed issue), 3 (403 private repo), 5 (float-like strings), 7 (concurrent writes), 8 (label colours)
