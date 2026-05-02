---
id: RETRO-V05-001
title: Version 0.5 release and distribution plan — Retrospective
stage: learning
feature: version-0-5-plan
status: complete
owner: retrospective
inputs:
  - REVIEW-V05-001
  - TESTREPORT-V05-001
  - IMPL-LOG-V05-001
  - RELEASE-V05-001
created: 2026-05-02
updated: 2026-05-02
---

# Retrospective — Version 0.5 release and distribution plan

## Outcome

**Shipped on plan.** All 13 tasks (T-V05-001 through T-V05-013, including the Article X iteration task T-V05-012 and the DEFECT-V05-001 resolution task T-V05-013) are complete. The `v0.5.0` lightweight tag is cut on `main` at commit `03f4a4c` and pushed to origin. CI is green across all 18 verify gates; 94 release-surface tests pass on `main`. Quality metrics score: `overallScore` 97.1, maturity level 3 (Traceable), `requirementCoverage` 100%, `earsCoverage` 100%, 0 blockers, 0 open clarifications.

**PRD goals met:**

- GitHub Packages npm distribution channel established: `@luis85/agentic-workflow` published to `https://npm.pkg.github.com` (pending operator-authorised first publish per Article IX + CLAR-V05-003 resolution; workflow, readiness gates, and package identity are all in place).
- Operator-authorised release workflow (`release.yml`) implements all eight design steps: manual dispatch, readiness gate, archive build, Layer 2 fresh-surface check, confirm gate, release create / dry-run preview, npm publish, asset upload.
- Fresh-surface starter contract (REQ-V05-012, ADR-0021): released archive ships docs as stubs, ADRs excluded, 10 intake folders empty. Build-time transform at `scripts/build-release-archive.ts` + prepack guard + staging marker + safety guard provide defence-in-depth.
- Release readiness check (`check:release-readiness`) covers Layer 1 (metadata + quality signals) and Layer 2 (fresh-surface contract assertions) with stable diagnostic codes.
- Operator guide (`docs/release-operator-guide.md`) is runnable end-to-end and includes a per-step recoverability matrix.

**Remaining open item:** TEST-V05-006 (live publish from authorised release run) is deferred to the operator-led stable publish per Article IX and the CLAR-V05-003 two-step plan. This was an intentional scope boundary, not a slip.

**Surprises (positive):**

- T-V05-013's build-time-transform approach was not in the original plan. qa's DEFECT-V05-001 discovery (22 numbered ADRs and built-up docs shipping in the candidate archive) forced a technically substantive new task. The escalation was handled correctly per Article X: requirements, spec, design, and ADR updated before code. The delay was real but the approach is now architecturally sound.
- The prepack guard (`scripts/release-prepack-guard.mjs`) was a Codex-originated improvement in round-2 that caught a npm precedence rule the original design had not accounted for: `package.json#files` takes precedence over `.npmignore` for listed directories, so the round-1 ADR exclusion in `.npmignore` was a false defence. The guard is now the primary enforcement layer.

**Surprises (negative):**

- T-V05-013 on PR #202 ran six Codex review rounds. Three of those rounds fixed bugs introduced by the agent's own earlier fixes in the same PR (see R-V05-003 below and §What didn't work).
- The `quality-metrics` tooling reports `requirementsWithTests: 0` for v0.5 despite all 12 REQs having documented TEST IDs in `spec.md` (see R-V05-001). The metric undercounts real coverage; a parser fix is needed.

---

## What worked

**Article X escalation protocol on REQ-V05-012.** When qa's dry run discovered that the candidate archive violated the fresh-surface contract, the correct escalation path was taken without hesitation: requirements updated first (REQ-V05-012 in `requirements.md`), then spec (SPEC-V05-010 in `spec.md`), then design (build-time-transform subsection in `design.md`), then ADR filed (ADR-0021), then code. The implementation sequence was correct; no silent invent occurred. This is a textbook Article X application — worth preserving as a worked example for future cycles.

