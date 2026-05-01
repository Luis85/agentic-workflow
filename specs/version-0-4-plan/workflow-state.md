---
feature: version-0-4-plan
area: V04
current_stage: implementation
status: active
last_updated: 2026-05-01
last_agent: claude
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
  release-notes.md: pending
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
| 10. Release | `release-notes.md` | pending |
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
- 2026-05-01 (claude, T-V04-005 closeout): Completed T-V04-005 workflow metrics report. Substantive work shipped in codex hand-offs 2026-04-28 / 2026-04-30 and is recorded in `implementation-log.md` §Task T-V04-005: stage-aware scoring in `scripts/lib/quality-metrics.ts`, optional `--save` / `--compare` trend snapshots under `quality/metrics/<scope>/`, trend deltas across score / maturity / blockers / clarifications / frontmatter gaps / QA checklist gaps, `/quality:status` workflow-native command, and agent prompt hooks across orchestration / QA / review / release / retrospective / project / roadmap / portfolio. Satisfies REQ-V04-003, REQ-V04-004, REQ-V04-009, NFR-V04-002, NFR-V04-003, NFR-V04-005, SPEC-V04-003, SPEC-V04-008. Unblocks T-V04-006 (qa — tests for readiness + metrics) and T-V04-009 (release-manager — public release documentation).
- 2026-05-01 (claude, T-V04-007 closeout): Completed T-V04-007 metrics interpretation documentation. Substantive work shipped in earlier codex hand-offs and is recorded in `implementation-log.md` §Task T-V04-007: `docs/quality-metrics.md` documents each metric's meaning, supported decisions, misuse warnings, and typical actions; linked from `docs/quality-framework.md`, `scripts/README.md`, and the `quality-metrics` skill. Satisfies REQ-V04-004, NFR-V04-003, SPEC-V04-004. Depends on T-V04-005 (closed above).
- 2026-05-01 (claude, T-V04-008 closeout): Completed T-V04-008 maturity model documentation. Substantive work shipped in codex hand-off 2026-04-29 and is recorded in `implementation-log.md` §Task T-V04-008: five-level evidence-backed maturity assessment in `npm run quality:metrics` with maturity evidence, gaps, and next-step guidance in both rendered and JSON output; documented in `docs/quality-metrics.md`; the `quality-metrics` skill reports maturity without presenting it as certification or people scoring. Satisfies REQ-V04-005, REQ-V04-006, NFR-V04-004, SPEC-V04-005. Independent of T-V04-005 / T-V04-007; no downstream task unblocked beyond T-V04-009 (already unblocked by T-V04-005 closeout).

## Open clarifications

- [x] CLAR-V04-001 — Confirm which v0.3 validation checks are stable enough to become required PR CI gates.  *(resolved 2026-05-01: 6 of 7 baseline checks classified `required`; 1 `deferred`. See `implementation-log.md` §Task T-V04-001.)*
- [x] CLAR-V04-002 — Confirm whether v0.4 should include scheduled read-only health reporting or defer scheduled automation beyond v0.4.  *(resolved 2026-05-01: deferred to v0.5+; v0.4 PRD non-goals exclude telemetry/dashboards. See `docs/pr-ci-gate.md` §Out of scope and `implementation-log.md` §Task T-V04-002.)*
