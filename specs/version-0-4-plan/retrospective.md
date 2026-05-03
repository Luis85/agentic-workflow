---
id: RETRO-V04-001
title: Version 0.4 release plan — Retrospective
stage: learning
feature: version-0-4-plan
status: complete
owner: retrospective
inputs:
  - PRD-V04-001
  - SPECDOC-V04-001
  - RELEASE-V04-001
created: 2026-05-01
updated: 2026-05-01
---

# Retrospective — Version 0.4 release plan

## Outcome

**Shipped on plan.** v0.4 fully delivered its three headline goals (CI quality gates, stage-aware workflow metrics, five-level maturity model) and the machine-readable v0.5 handoff contract. All 12 tasks (T-V04-001 through T-V04-012) are substantively complete. The release-readiness verdict (`implementation-log.md` §Task T-V04-011) was **go** with three release-time conditions outstanding, none of which are release blockers — they are deferred to the follow-up release-tag PR.

**PRD goals met:**

- CI ≡ local gate: `.github/workflows/verify.yml` enforces full `npm run verify` on every PR and every push to `main` (PRs #137, #138, #148). Confirmed in T-V04-003.
- Doctor contract: `scripts/lib/doctor.ts` `workflowReadinessChecks` enforces the verify.yml contract markers including YAML-parser-backed push-covers-main and verify-job-scoped SHA-pin evaluators (PR #149). Confirmed in T-V04-004.
- Stage-aware metrics: `npm run quality:metrics` with `--save` / `--compare` trend snapshots, `/quality:status` command, and agent prompt hooks across eight workflow roles (T-V04-005). Repo score 91.5%; v0.4 feature score 97.1%; 0 blockers; 0 open clarifications at release-readiness time.
- Maturity model: five evidence-backed levels in both rendered and JSON output (T-V04-008). Repo maturity: Level 3 (Traceable) at release-readiness time.
- Machine-readable v0.5 handoff: `specs/version-0-5-plan/v04-handoff.md` documents the consumption contract for the four quality signals (T-V04-012, PR #170). v0.5 release-readiness can consume without re-implementing metric collection.

**Surprises:**

- **Positive:** T-V04-003 discovered the PR CI workflow already existed and satisfied the contract. The task shifted from authoring a new workflow to reconciling two intentional contract drifts (Node version 20 → 24, concurrency expression) back into `docs/pr-ci-gate.md`. Contract now reflects what shipped, not what was assumed.
- **Positive:** T-V04-004 (PR #149) accumulated three rounds of Codex review. Each round found a real bypass in the SHA-pin check: round 2 found two paths (null-push-key and flow-list false positive), round 3 found that a whole-file regex could be satisfied by a sibling job while the verify-job step remained unpinned. The check is now genuinely hard to circumvent.
- **Negative:** T-V04-012 (the doc-only handoff contract) accumulated four rounds of Codex review, surfacing signal-cardinality ambiguity, maturity-level-0 naming, doctor advisory-tier documentation, branch-fail edge cases, and maturity-name mismatches between the doc and the source. Each was a real source-drift bug, not a doc style issue. Doc-as-contract reviews need a source-grounded reading style that is different from doc-quality reviews.
- **Negative:** Stage 10 (Release) cannot be fully closed in this PR because T-V04-009 final close (README roadmap flip, `docs/specorator.md` v0.4 references, `release-notes.md` status flip) are release-time operations gating on the actual v0.4 tag, which has not been cut. The stage stays `in-progress` until the release-tag PR lands.

## What worked

- **Baseline-promotion methodology (T-V04-001).** The structured classification table — v0.3 source, local repro command, class (required / advisory / deferred), false-positive decision — gave T-V04-002 a clean input. 6 of 7 baseline checks promoted to required with no noise. The cross-feature ID rule was caught and documented here (row 6 discovery), which prevented a validator hit later. This format should become a named step in the release-planning template.

- **CI ≡ local principle as a single architectural decision (T-V04-002).** By declaring CI ≡ local as the governing principle and choosing full `npm run verify` rather than a narrowed check subset, T-V04-003 became a confirmation task (the workflow already matched) instead of a build task. The principle also made CLAR-V04-002 (scheduled health reporting) easy to resolve: scheduled automation is out of scope until it can read the machine-readable outputs v0.4 now ships.

- **Two-phase pickup for T-V04-009.** PR #163/164 authored a starter `release-notes.md` draft, then PR #165 picked it up substantively. The explicit pickup checklist in PR #163 made the handover clean — no content was duplicated or dropped. The pattern is repeatable for any long-running documentation task that starts before all its upstream inputs exist.

- **Handoff doc location decision (T-V04-012).** Choosing option 2 (new doc at `specs/version-0-5-plan/v04-handoff.md`) over option 1 (append to v0.4 `release-notes.md`) kept each document focused on its audience: the release operator reads v0.4 release notes; the v0.5 implementor reads the v0.5-side consumption contract. The decision was recorded explicitly and cross-linked. This cross-version handoff pattern should be documented as a standing convention.

- **CLAR resolution in-place in `workflow-state.md`.** Both CLAR-V04-001 and CLAR-V04-002 were resolved with dated rationale inline, directly adjacent to the original question. Zero drift between the resolution and the downstream artifacts. Consistent with the v0.3 pattern — confirm the convention is in the template.

- **Meta-feature Stage 8 skip precedent.** The T-V04-011 decision to use the inline §Readiness summary in `release-notes.md` rather than a separate `release-readiness-guide.md` matched the v0.3 precedent and was recorded with a rationale that future releases can reference. Establishing the precedent explicitly prevents re-litigation.

- **Test count discipline.** Tests grew from 150 (pre-v0.4) to 165 (T-V04-004 + T-V04-006) with every addition traced to a specific gap. No speculative tests.

## What didn't work

- **T-V04-002 contract was authored without reading the existing workflow.** Two values in `docs/pr-ci-gate.md` (Node version 20, concurrency expression) diverged from what `.github/workflows/verify.yml` already shipped. T-V04-003 had to reconcile them back into the contract. The fix was straightforward, but the round-trip was unnecessary. Authoring a contract document before reading the implementation it is supposed to codify is a process smell — especially for a contract whose purpose is to describe an existing surface.

- **T-V04-012 (doc-as-contract) required four Codex review rounds.** The findings were: (a) `signals.activeBlockers` and `signals.openClarifications` are `string[]` arrays with one entry per workflow, not per item — the doc described item cardinality; (b) maturity level 0 name was `Uninstrumented`, not matched by the doc; (c) doctor advisory tier was documented as if `warn` blocks publish, but the script counts only `fail` for exit code; (d) `branchReadinessCheck` fail edges were incompletely described; (e) maturity names differed between doc and source. Every round was productive, but all five findings trace to the same root cause: the doc was written from memory of the source rather than from a live reading of the source. A review protocol for doc-as-contract artifacts — "reviewer reads the referenced source exports before reviewing the doc" — would have caught these in round 1.

- **`validateIdAreas` triggered twice during v0.4.** The cross-feature ID rule was discovered during T-V04-001 (and documented in `docs/pr-ci-gate.md`), then hit again during T-V04-012 when a `### T-V04-009 final close` heading at column 0 in `implementation-log.md` triggered a duplicate-definition detection. The heading pattern should not appear at top-of-line in a `## Task / ### T-AREA-NNN` context when the area-mismatch validator is scanning. The rule is correct enforcement; the tooling does not yet warn contributors about the heading-pattern risk before they hit it. A pre-write guidance note in `implementation-log-template.md` would prevent this class of error.

- **Stage 10 (Release) cannot close in the same PR as T-V04-012.** The release-time operations (README roadmap flip, `docs/specorator.md` updates, `release-notes.md` status flip) need the actual version tag to exist before they make sense. The workflow stages do not currently distinguish "release-readiness-complete" (gate passed; tag not cut) from "release-complete" (tag shipped; documentation flipped). This blurs the Stage 10 / Stage 11 boundary for multi-PR release sequences.

- **`npm run quality:metrics --feature=<slug>` silently no-ops.** The bare flag (without `--`) is swallowed by the npm CLI; the script receives nothing and falls back to repo scope. Discovered during T-V04-011, documented in `release-notes.md` §Verification steps and in `specs/version-0-5-plan/v04-handoff.md`. Actionable: the script should detect the unintended fallback and emit a warning when no `--feature` argument was parsed but the invocation used `npm run` (detectable via `npm_lifecycle_event`).

## Spec adherence

**No structural drift.** All nine functional requirements (REQ-V04-001 through REQ-V04-009) and five NFRs are satisfied. All eight SPEC items (SPEC-V04-001 through SPEC-V04-008) are accepted. All nine test scenarios (TEST-V04-001 through TEST-V04-009) are covered by implementation evidence.

**Deviations documented:**

- CLAR-V04-001 resolved 2026-05-01: 6 of 7 baseline checks promoted; 1 deferred. Classification recorded in `implementation-log.md` §Task T-V04-001 and carried forward to `docs/pr-ci-gate.md` §Deferred. No change to requirements.
- CLAR-V04-002 resolved 2026-05-01: scheduled health reporting deferred to v0.5 or later. Rationale in `docs/pr-ci-gate.md` §Out of scope. Aligns with PRD §Non-goals.
- T-V04-003 reconciliation: two contract values (Node 24, concurrency expression) updated in `docs/pr-ci-gate.md` to reflect what already shipped in the workflow — the workflow was not changed. The spec intent (CI ≡ local, deterministic, SHA-pinned) was never at risk.
- T-V04-012 location decision: handoff doc placed in `specs/version-0-5-plan/` rather than appended to v0.4 `release-notes.md`. Decision recorded in `implementation-log.md` §Task T-V04-012 §Decision with rationale. SPEC-V04-008 acceptance criterion is satisfied either way.

**Requirements were stable throughout.** No mid-flight requirement changes. The cross-feature ID discovery during T-V04-001 was a process clarification (phrase cross-feature mentions as prose), not a requirement change.

## Process observations

- **Stage 7 implementation interleaved with Stages 9 and 10.** As in v0.3, the meta-feature pattern means each T-V04-NNN sub-task is itself a mini-lifecycle slice. The Stage 8 skip (test-plan.md, test-report.md) was documented under `workflow-state.md` §Skips with rationale, following the v0.3 precedent. The template still does not have native meta-feature support. The v0.3 retro action (§Notes-on-meta-features in `workflow-state-template.md`) carried into v0.4 as an open action; it is still open.

- **T-V04-004 doctor check: three Codex review rounds on a code-and-test task.** Each round found a real bypass. This is the correct outcome — Codex review paying for itself. The YAML-parser-backed `requiredEvaluators` pattern (rather than pure regex) emerged from round 2 and is a stronger architectural choice than what T-V04-002 originally specified. Future doctor contract tasks should start from the YAML-parser approach for structural checks.

- **T-V04-012 doc-as-contract: four Codex review rounds on a doc-only task.** All five findings were real source-drift bugs. The lesson is distinct from T-V04-004: code reviews and doc-as-contract reviews need different reviewer stances. A code reviewer looks for behavioural correctness; a doc-as-contract reviewer must also verify that every claim in the doc matches the live source exports. No existing agent prompt instructs reviewers to read the referenced source before reviewing a doc-as-contract artifact.

- **Quality gates that produced real signal — keep all of them.** No false positives during v0.4. `check:traceability` `validateIdAreas` fired correctly twice (cross-area ID reference and heading-pattern duplicate-definition). `check:specs` and `check:traceability` passed at T-V04-011 verification, confirming no regression introduced during the cycle. `npm run doctor` surfaced the two stale merged worktrees advisory — hygiene only, correctly classified as non-blocking.

- **Quality gates that produced noise — none.** The zero-noise record holds from v0.3 into v0.4.

- **Worktree hygiene is a recurring advisory.** Both the v0.3 cycle (per workflow-state hand-off notes) and v0.4 (T-V04-011 doctor output) ended with advisory warnings about merged-but-not-pruned worktrees. This is not a gate failure — it is the expected output of the worktree-per-PR model. The advisory is correctly classified; however, a standing reminder in the release checklist to prune merged worktrees before the release-tag PR would eliminate the noise.

- **Stage 10 close gate is ambiguous for release-tag-dependent tasks.** T-V04-009 final close (README flip, specorator.md references, release-notes.md status) cannot happen until the v0.4 tag is cut. The current workflow has no sub-stage for "release-tag pending" that is distinct from "in-progress implementation." Stage 10 staying `in-progress` across the Stage 11 retrospective is a process smell worth addressing.

## Actions

| Action | Type | Owner | Due |
|---|---|---|---|
| Add `§Notes-on-meta-features` to `templates/workflow-state-template.md` clarifying that plan-level features may skip Stage 7-9 canonical artifacts when each sub-task ships as its own PR; require a `## Skips` entry and per-PR trace evidence. (Carried from v0.3 retro action; still open.) | template | analyst | 2026-06-15; [#212](https://github.com/Luis85/agentic-workflow/issues/212) |
| Add guidance to `templates/implementation-log-template.md` warning that `### T-AREA-NNN` headings at column 0 trigger `validateIdAreas` duplicate-definition detection; recommend using `#### Task: T-AREA-NNN` or indented forms for sub-section headings within an implementation log. | template | analyst | 2026-06-15; [#213](https://github.com/Luis85/agentic-workflow/issues/213) |
| Add a doc-as-contract review protocol to the reviewer agent (`spec:review`) or a new skill: before reviewing a doc that documents a script / source export, the reviewer reads the referenced source file exports and checks each doc claim against them. Propose as an ADR (changes reviewer agent scope). | agent / adr | human | 2026-06-01; [#214](https://github.com/Luis85/agentic-workflow/issues/214) |
| Done 2026-05-02: `scripts/quality-metrics.ts` reads `npm_config_feature`, so `npm run quality:metrics --feature=<slug>` no longer silently falls back to repository scope. Tracked by [#189](https://github.com/Luis85/agentic-workflow/issues/189). | tooling | dev | 2026-06-15 |
| Add a §Pre-release checklist item to `templates/release-notes-template.md`: "Prune merged worktrees (`git worktree prune`) before opening the release-tag PR to suppress the doctor advisory warning." | template | release-manager | 2026-06-15; [#199](https://github.com/Luis85/agentic-workflow/issues/199) |
| Document the cross-version handoff doc convention in `docs/specorator.md` or a new `docs/cross-version-handoff.md`: when a cycle's release-quality signals are consumed by the next cycle, the handoff contract lives in the consuming cycle's specs folder (`specs/<next-version>/v<prev>-handoff.md`), cross-linked from the prior cycle's `release-notes.md` §Validation baseline. | docs | analyst | 2026-06-15; [#215](https://github.com/Luis85/agentic-workflow/issues/215) |
| Done 2026-05-02: documented the Stage 10 `release-tag hold` convention instead of adding a new workflow-state field. The hold uses existing `current_stage: release`, `status: active`, `release-notes.md: in-progress`, and a required hand-off note naming readiness, pending irreversible action, required authorization, and follow-up owner. No ADR was required because the workflow schema did not change. | docs | architect | [#216](https://github.com/Luis85/agentic-workflow/issues/216) |
| Complete T-V04-009 final close in the release-tag PR: flip README.md §Roadmap row v0.4 from "Planned" to "Done", review `docs/specorator.md` v0.4 references, cross-check `release-notes.md` §Changes against the final merged PR list, flip `release-notes.md` frontmatter `status: draft` to `complete`, confirm T-V04-010 §Communication checkbox. Stage 10 closes when this PR merges. | release | release-manager | Immediately before v0.4 tag cut; [#89](https://github.com/Luis85/agentic-workflow/issues/89) |

## Amendments

The following kit changes are proposed. Each non-trivial change should be sequenced as a separate PR by the human owner. No changes to `templates/`, `.claude/`, or `memory/constitution.md` are made in this retrospective.

1. **Reviewer agent amendment (ADR required).** The reviewer agent prompt (`spec:review` or `.claude/agents/reviewer.md`) should instruct the reviewer to read referenced source exports before reviewing a doc-as-contract artifact. This changes the reviewer's scope and tool access and requires an ADR before the agent file is modified.

2. **Stage 10 release-tag hold (resolved by convention).** A new `release_tag_cut` field or enum value would change the workflow schema and require an ADR plus migration. The chosen fix is a documented Stage 10 convention: readiness-complete-but-tag-pending stays `current_stage: release`, `status: active`, and `release-notes.md: in-progress`, with a `release-tag hold` hand-off note. This preserves schema compatibility.

3. **Template amendments (no ADR needed).** `templates/workflow-state-template.md` (§Notes-on-meta-features), `templates/implementation-log-template.md` (heading-pattern guidance), `templates/release-notes-template.md` (worktree-prune pre-release checklist item). These are clarifications to existing structure, not new stages or roles.

4. **Docs addition (no ADR needed).** `docs/specorator.md` or a new `docs/cross-version-handoff.md` documenting the handoff-doc location convention.

5. **Script improvement (no ADR needed).** `scripts/quality-metrics.ts` warning when `--feature` is passed without `--` separator in `npm run` context.

## Lessons

- **Read the existing surface before writing the contract.** A five-minute read of `.github/workflows/verify.yml` before authoring `docs/pr-ci-gate.md` would have prevented the T-V04-003 reconciliation round-trip.
- **Doc-as-contract review needs a source-grounded reviewer, not a prose reviewer.** Every finding in T-V04-012 round 2–4 traced to a claim that was accurate when written but diverged from the source export's actual shape. The fix is reviewer discipline, not better writing.
- **Two-phase pickup (starter draft → substantive pickup) is a valid pattern for long-running documentation tasks.** Name the pickup checklist explicitly in the starter PR so the handover is clear.
- **Cross-version handoff docs belong in the consuming cycle's folder.** v0.4 release notes describe what v0.4 ships; the v0.5 consumption contract belongs beside the v0.5 artifacts that consume it.
- **Worktree hygiene warnings are expected, not alarming.** The doctor advisory for merged-but-not-pruned worktrees is a hygiene signal, not a gate failure. Prune before the release-tag PR; do not let it stop work mid-cycle.
- **The zero-noise quality-gate record (v0.3 + v0.4) is a commitment worth protecting.** Every validator failure during both cycles was a real defect. Keep the standard; do not add advisory checks that are not independently deterministic.
- **`validateIdAreas` is correct enforcement; the usability gap is heading-pattern guidance.** The rule prevented cross-namespace traceability tangles during both cycles where it fired. The fix is contributor guidance, not rule relaxation.

---

## Quality gate

- [x] Three buckets covered (worked / didn't / actions).
- [x] Every action has an owner and a due date.
- [x] Spec adherence assessed.
- [x] Improvements proposed back into the kit (templates / agents / constitution).
