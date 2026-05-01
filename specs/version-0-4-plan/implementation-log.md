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

## Task T-V04-006 - Focused tests for CI readiness and metrics by state

Added focused tests covering the five workflow states named in the task description (active / blocked / done / skipped / open-clarification) for `scripts/lib/quality-metrics.ts`, plus targeted gap-fill tests for `scripts/lib/doctor.ts` readiness checks. All tests use the existing `node:test` harness and run under `npm run test:scripts`.

### Tests added (`tests/scripts/quality-metrics.test.ts`)

| State | Test | Approach |
|---|---|---|
| active | `collectQualityMetrics scores active workflows by current stage` (refined) | Real fixture (`version-0-4-plan`), now also asserts `status === "active"` so the state contract is explicit. |
| done | `collectQualityMetrics treats done workflows as fully expected` | Real fixture (`improve-specorator-tooling`). Asserts `status === "done"`, `testCoverageExpected === true`, `earsExpected === true`, `expectedArtifactPresence === 100`, `expectedArtifactCompletion === 100`, and that the workflow does not appear in `signals.activeBlockers`. |
| skipped | `collectQualityMetrics counts skipped canonical artifacts as expected-complete` | Real fixture (`project-consistency-hardening`, which intentionally skips `idea.md`). Asserts `counts.artifactsExpectedForStage === 3` and `counts.artifactsCompleteForStage === 2` (idea skipped + research complete; requirements in-progress excluded). |
| open-clarification | `collectQualityMetrics surfaces open clarifications in workflow counts and signals` | Real fixture (`project-consistency-hardening`, which has 2 unresolved CLAR-CONS-* items). Asserts `workflow.openClarifications >= 2` and that `signals.openClarifications` mentions the feature. |
| blocked | `expectedArtifactsForStage and traceabilityExpectation handle the blocked status` | Pure helper — no real blocked spec exists in the repo. Asserts blocked at `specification` produces the same expected-artifact set and traceability expectation as active at `specification` (blocked is paused-at-stage, not progress past it). |
| done (helper) | `expectedArtifactsForStage with status done returns every canonical artifact regardless of currentStage` | Pure helper. Asserts `expectedArtifactsForStage("idea", "done")` and `expectedArtifactsForStage("learning", "done")` are deeply equal and include `retrospective.md`; `traceabilityExpectation("idea", "done")` returns `{ specs: true, tasks: true, tests: true }`. |

### Tests added (`tests/scripts/doctor.test.ts`)

| Gap | Test |
|---|---|
| `dependencyReadinessCheck` happy path (covered failure paths, missing the pass case) | `dependencyReadinessCheck passes when node_modules and lockfile are both present` |
| `branchReadinessCheck` topic-branch-ahead warn path (covered clean / behind / integration-ahead, missing topic-ahead at line 147 of `doctor.ts`) | `branchReadinessCheck warns when a topic branch is ahead` |

### What was deliberately not added

- **No new test for the active state** — the existing test refined here already exercises that path; duplicating would not change coverage.
- **No real-blocked-spec fixture** — no spec in the repo currently has `status: blocked`. The pure-helper test asserts the contract a blocked workflow would produce; a temp-fs fixture for `collectQualityMetrics` would duplicate the helper's behaviour without exercising new code paths.
- **No new tests for `assessMaturity` levels 0–3** — the existing tests cover level 4 (`Verified`) and level 0 (unreadable workflow states). The intermediate levels are already exercised indirectly by the level-4 evidence assertions; explicit tests for each level are deferred until a richer test-fixture harness lands (out of v0.4 scope).

Resolves SPEC-V04-002 (CI readiness contract — test side) and SPEC-V04-003 (workflow metrics report — test side). Satisfies REQ-V04-001, REQ-V04-003, REQ-V04-004, REQ-V04-008, REQ-V04-009, NFR-V04-001, NFR-V04-002, NFR-V04-005.

Test count: 158 → 165.

### Verification

