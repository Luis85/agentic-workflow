---
id: RETRO-BRANCH-001
title: Shape B Branching Adoption — Retrospective
stage: learning
feature: shape-b-branching-adoption
status: complete
owner: retrospective
inputs:
  - review.md
  - implementation-log.md
  - workflow-state.md
created: 2026-05-03
updated: 2026-05-03
---

# Retrospective — Shape B Branching Adoption

## Outcome

The file-change half of the feature shipped cleanly: `APPROVED_WITH_FINDINGS` verdict (no blocking findings), verify gate green, all 11 file-level requirements passed against their deterministic spec verification commands. The five human-owned remote operations (branch seeding, default-branch flip, ruleset PATCH, Pages env allow-list, `release/v0.5.0` cleanup) remain pending post-retro and are tracked in the implementation log. The feature did not ship on the original narrowed plan (Stages 1–4 + ADR + issue only) — the human operator opted into the full Stages 5–11 run mid-flight, which is the correct call given the value delivered.

Quality trend: no `npm run quality:metrics` baseline was captured for this feature slug; the verify gate (291 tests passing, check:links green, check:agents ok) serves as the post-implementation signal. A future baseline should be seeded after the first full-workflow feature run.

---

## What Worked Well

**Strict scope separation between file-level and remote-owned tasks.** The dev agent's explicit split in the implementation log — listing every remote/human-owned task in §"Tasks NOT executed" — made the review straightforward. The reviewer could verify all 11 file-level requirements in isolation without needing remote state, and the hand-off notes for the release-manager were unambiguous as a result.

**Deny-count baseline recorded before any edit (T-BRANCH-003).** The pre-edit baseline capture as the first substantive step meant the spec's arithmetic error (spec claimed 12 entries, actual was 14) was caught and corrected in the log rather than silently propagated forward. NFR-BRANCH-005 was then held against the corrected floor (21 >= 14), not the stale spec floor (19 >= 12). This is the TDD-ordering principle paying off at a spec-arithmetic level.

**Anchor breakages surfaced and fixed in the same session.** The section rename in IF-05 edit 4 (`Required main ruleset` → `Required ruleset for develop, main, demo`) inevitably broke four intra-doc anchors in `docs/ci-automation.md` and `docs/security-ci.md`. Because the verify gate ran immediately after each edit, all four were found and fixed before the final log entry, rather than becoming deferred CI failures.

**OPEN-BRANCH-001 resolved without expanding dev scope.** The T-BRANCH-024 spike correctly determined that no `.github/workflows/<bot>.yml` scheduler files exist in the repo, converting T-BRANCH-025 from an edit task to a documentation-only N/A finding. The dev agent escalated through the log rather than inventing an edit that wasn't needed.

**CLAR-003 and CLAR-004 resolved at design stage.** Both the demo promotion automation question (manual `chore/promote-demo` PR, no CI auto-trigger) and the ruleset-vs-legacy-protection-rule question (GitHub rulesets, available on free-tier for public repos) were resolved before specification, which meant the spec's IF-10 through IF-12 were written against confirmed architecture. No mid-implementation reversals.

**ADR-0020 immutability respected throughout.** Multiple agents touched ADR-0020 (architect in Stage 4 updated frontmatter; dev in Stage 7 left the body untouched). The immutable-body rule held across the stage boundary without manual enforcement.

---

## What Didn't Work Well

**F-007: `check:links` parsed a relative link inside a quoted example in `test-report.md:154`.** The qa agent's `test-report.md` included a quoted ADR README fragment containing `0027-adopt-shape-b-branching-model.md` as bare text. The link checker resolved it relative to `specs/shape-b-branching-adoption/` and flagged a broken file link. The link checker does not skip content inside fenced code blocks or inline code spans, so any quoted example that contains a path-like string is a false-positive risk. This was a `check:links` regression introduced by the qa stage, not by the file-change PR. The same class of false positive appeared in the implementation log at `spec.md:285` (a quoted CLAUDE.md example containing a relative path), though that one resolved as green by review time.

**Nested worktree creation path.** This branch (`feat/shape-b-branching-stage5`) was created inside `.worktrees/shape-b-stage5/`, which is itself a worktree rooted at the main repo. When agents reference paths relative to the worktree root, they are correct; when any tooling or human command attempts to create a new worktree from inside `.worktrees/shape-b-stage5/`, the result would be a nested `.worktrees/shape-b-stage5/.worktrees/<new-slug>/` path rather than the canonical `.worktrees/<new-slug>/` path. This is a known `git worktree` behaviour — the worktree command resolves paths relative to the cwd, not the main tree root. It was not triggered during this feature (no sub-worktrees were created), but it is an undocumented pitfall.

