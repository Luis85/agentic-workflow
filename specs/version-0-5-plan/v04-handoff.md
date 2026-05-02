---
title: v0.4 to v0.5 release-quality handoff
feature: version-0-5-plan
stage: research
status: accepted
owner: release-manager
created: 2026-05-01
updated: 2026-05-01
---

# v0.4 to v0.5 release-quality handoff

The consumption contract for the machine-readable quality signals v0.5 release-readiness must read before any GitHub Release or GitHub Package publish.

This doc is the canonical input for T-V05-004 (release readiness check), T-V05-005 (release readiness tests), T-V05-008 (release operator guide), and T-V05-010 (release dry run). It satisfies SPEC-V05-008 and REQ-V05-010 by naming exactly what a publish workflow consumes, what each signal means, and which exit conditions block a publish versus require an operator waiver.

Upstream of this doc:

- The v0.4 release notes (`specs/version-0-4-plan/release-notes.md` §Validation baseline for v0.5) list which surfaces v0.4 ships for v0.5.
- This doc is the v0.5 side: it pins the API shape, exit semantics, blocker rules, and test fixture expectations that v0.5 release-readiness automation depends on.

Cross-references rather than duplicating documentation:

- Workflow file contract and CI ≡ local rule: [`docs/pr-ci-gate.md`](../../docs/pr-ci-gate.md) §Required gate, §Workflow file contract.
- Metric semantics and what each metric must not be used to infer: [`docs/quality-metrics.md`](../../docs/quality-metrics.md) §Metric interpretation.
- The implementing types: [`scripts/lib/quality-metrics.ts`](../../scripts/lib/quality-metrics.ts) (`QualityMetrics`, `MaturityAssessment`, `WorkflowMetric`, `QualityTrend`).

If this doc and any of the three sources above disagree, the source documents win and this doc must be updated.

## Signals v0.5 consumes

Four surfaces. v0.5 release-readiness reads all four; any one of the listed blocker conditions stops a publish unless the human release operator records an explicit waiver in the release artifacts (per REQ-V05-010 acceptance criteria).

### 1. `npm run quality:metrics --json`

Canonical machine-readable workflow health snapshot. v0.5 invokes the script with the `--json` flag and parses the resulting JSON.

**Shape.** `QualityMetrics` (declared at [`scripts/lib/quality-metrics.ts:69`](../../scripts/lib/quality-metrics.ts)). Top-level keys:

| Key | Type | What it carries |
|---|---|---|
| `generatedAt` | ISO timestamp | When the snapshot ran. v0.5 records this with the publish artifact for traceability. |
| `root` | string | Absolute repo path. Informational. |
| `scope` | string | `"repository"` for repo-wide runs, `"feature:<slug>"` when `--feature` is passed. |
| `summary.workflowCount` | number | Workflow-state files scanned. |
| `summary.overallScore` | number 0..1 | Average stage-aware score across workflows. |
| `summary.maturity` | `MaturityAssessment` | `level` (0..5; `0` = `Uninstrumented`, returned when no workflow evidence exists), `name`, `summary`, `evidence[]`, `gaps[]`, `nextStep`. |
| `summary.checklistGaps` | number | QA checklist gaps / nonconformities. |
| `workflows[]` | `WorkflowMetric[]` | Per-feature row: `feature`, `area`, `status`, `currentStage`, `stageScore`, `blockers` (integer item count for that workflow), `openClarifications` (integer item count for that workflow), plus coverage ratios for frontmatter / requirement chain / test coverage / EARS. |
| `signals.activeBlockers[]` | string[] | One entry **per workflow** that has any unresolved blockers, formatted `<feature> (<workflow-state path>)`. The string array carries workflow identity, not item count — to count items, sum `workflows[].blockers`. |
| `signals.openClarifications[]` | string[] | One entry **per workflow** that has any unresolved `[ ] CLAR-<area>-<n>` lines, formatted `<feature> (<workflow-state path>)`. To count items, sum `workflows[].openClarifications`. |
| `signals.missingFrontmatter[]` | string[] | Markdown files missing required frontmatter. One entry per file. |

**Exit semantics.** The script always exits 0 on a successful run. The JSON itself is the signal — v0.5 must not infer pass / fail from the exit code. A non-zero exit means the script crashed (filesystem error, malformed workflow-state YAML), which is itself a release blocker because the snapshot is unusable.

