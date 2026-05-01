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

> **Status: in-progress draft.** Substantive editing has begun. Sections that depend on still-open tasks (T-V04-006 qa tests, T-V04-010 product page, T-V04-011 release readiness, T-V04-012 v0.5 handoff) remain marked TODO and will be finished by their owners before the release ships. Issue #89 tracks state.

## Summary

v0.4 promotes the v0.3 hard-fail validators into a required PR CI quality gate. Every pull request and every push to `main` now runs the full `npm run verify` composite on a fresh `npm ci` checkout — the same command contributors run locally, so any CI failure reproduces 1:1 on a developer machine (CI ≡ local). The release also adds a stage-aware workflow metrics report with optional trend snapshots and a machine-readable JSON output that v0.5 release-readiness can consume without re-implementing metric collection, plus a five-level evidence-backed maturity model surfaced in both the rendered metrics report and the JSON. v0.4 is non-breaking: no new lifecycle stage, no constitution change, no template / agent / skill / command rename.

## Changes

### New

- **PR CI quality gate** — `.github/workflows/verify.yml` enforces full `npm run verify` on every PR (T-V04-001 / T-V04-002 / T-V04-003, PRs #137 / #138 / #148). Workflow file contract published in `docs/pr-ci-gate.md`.
- **CI readiness checks** — `scripts/lib/doctor.ts` `workflowReadinessChecks` enforces the verify.yml contract markers from `docs/pr-ci-gate.md` §Workflow file contract: trigger keys (`pull_request:`, `push:`), a YAML-parser-backed evaluator that confirms the `push:` trigger covers the `main` branch (handles block-list `- main` and flow-list `[main]` forms equivalently), and verify-job-scoped SHA-pin evaluators for `actions/checkout` + `actions/setup-node` that walk `jobs.verify.steps` so a sibling pinned job cannot mask an unpinned verify-job step (T-V04-004, PR #149).
- **Workflow metrics report** — stage-aware scoring with optional `--save` / `--compare` trend snapshots; `/quality:status` workflow-native command; agent prompt hooks across orchestration / QA / review / release / retrospective / project / roadmap / portfolio (T-V04-005).
- **Metrics interpretation guide** — `docs/quality-metrics.md` documents each metric's meaning, supported decisions, misuse warnings, and typical actions; linked from `docs/quality-framework.md`, `scripts/README.md`, and the `quality-metrics` skill (T-V04-007).
- **Five-level maturity model** — evidence-backed maturity assessment with gaps and next-step guidance, surfaced in both `npm run quality:metrics` rendered output and the JSON output v0.5 release-readiness will consume (T-V04-008).

### Improved

- **Stage-aware quality scoring.** `scripts/lib/quality-metrics.ts` excludes future-stage evidence from the current-stage score and renders test / EARS coverage as `not expected yet` for workflows that have not reached the relevant stage. Replaces the previous all-or-nothing artifact gating (T-V04-005).
- **Trend snapshots.** `npm run quality:metrics --save` and `--compare` persist metric runs under `quality/metrics/<scope>/` and report deltas across score, maturity, blockers, clarifications, frontmatter gaps, and QA checklist gaps cycle-over-cycle (T-V04-005).
- **Workflow-native quality reporting.** `/quality:status` is the workflow-native command entry point; orchestration, QA, review, release, retrospective, project, roadmap, and portfolio agent guidance all surface the metrics report at handoff (T-V04-005).
- **Doctor enforces the verify.yml contract locally.** `npm run doctor` now runs the `workflowContracts` readiness checks in `scripts/lib/doctor.ts` against `.github/workflows/verify.yml`, so contract drift surfaces locally before CI rather than landing as a CI surprise (T-V04-004). The executable contract in `scripts/lib/doctor.ts` mirrors the human-readable contract in [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Workflow file contract; keeping the two in sync is a reviewer responsibility, not an automated bind.

### Fixed

- None — v0.4 introduces the PR CI gate, the doctor contract surface, and the stage-aware metrics surface for the first time. Refinements landed during v0.4 development (PR #149 rounds 2 + 3) are captured in the implementation log under T-V04-004; nothing previously released needed correction.

### Deprecated

- None.

### Removed

- None.

## User-visible impact

- **Who is affected:** every contributor whose PRs run through GitHub Actions; every operator running `npm run quality:metrics` or `npm run doctor`; every adopter of this template who copies the workflow / scripts into a downstream project.
- **Action required:** none. CI ≡ local — if `npm run verify` was already part of the pre-PR habit (per [`docs/verify-gate.md`](../../docs/verify-gate.md)), behaviour is unchanged. Contributors who were not running verify locally now see the same exit code and diagnostics in CI; the local-reproduction path is `npm ci && npm run verify`. T-V04-011 will re-confirm no action is required for in-flight PRs at release time.
- **Breaking changes:** none. v0.4 ships only new optional surfaces (the PR CI workflow, the doctor contract extension, the stage-aware metrics report, the maturity assessment); no template, agent, skill, command, or convention is renamed or removed.

## Readiness summary

- **Release readiness guide:** not used. v0.4 ships docs, scripts, and a CI workflow only — no runtime, no users, no migrations, no on-call rotation, no commercial impact, no external announcement that needs sign-off. The per-perspective scaffold in [`templates/release-readiness-guide-template.md`](../../templates/release-readiness-guide-template.md) (UX, security, operations, support, data, commercial, communications) is mostly N/A for a meta-template release. The inline §Readiness summary plus §Quality gate below provides the equivalent decision record. v0.3 set the same precedent.
- **Go / no-go verdict:** **go**. T-V04-011 verification on a fresh `npm ci` checkout of `feat/v04-t011-release-readiness` (cut from `origin/main` at `e6edc07`) was green end-to-end on 2026-05-01.
  - `npm ci` — exit 0 (30 packages, 0 vulnerabilities).
  - `npm test` — exit 0 (165/165 pass).
  - `npm run verify` — exit 0 (`verify: ok` in 20.5s; all bundled checks pass).
  - `npm run quality:metrics` (repo) — exit 0; overall score 91.5%; maturity Level 3 (Traceable); 0 active blockers.
  - `npm run quality:metrics -- --feature=version-0-4-plan` — exit 0; v0.4 stage score 97.1%; 0 open clarifications; CLAR-V04-001 and CLAR-V04-002 both resolved.
  - `npm run doctor` — exit 0; one advisory warning (two merged worktrees not yet pruned: `feat/v04-t006-tests`, `feat/v04-t010-product-page`). Hygiene only; not a release blocker.
- **Required conditions before release ships:**
  - T-V04-009 final cross-check: release-manager re-confirms §Changes against the final list of merged PRs at release time, and flips README.md §Roadmap row v0.4 from "Planned" to "Done" plus the `docs/specorator.md` v0.4 references (per the v0.3 pattern). Tracked in the T-V04-009 closeout note in `workflow-state.md`.
  - T-V04-010 external-announcement disposition: the §Communication external-announcement quality-gate item is paired with T-V04-010, and that task already shipped the `sites/index.html` v0.4 positioning update; the `[ ]` Communication checkbox flips to `[x]` once the release-manager confirms no further external-announcement work is required.
  - T-V04-012 v0.5 handoff: `release-notes.md` §Validation baseline for v0.5 is the canonical handoff input; T-V04-012 documents the consumption contract for v0.5 release-readiness automation.
  - Worktree hygiene: prune the two merged-but-still-registered worktrees flagged by `npm run doctor` before opening the release tag (cosmetic; can also ride on a follow-up PR).
- **Approvals required:** human release-manager sign-off on the T-V04-009 / T-V04-010 / T-V04-012 closures above. No legal, security, or compliance approvals required (no runtime change, no data flow, no third-party surface).

## Known limitations

- **Cross-feature ID references are flagged in narrative artifacts.** `scripts/lib/traceability.ts` `validateIdAreas` flags any traceability ID in an artifact body whose area code differs from the workflow's area. This is correct enforcement — cross-area IDs cross traceability namespaces — but contributors who quote another feature's IDs in `implementation-log.md`, `release-notes.md`, or `retrospective.md` will trip the rule. Use PR numbers, file paths, or prose instead. See [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Cross-feature ID references in narrative.
- **Traceability IDs in fenced code blocks could become a false-positive in future.** `idsIn` matches IDs anywhere in a line, including inside fenced code blocks. No template artifact embeds raw IDs in code today, so the risk is zero; if a future template change introduces raw IDs in a code example, the validator will need a code-block skip. See [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Traceability IDs in fenced code blocks.
- **REQ/NFR → TEST forward-coverage is deferred.** The advisory check that every `REQ-*` / `NFR-*` has at least one covering `TEST-*` is **not** part of v0.4. It is deferred until the test-plan format is locked enough to avoid false positives (CLAR-V03-002 carryover; v0.4-cycle action assigned to analyst). v0.5 should re-evaluate. See [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Deferred.
- **Doctor's substring markers are file-scoped.** The verify-job-scoped SHA-pin evaluators added in T-V04-004 (PR #149) close the bypass path for action references, but the existing substring markers (`actions/checkout`, `cache: npm`, `npm ci`, `npm run verify`) still scan the whole workflow file rather than `jobs.verify.steps`. In practice the SHA-pin evaluator catches the verify-job-empty case (returns false on zero references); tightening the substring markers to verify-job scope is a follow-up beyond v0.4's flagged findings (PR #149 commit 7809347 commit message).

## Verification steps

After pulling v0.4:

1. `npm ci` — installs dependencies with the lockfile.
2. `npm test` (or `npm run test:scripts`) — runs the script test suite.
3. `npm run verify` — full local verify gate. Expect `verify: ok`.
4. `npm run quality:metrics` — repo-wide workflow metrics report (rendered + JSON).
5. `npm run quality:metrics -- --feature=<slug>` — feature-scoped metrics. Note the `--` separator: `npm run quality:metrics --feature=<slug>` (without `--`) is silently swallowed by the npm CLI and the script falls back to repo-wide scope. Use `tsx scripts/quality-metrics.ts --feature=<slug>` if invoking the script directly.
6. `npm run doctor` — local environment + CI readiness checks. Includes the verify.yml workflow contract (trigger keys, push-covers-main, verify-job-scoped SHA-pin), branch readiness, and worktree hygiene.

## Rollback plan

- **Trigger criteria:** PR CI gate emits false-positive diagnostics that block legitimate PRs across multiple specs, or `quality:metrics` output destabilises decision-making.
- **Mechanism:** revert the offending PR (`git revert <merge-sha>` then PR through `main`). The CI gate logic lives in `.github/workflows/verify.yml`, `scripts/lib/doctor.ts`, and `scripts/lib/quality-metrics.ts`; reverts are surgical.
- **Data implications:** none. v0.4 ships no runtime, no migrations, no persisted state.
- **Communication:** post in the project channel and update the v0.4 issue (#89) with the revert SHA and reason.

## Observability

- Not applicable. v0.4 ships no runtime services. The "telemetry" of v0.4 is `npm run verify` exit code, `npm run quality:metrics` output (rendered + JSON), and CI job status on each PR.

## Communication

- **Internal announcement:** issue #89 (the v0.4 tracking issue) closes when this release ships and gets a final comment summarizing what landed.
- **External announcement:** `sites/index.html` updated in T-V04-010: §Quality gates feature card now states `npm run verify` runs locally and as required PR CI (CI ≡ local), and a new §Workflow metrics & maturity card calls out `npm run quality:metrics` with stage-aware scoring, trend snapshots, and the five-level maturity assessment. No new sections; positioning thesis (specs first, traceable, agent-specialised) unchanged.
- **Support / docs updates:** `docs/pr-ci-gate.md` (new), `docs/quality-metrics.md` (new), `docs/quality-framework.md` (cross-link added).

## Validation baseline for v0.5

This subsection feeds T-V04-012 (v0.5 release-quality handoff). v0.5 release-readiness should consume the JSON / exit-code surfaces below rather than re-implement metric collection (per SPEC-V04-008).

- **`npm run quality:metrics` JSON output** — score, five-level maturity assessment with evidence / gaps / next-step guidance, blocker count, open-clarification count, frontmatter / QA checklist gap counts, optional trend deltas when a prior `--save` snapshot exists. Documented in [`docs/quality-metrics.md`](../../docs/quality-metrics.md).
- **`npm run quality:metrics --save` snapshots** — each run persists state under `quality/metrics/<scope>/`. Together with `--compare` this gives v0.5 a cycle-over-cycle drift signal.
- **`npm run doctor` exit code** — covers the verify.yml workflow contract (trigger keys, push-covers-main, verify-job-scoped SHA-pin), dependency readiness, branch readiness, and worktree hygiene. Documented in [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Workflow file contract.
- **`npm run verify` exit code** — the canonical PR CI gate; CI ≡ local. Documented in [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Required gate.
- **Deferred CLAR-V03-002** — the REQ/NFR → TEST forward-coverage check is **not** part of the v0.4 baseline (see §Known limitations). Re-evaluation is a v0.5-cycle decision; v0.5 should confirm whether to promote, keep deferred, or drop based on the test-plan format lock outcome.

---

## Quality gate

- [x] Summary written for the audience (users / stakeholders, not engineers).
- [x] User-visible impact stated.
- [x] Readiness conditions and approvals summarized, or guide marked not used.
- [x] Known limitations disclosed.
- [x] Verification steps documented (T-V04-011 may add more).
- [x] Rollback plan documented.
- [x] Observability hooks in place (or correctly marked N/A).
- [x] Communication plan ready. *(T-V04-010: `sites/index.html` lift landed; external decision recorded above.)*
