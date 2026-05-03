---
feature: repo-adoption-track
area: ADOPT
current_stage: requirements
status: active
last_updated: 2026-05-03
last_agent: analyst
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: pending
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

# Workflow state — repo-adoption-track

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | pending |
| 4. Design | `design.md` | pending |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- **ADR-0030 required before Stage 3 (Requirements) can begin.** Research recommends filing ADR-0030 in a dedicated predecessor PR that is reviewed and merged before the implementation PR opens. All sister-track ADRs were bundled with implementation, but ADR-0030 supersedes ADR-0026 (a freeze decision), which makes early filing lower-risk than precedent might suggest. PM must confirm the sequencing with the human maintainer before Requirements begins.

## Hand-off notes

- 2026-05-03 (analyst): `research.md` complete. Recommended alternative: **Alternative A — Agent-orchestrated four-phase skill** (conductor skill + specialist agent + three TypeScript scripts + `adoptions/<slug>/` state directory). Reasons: strongest constitutional fit (Articles VI, VII, IX); consistent with all 12 existing track shapes; agent judgment concentrated at the phases that need it (Phase 1 conflict classification, Phase 3 preset selection).

  Items still needing validation before Stage 3 can close:
  1. **Agent tool list scope** — the path-scope gap in `.claude/settings.json` enforcement (the deny rules do not cover foreign-repo paths) must be resolved by the architect. This is potentially ADR-class.
  2. **ADR-0030 filing and acceptance** — blocking dependency. Recommend a dedicated predecessor PR. PM to confirm with human maintainer.
  3. **`verify.yml` opt-in mechanics** — the exact Phase 3 UI for CI workflow installation must be specified as acceptance criteria.
  4. **Idempotency marker naming** — `.specorator-version` vs. `.specorator/adoption.json`. Architect decision.
  5. **Preset manifest format** — must support future language presets without changing Phase 3 logic. Architect decision.
  6. **Windows MAX_PATH constraint** — maximum slug length must be defined. Architect/dev decision.
  7. **Patch-file fallback specification** — for GitHub repos where push access is unavailable. PM/architect decision.
  8. **Working tree location** — `idea.md`'s `.worktrees/adopt-<slug>/` framing is incorrect (a foreign-repo clone is not a git worktree of the template repo). Correct to `adoptions/<slug>/repo/` in Requirements.

  Superpowers design spec (`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`) was not found at the stated path and was reconstructed from issues #257 and #258. The issue #257 description mentions `adoptions/<slug>/` state home and `adopt-cycle` conductor name — these are plausible inputs for Stage 4 naming but are not binding.

- 2026-05-03 (analyst): `idea.md` complete. See prior research agenda bullet in this section for full detail.

## Open clarifications

- [x] CLAR-ADOPT-001 — ADR sequencing: should ADR-0030 be filed in a predecessor PR before implementation, or bundled with the implementation PR? *(resolved 2026-05-03 — see research.md §Q1. Recommendation: file ADR-0030 in a dedicated predecessor PR before implementation begins. No sister-track precedent exists for this pattern, but ADR-0030 supersedes a freeze decision, making early filing lower-risk than normal.)*
- [x] CLAR-ADOPT-002 — CI port-over scope: does Phase 3 enrichment install `verify.yml` or equivalent into the adopted repository, and how are conflicts with existing CI handled? *(resolved 2026-05-03 — see research.md §Q2. Recommendation: install `verify.yml` as an opt-in Phase 3 enrichment step, explicitly gated with human approval. Foreign-repo CI conflicts surfaced in adoption state; not silently resolved.)*
- [x] CLAR-ADOPT-003 — Language-specific renderer breadth: one generic enrichment preset vs. specialised Node/Python presets for v1.1? *(resolved 2026-05-03 — see research.md §Q3. Recommendation: ship v1.1 with one generic preset (always) and one optional Node/TypeScript preset (proposed but not auto-installed). Python-specific enrichment deferred to v1.2.)*