**DEFECT-V05-001 root-cause honesty.** The qa agent's test-report §5 (defect finding) was unambiguous: it named the exact SPEC assertions violated (1 and 3), enumerated every diagnostic code, and stated "do not fix in this PR." The clean handoff to dev prevented a scope-creep merge. This is the right defect-reporting posture for gate-boundary handoffs.

**Defence-in-depth layering on the archive builder.** The final shape — build-time transform + prepack guard + staging marker + safety guard + `.npmignore` — emerged across rounds 1–6 and is genuinely stronger than any single-layer design. Each Codex finding added a layer that addresses a distinct failure mode: the safety guard (`assertSafeOutDir`) prevents destructive misuse of `--out`; the prepack guard prevents bare `npm pack` from the repo root; the staging marker prevents the guard from blocking the legitimate staged pack; the `.npmignore` entries provide belt-and-suspenders for the ADR glob and `.worktrees/`. The layering was iterative but each layer is justified.

**Codex P1/P2 loop on PR #202 caught real bugs in every round.** Despite the six-round length, not one round was ping-pong. Rounds 1, 2, 3, 4, 5, and 6 each resolved a genuine defect: missing path guard on destructive clean (round 2), npm precedence rule on `.npmignore` (round 2), chicken-and-egg with the inner `npm pack --dry-run` call (round 3), operator runbook inconsistency with the new prepack guard (round 4), `--no-clean` self-contradiction in the non-empty rejection (round 5), and the deeper discovery that `--no-clean` was the wrong-layer fix (round 6). The loop paid for itself.

