---
feature: version-0-6-plan
area: V06
current_stage: implementation
status: active
last_updated: 2026-05-02
last_agent: codex
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: complete
  tasks.md: complete
  implementation-log.md: in-progress
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state - version-0-6-plan

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code/docs | in-progress |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- None.

## Hand-off notes

- 2026-05-01 (codex): Planned v0.6 through Stage 6 from the product research pass. Recommended implementation order is steering profile, live golden-path demo, cross-tool adapters, hook pack, agentic security workflow, proof-first public positioning, adoption profiles, ISO 9001:2026 watch item, then release readiness verification.
- 2026-05-02 (codex, T-V06-001/T-V06-002): PR-A selected the additive steering split: downstream starter templates stay in `docs/steering/`, while Specorator's own product steering lives in `docs/specorator-product/`. No ADR required because existing template ownership was preserved. Implementation evidence lives in `implementation-log.md`.
- 2026-05-02 (codex, CLAR-V06-002): ADR-0026 freezes the v1.0 track taxonomy and resolves agentic security as a QA/reviewer extension, not a new optional track. T-V06-010 should add an OWASP-aligned review path as an opt-in checklist/skill usable from Quality Assurance, Review, or Release readiness without creating a new state-bearing workflow.
- 2026-05-02 (Decider): CLAR-V06-001 and CLAR-V06-003 resolved in the cross-plan clarification slate. v0.6 ships a thin first-class adapter set: Claude Code baseline, Codex, Copilot, and one editor-agent path through Cursor/Aider-style guidance; fuller native adapters or generation are deferred. Golden-path proof starts as maintainer-run evidence plus CI validation of artifacts/scripts; full CI execution of the interactive demo is deferred until the path is stable.
- 2026-05-02 (codex, #195): Scope-cut verdicts recorded to protect the v1.0 timeline. PR-B, PR-C, PR-E, PR-F, and PR-G ship in v0.6 with the CLAR constraints below. PR-D hook packs slips to v0.7 because it is optional automation hardening and not required for v1.0 readiness. PR-H public positioning should cite shipped evidence from PR-B, PR-C, PR-E, and PR-F, with hook-pack claims omitted until v0.7. PR-I release readiness should verify the ISO watch item from PR-G and record PR-D as a planned v0.7 follow-up, not a v0.6 blocker.

## Scope-cut verdicts

| PR | Tasks | Verdict | v0.6 scope |
|---|---|---|---|
| #175 PR-A steering profile | T-V06-001, T-V06-002 | Shipped in v0.6 | Merged. No further scope decision needed. |
| #176 PR-B golden-path proof | T-V06-003, T-V06-004 | Ships in v0.6 | Maintainer-run evidence plus CI validation of artifacts/scripts. Fully automated interactive CI demo is deferred until stable. |
| #177 PR-C cross-tool adapters | T-V06-005, T-V06-006, T-V06-007 | Ships in v0.6 | Thin first-class set only: Claude Code baseline, Codex, Copilot, and one Cursor/Aider-style editor-agent guidance path. Fuller native adapters or generation are deferred beyond v0.6. |
| #178 PR-D hook packs | T-V06-008, T-V06-009 | Slips to v0.7 | Keep as opt-in automation hardening. Do not block v0.6 or v1.0 readiness on advisory hook examples. |
| #179 PR-E agentic security review path | T-V06-010 | Ships in v0.6 | QA/reviewer extension only. No new optional track or state-bearing workflow. |
| #180 PR-F adoption profiles | T-V06-011 | Ships in v0.6 | Lightweight persona routing to existing surfaces. No duplicate manuals. |
| #181 PR-G ISO 9001:2026 watch item | T-V06-013 | Ships in v0.6 | Watch item and follow-up trigger only. No premature ISO requirement or compliance change. |

## Open clarifications

- [x] CLAR-V06-001 - v0.6 does not implement the full cross-tool adapter set. Ship a thin first-class set: Claude Code baseline, Codex, Copilot, and one editor-agent path through Cursor/Aider-style guidance. Defer fuller native adapters or generation.
- [x] CLAR-V06-002 - Confirm whether the agentic security review is a new optional track, a QA checklist extension, or both. *(resolved 2026-05-02: QA/reviewer extension, not a new track; see ADR-0026.)*
- [x] CLAR-V06-003 - Start with maintainer-run golden-path evidence plus CI validation of artifacts/scripts. Defer fully automated CI execution of the interactive demo until the path is stable.
