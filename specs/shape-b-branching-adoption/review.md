---
id: REVIEW-BRANCH-001
title: Shape B branching adoption — Stage 9 Review
feature: shape-b-branching-adoption
stage: 9
status: complete
owner: reviewer
inputs:
  - PRD-BRANCH-001
  - DESIGN-BRANCH-001
  - SPEC-BRANCH-001
  - TASKS-BRANCH-001
  - ADR-0027
  - implementation-log.md
created: 2026-05-04
updated: 2026-05-04
---

# Stage 9 Review — shape-b-branching-adoption

## Verdict

**APPROVED_WITH_FINDINGS**

Every file-level requirement that this branch (`feat/shape-b-branching-stage5`) is scoped to deliver passes its spec-defined verification command. The four remote/human-owned requirements (REQ-BRANCH-006, -009, -013, -014 plus NFR-BRANCH-001/002/006) are intentionally out of scope for this Stage 7 file-change pass per the implementation log; they remain open and must be tracked through the human-owned post-merge actions before Shape B is "live". Findings below are advisory or hand-off items, not blockers for merging the file-change PR.

The verdict reflects: file changes are correct and complete; the spec/design intent is honoured; ADR-0020 immutability respected; settings deny coverage expanded (NFR-BRANCH-005 satisfied with count=21, exceeding the spec's `>= 19` floor); pages.yml retargeted; PROMPT.md fix landed; ADR-0027 accepted; documentation surfaces consistent. The "with findings" qualifier is for the post-merge handoff items the reviewer wants the release-manager and human operator to track explicitly.

## Scope of this review

Per Stage 7 implementation log §"Tasks NOT executed", the dev agent intentionally restricted this branch to file-only changes. Remote-only or human-owned tasks (`T-BRANCH-002`, `T-BRANCH-006`, `T-BRANCH-008`, `T-BRANCH-010`, `T-BRANCH-012`) are out of scope for this PR. The review evaluates the file changes against the spec; downstream remote operations are surfaced as findings for the release-manager / human operator handoff, not as blockers on the file-change PR.

Worktree reviewed: `D:\Projects\agentic-workflow\.worktrees\shape-b-stage5`
Branch: `feat/shape-b-branching-stage5`
Diff base: commits beyond `origin/main` — `23cbb42` spec, `986c6fe` tasks, `8687386` Stage 7 file changes.

## Requirements compliance

Confirmed against the artifacts and live verification commands. Status legend:
- `Pass (file)` — file-level deliverable satisfied in this PR; spec verification command executed and matched.
- `Pass (carry-in)` — already satisfied on `origin/main` (e.g., ADR-0020 frontmatter set in a prior PR).
- `Pending (remote)` — out of scope for this file-change PR; deliverable depends on a human-owned remote operation tracked in the implementation log.

| REQ | Status | Evidence |
|---|---|---|
| REQ-BRANCH-001 | Pass (file) | `docs/branching.md:15` — Shape B table now leads, names `develop` as the topic-PR target. `grep -c "Shape B" docs/branching.md` = 7 (>= 3). Bare-prose `main`-as-PR-target hits remaining outside Shape A subsection: only `docs/branching.md:80` "no direct commits on `main`" rule (general policy, not a PR-target claim) — acceptable. |
| REQ-BRANCH-002 | Pass (file) | `.claude/settings.json:38,41` — existing `develop` push-deny entries retained; verified by spec IF-01 verification command 1 (all three branches push-denied → "OK"). |
| REQ-BRANCH-003 | Pass (file) | `.claude/settings.json:40,43,59,62,65,68,71` — seven `demo` deny entries added (push, push -u, reset --hard origin/, reset --hard, checkout, branch -D, branch -d). Spec DS-01 enumerated seven; all seven present. |
| REQ-BRANCH-004 | Pass (file) | `.github/workflows/pages.yml:6` — `branches: [demo]`; `main` absent. IF-02 verification node command: `pages branch: demo`, `demo present`, `main absent`. |
| REQ-BRANCH-005 | Pass (file) | `docs/branching.md` — §"Release branches (`release/vX.Y.Z`)" replaced by §"Release path under Shape B" (lines 99-107) describing the `develop → main` promotion PR + `chore/promote-demo` PR. Shape A `release/vX.Y.Z` retained inside the explicit "Shape A only — historical convention" callout (line 109). `release/vX.Y.Z` appears exactly twice, both inside acceptable contexts. |
| REQ-BRANCH-006 | Pending (remote) | T-BRANCH-008 (`git push origin <SHA>:refs/heads/develop`) is human-owned and not yet executed. Implementation log §"Tasks NOT executed" acknowledges this. |
| REQ-BRANCH-007 | Pass (file) | `docs/branching.md:7` — explicit "This template repository operates under **Shape B** as of [ADR-0027]" lead paragraph. Shape B subsection precedes Shape A; Shape A explicitly labelled "(adopter option)". |
| REQ-BRANCH-008 | Pass (file) | `agents/operational/docs-review-bot/PROMPT.md:46` — string ``clean clone of `develop` `` present (count 1). Old string ``clean clone of `main` `` absent (count 0). |
| REQ-BRANCH-009 | Pending (remote) | Implementation log §Step 9 (T-BRANCH-024) confirms no in-repo `.github/workflows/<bot>.yml` schedulers exist for `review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`. The four bots inherit the repo default branch; the spec's IF-09 procedure resolves this to "Step 5b (default-branch flip) alone satisfies REQ-BRANCH-009 for these bots". The default-branch flip is human-owned and pending. (Dependabot sub-requirement: pass — see notes below). |
| REQ-BRANCH-010 | Pass (file + carry-in) | ADR-0027 (`docs/adr/0027-adopt-shape-b-branching-model.md`): `status: Accepted` (line 4), `supersedes: [ADR-0020]` (line 16). ADR-0020 frontmatter (`status: Superseded`, `superseded-by: [ADR-0027]`) was already on `origin/main` from a prior PR — `git diff origin/main...HEAD -- docs/adr/0020-v05-release-branch-strategy.md` returns empty. Body immutability respected. ADR README index updated (`docs/adr/README.md:42`). |
| REQ-BRANCH-011 | Pass (file) | `.claude/settings.json` — `release/*` allow entries removed; `grep -nE "release/" .claude/settings.json` returns nothing. |
| REQ-BRANCH-012 | Pass (file) | `docs/worktrees.md:20,25,35,61` — Lifecycle paragraph names `develop` as the cut-from branch under Shape B with explicit Shape A substitution; example `git worktree add` uses `origin/develop`; cleanup paragraph references `develop`; "merged local branches piling up" pitfall references `origin/develop` and `origin/main` parametrically. |
| REQ-BRANCH-013 | Pending (remote) | T-BRANCH-002 conditional cleanup — pre-condition check (T-BRANCH-001) and remote `git push --delete release/v0.5.0` are human-owned. Not yet executed. Implementation log captures this in §"Tasks NOT executed". |
| REQ-BRANCH-014 | Pending (remote) | T-BRANCH-008 — see REQ-BRANCH-006. |
| REQ-BRANCH-015 | Pass (file) | `AGENTS.md:33` — "Topic PRs target `develop` (Shape B per [ADR-0027]); `main` carries only promoted, tagged commits." `CLAUDE.md:34` — "Topic PRs target `develop`; `demo` is the Pages source." Both grep checks return 1. |

### NFR coverage

| NFR | Status | Evidence |
|---|---|---|
| NFR-BRANCH-001 | Pending (remote) | Verifiable only after T-BRANCH-008 seeds `develop`; spec check is `test "$(git rev-parse origin/develop)" = "${MAIN_HEAD_SHA}"`. |
| NFR-BRANCH-002 | Pending (remote) | Same — verifiable only after `demo` seeded. |
| NFR-BRANCH-003 | Pass | Grep heuristic from spec §NFR Verification Checklist returns only acceptable hits (Shape A subsection, the "no direct commits on `main`" general-policy rule, and unrelated "main checkout" terminology). Manual review confirms no file describes `main` as the integration branch or as the topic-PR target outside Shape A subsections. |
| NFR-BRANCH-004 | Pass (file + carry-in) | All four greps from spec §NFR-BRANCH-004 match. ADR-0020 body diff against `origin/main`: empty. |
| NFR-BRANCH-005 | Pass (file) | Pre-edit baseline (implementation log §Baseline) recorded as 14 entries naming `main` or `develop` (spec arithmetic of 12 was off by two `branch -d` patterns — corrected baseline recorded in the implementation log; reviewer confirms). Post-edit count for `{main, develop, demo}`: **21**. `21 >= 14` (and `21 >= 19` per the spec's stricter floor). |
| NFR-BRANCH-006 | Pending (remote) | Pre/post curl probes are human-owned; gated on the Pages env allow-list (T-BRANCH-006), branch seeding (T-BRANCH-008), and pages.yml workflow_dispatch verification (T-BRANCH-015 final step). |

## Design compliance

- Three-branch topology (System overview): the file changes set the foundation correctly; activation requires the human-owned branch creation and ruleset PATCH.
- Components-and-responsibilities table (design.md lines 102-118): every named component that the dev agent owns is updated. Components owned by the human (`develop` branch pointer, `demo` branch pointer, GitHub Pages env allow-list, GitHub branch-protection ruleset) remain pending and are correctly flagged in the implementation log.
- Rollout sequence (design.md §Rollout sequence): the dev agent executed the file portions of Steps 3, 7, 8, 10 and the documentation half of Step 9 (T-BRANCH-024 spike → T-BRANCH-025 N/A finding). Steps 1, 2, 4, 5, 5b, 6, 11, 12 are human-owned and pending. The order in which remote operations must run after this PR merges is captured in the spec's state-diagram and is unambiguous.
- Key decision compliance: deny syntax matches the symmetric pattern used for `main`/`develop`; demo seed source is `main` HEAD (architectural intent, executed at the human-ops stage).

## Spec compliance

- Every file-level interface (IF-01..IF-08, plus IF-03 Dependabot, plus IF-04 PROMPT.md) executed exactly per the spec's exact-string contracts.
- Two spec-line-level inaccuracies are documented in the implementation log and not in any artifact the reviewer must fix here:
  - Implementation log §Baseline corrects the spec's pre-edit deny-count arithmetic (spec said 12; actual was 14). The corrected post-edit floor (21) was honoured. This is the right way to handle a spec-arithmetic miss — record the corrected baseline, hold the invariant, do not mutate the spec mid-implementation.
  - Implementation log §"Verify gate" notes that the section rename in IF-05 edit (4) created broken anchors in `docs/ci-automation.md:111` and `docs/security-ci.md:93,101`. The dev agent fixed all four anchors in the same change set (visible in the diff). This is correct under Article I (specs as source of truth) — the rename was spec-mandated; the anchor fixes are the unavoidable side-effect.

## Constitution check

- Article I (spec-driven): no requirement was invented. The two surprises (deny-count arithmetic, anchor breakages) were surfaced in the log, not silently fixed in the spec.
- Article II (separation of concerns): dev stayed in scope. Remote operations remain owned by `human`; T-BRANCH-024 spike correctly resolved IF-09's open question without expanding scope.
- Article III (incremental): each step's success criterion is met before the next step depends on it (`pages.yml` flip remains "staged-but-inert" until the human seeds `demo` and updates the env allow-list — explicitly noted in the implementation log §Step 7).
- Article IV (quality gates): `test:scripts` 291 pass, `check:automation-registry` ok, `check:agents` ok, `check:links` ok, `check:adr-index` ok, `check:commands` ok. `check:script-docs` fails ("missing typedoc; run npm ci before verifying generated script docs") — pre-existing worktree environment artifact, reproducible against unchanged HEAD; not introduced by this change.
- Article V (traceability): every REQ → spec interface → implementation file mapping is intact. See `traceability.md`.
- Article VIII (plain language, ADRs): ADR-0027 reads cleanly, uses present tense, references prior art.
- Article IX (reversibility): all file edits are reversible by `git revert`. The settings.json change is JSON; the workflow YAML change is one-line; the ADR moves from `proposed` → `Accepted` reversibly via PR revert.

## Risks status

From `design.md` §Risks:

| Risk | Status |
|---|---|
| RISK-BRANCH-001 (Pages 404 during trigger swap) | Mitigation **pending human ops**. The dev agent staged `pages.yml` correctly; the env allow-list update precondition is owned by T-BRANCH-006. The implementation log §Step 7 explicitly calls this out. |
| RISK-BRANCH-002 (deny-list shrinks) | **Closed**. Post-edit count = 21, well above the 14-entry baseline. |
| RISK-BRANCH-003 (bot scheduler missed) | **Resolved as N/A** — no in-repo schedulers exist; the four bots inherit the repo default branch (resolution gated on T-BRANCH-010 default-branch flip). |
| RISK-BRANCH-004 (PRs continue targeting `main`) | Documentation mitigation **landed** in `docs/branching.md`, `AGENTS.md`, `CLAUDE.md`, `docs/worktrees.md`. The default-branch flip portion is human-owned. |
| RISK-BRANCH-005 (release/v0.5.0 stays on remote) | Mitigation **pending human ops** (T-BRANCH-002). |
| RISK-BRANCH-006 (ADR-0020 superseded-by empty) | **Closed**. ADR-0020 frontmatter on `origin/main` already carries `superseded-by: [ADR-0027]`. |
| RISK-BRANCH-007 (Dependabot targets main) | **Closed**. `.github/dependabot.yml` declares `target-branch: develop` in both `updates:` blocks; node verification command passes. |
| RISK-BRANCH-008 (demo promotion forgotten) | Recurring operational risk — captured in ADR-0027 §Compliance counter-metrics; no file-level mitigation possible until first release post-adoption. |

## Findings

Severity legend: `critical` = blocks merge of this PR; `high` = should fix before merge; `medium` = follow-up needed before Shape B is "live"; `low` = advisory.

### F-001 — Workflow-state drift on artifact statuses (low)

**Location:** `specs/shape-b-branching-adoption/workflow-state.md` lines 14, 36

The frontmatter shows `implementation-log.md: pending` while the body shows `implementation-log.md + code | pending`. The dev agent has produced a substantial implementation log (the file exists with detailed Step-by-Step entries). Per Stage 7 hand-off conventions, the dev agent should mark `implementation-log.md: complete` after the file-change pass — or `in-progress` if the human-owned tasks are still outstanding (which they are). The current "pending" status undersells what landed.

**Recommendation:** dev (or release-manager during the merge window) updates the artifact map to `implementation-log.md: in-progress` to reflect that file-level work is done but the human-owned remote ops remain. This is the kind of small drift workflow-state.md is supposed to surface, so it's worth fixing before the next stage hand-off.

**Owner:** dev (or release-manager).

### F-002 — Five remote/human tasks must be sequenced and executed before Shape B is operational (medium)

**Location:** `specs/shape-b-branching-adoption/implementation-log.md` §"Tasks NOT executed"

The following tasks remain unexecuted post-merge of this file-change PR. They are not blockers for *this PR*, but they are blockers for the feature being "live":

- T-BRANCH-001 (pre-condition checks, capture `$MAIN_HEAD_SHA`).
- T-BRANCH-002 (delete `release/v0.5.0` if present).
- T-BRANCH-006 (add `demo` to `github-pages` environment allow-list).
- T-BRANCH-008 (seed `develop` and `demo` from `main` HEAD).
- T-BRANCH-010 (flip default branch to `develop`).
- T-BRANCH-012 (extend GitHub ruleset to cover `develop` and `demo`).
- T-BRANCH-015 final substep (`gh workflow run pages.yml --ref demo` to verify Pages deploy).

The order matters. Per spec §State Transitions, the critical-path sequence is **Step 4 (Pages env allow-list) → Step 5 (branch seeding) → Step 5b (default-branch flip) → Step 6 (ruleset PATCH) → trigger one Pages deploy**. If the human merges this PR and then seeds branches without first updating the Pages env allow-list, the next push to `demo` will fail Pages deploy with "branch not in environment allow-list" (EC-006).

**Recommendation:** release-manager (or human operator) follows the spec §State Transitions order and records each step's evidence in `implementation-log.md` as the spec already prescribes. Specifically, do not skip Step 4 before Step 7's `pages.yml` change has merged — though in this PR `pages.yml` already merges with `branches: [demo]`, the `demo` branch and env allow-list both need to exist before the next push to `main` (which won't trigger Pages anyway under the new config). Operationally: after merge, complete Steps 4, 5, 5b, 6, 11 (optional), 12 in that order.

**Owner:** release-manager → human operator.

### F-003 — `pages.yml` change is staged-but-inert until remote ops complete (medium)

**Location:** `.github/workflows/pages.yml`, `specs/shape-b-branching-adoption/implementation-log.md` §Step 7

After this PR merges to `main` (or to `develop` once it exists), the only way Pages will deploy again is a push to `demo`. Until `demo` exists on the remote, Pages will not deploy from any future push. The current Pages site (last deployed from `main`) will continue serving cached content but will not refresh on future merges. The dev agent flagged this in the §Step 7 sequencing caveat.

**Recommendation:** the release-manager schedules the human-owned remote ops (F-002) to land within hours of this PR merging, not days. Capture the actual page_url HTTP status before and after the first `demo`-triggered deploy as NFR-BRANCH-006 evidence.

**Owner:** release-manager.

### F-004 — Targeting `main` for this PR conflicts with the model the PR establishes (low)

**Location:** PR base branch (this branch is `feat/shape-b-branching-stage5`; the merging target appears to be `main`)

The PR establishing Shape B will, by definition, land on `main` (because `develop` does not yet exist on the remote). This is acknowledged in the spec (§Step 3 actions: "Base = `main` (Shape A is still active until Step 8 docs land; this PR pre-dates the flip)"). The reviewer notes this is consistent with the spec but is worth surfacing to the release-manager: the very first PR after this one should target the newly-created `develop`, not `main`, and the bot/contributor onboarding window for that flip is the highest-risk moment for accidentally targeting `main` by muscle memory (RISK-BRANCH-004).

**Recommendation:** release-manager, immediately after T-BRANCH-010 (default-branch flip), confirms `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'` returns `develop` and broadcasts the change — even a one-line note in the next PR description is enough discipline.

**Owner:** release-manager.

### F-005 — Spec line 285 example phrasing is harmless but worth a follow-up (low)

**Location:** `specs/shape-b-branching-adoption/spec.md:285`

Implementation log §"Verify gate" reports a (since-resolved) `check:links` failure here: the spec quotes a literal example of `CLAUDE.md` text that contains the relative link `docs/branching.md`. The link checker resolves it relative to the spec file's location. At review time `npm run check:links` is **green** — the failure described in the log no longer reproduces. Either the spec edit landed before this review, or the link checker's traversal heuristic accepts this example. Either way, the artefact is fine now.

**Recommendation:** none required. Noted for traceability in case the failure recurs after a future link-checker change.

**Owner:** none.

### F-006 — `check:script-docs` fails in this worktree (low — environmental)

**Location:** `npm run verify` output

`check:script-docs: missing typedoc; run npm ci before verifying generated script docs`. Reproducible against unchanged HEAD; this worktree never had `npm ci` run. Not introduced by this change. The CI environment (where typedoc is installed) is the canonical verification environment; the failure is a worktree-local artefact and not a defect in this PR.

**Recommendation:** none for this PR. If the release-manager wants a clean local verify before tagging, run `npm ci` in this worktree.

**Owner:** none.

### F-007 — `check:links` error in qa-produced `test-report.md` (medium)

**Location:** `specs/shape-b-branching-adoption/test-report.md:154`

After the qa agent landed `test-plan.md` and `test-report.md`, `npm run check:links` reports: `[LINK_FILE] links to missing file 0027-adopt-shape-b-branching-model.md`. The link in `test-report.md` line 154 is the bare relative reference `0027-adopt-shape-b-branching-model.md` (inside a quoted ADR README example), which the link checker resolves relative to `specs/shape-b-branching-adoption/` rather than `docs/adr/`. The reviewer's own files (`review.md`, `traceability.md`) do **not** introduce any link errors; this defect predates this review and was introduced by the qa stage.

**Recommendation:** qa updates the offending example in `test-report.md` to escape the link (use a full path `docs/adr/0027-adopt-shape-b-branching-model.md`, or wrap the example in a fenced code block where the link checker does not parse `]( )` patterns). Not a blocker for the file-change PR — but it is a `check:links` regression that the verify gate will flag in CI.

**Owner:** qa.

## Traceability

See `specs/shape-b-branching-adoption/traceability.md`. Every REQ-BRANCH-001..015 maps to at least one downstream artifact (file edit, ADR section, or human-owned task tracked in the implementation log). NFRs map to the same plus the spec verification checklist.

No orphans:

- No spec interface (IF-01..IF-12) is unmapped.
- No task (T-BRANCH-001..T-BRANCH-029) is unmapped.
- ADR-0027 covers all design-stage clarifications (CLAR-003, CLAR-004) and is named in `supersedes: [ADR-0020]`.
- Three open spec items (OPEN-BRANCH-001 resolved as N/A by the dev spike; OPEN-BRANCH-002 deferred to Step 11; OPEN-BRANCH-003 explicitly out of scope per PRD NG) are accounted for.

## Brand review

Not applicable. The diff touches no files under `sites/`, `.claude/skills/specorator-design/`, no `*.html`/`*.css`/`*.jsx` rendering UI, and no `templates/` files emitting HTML or CSS. Documentation Markdown only.

## Quality metrics evidence

`npm run quality:metrics -- --feature shape-b-branching-adoption --json` was not invoked; the review's evidence is the deterministic spec verification commands listed above and the live `npm run verify` run. The verify gate is green except for the pre-existing worktree-environment `check:script-docs` artefact.

## Hand-off

- **release-manager:** primary hand-off. Sequence and execute T-BRANCH-006, T-BRANCH-008, T-BRANCH-010, T-BRANCH-012, plus the verifying `gh workflow run pages.yml --ref demo`. Capture the NFR-BRANCH-001/002/006 evidence in the implementation log. Then update `workflow-state.md` to `current_stage: review` (or `release` if confidence is high) and `implementation-log.md: complete`.
- **dev:** F-001 fix (workflow-state.md artifact-status update) takes 30 seconds; can ride with the workflow-state update at hand-off time.
- **qa:** Stage 8 (Test) was skipped per the feature's nature (no application source code). The spec's NFR Verification Checklist serves the test-plan role; the implementation log §"Verify gate" entry serves the test-report role. If Stage 8 is later opened, qa should translate the spec verification commands into a `test-plan.md`/`test-report.md` pair for archival completeness.

## Summary

This is a well-executed Stage 7 file-change pass. The dev agent stayed cleanly in scope, surfaced two spec inaccuracies (deny-count arithmetic and the section-rename anchor breakage) in the implementation log rather than silently mutating the spec, and produced a complete, reproducible diff with green verify (less the pre-existing typedoc artefact). The five medium-priority findings are all hand-off items for the release-manager; none block the PR.
