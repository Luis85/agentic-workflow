---
feature: version-0-3-plan
area: V03
current_stage: implementation
status: active
last_updated: 2026-05-01
last_agent: release-manager
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
  release-notes.md: in-progress
  retrospective.md: pending
---

# Workflow state — version-0-3-plan

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
| 10. Release | `release-notes.md` | in-progress |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- None.

## Hand-off notes

- 2026-04-28 (codex): Planned v0.3 through Stage 6. Recommended implementation order is example completion, validation hardening, validator tests, documentation, product-page review, release readiness verification, then explicit v0.4 validation handoff.
- 2026-05-01 (claude): T-V03-001/002/003/005/007 shipped. Drafted `release-notes.md` for T-V03-006. T-V03-004 satisfied by existing checks plus T-V03-003 slice 3. T-V03-008 (release readiness) and T-V03-009 (v0.4 handoff) remain.

## Open clarifications

- [ ] CLAR-V03-001 — Confirm whether `examples/cli-todo` remains the selected complete example for v0.3 or whether a different example should replace it.
- [x] CLAR-V03-002 — Confirm which strengthened validation checks must fail `npm run verify` in v0.3 versus remain advisory until v0.4.

  **Resolved 2026-05-01 (human + claude):** Default is hard-fail; advisory only when format variability creates real false-positive risk. Concrete split for the new T-V03-003 / T-V03-004 checks:
  - **Hard-fail (v0.3 verify gate):** skipped artifact must appear under `## Skips` section (T-V03-003); examples folders must have a `workflow-state.md` (T-V03-003); every `TEST-*` references back to a `REQ-*` or `NFR-*` (T-V03-004).
  - **Advisory (deferred to v0.4):** every `REQ-*` / `NFR-*` has at least one covering `TEST-*` — test-plan formats are not yet locked, so a deterministic coverage check would block legitimate PRs. T-V03-009 records this as a v0.4 promotion candidate.

  All previously-shipped checks (current-stage consistency, complete-artifact file presence, done-state rules, duplicate IDs, area mismatches, unknown references, invalid reference kinds, missing `Satisfies`) remain hard-fail and are now covered by regression tests (PR #93 for spec-state, PR #94 for traceability).
