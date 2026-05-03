---
id: RTM-V05-001
title: Version 0.5 release and distribution plan — Traceability matrix
stage: review
feature: version-0-5-plan
status: complete
owner: reviewer
inputs:
  - PRD-V05-001
  - SPECDOC-V05-001
  - TASKS-V05-001
  - IMPL-LOG-V05-001
  - TESTREPORT-V05-001
  - REVIEW-V05-001
  - PKG-CONTRACT-V05-001
generated: 2026-05-02 14:06
---

# Traceability matrix — Version 0.5 release and distribution plan

Regenerable from artifact frontmatter (`PRD-V05-001`, `DESIGN-V05-001`, `SPECDOC-V05-001`, `TASKS-V05-001`, `IMPL-LOG-V05-001`, `TESTPLAN-V05-001`, `TESTREPORT-V05-001`, `REVIEW-V05-001`, `PKG-CONTRACT-V05-001`) and the marked-up per-item entries (REQ / SPEC / T / TEST IDs and `Satisfies:` cross-links).

## Forward chain — functional requirements

| REQ | Spec | Tasks | Code | Tests | Status |
|---|---|---|---|---|---|
| REQ-V05-001 | SPEC-V05-001 | T-V05-001 | [`docs/branching.md`](../../docs/branching.md), [`docs/adr/0020-v05-release-branch-strategy.md`](../../docs/adr/0020-v05-release-branch-strategy.md) | TEST-V05-001 | accepted (doc review pass) |
| REQ-V05-002 | SPEC-V05-002 | T-V05-006, T-V05-010 | `.github/workflows/release.yml:17–48`, `:62–64`, `:160–169` | TEST-V05-002, TEST-V05-002-NFR | passing (deterministic) |
| REQ-V05-003 | SPEC-V05-003 | T-V05-003, T-V05-006, T-V05-010 | `.github/release.yml`, `.github/workflows/release.yml:170–218` | TEST-V05-003 | passing (local); live dispatch deferred |
| REQ-V05-004 | SPEC-V05-003 | T-V05-003 | `.github/release.yml` | TEST-V05-004 | passing |
| REQ-V05-005 | SPEC-V05-004, SPEC-V05-010 | T-V05-002, T-V05-007, T-V05-011, T-V05-012, T-V05-013 | [`specs/version-0-5-plan/package-contract.md`](package-contract.md), [`docs/adr/0021-release-package-fresh-surface.md`](../../docs/adr/0021-release-package-fresh-surface.md), `package.json`, `scripts/lib/release-package-contract.ts`, `scripts/lib/release-archive-builder.ts`, `scripts/lib/release-stubify.ts` | TEST-V05-005, TEST-V05-012 | passing |
| REQ-V05-006 | SPEC-V05-004 | T-V05-007, T-V05-011 | `.github/workflows/release.yml:220–286` | TEST-V05-006 | deferred to live publish (Article IX) |
| REQ-V05-007 | SPEC-V05-005 | T-V05-004, T-V05-005, T-V05-011 | `scripts/check-release-readiness.ts`, `scripts/lib/release-readiness.ts` | TEST-V05-007 | passing (26 unit tests) |
| REQ-V05-008 | SPEC-V05-006 | T-V05-008, T-V05-010, T-V05-011 | [`docs/release-operator-guide.md`](../../docs/release-operator-guide.md) | TEST-V05-008 | passing |
| REQ-V05-009 | SPEC-V05-007 | T-V05-009, T-V05-011 | [`README.md`](../../README.md), [`docs/specorator.md`](../../docs/specorator.md), [`docs/release-package-contents.md`](../../docs/release-package-contents.md), `sites/index.html` | TEST-V05-009 | passing |
| REQ-V05-010 | SPEC-V05-008 | T-V05-004, T-V05-008, T-V05-010, T-V05-011 | `scripts/lib/release-readiness.ts` quality-signal layer | TEST-V05-010 | passing |
| REQ-V05-011 | SPEC-V05-009 | T-V05-006, T-V05-008, T-V05-010, T-V05-011 | `.github/workflows/release.yml:24–28` (`dry_run: true` default), `:198–218` (dry-run preview) | TEST-V05-011 | passing (local); remote dispatch deferred |
| REQ-V05-012 | SPEC-V05-010 | T-V05-002, T-V05-004, T-V05-006, T-V05-012, T-V05-013 | `scripts/build-release-archive.ts`, `scripts/lib/release-archive-builder.ts`, `scripts/lib/release-stubify.ts`, `scripts/lib/release-package-contract.ts`, `scripts/release-prepack-guard.mjs`, `scripts/lib/release-staging-safety.ts`, `.github/workflows/release.yml:127–155` | TEST-V05-012 | passing (resolved 2026-05-02 via T-V05-013) |

