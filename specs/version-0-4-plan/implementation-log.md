---
id: IMPL-LOG-V04-001
title: Version 0.4 implementation log
stage: implementation
feature: version-0-4-plan
status: in-progress
owner: dev
inputs:
  - TASKS-V04-001
created: 2026-04-28
updated: 2026-05-01
---

# Implementation log - Version 0.4

## Task T-V04-001 - v0.3 validation baseline confirmation

Source: `specs/version-0-3-plan/release-notes.md` §Validation baseline for v0.4. Each
candidate v0.3 hard-fail or advisory check is classified below as **required**, **advisory**,
or **deferred** for promotion into PR CI in T-V04-003. Each row documents v0.3 source, local
reproduction command, and false-positive decision (per SPEC-V04-007 acceptance).

Resolves CLAR-V04-001.

### Classification

| # | Check | v0.3 source | Local repro | Class | False-positive decision |
|---|---|---|---|---|---|
| 1 | Workflow-state frontmatter consistency (`scripts/lib/spec-state.ts`) | §Validation baseline, hard-fail #1 | `npm run check:specs` | required | Deterministic frontmatter parse; backed by 24 characterization tests. No known false-positive path. |
| 2 | Stage-progress table consistency (`scripts/lib/spec-state.ts`) | §Validation baseline, hard-fail #2 | `npm run check:specs` | required | Same library; mirrors frontmatter status. No known false-positive path. |
| 3 | Skipped-artifact documentation under `## Skips` (v0.3 PR #95) | §Validation baseline, hard-fail #3 | `npm run check:specs` | required | Caught the v0.3 plan's own skip gap (v0.3 PR #112) — real signal. v0.4 retrospective filed an action for the §Notes-on-meta-features template clarification (analyst, due 2026-06-01); does not block CI promotion. |
| 4 | Examples folders contain `workflow-state.md` (v0.3 PR #101) | §Validation baseline, hard-fail #4 | `npm run check:specs` | required | Deterministic file-presence check. No known false-positive path. |
| 5 | `TEST-*` references back to `REQ-*`/`NFR-*` in its definition source (v0.3 PR #107) | §Validation baseline, hard-fail #5 | `npm run check:traceability` | required | Caught 14 pre-existing trace gaps in `examples/cli-todo/` during v0.3. Known risk: `idsIn` matches IDs anywhere in a line including fenced code blocks; today no artifact embeds raw IDs in code, so risk is zero. If a future template embeds IDs in code, the validator will need a code-block skip. Document the risk in CI gate contract; not a CI promotion blocker. |
| 6 | Traceability ID format, area mismatch, duplicate ID, unknown reference, invalid reference kind, and missing `Satisfies` field (`scripts/lib/traceability.ts`) | §Validation baseline, hard-fail #6 | `npm run check:traceability` | required | Single library, 23 characterization tests, surfaced a P1 dropped-error bug in v0.3 (v0.3 PR #94 fix). High-confidence promotion. **Discovered during T-V04-001 authoring:** the area-mismatch sub-rule (`validateIdAreas`) flags any traceability ID in the body whose area code differs from the workflow's area. Cross-feature narrative references in `implementation-log.md` (e.g. quoting v0.3 task or retro IDs from v0.4 work) trigger the rule. This is correct enforcement — cross-area IDs cross traceability namespaces — but contributors should phrase cross-feature mentions via PR numbers or file paths, not via raw IDs. CI gate contract should note this. |
| 7 | Every `REQ-*`/`NFR-*` has at least one covering `TEST-*` | §Validation baseline, advisory deferred (v0.3 CLAR-V03-002) | (no validator yet) | deferred | Not implemented in v0.3. Deferred until test-plan format is locked enough to avoid false positives. Re-evaluate as a v0.4 cycle action filed in v0.3 retrospective (analyst, due v0.4 cycle); decision to be tracked separately from this baseline confirmation. |

### Outcome

- 6 of 7 baseline candidates promote to **required** PR CI gates (rows 1-6).
- 1 remains **deferred** (row 7) pending the test-plan format lock decision (v0.3 retrospective action).
- No baseline check is downgraded to **advisory**. The v0.3 hard-fail set held under v0.3's own use; nothing produced noise (per v0.3 retrospective §Process observations: "Quality gates that produced noise — None.").
- Other `npm run verify` checks beyond the v0.3 baseline (`check:links`, `check:agents`, `check:frontmatter`, `check:obsidian`, `check:product-page`, `check:script-docs`, `check:workflow-docs`, `check:roadmaps`, `check:automation-registry`, `check:adr-index`, `check:commands`, `check:token-budget`, `typecheck:scripts`, `test:scripts`) are out of scope for T-V04-001 (REQ-V04-008 narrows v0.4 to the v0.3 baseline). T-V04-002 (architect — CI gate contract) decides whether to expand the contract beyond the baseline.

### Handoff to T-V04-002

The architect authoring `T-V04-002` should:
1. Read this section as the canonical input list.
2. Decide whether the CI workflow runs the broader `npm run verify` set or only the 6 required baseline checks. Recommend full `npm run verify` to keep CI ≡ local (REQ-V04-002), with the 6 baseline checks called out as the v0.3 promotion record (SPEC-V04-007).
3. Document the false-positive risk for row 5 (`idsIn` and code blocks) in the CI gate contract.
4. Carry the deferred row 7 forward into the gate contract's "advisory / deferred" section so the deferral is visible to contributors.

## Task T-V04-002 - PR CI gate contract

Authored `docs/pr-ci-gate.md` as the architecture output. Companion to `docs/verify-gate.md` (local) and `docs/ci-automation.md` (PR hygiene).

Decisions taken:

- **Run full `npm run verify` on PR.** CI ≡ local (REQ-V04-002). The 6 v0.3 baseline checks are called out as the v0.3 promotion record (SPEC-V04-007); the remaining 11 checks bundled by `verify` are also blocking because each is independently deterministic and low-noise (NFR-V04-001).
- **No advisory tier in v0.4.** Reserved for future deferred items.
- **One deferred check.** Row 7 (every `REQ-*`/`NFR-*` covered by a `TEST-*`) carried forward; re-evaluation gated on test-plan format lock decision.
- **False-positive guidance.** Documents the cross-feature ID rule (correct enforcement; phrase via PR numbers / file paths / prose) and the IDs-in-fenced-code risk (zero today; action only if a future template change introduces it).
- **Workflow file contract.** Specifies trigger (`pull_request` + `push: main`), runner (`ubuntu-latest`), required steps (`actions/checkout` SHA-pinned, `actions/setup-node` for Node 20, `npm ci`, `npm run verify`), concurrency, and least-privilege permissions. T-V04-003 implements; T-V04-004 verifies.
- **CLAR-V04-002 disposition.** Scheduled health reporting deferred to v0.5 or later. Rationale: PRD non-goals exclude telemetry / dashboards; v0.4 produces machine-readable signals (T-V04-005 + T-V04-012) that v0.5 can consume from a scheduled job.

Resolves CLAR-V04-002.

### Handoff to T-V04-003 / T-V04-004

- **T-V04-003 (dev — `.github/workflows/verify.yml`)** — author the workflow per `docs/pr-ci-gate.md` §Workflow file contract. SHA-pin actions per `docs/security-ci.md`. Single PR.
- **T-V04-004 (dev — extend doctor)** — extend `scripts/doctor.ts` with a check that asserts the workflow file's presence and the markers listed in §Workflow file contract. Add focused tests under `tests/scripts/`. Depends on T-V04-003 landing.

## Task T-V04-003 - PR CI quality gate

`.github/workflows/verify.yml` already existed in the repository before T-V04-002 contract authorship; it was authored alongside earlier CI hardening (`2a56ce8 chore: add JavaScript integrity checks`) and tightened over time (`d322108 chore(ci): bump GitHub Actions to Node 24-compatible majors`, `f4335ab chore(ci): pin all action references to commit SHA`, `3a701c9 ci: resolve code scanning workflow alerts`). This task confirms the existing workflow satisfies the §Workflow file contract published in T-V04-002 and reconciles two intentional drifts back into the contract.

### Workflow file vs §Workflow file contract

| Slot | Required | Existing `.github/workflows/verify.yml` | Status |
|---|---|---|---|
| Trigger | `pull_request` (any branch) and `push: branches: [main]` | `pull_request:` + `push: branches: [main]` | satisfied |
| Runner | `ubuntu-latest` | `ubuntu-latest` | satisfied |
| Step 1 | `actions/checkout@<SHA>` (SHA-pinned) | `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2` | satisfied |
| Step 2 | `actions/setup-node@<SHA>` with Node 24 | `actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0` with `node-version: 24` and `cache: npm` | satisfied |
| Step 3 | `npm ci` | `npm ci` | satisfied |
| Step 4 | `npm run verify` | `npm run verify` | satisfied |
| Concurrency | `cancel-in-progress: true`, group keyed per workflow + PR-or-ref | `${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}`, `cancel-in-progress: true` | satisfied |
| Permissions | `contents: read` | `contents: read` | satisfied |

### Reconciliation back into the contract

T-V04-002 was authored without reading the existing workflow, so it specified two values that diverged from what already shipped. Both existing values are intentional and better; this task updates `docs/pr-ci-gate.md` rather than the workflow:

- **Node version.** Contract said Node 20; existing workflow uses Node 24 from PR #38 (`d322108 chore(ci): bump GitHub Actions to Node 24-compatible majors`). Node 24 is the project's current target. Contract updated to Node 24.
- **Concurrency expression.** Contract said `verify-${{ github.ref }}`; existing workflow uses `${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}`. The existing form scopes PR runs (keyed by PR number) separately from branch runs (keyed by ref), so a force-push to a branch only cancels its own in-flight runs and a PR push only cancels prior runs of the same PR. Contract updated to describe the existing pattern.

Neither change widens the contract's intent (a single-job, single-composite, fail-fast PR gate) or weakens the markers T-V04-004 will codify in `npm run doctor`: workflow file presence, trigger contains `pull_request` + `push: main`, steps include `npm ci` + `npm run verify`, `actions/checkout` and `actions/setup-node` SHA-pinned. Node version and concurrency-group shape are deliberately not in T-V04-004's marker set.

Resolves SPEC-V04-001 (PR CI gate). Satisfies REQ-V04-001 (PR CI gates), REQ-V04-002 (preserve local-first), NFR-V04-001 (deterministic, low-noise).

### Verification

- `npm run verify` (full composite, run from worktree against repo root)
- Manual cross-check of `.github/workflows/verify.yml` against `docs/pr-ci-gate.md` §Workflow file contract

### Handoff to T-V04-004

The contract is now aligned with the shipped workflow. T-V04-004 (dev — extend `scripts/doctor.ts`) implements the readiness check listed under §Workflow file contract: file presence, trigger markers, step markers, SHA-pin pattern. Add focused tests under `tests/scripts/`.

## Task T-V04-004 - Extend CI readiness checks

Extended `scripts/lib/doctor.ts` with the readiness contract for `.github/workflows/verify.yml` listed in `docs/pr-ci-gate.md` §Workflow file contract. The check is invoked from `scripts/doctor.ts` via the existing `workflowReadinessChecks(repoRoot)` array (no change to the doctor entry point — only the contract definition expanded).

### What's checked

`workflowReadinessCheck` already short-circuited on missing files and on missing string markers. Three additions:

1. **`requiredPatterns`** added to the `WorkflowContract` type. Each entry is `{ description, pattern: RegExp }`. Used for textual structural checks (e.g. SHA-pin format) where regex is sufficient and a YAML parse would be overkill.
2. **`requiredEvaluators`** added to the `WorkflowContract` type. Each entry is `{ description, evaluate: (text: string) => boolean }`. Used for semantic checks that need YAML structure — currently the "push trigger covers main branch" check parses the file with the `yaml` package (already a project dep), reads `on.push.branches`, and confirms `"main"` is in the array. This handles all valid YAML forms — block list (`- main`) and flow list (`[main]`) — and refuses to be fooled by a `push:` key that precedes a `pull_request: branches: [main]` block (PR #149 round 2 review caught both bypass paths).
3. **verify.yml contract entry expanded** with:
   - New string markers `pull_request:` and `push:` (catch the "trigger key missing entirely" case).
   - The push-covers-main evaluator described above.
   - SHA-pin evaluators for `actions/checkout` and `actions/setup-node` that walk `jobs.verify.steps` (PR #149 round 3 review found the original whole-file regex was bypassable: a separate pinned job in the same workflow could mask an unpinned `verify` job step). Each evaluator reads the verify-job step list, filters `uses:` entries that target the action, and verifies every reference matches `^[^@]+@[0-9a-f]{40}$`. A 40-character lowercase hex commit SHA is the deterministic shape used by GitHub for commit-pinned actions; this matches the existing `chore(ci): pin all action references to commit SHA` policy.

`workflowReadinessCheck` now collects missing markers, missing patterns, and missing evaluators into a single `missing` list (markers first, then patterns, then evaluators) and surfaces them in the failure detail.

The pages.yml contract entry is unchanged. The pages workflow does not need PR-trigger or SHA-pin enforcement at this readiness level (the `check:product-page` and `zizmor` jobs cover Pages-specific concerns).

### What's deliberately not checked

Per the §Workflow file contract scope, the doctor check does not enforce:
- Node version (24 today; bump policy lives elsewhere).
- Concurrency-group shape (the project uses a per-workflow + PR-or-ref pattern; future tweaks to the expression should not break the doctor).
- `permissions: contents: read` (SHA-pin and least-privilege are tracked together by the `zizmor` security workflow; doctor is not the right enforcement point).

### Tests

Added eight focused tests under `tests/scripts/doctor.test.ts`:

| Test | Scenario | Expected fail detail |
|---|---|---|
| pull_request trigger missing | verify.yml without `pull_request:` | `... missing pull_request:` |
| push trigger does not cover main | push.branches list is `- develop` | `... missing push trigger covers main branch` |
| push trigger missing entirely | verify.yml triggers only on `pull_request: branches: [main]` (no push: at all) | `... missing push:, push trigger covers main branch` |
| push: empty / main only under pull_request | `push:` (null) precedes `pull_request: branches: [main]` — the round 2 P1 bypass case | `... missing push trigger covers main branch` |
| inline flow form `branches: [main]` is accepted | YAML flow form for the push trigger — round 2 P2 false-positive case | `pass` |
| checkout not SHA-pinned | `actions/checkout@v6` in verify-job step | `... missing actions/checkout SHA-pinned` |
| setup-node not SHA-pinned | `actions/setup-node@v6` in verify-job step | `... missing actions/setup-node SHA-pinned` |
| verify job unpinned but another job pinned | verify uses `@v6`, sibling job uses 40-hex — round 3 P2 bypass case | `... missing actions/checkout SHA-pinned, actions/setup-node SHA-pinned` |

The two existing tests ("validates verify and Pages workflow contracts" / "reports missing workflow contract markers") were updated. The valid-workflow fixture now includes the new markers + SHA-pinned actions; the missing-markers fixture now expects all ten missing items in the failure detail. A `validVerifyWorkflow()` helper holds the fixture.

Test count: 150 → 158.

Resolves SPEC-V04-002 (CI readiness contract). Satisfies REQ-V04-001 (PR CI gates), REQ-V04-002 (preserve local-first), NFR-V04-002 (deterministic + low-noise readiness signal).

### Verification

- `npm run typecheck:scripts`
- `npm run test:scripts` (158 pass, 0 fail)
- `npm run doctor` (passes against the real `.github/workflows/verify.yml`)
- `npm run verify`

## Task T-V04-005 - Workflow metrics report

- Extended `scripts/lib/quality-metrics.ts` with stage-aware scoring.
- Kept full lifecycle artifact progress visible while excluding future-stage evidence from the stage score.
- Rendered test and EARS coverage as `not expected yet` when the workflow has not reached the relevant stage.
- Added regression tests for stage-aware artifact and traceability expectations.
- Added optional `--save` and `--compare` trend snapshots under `quality/metrics/<scope>/`.
- Added trend deltas for score, maturity, blockers, clarifications, frontmatter gaps, and QA checklist gaps.
- Added `/quality:status` as the workflow-native command entry point for the metrics report.
- Wired quality metrics usage into orchestration, QA, review, release, retrospective, project, roadmap, and portfolio agent guidance.

## Task T-V04-007 - Metrics interpretation

- Added `docs/quality-metrics.md` with metric meaning, decision use, misuse warnings, and typical actions.
- Linked the interpretation guide from `docs/quality-framework.md`, `scripts/README.md`, and the `quality-metrics` skill.

## Task T-V04-008 - Maturity model documentation

- Added a five-level evidence-backed maturity assessment to `npm run quality:metrics`.
- Included maturity evidence, gaps, and next-step guidance in the rendered report and JSON output.
- Documented maturity levels in `docs/quality-metrics.md`.
- Updated the `quality-metrics` skill to report maturity without presenting it as certification or people scoring.

## Task T-V04-010 - Product page v0.4 positioning

Decision: minimal-lift positioning update on `sites/index.html`. Page is positioning-level and version-agnostic — v0.4 thesis (specs first, traceable, agent-specialised) unchanged — but the headline v0.4 shift (CI-enforced quality gate, workflow metrics + maturity) was not reflected in the §features grid.

| Card | Before | After |
|---|---|---|
| §Quality gates | Stage-gate framing only ("acceptance criteria so defects are caught where they are cheapest to fix") | Adds `npm run verify` runs locally and as required PR CI — CI ≡ local. |
| §Workflow metrics & maturity (new) | — | Stage-aware `npm run quality:metrics` with score, blockers, frontmatter / QA gaps, optional trend snapshots, five-level evidence-backed maturity assessment in JSON and rendered form. |

§features grid: 9 → 10 cards. No new sections. Quickstart already shows `npm run verify`; no further changes needed there. Recorded the external-announcement decision in `release-notes.md` §Communication; flipped the matching quality-gate checkbox to `[x]`.

### Deliberately not changed

- Hero, problem/solution, team-grid, audience-grid, workflow-diagram, 8-track grid, 30-agent roster, repo contents, FAQ, get-started: positioning stays valid; v0.4 is non-breaking and ships only optional surfaces.
- No version banner, no v0.4 callout strip — landing page remains version-agnostic by design.
- `npm run quality:metrics` and `npm run doctor` are operator commands, not prospect-facing CTAs; left out of the §start quickstart on purpose.

Satisfies T-V04-010 release task; satisfies the §Communication TODO that the v0.4 release notes flagged.

## Verification

- `npm run typecheck:scripts`
- `npm run test:scripts`
- `npm run quality:metrics`
- `npm run quality:metrics -- --feature=version-0-4-plan`
- `npm run verify`
