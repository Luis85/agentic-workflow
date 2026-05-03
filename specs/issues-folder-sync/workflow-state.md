---
feature: issues-folder-sync
area: ISSUE
current_stage: testing
status: active
last_updated: 2026-05-03
last_agent: specorator-improvement
artifacts:
  idea.md: skipped
  research.md: skipped
  requirements.md: skipped
  design.md: skipped
  spec.md: skipped
  tasks.md: skipped
  implementation-log.md: skipped
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — issues-folder-sync

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | skipped |
| 2. Research | `research.md` | skipped |
| 3. Requirements | `requirements.md` | skipped |
| 4. Design | `design.md` | skipped |
| 5. Specification | `spec.md` | skipped |
| 6. Tasks | `tasks.md` | skipped |
| 7. Implementation | `implementation-log.md` + code | skipped |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- `idea.md` — Specorator-improvement workflow; design framed and confirmed in session conversation. Per the specorator-improvement skill, the improvement loop replaces the upstream lifecycle stages for template changes.
- `research.md` — same rationale as `idea.md`; alternatives and risks surfaced in the design conversation (D1–D5).
- `requirements.md` — same rationale; confirmed design decisions D1–D5 serve as requirements.
- `design.md` — same rationale; design decisions D1–D5 are recorded in ADR-0030.
- `spec.md` — same rationale; ADR-0030 §1–§7 serves as the specification.
- `tasks.md` — same rationale; task list tracked in session TaskCreate entries.
- `implementation-log.md` — Specorator-improvement: all implementation done in a single session; no multi-dev log needed.

## Blocks

- None.

## Hand-off notes

- 2026-05-03 (specorator-improvement): Implementation in progress on `feat/issues-folder-sync`. Design decisions D1–D5 confirmed by human:
  - D1: `issues/` at repo root, flat `<number>-<slug>.md` files.
  - D2: Issue created at `/spec:start` time.
  - D3: `check:issues` is warn-only (not in verify task list).
  - D4: Sync is pull-only from GitHub; push only at creation via `gh issue create`.
  - D5: ADR-0030 filed for this change.

## Open clarifications

- None.