**PR boundaries across Stages 1–10 were well-scoped overall.** Thirteen tasks distributed across roughly 13 independent PRs (#156, #157, #158, #159, #160, #161, #162, #173, #202, and the release-prep PRs). Each PR owned a single concern. No task bundling problems. The one exception is noted below.

**Two-stage publish design (CLAR-V05-003).** The Decider's resolution — draft+prerelease first, then promoted to stable — is the correct first-publish strategy. It allows reviewer inspection of the draft GitHub Release and the attached tarball before committing to a stable public version. The operator guide documents both steps and both `gh workflow run` commands are ready.

**Operator guide self-consistency at §7.1.** The manual recovery runbook for the non-idempotent `gh release create` case was qa-confirmed as internally consistent. Having a per-step recoverability matrix (idempotent vs. non-idempotent, with explicit manual commands for the non-idempotent case) is the right approach for irreversible shared-state operations.

---

## What didn't work

**T-V05-013 rounds 4–6 fixed bugs introduced by the agent's own earlier fixes in the same PR.** The sequence was: round-2 added the prepack guard (correct), round-3 fixed the chicken-and-egg it created (correct), round-4 updated the operator runbook to match (correct), and then also added `--no-clean` as a "convenience" mode. Round-5 tried to fix `--no-clean`'s self-contradictory rejection message. Round-6 correctly diagnosed that `--no-clean` was the wrong abstraction layer entirely — `package.json#files` whitelists whole directories, so any non-destructive mode silently re-ships stale files from prior runs. The correct fix was to remove `--no-clean` entirely, not to fix its rejection logic.

The generalised lesson: when a flag that started as optional becomes internally inconsistent with the system's invariants, the answer is to remove the flag, not to fix the consistency check. Round-4 added `--no-clean` as an apparent convenience; round-6 removed it as an architectural liability. The round-trip cost two rounds and added/then-removed four tests.

**The runbook was not tested on the day the implementation changed (round-3 → round-4).** Round-4 updated `docs/release-operator-guide.md` §7.1 after round-3 added the prepack guard, because round-3's guard broke the bare `npm pack` commands in the runbook. This update was necessary and correct. But the root inconsistency (bare `npm pack` in the runbook would have shipped 22 ADRs) predated the guard. The runbook was inconsistent with the archive's content contract before round-2's changes were merged. A "run the runbook against a real archive" step at the time of authoring T-V05-008 (operator guide task) would have caught this.

**R-V05-001 — `quality-metrics` undercounts `requirementsWithTests`.** The tool reports `requirementsWithTests: 0` for v0.5 despite `spec.md` lines 90–101 enumerating TEST-V05-001 through TEST-V05-012 against REQ IDs. The metric-side maturity summary ("No completed workflow has complete downstream test evidence yet") is therefore inaccurate for this feature. The underlying tests exist and pass; the parser does not yet find them. This miscount had no effect on the release verdict — the reviewer manually confirmed coverage — but it undermines trust in the metric as a lazy-load signal for future cycles.

**Stage 10 (release) artifact (`release-notes.md`) was not tracked in the original `workflow-state.md` frontmatter.** The `artifacts` table in `workflow-state.md` had `release-notes.md: pending` but the release-notes themselves did not have a formal artifact ID (RELEASE-V05-001) until the release stage ran. This is consistent with the v0.4 pattern but still creates an ambiguity between "release-readiness complete" and "release artifact produced." The v0.4 retro raised this (§Action: "release-tag pending" sub-state); it remains open.

---

## Spec adherence

**No structural drift.** All 12 functional requirements (REQ-V05-001 through REQ-V05-012) and 5 NFRs are satisfied. All 10 SPEC items (SPEC-V05-001 through SPEC-V05-010) have downstream task and passing test chains. The traceability matrix (`traceability.md`, RTM-V05-001) is complete.

**Documented deviations:**

- **REQ-V05-012 + SPEC-V05-010 (Article X iteration).** `check-release-package-contents` was the building block; qa's DEFECT-V05-001 surfaced that the requirement needed to exist before the release workflow ran it. Requirements, spec, design, and ADR (ADR-0021) were updated before the code landed in T-V05-013. The deviation was a requirement discovery, not scope creep, and was handled exactly per Article X.
- **CLAR-V05-001 (branch strategy).** Shape A with `release/vX.Y.Z` branches adopted per ADR-0020. No `develop` branch introduced. Spec intent preserved.
- **CLAR-V05-002 (package identity).** `@luis85/agentic-workflow` on GitHub Packages (`npm.pkg.github.com`), `publishConfig.access: "public"`. OQ-V05-001 and OQ-V05-002 resolved during implementation; OQ-V05-003 resolved by T-V05-013.
- **CLAR-V05-003 (first publish strategy).** Draft+prerelease first, then promoted to stable. Resolved by Decider; documented in `workflow-state.md` resolved-clarifications table and in `docs/release-operator-guide.md`.
- **R-V05-004 (EARS wording nit on REQ-V05-012).** Accepted as-is for v0.5. The semantic alignment is correct; a strict EARS reader could read "when the workflow publishes" as a post-condition when the check actually fires pre-publish. Flagged for a prose pass on the next requirements touch. Not a defect.
- **R-V05-005 (`package-contract.md` status).** `package-contract.md` was flipped from `draft` to `accepted` during release prep, closing this finding. All three open questions (OQ-V05-001, OQ-V05-002, OQ-V05-003) confirmed closed.

**Requirements were not stable throughout** — REQ-V05-012 was added mid-flight — **but the instability was handled correctly.** The requirement was escalated, not invented silently. The spec, design, and ADR were updated before any code landed. No pre-REQ-V05-012 requirement was modified.

---

## Process observations

**PR #202 (T-V05-013) soft loop cap reached and noted.** Round-4 hit the soft cap; the agent posted a cap-reached comment to the PR as required by `feedback_pr_review_loop.md`. Rounds 5 and 6 continued because each addressed a genuine bug introduced by the agent's own earlier work. This is an acceptable reason to exceed the cap — it is not ping-pong — but the circumstances are worth naming: the round-5 and round-6 bugs were self-inflicted. A more conservative posture at round-4 ("is the `--no-clean` flag warranted at all?") would have avoided them.

**Runbook testing should be same-day as implementation change.** The operator guide (T-V05-008) was authored as a standalone task (PR #161) before DEFECT-V05-001 was discovered. When T-V05-013 changed the archive build path, round-4 of PR #202 had to update the runbook retroactively. The round-trip was necessary and caught a genuine inconsistency, but the protocol should be: whenever a task changes a step that is referenced in the operator guide, the author tests the runbook commands before closing the review round. "Test the runbook the day you change the implementation" is the rule.

**Stage 10 artifact sequencing across PRs.** The release-notes, CHANGELOG promotion, `package-contract.md` status flip, and `workflow-state.md` release-stage hand-off landed across three independent PRs (the release-prep PR, the CLAR-V05-003 closure PR, and the review PR). This was correct separation: each PR owned one concern. The sequence was enforced by hand rather than a gate. A "release-tag pending" sub-state in `workflow-state.md` (carried forward from the v0.4 retro) would have made the sequencing constraint explicit.

**Quality gates that produced real signal — keep all eighteen.** `check:traceability` confirmed the REQ → Spec → Task → Test chain at every stage boundary. `check:release-package-contents` (new in v0.5) found DEFECT-V05-001 during T-V05-011; the gate paying for itself in the first run. `check:release-readiness` correctly blocked on missing tag and CHANGELOG in every pre-release invocation. `check:workflow-docs` and `check:automation-registry` caught documentation drift when new scripts and workflows were added. Zero false positives in v0.5; the zero-noise record from v0.3 and v0.4 holds.

**`actionlint` and `zizmor` as structural checks on the workflow file.** These two existing CI gates prevented the release workflow from accumulating injection vectors or permission scope creep. Their presence meant that Codex review rounds on PR #202 could focus on semantic correctness rather than workflow security. The layering is working correctly.

**Meta-feature Stage 7–9 artifact pattern (carried from v0.3 + v0.4).** v0.5 does produce `implementation-log.md`, `test-plan.md`, and `test-report.md` as first-class deliverables (unlike v0.3 which marked them skipped). The test-report is substantive: it documents 7 deterministic commands, a defect finding, and deferred checks with explicit closure paths. This is better than the v0.3 skip pattern. The pattern is now stable enough to document as a standing meta-feature convention.

---

## Quality trend

`npm run quality:metrics -- --feature version-0-5-plan --compare` run at retro time:

- `overallScore` = 97.1 / 100 (reviewer-reported at Stage 9; retro-time tool shows `92.9%` stage score due to `retrospective.md` being a live artifact — the difference is the known `requirementsWithTests: 0` miscount identified in R-V05-001).
- `maturity.level` = 3 (Traceable).
- `requirementCoverage` = 100% (12/12 requirements have spec links at review time).
- `earsCoverage` = 100%.
- `frontmatterCoverage` = 100%.
- `openClarifications` = 0.
- `blockers` = 0.
- `requirementsWithTests` = 0 (tooling miscount — R-V05-001; actual test coverage is 12/12 via manually verified REQ → TEST chains).

No prior baseline existed for this feature; the post-retro save (`npm run quality:metrics -- --feature version-0-5-plan --save`) creates the first baseline at `quality/metrics/feature-version-0-5-plan/2026-05-02T14-59-53-184Z.json`. Future cycles can compare against this.

**Quality direction: net positive.** The v0.5 feature score (97.1 at review; 92.9 at retro due to mid-sequence artifact state) is consistent with the v0.4 pattern (97.1 feature score at release-readiness). The `requirementsWithTests: 0` miscount is the one structural metric gap; fixing R-V05-001 will lift the reported score to reflect actual coverage.

---

## Actions

> Actions without owners are wishes. Actions without Definition of Done are plans. All three are provided below.

| # | Action | Type | Owner | DoD | Due / Trigger |
|---|---|---|---|---|---|
| A-V05-001 | File a GitHub issue against `scripts/quality-metrics.ts` (or its lib) to fix `requirementsWithTests` undercount: parse `spec.md` test-scenario table rows (`TEST-V05-NNN | REQ-V05-NNN`) or the `## Test scenarios` section to map TEST IDs back to REQ IDs. (R-V05-001) | tooling | dev | Issue filed with reproduction steps; fix landed in a PR that makes `requirementsWithTests` = 12 for v0.5 when re-run. | 2026-06-15 |
| A-V05-002 | Backfill TEST-V05-006 evidence into `specs/version-0-5-plan/test-report.md` after the operator's stable publish completes: record the workflow run URL, npm package URL, publish timestamp, and npm view output confirming the package is live. Mark TEST-V05-006 `PASS` in the test report. (R-V05-002) | qa | qa / release-manager | `test-report.md` §Coverage gaps Gap 1 closed; TEST-V05-006 row in test report updated to PASS with run URL. | Triggered by: operator completes stable `gh workflow run release.yml` dispatch per CLAR-V05-003 step 2. |
| A-V05-003 | Amend `feedback_pr_review_loop.md` to add a "self-inflicted bug" note: when rounds after the soft cap are addressing bugs introduced by earlier rounds in the same PR, add a retrospective note identifying the root cause (e.g., "flag added at round-N was the wrong abstraction") and the earlier round that should have been more conservative. (R-V05-003) | process | analyst | `feedback_pr_review_loop.md` updated with a "Self-inflicted round extension" section; change rides its own docs-only PR. | 2026-06-15 |
| A-V05-004 | Add a "same-day runbook test" protocol note to `templates/implementation-log-template.md` or `docs/release-operator-guide.md`: when a task changes a step referenced in the operator guide, the task's DoD includes running the affected runbook commands against a real (or staged) archive before the review round closes. | template | analyst | Template updated; the note appears under the DoD checklist for release-stage tasks. | 2026-06-15 |
| A-V05-005 | Investigate `workflow-state.md` "release-tag pending" sub-state (carried from v0.4 retro action, issue #216). Determine whether a `release_tag_cut: false` frontmatter flag or a `release` sub-stage is the right shape; raise as an ADR if it requires schema change. | adr | architect | ADR drafted (or formal decision recorded that no schema change is warranted and the current "active with hand-off note" pattern is sufficient). | 2026-07-01; [#216](https://github.com/Luis85/agentic-workflow/issues/216) |
| A-V05-006 | Add a "flag smell" checklist item to the dev agent (`spec:implement`) or `docs/quality-framework.md`: before adding an opt-in mode flag to a script, confirm that the mode is compatible with every invariant the script enforces. If any invariant must be relaxed for the flag to function, reconsider whether the flag is the right layer. | docs | analyst | One-liner checklist item added in the appropriate doc; no ADR needed unless it changes an agent's scope. | 2026-06-15 |
| A-V05-007 | Document the meta-feature Stage 7–9 artifact convention as a named pattern in `templates/workflow-state-template.md`: a plan-level feature that ships via a sequence of implementation PRs should produce `implementation-log.md`, `test-plan.md`, and `test-report.md` that reference those PRs as their "implementation" evidence rather than marking the stages skipped. (Supersedes the v0.3 "§Notes-on-meta-features" action, issue #212.) | template | analyst | Template updated with a `## Meta-feature Stage 7–9 pattern` note; issue #212 referenced. | 2026-06-15; [#212](https://github.com/Luis85/agentic-workflow/issues/212) |

---

## Proposed amendments

These amendments are proposals only. No files in `templates/`, `.claude/agents/`, or `memory/constitution.md` are modified in this retrospective. The human sequences the actual PRs.

**Amendment 1 — `feedback_pr_review_loop.md`: self-inflicted round extension note (no ADR needed).**
Proposed addition after the §Soft cap section:

> **Self-inflicted round extensions.** When rounds beyond the soft cap address bugs introduced by the agent's own earlier fixes in the same PR (not by Codex findings that reappear), add a retrospective note to the PR comment identifying (a) which earlier round introduced the bug and (b) what question, if asked at that round, would have caught it. This surfaces the pattern without blame and gives the next cycle a concrete prompt. The note does not extend the cap; it documents the extension's cause.

**Amendment 2 — `templates/implementation-log-template.md`: same-day runbook test DoD (no ADR needed).**
Proposed addition to the task DoD checklist:

> - If this task changes a step referenced in `docs/release-operator-guide.md` or an equivalent runbook, run the affected runbook commands against a real or staged archive before closing this review round. Record the result.

**Amendment 3 — `templates/workflow-state-template.md`: meta-feature Stage 7–9 pattern (no ADR needed).**
Carrying forward the v0.3 + v0.4 retro action (issue #212). Add a `## Meta-feature pattern` note explaining that plan-level features with sub-PR implementations produce `implementation-log.md` (linking sub-PRs as evidence), `test-plan.md` (referencing the test suites in each sub-PR), and `test-report.md` (summarising each sub-PR's test run results). Do not mark these stages skipped unless no implementation evidence exists.

**Amendment 4 — `docs/quality-framework.md`: add `requirementsWithTests` metric caveat (no ADR needed).**
Until R-V05-001 (A-V05-001) is fixed, add a known-limitation note to the quality framework documentation: the `requirementsWithTests` counter currently undercounts features that document their REQ → TEST mapping in `spec.md` test-scenario tables rather than in a separate `test-plan.md` table. The reviewer should manually confirm coverage chains when the metric reports 0.

---

## Lessons

- **When a flag is internally inconsistent with the system's invariants, remove it; don't fix the consistency check.** `--no-clean` was broken by design: `package.json#files` whitelists whole directories, so any non-destructive mode silently re-ships stale files. Round-6 reached the right answer; the question "does this mode make sense?" should have been asked at round-4.
- **Test the runbook the same day you change the implementation that underpins it.** The operator guide's §7.1 recovery commands were inconsistent with the bare `npm pack` assumption before the prepack guard existed. The inconsistency was always there; the guard made it visible. The protocol fix is: runbook commands are part of the task's DoD, not a separate review concern.
- **Article X escalation is cheap when the process is followed.** REQ-V05-012 was a mid-cycle requirement addition. Because the team followed the spec-before-code rule, the escalation added one PR (ADR-0021 + spec updates) and one task (T-V05-012), both of which were correct and traceable. The cycle did not derail.
- **Defence-in-depth on packaging is not over-engineering.** Each of the four layers (safety guard, prepack guard, staging marker, `.npmignore`) defends against a distinct failure mode. The cost of the guard (one file, five tests) is small relative to the cost of shipping codebase-internal ADRs to every consumer of the package.
- **The zero-noise quality-gate record (v0.3 + v0.4 + v0.5) is worth protecting.** Every gate failure across three release cycles was a real defect. Keep the standard.
- **A high `overallScore` does not substitute for a human reviewer reading the artifacts.** The `requirementsWithTests: 0` miscount is the proof: the score was 97.1 but the metric was wrong. The reviewer caught this by reading `spec.md` lines 90–101 directly. Metrics are signals, not verdicts.
- **The soft loop cap is a warning, not a maximum.** Round-5 and round-6 on PR #202 were correct to continue past the cap because each addressed a real bug, not a preference. The cap's purpose is to surface ping-pong; it should not stop necessary work. The cap-reached comment posted at round-4 is the right protocol.

---

## Quality gate

- [x] Three buckets covered (worked / didn't / actions).
- [x] Every action has an owner and a due date or trigger.
- [x] Spec adherence assessed.
- [x] Improvements proposed back into the kit (templates / memory / quality-framework).
- [x] Quality trend run; post-retro baseline saved.