**Workflow-state `implementation-log.md` status drift (F-001).** At review time, `workflow-state.md` still showed `implementation-log.md: pending` even though the dev agent had produced a complete, detailed log. The dev agent's procedure did not include a final step to update the artifact status on stage completion. This is a recurring pattern: agents complete their primary artifact but do not close the loop on the state file.

**Spec arithmetic miss (deny-count).** The spec's IF-01 stated a pre-edit baseline of 12 deny entries and derived a post-edit floor of `>= 19`. The actual pre-edit count was 14 (two additional `branch -d` patterns per branch). The spec was not wrong in intent — the invariant was "deny-list does not shrink" — but the concrete floor number was wrong. This required the dev agent to correct it in the log rather than in the spec, which is the right escalation path per Article I. However, if the spec had been verified at plan time with the actual `settings.json` count, the arithmetic would have been correct from the start.

---

## Spec Adherence

All 11 file-level requirements (REQ-BRANCH-001 through -015 minus the four remote-pending ones) were delivered as specified. The two deviations were:

1. **Deny-count arithmetic (REQ-BRANCH-005 / NFR-BRANCH-005):** the spec's concrete floor number was corrected in the implementation log; the invariant itself was honoured. Not a spec drift — a spec-arithmetic clarification handled correctly.

2. **Anchor side-effects of IF-05 edit 4:** the spec did not enumerate the four downstream anchors that the section rename would break. These were discovered during verify and fixed in scope. Not a requirement change — an unavoidable implementation side-effect that the spec did not foresee. Recorded in the log.

