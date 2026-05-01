---
feature: version-0-4-plan
area: V04
current_stage: implementation
status: active
last_updated: 2026-05-01
last_agent: claude-product-page-designer
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
  release-notes.md: in-progress
  retrospective.md: pending
---

# Workflow state — version-0-4-plan

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
| 10. Release | `release-notes.md` | in-progress |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- None.

## Hand-off notes

- 2026-04-28 (codex): Planned v0.4 through Stage 6. Recommended implementation order is v0.3 validation baseline confirmation, CI gate contract, PR CI workflow, CI readiness checks, metrics report with machine-readable release-quality output, maturity documentation, public docs/product page review, release readiness verification, then v0.5 handoff.
- 2026-04-28 (codex): Started T-V04-005/T-V04-007 by making quality metrics stage-aware and adding metric interpretation guidance.
- 2026-04-29 (codex): Extended T-V04-008 with evidence-backed maturity assessment in the quality metrics report and documentation.
- 2026-04-30 (codex): Extended T-V04-005 with optional quality metrics trend snapshots via `--save` and `--compare`.
- 2026-04-30 (codex): Added `/quality:status` and agent prompt hooks so quality metrics are visible at orchestration, QA, review, release, retrospective, project, roadmap, and portfolio handoffs.
- 2026-05-01 (claude): Completed T-V04-001 v0.3 validation baseline confirmation. 6 of 7 baseline checks classified `required` for PR CI promotion; 1 (every `REQ-*`/`NFR-*` covered by `TEST-*`) remains `deferred` pending test-plan format lock. Classification + handoff lives in `implementation-log.md` §Task T-V04-001. CLAR-V04-001 resolved. Unblocks T-V04-002 (architect — CI gate contract).
- 2026-05-01 (claude): Completed T-V04-002 PR CI gate contract. Authored `docs/pr-ci-gate.md` — full `npm run verify` on PR (CI ≡ local), no advisory tier, 1 deferred check, false-positive guidance, workflow file contract markers for T-V04-004 doctor. CLAR-V04-002 resolved (scheduled health reporting deferred to v0.5+). Unblocks T-V04-003 (dev — `.github/workflows/verify.yml`) and T-V04-004 (dev — extend doctor).
- 2026-05-01 (claude): Completed T-V04-003 PR CI quality gate. Confirmed existing `.github/workflows/verify.yml` satisfies `docs/pr-ci-gate.md` §Workflow file contract on every slot. Reconciled two contract values (Node 24, current concurrency expression) back into the contract; existing workflow values left unchanged because they are intentional and better. Resolves SPEC-V04-001. Unblocks T-V04-004 (dev — extend doctor).
- 2026-05-01 (claude): Completed T-V04-004 CI readiness checks. Extended `scripts/lib/doctor.ts` `workflowReadinessChecks` so the verify.yml contract enforces the §Workflow file contract markers from `docs/pr-ci-gate.md`: `pull_request:` trigger, `- main` push branch, and SHA-pinned `actions/checkout` + `actions/setup-node` (40-hex regex). Added `requiredPatterns` to `WorkflowContract` so regex enforcement composes with existing substring markers. Four new focused tests under `tests/scripts/doctor.test.ts`; total 150 → 154 passing. Doctor passes against the real verify.yml. Resolves SPEC-V04-002.
- 2026-05-01 (claude, T-V04-005 closeout): Completed T-V04-005 workflow metrics report. Substantive work shipped in codex hand-offs 2026-04-28 / 2026-04-30 and is recorded in `implementation-log.md` §Task T-V04-005: stage-aware scoring in `scripts/lib/quality-metrics.ts`, optional `--save` / `--compare` trend snapshots under `quality/metrics/<scope>/`, trend deltas across score / maturity / blockers / clarifications / frontmatter gaps / QA checklist gaps, `/quality:status` workflow-native command, and agent prompt hooks across orchestration / QA / review / release / retrospective / project / roadmap / portfolio. Satisfies REQ-V04-003, REQ-V04-004, REQ-V04-009, NFR-V04-002, NFR-V04-003, NFR-V04-005, SPEC-V04-003, SPEC-V04-008. With T-V04-004 (closed above) now landed, this closure fully unblocks T-V04-006 (qa — tests for readiness + metrics). T-V04-007 and T-V04-009 also list T-V04-005 as a prerequisite; their unblock state is recorded in the closeout notes below.
- 2026-05-01 (claude, T-V04-007 closeout): Completed T-V04-007 metrics interpretation documentation. Substantive work shipped in earlier codex hand-offs and is recorded in `implementation-log.md` §Task T-V04-007: `docs/quality-metrics.md` documents each metric's meaning, supported decisions, misuse warnings, and typical actions; linked from `docs/quality-framework.md`, `scripts/README.md`, and the `quality-metrics` skill. Satisfies REQ-V04-004, NFR-V04-003, SPEC-V04-004. T-V04-007's only prerequisite was T-V04-005 (closed above), so this closure fully unblocks T-V04-007 itself. T-V04-007 is in turn a prerequisite for T-V04-011 (qa — release readiness verification).
- 2026-05-01 (claude, T-V04-008 closeout): Completed T-V04-008 maturity model documentation. Substantive work shipped in codex hand-off 2026-04-29 and is recorded in `implementation-log.md` §Task T-V04-008: five-level evidence-backed maturity assessment in `npm run quality:metrics` with maturity evidence, gaps, and next-step guidance in both rendered and JSON output; documented in `docs/quality-metrics.md`; the `quality-metrics` skill reports maturity without presenting it as certification or people scoring. Satisfies REQ-V04-005, REQ-V04-006, NFR-V04-004, SPEC-V04-005. T-V04-008 has no prerequisites itself. With T-V04-003 (closed earlier 2026-05-01), T-V04-005 (closed above), and now T-V04-008 all closed, T-V04-009 (release-manager — public release documentation) is fully unblocked. T-V04-008 is also a prerequisite for T-V04-011 (qa — release readiness verification).
- 2026-05-01 (claude, T-V04-006): Completed T-V04-006 focused tests for CI readiness + metrics behaviour by state. Added 5 metrics tests covering the 5 task-named states (active / blocked / done / skipped / open-clarification): stage-aware scoring of an active workflow (already covered, refined with status assertion), `collectQualityMetrics` on a done workflow (`testCoverageExpected` true, `earsExpected` true, `expectedArtifact*` 100), skipped-canonical-artifact accounting (`completeArtifactsFor` counts skipped equivalently to complete), open-clarification surfacing in workflow counts and metrics signals, and pure-helper coverage for `expectedArtifactsForStage` + `traceabilityExpectation` under the blocked status (paused-at-current-stage; same shape as active) and the done status (full canonical set regardless of `currentStage`). Added 2 doctor-readiness tests filling coverage gaps: `dependencyReadinessCheck` happy path (both `node_modules` and lockfile present) and `branchReadinessCheck` topic-branch-ahead warn path (distinct from the integration-branch-ahead failure). Test count 158 → 165. Resolves SPEC-V04-002 (CI readiness contract — test side) and SPEC-V04-003 (metrics — test side); satisfies REQ-V04-001, REQ-V04-003, REQ-V04-004, REQ-V04-008, REQ-V04-009, NFR-V04-001, NFR-V04-002, NFR-V04-005. Unblocks T-V04-011 (qa — release readiness).
- 2026-05-01 (claude, T-V04-009 pickup): Started substantive T-V04-009 work on `release-notes.md`. Picked up the starter draft authored in PR #163 / #164 (per the pickup checklist in PR #163). Filled non-blocked TODO sections — §Summary (drafted clean prose, no longer "starter draft"), §Improved (stage-aware scoring, trend snapshots, workflow-native quality reporting, doctor reads contract), §Fixed (none — first cycle for these surfaces), §User-visible impact (no action required, no breaking changes), §Known limitations (cross-feature ID rule, IDs-in-fenced-code risk, deferred CLAR-V03-002, doctor substring-marker scope follow-up), §Validation baseline for v0.5 (machine-readable JSON / exit-code surface contract for v0.5 consumption). Updated the §Changes T-V04-004 entry to describe what actually landed via PR #149 (`requiredEvaluators`, YAML-parser-backed push-covers-main, verify-job-scoped SHA-pin) instead of the round-1 description. Quality-gate checklist marked `[x]` for the items now drafted; `[ ]` retained for §Readiness summary (T-V04-011) and §Communication external announcement (T-V04-010). `release-notes.md` flipped from `pending` to `in-progress`; status banner reframed from "starter draft" to "in-progress draft". Remaining T-V04-009 work for the release-manager: cross-check §Changes against the final list of merged PRs at release time, and update README.md §Roadmap row v0.4 from "Planned" to "Done" + `docs/specorator.md` v0.4 references when the release ships (per v0.3 pattern). Closes the bulk of T-V04-009 substantive editing; final close gates on T-V04-010 / T-V04-011.
- 2026-05-01 (claude, T-V04-010 closeout): Completed T-V04-010 product-page v0.4 positioning. `sites/index.html` §features grid: §Quality gates card now states `npm run verify` runs locally and as required PR CI (CI ≡ local); new §Workflow metrics & maturity card calls out `npm run quality:metrics` with stage-aware scoring, trend snapshots, and the five-level maturity assessment. 9 → 10 cards, no new sections, version-agnostic positioning preserved. Recorded the external-announcement decision in `release-notes.md` §Communication and flipped the matching quality-gate checkbox from `[ ]` to `[x]`. T-V04-010 entry added to `implementation-log.md` with deliberately-not-changed rationale. With T-V04-010 closed, T-V04-009 final close still gates only on T-V04-011 (qa — release readiness verification). Unblocks T-V04-011 (qa — release readiness verification): all upstream slices T-V04-005 / T-V04-007 / T-V04-008 / T-V04-010 are now complete.

## Open clarifications

- [x] CLAR-V04-001 — Confirm which v0.3 validation checks are stable enough to become required PR CI gates.  *(resolved 2026-05-01: 6 of 7 baseline checks classified `required`; 1 `deferred`. See `implementation-log.md` §Task T-V04-001.)*
- [x] CLAR-V04-002 — Confirm whether v0.4 should include scheduled read-only health reporting or defer scheduled automation beyond v0.4.  *(resolved 2026-05-01: deferred to v0.5+; v0.4 PRD non-goals exclude telemetry/dashboards. See `docs/pr-ci-gate.md` §Out of scope and `implementation-log.md` §Task T-V04-002.)*
