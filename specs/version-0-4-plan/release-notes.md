---
id: RELEASE-V04-001
title: Version 0.4 release plan — Release notes
stage: release
feature: version-0-4-plan
version: v0.4.0
status: draft
owner: release-manager
inputs:
  - PRD-V04-001
  - SPECDOC-V04-001
  - TASKS-V04-001
created: 2026-05-01
updated: 2026-05-01
---

# Release notes — v0.4 (CI quality gates, metrics, maturity model)

> **Status: starter draft.** This file is a starter created to unblock T-V04-009. Sections marked **TODO** need to be filled by the release-manager once the remaining tasks (T-V04-006 qa tests, T-V04-010 product page, T-V04-011 release readiness, T-V04-012 v0.5 handoff) land. Issue #89 tracks state.

## Summary

TODO — one paragraph for end users / stakeholders. Recommended frame: v0.4 promotes the v0.3 hard-fail validators into a required PR CI quality gate (full `npm run verify` runs on every PR — CI ≡ local), adds a workflow metrics report with stage-aware scoring + trend snapshots + machine-readable JSON for v0.5 release-readiness consumption, and ships a five-level evidence-backed maturity model. Non-breaking; no new lifecycle stage; no constitution change.

## Changes

### New

- **PR CI quality gate** — `.github/workflows/verify.yml` enforces full `npm run verify` on every PR (T-V04-001 / T-V04-002 / T-V04-003, PRs #137 / #138 / #148). Workflow file contract published in `docs/pr-ci-gate.md`.
- **CI readiness checks** — `scripts/lib/doctor.ts` `workflowReadinessChecks` enforces the verify.yml contract markers: `pull_request:` trigger, `- main` push branch, SHA-pinned `actions/checkout` + `actions/setup-node` (T-V04-004, PR #149).
- **Workflow metrics report** — stage-aware scoring with optional `--save` / `--compare` trend snapshots; `/quality:status` workflow-native command; agent prompt hooks across orchestration / QA / review / release / retrospective / project / roadmap / portfolio (T-V04-005).
- **Metrics interpretation guide** — `docs/quality-metrics.md` documents each metric's meaning, supported decisions, misuse warnings, and typical actions; linked from `docs/quality-framework.md`, `scripts/README.md`, and the `quality-metrics` skill (T-V04-007).
- **Five-level maturity model** — evidence-backed maturity assessment with gaps and next-step guidance, surfaced in both `npm run quality:metrics` rendered output and the JSON output v0.5 release-readiness will consume (T-V04-008).

### Improved

- TODO — fill once T-V04-006 (qa tests) and T-V04-011 (release readiness) verify the cross-cutting impact.

### Fixed

- TODO.

### Deprecated

- None expected.

### Removed

- None expected.

## User-visible impact

- **Who is affected:** TODO — every contributor whose PRs run through GitHub Actions; every operator running `npm run quality:metrics`.
- **Action required:** TODO — confirm in T-V04-011 whether existing PRs need any change (expected: none, since CI ≡ local).
- **Breaking changes:** TODO — none expected at the workflow / template level; the PR CI gate is the formalisation of `npm run verify` which contributors already run locally.

## Readiness summary

- Release readiness guide: TODO — decide in T-V04-011 whether to use a separate `release-readiness-guide.md`.
- Go/no-go verdict: TODO (lands in T-V04-011).
- Required conditions or approvals: TODO.

## Known limitations

- TODO — surface the false-positive risks documented in `docs/pr-ci-gate.md` §False-positive guidance: cross-feature ID rule (correct enforcement; phrase via PR numbers / file paths / prose) and IDs-in-fenced-code (zero today; future-template risk).
- TODO — note that the REQ/NFR → TEST forward-coverage check is **deferred** to v0.5 (CLAR-V03-002 carryover; gated on test-plan format lock).

## Verification steps

After pulling v0.4:

1. `npm ci` — installs dependencies with the lockfile.
2. `npm test` (or `npm run test:scripts`) — runs the script test suite.
3. `npm run verify` — full local verify gate. Expect `verify: ok`.
4. `npm run quality:metrics` — workflow metrics report (rendered + JSON).
5. `npm run doctor` — local environment + CI readiness checks.
6. TODO — additional steps once T-V04-011 lands.

## Rollback plan

- **Trigger criteria:** PR CI gate emits false-positive diagnostics that block legitimate PRs across multiple specs, or `quality:metrics` output destabilises decision-making.
- **Mechanism:** revert the offending PR (`git revert <merge-sha>` then PR through `main`). The CI gate logic lives in `.github/workflows/verify.yml`, `scripts/lib/doctor.ts`, and `scripts/lib/quality-metrics.ts`; reverts are surgical.
- **Data implications:** none. v0.4 ships no runtime, no migrations, no persisted state.
- **Communication:** post in the project channel and update the v0.4 issue (#89) with the revert SHA and reason.

## Observability

- Not applicable. v0.4 ships no runtime services. The "telemetry" of v0.4 is `npm run verify` exit code, `npm run quality:metrics` output (rendered + JSON), and CI job status on each PR.

## Communication

- **Internal announcement:** issue #89 (the v0.4 tracking issue) closes when this release ships and gets a final comment summarizing what landed.
- **External announcement:** TODO — confirm in T-V04-010 whether `sites/index.html` needs a v0.4 pivot (CI gates / metrics positioning).
- **Support / docs updates:** `docs/pr-ci-gate.md` (new), `docs/quality-metrics.md` (new), `docs/quality-framework.md` (cross-link added).

## Validation baseline for v0.5

This subsection feeds T-V04-012 (v0.5 release-quality handoff).

- TODO — list machine-readable quality signals v0.5 should consume before GitHub Release / Package publication. Source list:
  - `npm run quality:metrics` JSON output (score, maturity assessment, trend deltas).
  - `npm run quality:metrics --save` snapshots under `quality/metrics/<scope>/`.
  - `npm run doctor` CI readiness check exit code.
- TODO — confirm whether the deferred CLAR-V03-002 advisory check (REQ/NFR → TEST forward coverage) lands as a v0.5 hard-fail gate or is deferred again.

---

## Quality gate

- [ ] Summary written for the audience (users / stakeholders, not engineers).
- [ ] User-visible impact stated.
- [ ] Readiness conditions and approvals summarized, or guide marked not used.
- [ ] Known limitations disclosed.
- [ ] Verification steps documented.
- [ ] Rollback plan documented.
- [ ] Observability hooks in place.
- [ ] Communication plan ready.