- `npm run typecheck:scripts`
- `npm run test:scripts` (165 pass, 0 fail)
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

## Task T-V04-011 - Verify v0.4 release readiness

Source: tasks.md T-V04-011 DoD ("Run targeted tests, CI-readiness checks, metrics
checks, link checks, and `npm run verify`; document skipped checks and any deferred
scheduled automation.") and the session pickup brief.

Resolves the bulk of T-V04-009's final close gate (release-manager retains the
T-V04-009 §Changes cross-check + README §Roadmap flip at release time) and unblocks
T-V04-012 (release-manager - v0.5 release-quality handoff).

Satisfies REQ-V04-001, REQ-V04-002, REQ-V04-003, REQ-V04-007, REQ-V04-008, REQ-V04-009,
NFR-V04-005, SPEC-V04-001, SPEC-V04-002, SPEC-V04-003, SPEC-V04-006, SPEC-V04-007,
SPEC-V04-008.

### Decision: no separate release-readiness-guide.md

`templates/release-readiness-guide-template.md` ships a per-perspective scaffold
(product, UX, customer, engineering, security, operations, support, data, commercial,
communications). v0.4 ships docs, scripts, and a CI workflow only. There is no
runtime, no users, no migrations, no on-call rotation, no commercial impact, no data
flow, and no external announcement that needs sign-off. Eight of ten perspectives
collapse to N/A. The remaining two (engineering, communications) are already covered
by `release-notes.md` §Quality gate.

A separate guide would add noise without adding signal. v0.3 set the same precedent
(no guide). The decision is recorded in `release-notes.md` §Readiness summary
("Release readiness guide: not used"). The v0.5 release should re-evaluate per
release; a runtime release would justify the guide.

### Verification suite

Worktree cut from `origin/main` at `e6edc07` on branch `feat/v04-t011-release-readiness`.
Fresh `npm ci` install (worktrees do not share `node_modules`).

| # | Command | Exit | Result |
|---|---|---:|---|
| 1 | `npm ci` | 0 | 30 packages installed; 0 vulnerabilities. |
| 2 | `npm test` | 0 | 165/165 tests pass in 3.6s. |
| 3 | `npm run verify` | 0 | `verify: ok` in 20.5s; all bundled checks green (`typecheck:scripts`, `test:scripts`, `check:agents`, `check:links`, `check:adr-index`, `check:commands`, `check:script-docs`, `check:workflow-docs`, `check:product-page`, `check:sites-tokens-mirror`, `check:frontmatter`, `check:obsidian`, `check:obsidian-assets`, `check:specs`, `check:roadmaps`, `check:traceability`, `check:token-budget`). |
| 4 | `npm run quality:metrics` | 0 | Repo overall score 91.5%; 11 workflow states scanned; maturity Level 3 (Traceable); 0 active blockers; 5 specs with open clarifications, none in v0.4. |
| 5 | `npm run quality:metrics -- --feature=version-0-4-plan` | 0 | v0.4 stage score 97.1% (stage `implementation`, status `active`); req-chain coverage 100%; EARS coverage 100%; test coverage `not expected yet` for current stage; 0 active blockers; 0 open clarifications (CLAR-V04-001 + CLAR-V04-002 both resolved). |
| 6 | `npm run doctor` | 0 | Node v24.12.0; npm 11.9.0; git 2.47.0; branch tracking `origin/main`; working tree clean; dependencies present; verify workflow ready; pages workflow ready; ADR index ok; command inventories ok; verify gate ok. One advisory warning: 5 worktrees registered, 2 hygiene warnings — `feat/v04-t006-tests` and `feat/v04-t010-product-page` are merged into `origin/main` but the worktrees / branches were not pruned. Hygiene only; not a release blocker. |

CI-readiness signals exercised by command 6: trigger keys (`pull_request:`, `push:`),
push-covers-`main` evaluator (block-list and flow-list forms), verify-job-scoped
SHA-pin evaluators for `actions/checkout` and `actions/setup-node`. All green.

### Caveat surfaced

