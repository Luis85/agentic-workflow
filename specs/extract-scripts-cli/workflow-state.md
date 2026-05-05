---
feature: extract-scripts-cli
area: CLI
current_stage: design
status: active
last_updated: 2026-05-05
last_agent: architect
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
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

# Workflow state — extract-scripts-cli

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code/docs | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Hand-off notes

2026-05-05 — Spec folder created by specorator-improvement skill (mode=update). Improvement idea: "Extract scripts into a dedicated specorator-cli package." Classified as tooling + distribution change. ADR required before implementation.
2026-05-05 — Stages 1–4 complete. idea.md, research.md, requirements.md, design.md, ADR-0034 filed. Chosen model: Option A (bin in existing package). docs/specorator-product/tech.md updated. Ready for spec (stage 5) and tasks (stage 6).