## Forward chain — non-functional requirements

| NFR | Spec | Tasks | Code | Tests | Status |
|---|---|---|---|---|---|
| NFR-V05-001 (least-privilege) | SPEC-V05-002, SPEC-V05-004 | T-V05-006, T-V05-007 | `.github/workflows/release.yml:62–64`, `scripts/lib/release-readiness.ts` (workflow-permissions check) | TEST-V05-002-NFR | passing |
| NFR-V05-002 (reproducibility) | SPEC-V05-001, SPEC-V05-003, SPEC-V05-004, SPEC-V05-010 | T-V05-001, T-V05-002, T-V05-007, T-V05-012, T-V05-013 | All v0.5 surfaces (single `vX.Y.Z` resolves tag + Release + package version + asset) | (covered through REQ tests) | passing |
| NFR-V05-003 (maintainability) | SPEC-V05-005 | T-V05-004, T-V05-005, T-V05-012 | TypeScript scripts under `scripts/`, tests under `tests/scripts/`, `tools/automation-registry.yml`, `docs/scripts/` (typedoc) | (`npm run verify`) | passing — 18 / 18 gates |
| NFR-V05-004 (operator usability) | SPEC-V05-006, SPEC-V05-008, SPEC-V05-009 | T-V05-008, T-V05-010, T-V05-011 | `docs/release-operator-guide.md` (11 sections, 6-input table, 6-scenario recovery) | TEST-V05-008, TEST-V05-005-NFR | passing |
| NFR-V05-005 (recoverability) | SPEC-V05-006, SPEC-V05-009 | T-V05-006, T-V05-007, T-V05-008, T-V05-013 | `.github/workflows/release.yml:269–286` (npm view exit-code branch), `:288–299` (`gh release upload --clobber`), `docs/release-operator-guide.md` §7 | TEST-V05-005-NFR | passing |

## Reverse coverage — orphan checks

### Orphan tests (tests without a REQ ID)

- — none —

Every TEST-V05-* maps explicitly to one or more REQ-V05-* / NFR-V05-* per `spec.md` lines 90–101 and `test-plan.md` §3 + `test-plan.md` "Additional coverage rows" table.

### Orphan tasks (tasks without a REQ / SPEC ID)

- — none —

Every T-V05-* in `tasks.md` carries a `Satisfies:` field listing one or more REQ / SPEC / NFR IDs. Cross-checked against `tasks.md` body.

### Orphan ADRs (decisions without a triggering artifact)

- — none —

ADR-0020 (release branch strategy, `accepted`) → triggered by REQ-V05-001 / SPEC-V05-001 / T-V05-001.
ADR-0021 (release-package fresh-surface, `accepted`) → triggered by Article X iteration; declared upstream of REQ-V05-012 / SPEC-V05-010 / T-V05-002 / T-V05-012 / T-V05-013.

### Orphan code surfaces (code without an upstream task)

- — none —

Spot-checked the new code surfaces from the v0.5 PR sequence:

| Code surface | Upstream task |
|---|---|
| `scripts/check-release-readiness.ts` | T-V05-004 |
| `scripts/lib/release-readiness.ts` | T-V05-004 |
| `scripts/check-release-package-contents.ts` | T-V05-012 |
| `scripts/lib/release-package-contract.ts` | T-V05-012 |
| `scripts/build-release-archive.ts` | T-V05-013 |
| `scripts/lib/release-archive-builder.ts` | T-V05-013 |
| `scripts/lib/release-stubify.ts` | T-V05-013 |
| `scripts/lib/release-staging-safety.ts` | T-V05-013 (round-2) |
| `scripts/release-prepack-guard.mjs` | T-V05-013 (round-2) |
| `.github/workflows/release.yml` | T-V05-006 + T-V05-007 + T-V05-013 |
| `.github/release.yml` | T-V05-003 |
| `templates/release-package-stub.md` | REQ-V05-012 / Article X iteration |
| `docs/adr/0020-*.md`, `docs/adr/0021-*.md` | T-V05-001 / Article X iteration |
| `docs/release-operator-guide.md` | T-V05-008 |
| `docs/release-package-contents.md` | Article X iteration / REQ-V05-012 |

### Orphan findings (findings without a referent)

- — none —

Every finding in `review.md` (R-V05-001 through R-V05-005) is anchored to a specific artifact reference (file:line, REQ ID, or process artefact).

## Forward chain — review findings

| Finding | Severity | Anchored to | Status |
|---|---|---|---|
| R-V05-001 | medium | `scripts/quality-metrics.ts` (tooling) | scheduled-fix (post-v0.5) |
| R-V05-002 | low | TEST-V05-006 / `test-report.md` §10 | accepted-as-is |
| R-V05-003 | low | PR #202 review-fix loop length | scheduled-fix (in retro) |
| R-V05-004 | low | `requirements.md` REQ-V05-012 wording | accepted-as-is |
| R-V05-005 | low | `package-contract.md` frontmatter `status: draft` | scheduled-fix (during release prep) |

## Coverage summary

| Bucket | Total | Covered | % |
|---|---|---|---|
| Functional REQs | 12 | 12 (10 fully passing locally, 2 deferred to live publish) | 100% |
| NFRs | 5 | 5 | 100% |
| EARS clauses with explicit TEST | 12 / 12 functional | 12 | 100% |
| Edge cases (SPEC-V05-010 §Edge cases) | 4 | 4 (each defended by a code path or maintenance rule) | 100% |
| Quality metrics `requirementCoverage` | 17 | 17 | 100% |
| Quality metrics `earsCoverage` | (per metric) | (per metric) | 100% |

The `docs/quality-framework.md` bar is met: every functional REQ has a downstream chain through Spec → Tasks → Code → Tests; the two REQs whose live verification is deferred to operator-authorised infrastructure (REQ-V05-006, REQ-V05-011 remote-dispatch path) carry explicit closure paths in `test-report.md` §10 and `review.md` §Recommendation.

## Open items blocking review

- — none from the agent-tractable surface —

The two remaining items are by design Decider-owned (Article IX) and are not review blockers; they are release prerequisites:

- [ ] CLAR-V05-003 — Decider chooses draft+prerelease vs stable for the first v0.5 publish.
- [ ] Operator-authorised `gh workflow run release.yml --ref main -f version=0.5.0 -f dry_run=true …` exercise on `main` after PR sequence is merged, `v0.5.0` tag is cut, and `CHANGELOG.md` heading is promoted.

## Provenance

- Generated 2026-05-02 14:06 UTC by `reviewer` agent in worktree `D:/Projects/agentic-workflow/.worktrees/v05-stage-9` on branch `review/v05-stage-9` (cut at `origin/main` SHA `302c4a6`).
- Cross-checked against `npm run quality:metrics -- --feature version-0-5-plan --json` (overallScore 97.1, maturity level 3, 0 blockers, 1 open clarification — CLAR-V05-003).
- 94 / 94 v0.5 release-surface tests pass on this branch (`npx tsx --test tests/scripts/release-archive-builder.test.ts tests/scripts/release-stubify.test.ts tests/scripts/release-staging-safety.test.ts tests/scripts/release-prepack-guard.test.ts tests/scripts/release-package-contract.test.ts tests/scripts/release-readiness.test.ts`).

---

## Quality gate

- [x] Every REQ row has all downstream cells filled or marked as accepted gap (with closure path documented).
- [x] No orphan tests / tasks / ADRs / code surfaces / findings.
- [x] Coverage summary shows the bar set in `docs/quality-framework.md` is met (100% functional / NFR / EARS / edge case).