**`--feature <slug>` flag.** Use the `--` separator (`npm run quality:metrics -- --json --feature <slug>`) when invoking through `npm run`; bare `--feature=<slug>` after `npm run quality:metrics` is silently swallowed by the npm CLI and the script falls back to repo scope. v0.5 release-readiness should call `tsx scripts/quality-metrics.ts --json --feature <slug>` directly to avoid the trap. Documented in v0.4 release notes §Verification steps.

**Blocker rules v0.5 should enforce.** v0.4 does not gate on these — it reports them. v0.5 release-readiness owns the enforcement logic:

| Field | Block publish when | Reason |
|---|---|---|
| `signals.activeBlockers.length` (or `sum(workflows[].blockers)` for item-level cardinality) | > 0 | Any workflow with unresolved blockers signals a feature paused for cause; releasing past it is the regression we want to prevent. The string array length is workflow count; the per-workflow integer is item count. v0.5 should pick the cardinality that matches the gate it is enforcing (workflow-level vs. item-level). |
| `signals.openClarifications.length` (or `sum(workflows[].openClarifications)` for item-level cardinality) | > 0 for the feature being released | Unresolved clarification = unresolved spec ambiguity per Article I.4. Same workflow-vs-item cardinality note as blockers. |
| `summary.overallScore` (repo scope) | < threshold | Threshold is a v0.5 decision (release-readiness check task); recommend 0.85 as the initial floor based on v0.4 observed 0.915. |
| `summary.maturity.level` | < 3 (treats `0` `Uninstrumented`, `1` `Documented`, `2` `Managed` all as block) | Below Level 3 (Traceable) the lifecycle has gaps the release process depends on. v0.4 currently reports Level 3. Level `0` (`Uninstrumented`) is expected only on first-run / new-scope cases and is a hard block: nothing useful can be said about a release with zero workflow evidence. Levels 4 (`Verified`) and 5 (`Improving`) ship as pass; full level / name mapping in [`docs/quality-metrics.md`](../../docs/quality-metrics.md). |
| `summary.checklistGaps` | > 0 with no waiver | QA checklist nonconformities are explicit gaps. |

**Advisory (do not block, but surface in release notes).** `summary.workflowCount` (informational), `signals.missingFrontmatter` (often legacy docs, not blocking a release), per-workflow `stageScore` for non-released features.

### 2. `npm run quality:metrics --save` snapshot directory

Trend signal for cycle-over-cycle drift. v0.5 release-readiness reads the most recent saved snapshot to compare current metrics against the prior release cycle.

**Layout.** `quality/metrics/<scope>/<timestamp>.json`. `<scope>` is `repository` for repo-wide runs and `feature-<slug>` for feature-scoped runs (slugified by `slugifyScope` at [`scripts/lib/quality-metrics.ts:606`](../../scripts/lib/quality-metrics.ts)). Each file is a full `QualityMetrics` JSON document, identical to the `--json` output.

**Latest snapshot semantics.** `latestQualityMetricsSnapshot` reads the directory, filters by the snapshot file pattern, and returns the lexicographically last entry. Timestamps in filenames are ISO-formatted, so lexicographic order equals chronological order.

**Trend deltas.** When v0.5 calls `compareQualityMetrics(current, previous)` it gets a `QualityTrend` with deltas for: overall score, maturity level, workflow count, open blockers, open clarifications, missing frontmatter, QA checklist gaps. Each delta has `previous`, `current`, `delta`, and `unit` (`percent` / `level` / `count`).

**Blocker rules v0.5 should enforce.**

| Delta | Block publish when | Reason |
|---|---|---|
| Open blockers | `delta > 0` | Cycle introduced new blockers. Publishing past a regression is the failure mode. |
| Maturity level | `delta < 0` | Downward maturity drift signals process erosion; investigate before publishing. |
| Overall score | `delta < -0.05` | A 5+ point regression cycle-over-cycle warrants an operator review even if the absolute score is above the floor. |

**Advisory.** Frontmatter delta, QA checklist delta, workflow-count delta. Surface in release notes; not a publish block.

**Missing baseline.** If no prior snapshot exists for the scope, v0.5 release-readiness must either skip the trend check (first release) or treat it as advisory. It must not block on `null`.

