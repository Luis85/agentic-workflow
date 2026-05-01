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
  implementation-log.md: pending
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
| 7. Implementation | `implementation-log.md` + code | pending |
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
- 2026-05-02 (architect): Per Article X (Iteration), this PR re-opens Stages 3–5 of v0.5 to absorb a new template-wide requirement: the released package ships as a **fresh-surface starter** — docs as stubs, ADRs excluded, 10 intake folders empty (`inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`). Filed [ADR-0021](../../docs/adr/0021-release-package-fresh-surface.md) (Accepted), added Stage 4 design section "Release package contents (fresh-surface contract)" plus three new affected-surface rows, added `SPEC-V05-010` and `TEST-V05-012`, added `templates/release-package-stub.md` and `docs/release-package-contents.md`, updated `docs/specorator.md` §3.10 and `docs/sink.md`. `current_stage` remains `implementation` — this is an iteration loop, not a stage rewind. **Hand-off to `pm`:** add `REQ-V05-012` (fresh-surface contract requirement) to `requirements.md` and write the package-contract document (T-V05-002 deliverable) using ADR-0021 as the include / exclude source of truth. **Hand-off to orchestrator / planner:** broaden `T-V05-002` (package contract document) to incorporate the fresh-surface include / exclude lists, and add a new `T-V05-012` task for `scripts/check-release-package-contents.ts` that asserts the three exclusion classes; sequence it before the release readiness implementation task so SPEC-V05-005 can call into it.
- 2026-05-02 (pm): Added REQ-V05-012 (fresh-surface starter, EARS event-driven form) to `requirements.md` and wrote the T-V05-002 deliverable `specs/version-0-5-plan/package-contract.md` (PKG-CONTRACT-V05-001, status `draft`). Package name committed to `@luis85/agentic-workflow` (GitHub login confirmed `Luis85` from README + product page URL). Three open questions logged in the contract (OQ-V05-001 visibility confirmation, OQ-V05-002 final `package.json#files` glob, OQ-V05-003 manual stub-form packaging step until T-V05-012 lands). Resolves CLAR-V05-002 (package type, name, scope, contents). **Hand-off to orchestrator:** broadened T-V05-002 + added T-V05-012 in `tasks.md`; ready for verify + commit per concern + push.

## Open clarifications

- [ ] CLAR-V05-001 — Confirm whether v0.5 should keep Shape A with `release/vX.Y.Z` branches or adopt Shape B with a permanent `develop` branch. *(Resolved on PR #156 by ADR-0020; will surface as resolved here once #156 merges.)*
- [ ] CLAR-V05-003 — Confirm whether the first publish should be draft/pre-release only before a stable GitHub Release and package are published.

## Resolved clarifications

- [x] CLAR-V05-002 — 2026-05-02 (pm): GitHub Packages npm registry; package name `@luis85/agentic-workflow`; visibility public (subject to OQ-V05-001 repo-visibility confirmation); contents per `package-contract.md` §3 (include) and §4 (exclude), encoding ADR-0021 fresh-surface rules.