No requirements changed mid-flight. The four OPEN-BRANCH items were resolved at their designated stages (OPEN-BRANCH-001 by the spec's IF-09 procedure via T-BRANCH-024 spike; OPEN-BRANCH-002 deferred to Step 11; OPEN-BRANCH-003 explicitly out of scope per PRD NG).

---

## Process Observations

**Stage sequence ran correctly but with one consent gate mid-flight.** The feature began with a scoped plan (Stages 1–4 + ADR + issue). The human operator opted into the full pipeline (Stages 5–11) mid-flight. The workflow handled this gracefully: each stage's artifacts were produced in order without cross-contamination, and the hand-off notes in `workflow-state.md` tracked the opt-in decision.

**Stage 8 (Testing) preceded Stage 7 (Implementation) in the execution order.** The qa agent produced `test-plan.md` and `test-report.md` before the dev agent produced the implementation log, which is consistent with TDD-first ordering in the task plan. The qa stage correctly deferred the three MANUAL tests to the deployment phase without blocking the review.

**The verify gate is the most valuable quality signal in this workflow.** It caught four anchor breakages immediately, confirmed the deny-count invariant, and cleanly separated file-level defects (fixable now) from environment defects (`check:script-docs` typedoc missing, pre-existing). Running it after every logical edit cluster — not just at the end — is the practice that caught the anchors before they became CI failures.

**The implementation log format is over-specified for a documentation-only feature.** The log's step-by-step structure (with `Baseline`, per-step verification commands, and `Outcome: done` closings) is well-suited to code changes, but for a feature that is entirely documentation and config edits, the granularity added length without proportional traceability gain. A lighter format (one entry per interface, with verification output inline) would suffice for documentation-only features.

---

## Quality Trend

No prior `quality:metrics` baseline exists for this feature slug. The post-implementation verify signal: 291 script tests passing, all structural checks green, verify gate green (less the pre-existing typedoc worktree-environment artefact). This serves as the de facto post-retro baseline.

`npm run quality:metrics -- --feature shape-b-branching-adoption --save` should be run by the human operator after the remote ops complete and the PR merges to establish a persistent baseline for future comparisons.

---

## Action Items

| ID | Action | Owner | Due |
|---|---|---|---|
| A-BRANCH-001 | File a follow-up issue: should `check:links` skip content inside fenced code blocks and inline code spans? The F-007 pattern (link checker flagging bare paths inside quoted examples) is a recurring false-positive risk. Draft the issue body as: "The link checker currently parses `]( )` patterns inside fenced code blocks in `specs/` and `test-report.md`, causing false-positive broken-link errors when examples quote file paths. Evaluate whether the `check-markdown-links` script should use a pre-processor to strip fenced code and inline code before scanning, or whether the qa agent's documentation convention should wrap all quoted examples in code fences." | human | next sprint |
| A-BRANCH-002 | Add a "Known pitfall: creating worktrees from inside a worktree" section to `docs/worktrees.md`. Content: if your cwd is `.worktrees/<slug>/` when you run `git worktree add`, the new worktree will be created as `.worktrees/<slug>/.worktrees/<new-slug>/` instead of the canonical `.worktrees/<new-slug>/`. Always run `git worktree add` from the main repo root, not from inside an existing worktree. | human | next sprint |
| A-BRANCH-003 | Update the dev agent's stage-completion checklist (`.claude/agents/dev.md` or the implementation-log template) to include an explicit final step: update `workflow-state.md` `implementation-log.md:` status to `in-progress` (or `complete`) before handing off to qa or reviewer. This prevents the F-001 status-drift pattern from recurring. | human (template PR) | next sprint |
| A-BRANCH-004 | Complete the five human-owned remote operations in spec §State Transitions order: (1) T-BRANCH-006 Pages env allow-list, (2) T-BRANCH-008 seed `develop` and `demo`, (3) T-BRANCH-010 default-branch flip to `develop`, (4) T-BRANCH-012 ruleset PATCH, (5) T-BRANCH-002 `release/v0.5.0` cleanup. Capture each step's evidence in `implementation-log.md`. Do not invert the order. | human | immediately post-merge |
| A-BRANCH-005 | After remote ops complete, run `npm run quality:metrics -- --feature shape-b-branching-adoption --save` to create the first persistent quality baseline for this feature slug. | human | post-merge, after A-BRANCH-004 |

---

## Proposed Template Amendments

### Amendment 1: `docs/worktrees.md` — nested-worktree pitfall

**Proposed addition to §Common pitfalls:**

> **Creating a worktree from inside another worktree.** Running `git worktree add` while your cwd is `.worktrees/<slug>/` creates the new worktree under `.worktrees/<slug>/.worktrees/<new-slug>/`, not under `.worktrees/<new-slug>/`. The canonical path for all worktrees is `.worktrees/<slug>/` directly under the repo root. Always run worktree commands from the main repo root.

This is advisory documentation only — no ADR required. Opens as a documentation PR.

### Amendment 2: `check-markdown-links` script — fenced-code-block skip

**Proposed behaviour change:** the link checker should strip fenced code blocks (` ```...``` `) and inline code spans (`` `...` ``) from file content before scanning for `\[text\]\(path\)` patterns. This would eliminate the class of false-positive that flagged `test-report.md:154` and `spec.md:285` in this feature.

**Scope:** medium. Requires a change to the link-checker pre-processor in `scripts/check-markdown-links.js` (or equivalent). Needs a unit test covering "bare path inside a code fence is not flagged". Opens as a follow-up issue (A-BRANCH-001 above) before a PR.

**Does not require an ADR** — this is a tooling improvement to an existing script, not an architectural decision.

### Amendment 3: dev agent stage-completion checklist

**Proposed addition to `.claude/agents/dev.md` or `templates/implementation-log.md`:**

After the final verify run, the dev agent should add a closing step:

> **Stage 7 close-out:** update `workflow-state.md` artifact entry for `implementation-log.md` to `in-progress` (if human-owned tasks remain) or `complete` (if all tasks executed). Record the hand-off date and the next agent in `## Hand-off notes`.

This prevents the F-001 status-drift pattern. Opens as a template-improvement PR after human review.

---

## Lessons

- Pre-edit baseline capture as the first task (before any file edit) catches spec-arithmetic errors before they propagate to NFR floors.
- Fenced code blocks in spec and test artifacts are a link-checker blind spot; qa agents should wrap all path-literal examples in inline code or code fences to avoid false-positive `check:links` failures.
- Worktrees must be created from the main repo root, not from inside an existing worktree.
- A dev agent completing implementation should always close its loop in `workflow-state.md` — stage hand-off is not complete until the artifact status is updated.
- Documentation-only features benefit from a lighter implementation-log format; the full step-by-step structure is optimised for code changes.
- When a feature splits into file-owned and remote-owned halves, the split must be explicit in the implementation log and the review scope statement — otherwise the reviewer cannot tell what is in scope.