### 3. `npm run doctor` exit code

CI readiness + branch / worktree hygiene check. v0.5 invokes it before publish.

**Exit semantics.**

| Exit code | Meaning |
|---|---|
| 0 | No check returned `fail`. Warnings (status `warn`) do not affect the exit code — the doctor script counts only `fail` results (`scripts/doctor.ts` lines 36–46). v0.5 must read stdout to discover warnings. |
| Non-zero (1) | At least one check returned `fail`. Doctor prints the failing task name and diagnostic output. |

**Status tiers.** Each doctor check emits one of three statuses:

| Status | Effect on exit code | What v0.5 should do |
|---|---|---|
| `pass` | none | Nothing. Check succeeded. |
| `warn` | none — exit code stays 0 | Advisory. Surface in release notes; do not block publish by default. |
| `fail` | counted; exit code becomes 1 if any | Hard publish block. |

**What doctor enforces** (per v0.4 §New, §Improved). The status column reflects current implementation:

| Check | Source | Status when degraded |
|---|---|---|
| Node / npm / git availability and Node ≥ 20 | `scripts/doctor.ts` | `fail` |
| Branch readiness (ahead / behind / topic vs. integration) | `scripts/lib/doctor.ts` `branchReadinessCheck` + `scripts/doctor.ts` `checkGitBranch` | **`fail`** when (a) `git branch --show-current` fails — not in a git checkout; (b) `git rev-list --left-right --count HEAD...@{u}` fails — cannot compare with upstream; or (c) on an integration branch (`main` / `develop`) with `ahead > 0` — local commits unpushed (`scripts/lib/doctor.ts` lines 164–170; this is the integration-branch-ahead publish blocker). **`warn`** for behind-upstream, topic-branch-ahead-of-upstream, and similar non-blocking divergence. **`pass`** when on a topic branch with no upstream (intentionally non-blocking — fresh topic branch state). |
| Working tree clean | `scripts/doctor.ts` `checkGitStatus` | `warn` |
| Worktree hygiene (no merged-but-stale registrations) | `scripts/lib/doctor.ts` `worktreeHygieneCheck` | `warn` |
| Dependency readiness (`node_modules` + lockfile) | `scripts/lib/doctor.ts` `dependencyReadinessCheck` | `warn` (missing / drift) |
| `.github/workflows/verify.yml` workflow contract | `scripts/lib/doctor.ts` `workflowReadinessChecks` | `fail` |
| ADR index, command inventories, `npm run verify` | `scripts/doctor.ts` `checkTask` | `fail` |

**Blocker rules v0.5 should enforce.**

| Signal | Block publish | Reason |
|---|---|---|
| `doctor` exit non-zero | Yes | A `fail` check means the verify gate, workflow contract, or environment is broken. |
| `doctor` exit 0 with `warn` lines (default) | No, surface only | Warnings are advisory by current implementation. |
| `doctor` exit 0 with specific `warn` v0.5 elects to gate on | Operator policy | If v0.5 release-readiness chooses to elevate certain warnings (e.g. dirty working tree on the release branch), document the elevation in the release operator guide and parse stdout for the warn line. v0.4 does not enforce; v0.5 owns the policy. |

**Operator-waiver caveat.** Doctor `fail` exits trace to broken gate / contract — not defensible to waive. The advisory warnings (worktree hygiene, branch ahead, dirty tree) do not require waiving because they do not block; if v0.5 elevates one of them to a gate and the operator chooses to waive, the waiver is recorded in the publish artifact.

### 4. `npm run verify` exit code

Canonical PR CI gate. CI ≡ local. v0.5 release-readiness invokes it directly when running outside CI; in CI the gate has already run on the merge commit and v0.5 reads the GitHub Actions run conclusion.

**Exit semantics.**

| Exit code | Meaning |
|---|---|
| 0 | All bundled checks passed. `verify` prints `verify: ok in <Ns>`. |
| Non-zero | At least one check failed. The composite names the failing stage and prints the per-check repro command. |

**Bundled checks.** Authoritative list lives in [`scripts/lib/tasks.ts`](../../scripts/lib/tasks.ts) (`checkTasks`); summary in `docs/pr-ci-gate.md` §Required gate. Includes `check:specs`, `check:traceability`, `check:frontmatter`, `check:obsidian`, `check:adr-index`, `check:commands`, `check:product-page`, `check:script-docs`, `check:workflow-docs`, `check:roadmaps`, `check:token-budget`, `check:agents`, `check:automation-registry`, `check:links`, `typecheck:scripts`, `test:scripts`.