`npm run quality:metrics --feature=<slug>` (without `--`) is silently swallowed by
the npm CLI as an npm config flag (`npm warn Unknown cli config "--feature"`); the
script never sees it and falls back to repo-wide scope. The proper invocation is
`npm run quality:metrics -- --feature=<slug>` (with the `--` separator) or
`tsx scripts/quality-metrics.ts --feature=<slug>` invoked directly. Recorded in
`release-notes.md` §Verification steps so v0.5 release-readiness automation does not
hit the same trap.

### Deferred automation (per task DoD)

- **Scheduled health reporting** - deferred to v0.5+ per CLAR-V04-002 (resolved
  2026-05-01 in T-V04-002). PRD non-goals exclude telemetry / dashboards. v0.4
  produces machine-readable signals (`npm run quality:metrics` JSON and exit codes,
  `npm run doctor` exit code) that v0.5 can consume from a scheduled job. See
  `docs/pr-ci-gate.md` §Out of scope.
- **REQ/NFR -> TEST forward-coverage advisory check** - deferred (carried forward
  from CLAR-V03-002) until the test-plan format is locked enough to avoid false
  positives. v0.5 should re-evaluate. Captured in `release-notes.md` §Known
  limitations and §Validation baseline for v0.5.

### Edits in this PR

- `release-notes.md` §Readiness summary — guide-not-used decision, **go** verdict,
  three release-time conditions (T-V04-009 §Changes cross-check + README flip,
  T-V04-010 §Communication checkbox confirmation, T-V04-012 v0.5 handoff), required
  approvals (release-manager only).
- `release-notes.md` §Verification steps — replaced TODO row 6 with the
  feature-scoped invocation plus the `--` separator caveat; added doctor's CI
  contract scope.
- `release-notes.md` §Quality gate — flipped `[ ]` Readiness conditions to `[x]`.
  `[ ]` Communication remains; release-manager confirms it during T-V04-009 close.
- `workflow-state.md` Stage 8 marked `skipped` with rationale under §Skips
  (`test-plan.md`, `test-report.md` skipped — meta-feature; canonical test
  artifacts are `tests/scripts/doctor.test.ts` and `tests/scripts/quality-metrics.test.ts`
  from T-V04-006).
- `workflow-state.md` Hand-off note added (T-V04-011 closeout).
- `implementation-log.md` §Task T-V04-011 (this section).

### Verdict

**Go**, conditional on the three release-time items in `release-notes.md`
§Readiness summary. Verification suite is green; no release-blocking findings;
deferred automation is documented; CLAR-V04-001 and CLAR-V04-002 are both resolved.

### Handoff to T-V04-012

Release-manager picks up T-V04-012 (v0.5 release-quality handoff) using
`release-notes.md` §Validation baseline for v0.5 as the canonical input. That
section already documents the machine-readable JSON / exit-code surfaces and the
`--save` / `--compare` snapshot contract that v0.5 release-readiness should consume.
T-V04-012's job is to write the consumption contract from the v0.5 side; this PR
does not pre-empt it.

## Task T-V04-012 - v0.5 release-quality handoff

Documents the consumption contract for the four machine-readable quality signals
v0.5 release-readiness must read before any GitHub Release or GitHub Package
publish. Satisfies REQ-V04-009 (Expose release-quality signals for v0.5),
NFR-V04-005 (machine-readability), SPEC-V04-008 (Release-quality output).

### Decision: where the consumption contract lives

Two locations were considered:

1. Expand v0.4 `release-notes.md` §Validation baseline for v0.5 with the
   consumption side - what v0.5 reads, when, with what error semantics.
2. New doc under `specs/version-0-5-plan/` that v0.5 consumes as a
   prerequisite, leaving v0.4 release notes scoped to what v0.4 ships.

Picked option 2: `specs/version-0-5-plan/v04-handoff.md`. Reasons:

- v0.4 release notes are about what v0.4 ships; the consumption contract is
  forward-looking. Mixing them muddles the audience (release operator vs.
  v0.5 implementor).
