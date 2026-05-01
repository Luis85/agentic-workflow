---
id: IMPL-LOG-V05-001
title: Version 0.5 release and distribution plan — Implementation log
stage: implementation
feature: version-0-5-plan
status: in-progress
owner: dev
inputs:
  - SPECDOC-V05-001
  - TASKS-V05-001
created: 2026-05-02
updated: 2026-05-02
---

# Implementation log — Version 0.5 release and distribution plan

A running record of *what* was implemented, *why* a deviation was taken, and *what* was learned. Append-only during implementation; no rewriting history.

## Entries

### 2026-05-02 — T-V05-001 — Decide release branch strategy

- **Files changed:** `docs/adr/0020-v05-release-branch-strategy.md` (new); `docs/adr/README.md`; `docs/branching.md`
- **Commit:** *(staged together with T-V05-003 in PR #156; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-001 (REQ-V05-001, NFR-V05-002)
- **Owner:** architect
- **Outcome:** done
- **Deviation from spec:** none
- **Notes:** Adopted Shape A with explicit `release/vX.Y.Z` branches; `main` remains the canonical release source and tag origin; `develop` is not introduced. Resolves CLAR-V05-001. ADR-0020 captures the decision; `docs/branching.md` updated to name the release branch shape, promotion path, tag source, and cleanup rules.

### 2026-05-02 — T-V05-003 — Add `.github/release.yml` for generated release notes

- **Files changed:** `.github/release.yml` (new)
- **Commit:** *(staged together with T-V05-001 in PR #156; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-003 (REQ-V05-003, REQ-V05-004)
- **Owner:** dev
- **Outcome:** done
- **Deviation from spec:** none
- **Notes:** Configured GitHub's auto-generated release notes for the v0.5 manual release workflow. Categories (top-down): Breaking Changes, Features, Bug Fixes, Documentation, Performance, Refactor, Tests, Build & CI, Reverts, Chores & Dependencies, Other Changes (catch-all `labels: ['*']`). Category labels map onto the Conventional-Commit types enforced by `.github/workflows/pr-title.yml`. `changelog.exclude.labels` covers `release`, `chore-release`, and `skip-changelog` so release-prep PRs don't show up in their own notes. `changelog.exclude.authors` filters `dependabot` and `github-actions` (both bare and `[bot]` forms); the file's leading comment notes that operational-bot author handles can be added once verified. YAML validated locally (parses to 11 categories + 3 excluded labels). The release workflow itself lands in T-V05-006; this PR only configures the notes.

## Pull request grouping

PR #156 (`feat/v05-branch-strategy-and-release-notes`) stages two tasks together because they share a thin surface area (release branching decision + the release-notes config consumed by the future release workflow) and neither needs the other to merge first. Per-task entries above record the file paths, owners, and traceability separately so the grouping does not blur task boundaries.

## Deviations summary

> Any deviation from spec must be listed here, with link to ADR if material.

| Date | Task | Deviation | Reason | ADR |
|---|---|---|---|---|
| — | — | none | — | — |

## Quality gate

- [ ] All tasks accounted for (done, partial, blocked, or dropped).
- [ ] Implementation matches the spec; any deviation is logged with rationale (and ADR if material).
- [ ] No unrelated changes ("scope creep") in any task entry.
- [ ] Lint, type checks, unit tests green for the changed surface.
- [ ] Commits reference task IDs.
