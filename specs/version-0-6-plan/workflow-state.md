---
feature: version-0-6-plan
area: V06
current_stage: implementation
status: active
last_updated: 2026-05-01
last_agent: planner
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
| 7. Implementation | `implementation-log.md` + code/docs | pending |
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

## Open clarifications

- [ ] CLAR-V06-001 - Confirm whether v0.6 should implement the full cross-tool adapter set or start with Claude Code, Codex, and Copilot only.
- [ ] CLAR-V06-002 - Confirm whether the agentic security review is a new optional track, a QA checklist extension, or both.
- [ ] CLAR-V06-003 - Confirm whether the golden-path demo should be fully automated in CI or documented as a maintainer-run release evidence check first.