**Blocker rule v0.5 should enforce.** `verify` exit non-zero is a hard publish block. No advisory tier; every bundled check is required (per v0.4 `docs/pr-ci-gate.md` §Advisory checks).

**Why also call doctor.** Doctor adds the workflow-file contract + branch / worktree hygiene checks that `verify` does not run. v0.5 should call both: `verify` confirms the build is shippable; `doctor` confirms the local environment and CI surface still match what v0.5 expects to read.

## Consumption matrix

How each release-readiness requirement in v0.5 maps to the four signals.

| Acceptance | quality:metrics JSON | --save / --compare | doctor | verify |
|---|---|---|---|---|
| CI status green | n/a | n/a | exit 0 includes `npm run verify` | exit 0 |
| Validation status green (`check:specs`, `check:traceability`, etc.) | n/a | n/a | n/a | bundled inside verify |
| Open blockers | `signals.activeBlockers` | new-blocker delta | n/a | n/a |
| Open clarifications | `signals.openClarifications` | new-clarification delta | n/a | n/a |
| Maturity evidence | `summary.maturity` | level delta | n/a | n/a |
| Workflow file contract | n/a | n/a | enforced | n/a |
| Workflow score floor | `summary.overallScore` | score delta | n/a | n/a |

The CI status / validation status entries above intentionally collapse into `verify` and `doctor`. v0.5 release-readiness should not re-implement the per-check parse of CI logs; reading the two exit codes is the contract.

## Test fixture expectations for T-V05-005

Tests for v0.5 release readiness should mock the four signals as follows:

- **quality:metrics JSON.** Fixture is a `QualityMetrics` literal. The existing fixtures used by v0.4's `tests/scripts/quality-metrics.test.ts` cover the five workflow states (active / blocked / done / skipped / open-clarification); v0.5 can re-use the same shape.
- **Snapshot directory.** Fixture is a temporary directory with one or more `*.json` files; snapshot name pattern matches `qualityMetricsSnapshotFilePattern`.
- **doctor.** Fixture is a process result with `exitCode` and `stdout` / `stderr`. Don't shell out in unit tests — the existing `tests/scripts/doctor.test.ts` style of invoking the pure check function is the model.
- **verify.** Fixture is the bundled `verify` exit code. Same approach: invoke the per-check pure functions where possible.

## What v0.5 must not do

- **Must not duplicate metric collection.** Re-implementing parsers for workflow-state.md or traceability would diverge from `scripts/lib/quality-metrics.ts` and produce a second source of truth. Always shell out to the script (or import the library directly).
- **Must not gate on `--save` alone.** Saving a snapshot is a side effect; readiness must read the *current* JSON. Use `--save` to persist for the next cycle's `--compare`, not as the readiness signal.
- **Must not block on `signals.missingFrontmatter` by default.** Many of those entries are legacy docs that pre-date the frontmatter contract. Treat as advisory; flag in the release notes.
- **Must not silently waive blockers.** When the human release operator waives a signal, the waiver is recorded in the publish artifact (release notes plus the operator guide audit trail). REQ-V05-010 acceptance is "explicit waiver".

## Open questions for v0.5

These are decisions the v0.5 implementation owns, called out here for visibility:

- Workflow score floor (recommended 0.85). Decision: T-V05-004 / T-V05-008.
- Maturity level floor (recommended 3, current). Decision: T-V05-004.
- Score-delta block threshold (recommended -0.05 / -5pp). Decision: T-V05-004.
- Whether to gate on per-feature stage score (recommended yes for the feature being released; no for unrelated features). Decision: T-V05-004.
- Whether the trend check is mandatory or advisory for a first-ever release of a scope. Recommended: advisory when no baseline exists; mandatory once one cycle has been saved.

## Deferred

The REQ-* / NFR-* forward-coverage check (every functional requirement has at least one covering TEST-*) is **not** in the v0.4 baseline. v0.5 should re-evaluate whether to promote, keep deferred, or drop based on the test-plan format lock outcome. See `docs/pr-ci-gate.md` §Deferred and v0.4 release notes §Known limitations.
