---
feature: version-0-6-plan
area: V06
current_stage: implementation
status: active
last_updated: 2026-05-02
last_agent: codex-dev
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

## Open clarifications

- [ ] CLAR-V06-001 - Confirm whether v0.6 should implement the full cross-tool adapter set or start with Claude Code, Codex, and Copilot only.
- [x] CLAR-V06-002 - Confirm whether the agentic security review is a new optional track, a QA checklist extension, or both. *(resolved 2026-05-02: QA/reviewer extension, not a new track; see ADR-0026.)*
- [ ] CLAR-V06-003 - Confirm whether the golden-path demo should be fully automated in CI or documented as a maintainer-run release evidence check first.
