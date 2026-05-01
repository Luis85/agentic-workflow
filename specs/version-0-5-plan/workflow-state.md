---
feature: version-0-5-plan
area: V05
current_stage: implementation
status: active
last_updated: 2026-05-02
last_agent: dev
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

# Workflow state — version-0-5-plan

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code | in-progress |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- None.

## Hand-off notes

- 2026-04-28 (codex): Planned v0.5 through Stage 6. Recommended implementation order is branch strategy decision, package contract, release notes configuration, release readiness check that consumes v0.4 quality signals, manual GitHub Release workflow with release-candidate mode, package publish path, operator guide, public docs/product page update, dry run, then release readiness verification.
- 2026-05-02 (architect): T-V05-001 complete — adopted Shape A with `release/vX.Y.Z` branches and `main` as canonical release source and tag origin via [ADR-0020](../../docs/adr/0020-v05-release-branch-strategy.md); `docs/branching.md` updated; CLAR-V05-001 resolved.
- 2026-05-02 (dev): T-V05-003 complete — added `.github/release.yml` mapping merged-PR labels to v0.5 generated release-note categories (Breaking Changes first, then Features / Bug Fixes / Documentation / Performance / Refactor / Tests / Build & CI / Reverts / Chores & Dependencies / Other Changes catch-all) and excluding `release` / `chore-release` / `skip-changelog` labels plus `dependabot` and `github-actions` author handles. Satisfies SPEC-V05-003 (REQ-V05-003, REQ-V05-004); the release workflow itself follows in T-V05-006. PR #156 stages T-V05-001 + T-V05-003 together.

## Open clarifications

- [ ] CLAR-V05-002 — Confirm the first GitHub Package type, package name, scope, visibility, and contents.
- [ ] CLAR-V05-003 — Confirm whether the first publish should be draft/pre-release only before a stable GitHub Release and package are published.

## Resolved clarifications

- [x] CLAR-V05-001 (resolved 2026-05-02 by architect, [ADR-0020](../../docs/adr/0020-v05-release-branch-strategy.md)) — v0.5 keeps Shape A with explicit `release/vX.Y.Z` branches; `main` remains the canonical release source and tag origin; `develop` is not introduced.
