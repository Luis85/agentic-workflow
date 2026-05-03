---
feature: version-0-8-plan
area: V08
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
- 2026-05-02 (Decider): CLAR-V08-001, CLAR-V08-002, and CLAR-V08-003 resolved in the cross-plan clarification slate. v0.8 adopts Astro as the default generator without building a generator-neutral adapter layer. Canonical product-page source moves from `sites/index.html` to Markdown/content plus Astro source; generated output is build/deploy output, with direct-open behavior preserved after build and the changed contract documented. Downstream adopters receive the generator as an opt-in scaffold, while Specorator itself can use it by default.

## Open clarifications

- [x] CLAR-V08-001 - Adopt Astro as the default generator. Keep content/source boundaries plain Markdown so downstream projects can replace Astro, but do not build a generator-neutral adapter layer in v0.8.
- [x] CLAR-V08-002 - `sites/index.html` is no longer the canonical source. Canonical source becomes Markdown/content plus Astro source. Generated output is build/deploy output; preserve direct-open behavior after build and document the changed contract.
- [x] CLAR-V08-003 - Downstream adopters get the product-page generator as an opt-in scaffold, not mandatory default weight for every fork. Specorator itself can use it by default.