- The v0.5 folder already houses the consumers - the release-readiness check
  task, the tests for it, the operator guide, and the v0.5 spec section
  pinning v0.4 quality gate consumption. The handoff doc sits alongside the
  artifacts that need it. (Cross-feature IDs are deliberately phrased as
  prose here per `docs/pr-ci-gate.md` §Cross-feature ID references in
  narrative.)
- v0.5 can evolve the consumption seam (threshold tuning, new signal
  consumption, waiver semantics) without editing v0.4 release notes after
  the v0.4 tag ships.
- v0.4 release-notes §Validation baseline for v0.5 stays the canonical
  upstream listing. This is its companion downstream contract, cross-linked.

### Edits

- `specs/version-0-5-plan/v04-handoff.md` (new). Frontmatter only carries
  title / feature / stage / status / owner / dates - no `id` field, because
  the doc is supplementary (not in `workflowArtifacts`) and "HANDOFF" is not
  a valid traceability ID kind. The doc is excluded from
  `check:traceability` by virtue of not being a canonical artifact, so
  cross-feature ID references in the body are safe; this is the one v0.5
  artifact where v0.4 IDs appear deliberately.

  Sections:
  - Upstream / cross-reference list, with the explicit rule that source
    documents (`docs/pr-ci-gate.md`, `docs/quality-metrics.md`,
    `scripts/lib/quality-metrics.ts`) win on disagreement.
  - Four signal subsections - `npm run quality:metrics --json`,
    `npm run quality:metrics --save` snapshots, `npm run doctor`,
    `npm run verify` - each documenting shape / exit semantics / blocker
    rules / advisory tier.
  - Consumption matrix mapping the v0.5 release-readiness acceptance items
    onto the four signals.
  - Test fixture expectations for the v0.5 release-readiness test task.
  - "Must not" list (do not duplicate metric collection, do not gate on
    `--save` alone, do not silently waive blockers).
  - Open questions deliberately deferred to v0.5 implementation
    (workflow score floor, maturity floor, delta thresholds).

- `specs/version-0-4-plan/implementation-log.md` (this section).
- `specs/version-0-4-plan/workflow-state.md` - hand-off note for T-V04-012;
  `last_updated` and `last_agent` refreshed.

No edits to `release-notes.md` §Verification steps. The handoff doc does not
introduce new release-time verification commands; T-V04-011's verification
suite already exercised the four signals end-to-end.

### Traceability

- REQ-V04-009 (Expose release-quality signals for v0.5) - satisfied by the
  consumption contract written in `v04-handoff.md`. v0.5 release-readiness
  can now read the four surfaces without re-implementing metric collection.
- NFR-V04-005 (machine-readability) - satisfied. The contract names the
  JSON shape, the snapshot directory layout, and the exit-code semantics
  v0.5 automation parses without prose.
- SPEC-V04-008 (Release-quality output) - satisfied. The acceptance criterion
  ("v0.5 release readiness can consume the output without reimplementing
  metric collection") is the contract this doc records.

### Deferred: T-V04-009 final close

T-V04-009 has three release-time pieces still owed:

- README.md §Roadmap row v0.4 flip from "Planned" to "Done" with link to
  `release-notes.md`.
- `docs/specorator.md` v0.4 references review.
- `release-notes.md` §Changes cross-check against the final list of merged
  PRs at release time, plus frontmatter `status: draft` -> `complete`.

These are release-time operations: the v0.4 tag has not been cut. Performing
them now would advertise a release that does not exist. The handoff PR
deliberately does not bundle them. They land in a follow-up PR alongside
the release tag (`feat/v04-release-tag` or similar), at which point Stage 10
flips to `complete` and Stage 11 (`/spec:retro`) opens.

### Stage status

Stage 10 (Release) stays `in-progress`. T-V04-012 substantive work is
complete; the remaining open items (T-V04-009 final close, T-V04-010
§Communication checkbox confirmation) are release-time, not handoff-time.
