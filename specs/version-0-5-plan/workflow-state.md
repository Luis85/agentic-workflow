---
feature: version-0-5-plan
area: V05
current_stage: implementation
status: active
last_updated: 2026-05-02
last_agent: pm
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
- 2026-05-02 (architect): Per Article X (Iteration), PR #157 re-opens Stages 3–5 of v0.5 to absorb a new template-wide requirement: the released package ships as a **fresh-surface starter** — docs as stubs, ADRs excluded, 10 intake folders empty (`inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`). Filed [ADR-0021](../../docs/adr/0021-release-package-fresh-surface.md) (Accepted), added Stage 4 design section "Release package contents (fresh-surface contract)" plus three new affected-surface rows, added `SPEC-V05-010` and `TEST-V05-012`, added `templates/release-package-stub.md` and `docs/release-package-contents.md`, updated `docs/specorator.md` §3.10 and `docs/sink.md`. `current_stage` remains `implementation` — this is an iteration loop, not a stage rewind. **Hand-off to `pm`:** add `REQ-V05-012` (fresh-surface contract requirement) to `requirements.md` and write the package-contract document (T-V05-002 deliverable) using ADR-0021 as the include / exclude source of truth. **Hand-off to orchestrator / planner:** broaden `T-V05-002` (package contract document) to incorporate the fresh-surface include / exclude lists, and add a new `T-V05-012` task for `scripts/check-release-package-contents.ts` that asserts the three exclusion classes; sequence it before the release readiness implementation task so SPEC-V05-005 can call into it.
- 2026-05-02 (pm): Added REQ-V05-012 (fresh-surface starter, EARS event-driven form) to `requirements.md` and wrote the T-V05-002 deliverable `specs/version-0-5-plan/package-contract.md` (PKG-CONTRACT-V05-001, status `draft`). Package name committed to `@luis85/agentic-workflow` (GitHub login confirmed `Luis85` from README + product page URL). Three open questions logged in the contract (OQ-V05-001 visibility confirmation, OQ-V05-002 final `package.json#files` glob, OQ-V05-003 manual stub-form packaging step until T-V05-012 lands). Resolves CLAR-V05-002 (package type, name, scope, contents). **Hand-off to orchestrator:** broadened T-V05-002 + added T-V05-012 in `tasks.md`; ready for verify + commit per concern + push.
- 2026-05-02 (orchestrator): Codex review feedback drained on PR #157 (4 findings — 2× P1, 2× P2). Fixes applied in a single review-fix commit: (1) ADR-file glob notation corrected from the regex/glob mix `0\d{3}-*.md` to the unambiguous shell glob `[0-9][0-9][0-9][0-9]-*.md` across `requirements.md`, `spec.md`, `design.md`, `tasks.md`, `package-contract.md`, `docs/release-package-contents.md`, and `docs/sink.md`; an Errata addendum was added to ADR-0021 calling out the typo and the canonical operational form (decision unchanged). (2) `package-contract.md` §7 Install path expanded with the GitHub Packages prerequisites (`read:packages` PAT, `~/.npmrc` auth line, scope-to-registry mapping in the consumer project's `.npmrc`); the bare `npm install` command no longer over-promises. (3) `templates/release-package-stub.md` no longer links to ADR-0021 (which the contract excludes from the released archive); the trailer points at `docs/release-package-contents.md` (which ships in stub form) and notes the ADR ships in the codebase only. (4) `tasks.md` DAG inverted around the fresh-surface gate — `T-V05-012` now depends on `T-V05-002` only, and `T-V05-004` (release readiness) depends on `T-V05-001`, `T-V05-002`, `T-V05-012`; this prevents a path where readiness can pass before the fresh-surface assertions are wired in. T-V05-004 satisfies expanded to include REQ-V05-012 and SPEC-V05-010.

## Open clarifications

- [ ] CLAR-V05-003 — Confirm whether the first publish should be draft/pre-release only before a stable GitHub Release and package are published.

## Resolved clarifications

- [x] CLAR-V05-001 (resolved 2026-05-02 by architect, [ADR-0020](../../docs/adr/0020-v05-release-branch-strategy.md)) — v0.5 keeps Shape A with explicit `release/vX.Y.Z` branches; `main` remains the canonical release source and tag origin; `develop` is not introduced.
- [x] CLAR-V05-002 (resolved 2026-05-02 by pm) — GitHub Packages npm registry; package name `@luis85/agentic-workflow`; visibility public (subject to OQ-V05-001 repo-visibility confirmation); contents per `package-contract.md` §3 (include) and §4 (exclude), encoding ADR-0021 fresh-surface rules.
