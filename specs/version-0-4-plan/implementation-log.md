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

## Verification

- `npm run typecheck:scripts`
- `npm run test:scripts`
- `npm run quality:metrics`
- `npm run quality:metrics -- --feature=version-0-4-plan`
- `npm run verify`
