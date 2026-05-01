---
feature: version-0-8-plan
area: V08
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

# Workflow state - version-0-8-plan

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

- 2026-05-01 (codex): Planned v0.8 through Stage 6 from the request for better product page creation. Recommended implementation order is decide the generator stack, define the content model, scaffold the static-site app, migrate the current product page into content files, add GitHub Pages deployment, add deterministic checks and docs, then update product-page agent/skill guidance.

## Open clarifications

- [ ] CLAR-V08-001 - Confirm whether v0.8 should adopt Astro as the default generator or keep a generator-neutral adapter with Astro as the first implementation.
- [ ] CLAR-V08-002 - Confirm whether the generated site must preserve `sites/index.html` as the canonical source file or may make it a generated artifact committed or built by CI.
- [ ] CLAR-V08-003 - Confirm whether downstream adopters should get the product-page generator by default or as an opt-in scaffold.
