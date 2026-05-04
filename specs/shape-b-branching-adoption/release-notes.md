---
id: RELEASE-BRANCH-001
title: Shape B branching adoption — Release notes
stage: release
feature: shape-b-branching-adoption
version: post-merge (no version tag; this is a template operations change)
status: draft
owner: release-manager
inputs:
  - REVIEW-BRANCH-001
created: 2026-05-04
updated: 2026-05-03
---

# Release notes — Shape B branching adoption

Closes #255.

## Summary

The agentic-workflow template now operates under the Shape B branching model. `develop` is the integration branch where all topic PRs land. `main` carries only promoted, tagged commits. `demo` is the GitHub Pages source, ensuring the public preview always reflects a validated state rather than in-progress work.

The file-change PR (`feat/shape-b-branching-stage5`) delivers the settings, documentation, workflow, and ADR updates that wire the new topology. A small set of human-owned remote operations (branch seeding, GitHub UI changes) must be completed in a specific order after the PR merges — those steps are detailed in the Post-merge checklist below.

Downstream adopters are not affected. Shape A remains documented as a valid option for repositories that have not adopted Shape B.

## Changes

### New

- ADR-0027 (`docs/adr/0027-adopt-shape-b-branching-model.md`) — records the Shape B decision, rationale, compliance rules, and rollback strategy. Status set to Accepted.
- Seven `demo` push/reset/checkout/branch-delete deny entries added to `.claude/settings.json`, expanding the protected-branch surface from 14 entries (main + develop) to 21 (main + develop + demo). No deny entry was removed or weakened.
- `demo` declared as the `on.push.branches` trigger in `.github/workflows/pages.yml` (retargeted from `main`).
- Both `updates:` blocks in `.github/dependabot.yml` now declare `target-branch: develop`, making the Dependabot target explicit and resilient to future default-branch changes.

### Improved

- `docs/branching.md` — rewritten for Shape B. Shape B now leads; Shape A is retained as a documented adopter option. Release path updated to describe the `develop → main` promotion PR; `release/vX.Y.Z` branches retained as a Shape A historical callout only.
- `docs/worktrees.md` — lifecycle section names `develop` as the cut-from branch for Shape B, with a one-line adopter note for Shape A.
- `AGENTS.md` — "Branch per concern" bullet appended: topic PRs target `develop`; `main` carries only promoted, tagged commits.
- `CLAUDE.md` — permission-rules bullet updated to include `demo` in the push-deny list and to note that topic PRs target `develop`.
- `agents/operational/docs-review-bot/PROMPT.md` — tutorial-drift rule updated from "clean clone of `main`" to "clean clone of `develop`", eliminating false drift findings for users of that bot.
- `docs/adr/README.md` — ADR-0027 row status updated to Accepted.
- `docs/ci-automation.md` (line 111) and `docs/security-ci.md` (lines 93, 101) — four internal anchor links repaired after the `docs/branching.md` section rename (`Required main ruleset` → `Required ruleset for develop, main, demo`).

### Removed

- Two `release/*` push-allow entries removed from `.claude/settings.json` (`Bash(git push -u origin release/*)` and `Bash(git push origin release/*)`). The `release/vX.Y.Z` branch convention is retired under Shape B.

### Deprecated

- Shape A as the active model for this template repository. Shape A documentation is retained as an adopter option.
- `release/vX.Y.Z` branch convention for the template's own operations.

## Files changed

The following files were modified in the Stage 7 file-change pass on branch `feat/shape-b-branching-stage5`:

| File | Change |
|---|---|
| `.claude/settings.json` | +7 demo deny entries; -2 release/* allow entries |
| `.github/workflows/pages.yml` | `on.push.branches`: `main` → `demo` |
| `.github/dependabot.yml` | `target-branch: develop` added to both `updates:` blocks |
| `agents/operational/docs-review-bot/PROMPT.md` | "clean clone of `main`" → "clean clone of `develop`" |
| `docs/branching.md` | Full Shape B rewrite (six edits per spec IF-05) |
| `docs/worktrees.md` | `develop` named as cut-from branch |
| `AGENTS.md` | Topic-PR target clarified to `develop` |
| `CLAUDE.md` | Push-deny list and PR-target line updated |
| `docs/adr/0027-adopt-shape-b-branching-model.md` | Status: Proposed → Accepted |
| `docs/adr/README.md` | ADR-0027 row: Proposed → Accepted |
| `docs/ci-automation.md` | Anchor repair (line 111) |
| `docs/security-ci.md` | Anchor repairs (lines 93, 101) |
| `specs/shape-b-branching-adoption/spec.md` | (spec artifact, no behaviour change) |
| `specs/shape-b-branching-adoption/tasks.md` | (spec artifact, no behaviour change) |

ADR-0020 (`docs/adr/0020-v05-release-branch-strategy.md`) frontmatter was already updated to `status: Superseded` and `superseded-by: [ADR-0027]` by the architect in Stage 4. The body is immutable and was not touched.

## User-visible impact

**Template maintainer and contributors (Luis and future contributors):**

- All new topic PRs must target `develop`, not `main`. If the GitHub default branch is flipped to `develop` (post-merge step 5b below), this happens automatically for new PRs opened via the GitHub UI.
- `main` is now a release-only branch. Direct commits to `main` (other than via the `develop → main` promotion PR) are not permitted.
- To cut a release: complete work on `develop`, open a promotion PR from `develop` to `main`, tag from `main` HEAD, then open a `chore/promote-demo` PR to advance the `demo` branch.
- The `release/vX.Y.Z` branch workflow is retired. No action required for existing branches — T-BRANCH-002 (cleanup of `release/v0.5.0` if it still exists on the remote) is one of the post-merge human steps.

**GitHub Pages visitors:** No visible interruption is expected during the transition, provided the post-merge steps below are completed in order. Until `demo` is seeded and the Pages environment allow-list is updated, the Pages site continues to serve the last `main`-triggered deploy but will not refresh on future `main` merges.

**Operational bots (`review-bot`, `docs-review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`):** No bot has an in-repo scheduler that hard-codes a branch name. All four bots inherit the repository default branch. After the default-branch flip (step 5b), they will automatically operate against `develop`. `docs-review-bot` now references `develop` explicitly in its tutorial-drift rule.

**No breaking changes for downstream adopters.** Shape A documentation is retained; nothing in the adopter starter-template files changes semantics.

## Post-merge checklist (human-owned remote operations)

These steps are out of scope for the file-change PR. They must be completed in the order shown before Shape B is fully operational. See `specs/shape-b-branching-adoption/spec.md` §State Transitions and `specs/shape-b-branching-adoption/implementation-log.md` §"Tasks NOT executed" for the authoritative detail.

**Critical-path order: Step 4 must precede Step 5; Step 5 must precede Step 7.**

| Step | Task | Notes |
|---|---|---|
| 1 | T-BRANCH-001 — Capture `$MAIN_HEAD_SHA` (`git ls-remote origin main`) | Gate for all subsequent steps |
| 2 | T-BRANCH-002 — Delete `release/v0.5.0` from the remote if it exists (`git ls-remote --heads origin release/v0.5.0`; delete if found) | Conditional; check before acting |
| 3 | T-BRANCH-006 (Step 4) — Add `demo` to the `github-pages` environment allow-list in GitHub Settings | Must precede Pages trigger going live |
| 4 | T-BRANCH-008 (Step 5) — Seed `develop` and `demo` from `$MAIN_HEAD_SHA` (`git push origin <SHA>:refs/heads/develop` and `git push origin <SHA>:refs/heads/demo`) | Non-destructive; creates new pointers only |
| 5 | T-BRANCH-010 (Step 5b) — Flip the GitHub default branch to `develop` (GitHub Settings → Branches) | After `develop` exists on remote |
| 6 | T-BRANCH-012 (Step 6) — Extend the GitHub ruleset to cover `develop` and `demo` | After both branches exist |
| 7 | T-BRANCH-015 final step — Trigger one Pages deploy (`gh workflow run pages.yml --ref demo`) and confirm the site responds | Closes NFR-BRANCH-006 |
| 8 | Record NFR-BRANCH-001, NFR-BRANCH-002, and NFR-BRANCH-006 evidence in `implementation-log.md` | Closes the pending requirement status |

All currently-pending requirements (REQ-BRANCH-006, REQ-BRANCH-009, REQ-BRANCH-013, REQ-BRANCH-014, NFR-BRANCH-001, NFR-BRANCH-002, NFR-BRANCH-006) resolve to "Pass" once the above steps are completed.

## Readiness summary

- Release readiness guide: not used. This is a documentation and tooling-configuration change with no application source code; user impact is limited to maintainers and contributors; no compliance, PII, or commercial implications.
- Go/no-go verdict: APPROVED_WITH_FINDINGS per `review.md` (REVIEW-BRANCH-001, 2026-05-04).
- Required conditions: all six review findings are advisory or hand-off items. No finding blocks the file-change PR merge. F-002 and F-003 (the five remote/human tasks and the staged-but-inert pages.yml) are the principal operational risks; both are addressed by the Post-merge checklist above.

## Known limitations

1. **pages.yml is staged-but-inert until `demo` is seeded.** After this PR merges, GitHub Pages will not redeploy on future merges until the post-merge checklist steps 3 and 4 are complete. The existing Pages site (last deployed from `main`) will continue to serve cached content during this window. Risk window: hours (if the maintainer completes the checklist promptly) to indefinite (if delayed). Mitigation: complete the checklist within hours of merge.

2. **Four requirements remain pending until human-owned remote ops complete.** REQ-BRANCH-006, REQ-BRANCH-009 (partial), REQ-BRANCH-013, and REQ-BRANCH-014 are gated on post-merge remote operations. The feature is not "fully live" until those steps are done and logged.

3. **`check:script-docs` fails in this worktree environment.** This is a pre-existing artifact of the worktree not having had `npm ci` run; it reproduces against unchanged HEAD and is not introduced by this change. CI (which installs typedoc) is the canonical verification environment.

4. **`check:links` reports one pre-existing error** in `specs/shape-b-branching-adoption/spec.md:285` (the spec quotes a relative `docs/branching.md` link that resolves incorrectly relative to the spec file's location). This predates this PR and is not introduced by it.

5. **F-007 (`test-report.md` broken link)** — `specs/shape-b-branching-adoption/test-report.md:154` contains a relative reference `0027-adopt-shape-b-branching-model.md` that the link checker resolves incorrectly. This is a qa-stage artifact; the link checker will flag it in CI. The qa owner should escape the example or wrap it in a fenced code block.

6. **`release/v0.5.0` remote-branch cleanup is conditional.** T-BRANCH-002 will no-op if the branch is already absent. Verify with `git ls-remote --heads origin release/v0.5.0` before acting.

## Verification steps

Run these after the PR merges to confirm the file-change set is correct.

**File-level (can run locally in the worktree today):**

1. Verify Shape B is the active model in `docs/branching.md`: `grep -c "Shape B" docs/branching.md` should return `>= 3`.
2. Verify all three branches are push-denied: `node -e "const s=require('./.claude/settings.json'); ['main','develop','demo'].forEach(b => { const has=s.permissions.deny.some(d => d.includes('git push origin '+b+':') || d.includes('git push -u origin '+b+':')); if(!has){process.exit(1)} }); console.log('OK')"` should print `OK`.
3. Verify deny-list count: `node -e "const s=require('./.claude/settings.json'); const b=['main','develop','demo']; console.log(s.permissions.deny.filter(d => b.some(x => d.includes(x))).length);"` should return `21`.
4. Verify `release/*` is not in the allow list: `node -e "const s=require('./.claude/settings.json'); if(s.permissions.allow.some(a=>a.includes('release/*'))){process.exit(1)} console.log('OK')"` should print `OK`.
5. Verify `pages.yml` targets `demo`: `node -e "const y=require('yaml').parse(require('fs').readFileSync('.github/workflows/pages.yml','utf8')); const b=y.on.push.branches; if(!b.includes('demo')||b.includes('main')){process.exit(1)} console.log('OK')"` should print `OK`.
6. Verify `docs-review-bot` references `develop`: `grep -c "clean clone of \`develop\`" agents/operational/docs-review-bot/PROMPT.md` should return `1`; `grep -c "clean clone of \`main\`"` should return `0`.
7. Verify ADR-0027 is Accepted: `grep -E "^status: Accepted$" docs/adr/0027-adopt-shape-b-branching-model.md` should match.
8. Verify Dependabot targets: `node -e "const y=require('yaml').parse(require('fs').readFileSync('.github/dependabot.yml','utf8')); if(!y.updates.every(u => u['target-branch'] === 'develop')){process.exit(1)} console.log('OK')"` should print `OK`.
9. Run full verify gate: `npm run verify` — should be green except the pre-existing `check:script-docs` typedoc artefact (run `npm ci` first to clear that).

**Remote-ops (after post-merge checklist is complete):**

10. Verify `develop` branch exists and is at `$MAIN_HEAD_SHA`: `test "$(git rev-parse origin/develop)" = "${MAIN_HEAD_SHA}"` (NFR-BRANCH-001).
11. Verify `demo` branch exists and is at `$MAIN_HEAD_SHA`: `test "$(git rev-parse origin/demo)" = "${MAIN_HEAD_SHA}"` (NFR-BRANCH-002).
12. Verify GitHub default branch is `develop`: `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'` should return `develop`.
13. Verify Pages site responds after first `demo`-triggered deploy: `curl -sI <pages-url> | head -1` should return `HTTP/2 200` (NFR-BRANCH-006).

## Rollback plan

This PR contains only documentation, configuration, and ADR updates. There is no application code, database schema, or deployed artifact. The rollback procedure is a standard `git revert`.

- **Trigger criteria:** Any of the following: (a) the `pages.yml` retarget causes an unrecoverable Pages deploy failure after `demo` is seeded; (b) the deny-list change unintentionally blocks a legitimate agent operation; (c) the `docs/branching.md` rewrite introduces contributor confusion that causes PRs to land on the wrong branch at a rate that cannot be corrected by a follow-up clarification commit; (d) any post-merge remote operation reveals that the file-change set and the remote topology are incompatible in a way not resolvable by a forward fix.

- **Mechanism:** Open a PR that reverts the merge commit for `feat/shape-b-branching-stage5` on `main`. The revert is a forward commit and does not require force-push. After the revert PR merges: (1) restore the old `pages.yml` `on.push.branches: [main]` trigger; (2) restore the `.claude/settings.json` `release/*` allow entries and remove `demo` deny entries; (3) update `docs/adr/0027-adopt-shape-b-branching-model.md` status to `Superseded` and open a superseding ADR recording why Shape B was rolled back. Do not delete `demo` or `develop` from the remote without separate authorisation — those are non-destructive branch pointers and can be left in place or removed in a follow-up step with explicit human approval.

- **Data implications:** None. This change touches no database, no published package, and no user data. GitHub Pages will serve the previous deploy until `main`-triggered deploys resume. No in-flight contributor PRs are disrupted by the revert (they may need a rebase onto the restored `main` if their base was `develop`, but that is a recoverable author action).

- **Communication:** Notify contributors via a comment on issue #255 and a note in the next PR description. If the default-branch flip (step 5b) had already been completed, update the GitHub default branch back to `main` (manual UI action, requires explicit authorisation).

## Observability

This change introduces no new application metrics, dashboards, or alerts. The signals to watch after merge are:

- **CI gate:** `npm run verify` on the merged `main` HEAD should be green (less the pre-existing typedoc artefact). Any new failure indicates the file-change set introduced a regression.
- **GitHub Pages deploy log:** after `demo` is seeded and the Pages allow-list is updated, monitor the first `demo`-triggered Pages deploy in the GitHub Actions log. A success confirms NFR-BRANCH-006.
- **PR base-branch discipline (30-day window):** monitor whether new PRs target `develop`. North-star metric: zero PRs targeting `main` as a topic-branch base in the 30 days following the default-branch flip (from `requirements.md` §Success metrics).
- **`docs-review-bot` false-drift rate:** monitor `docs-review-bot` run logs for false tutorial-drift findings attributable to branch references. Supporting metric: zero false drift findings attributable to the stale `main` reference in 30 days post-merge.
- **Counter-metric:** any direct commit landing on `main` outside the promotion PR path is a Shape B discipline failure. Target: zero.

## Communication

- **Internal:** Update `specs/shape-b-branching-adoption/implementation-log.md` with evidence from each completed post-merge remote operation step. The reviewer hand-off note (review.md §Hand-off) serves as the internal briefing for the human operator.
- **Contributor notice:** after the default-branch flip (post-merge step 5b), confirm `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'` returns `develop` and note the change in the next PR description (per reviewer finding F-004).
- **External:** No external announcement needed. This is a template-operations change; downstream adopters are unaffected and Shape A remains documented.
- **Issue closure:** close issue #255 once the post-merge checklist is complete and NFR-BRANCH-001, NFR-BRANCH-002, and NFR-BRANCH-006 evidence is recorded in `implementation-log.md`.

---

## Quality gate

- [x] Summary written for the audience (maintainers and contributors, not internal-implementation detail).
- [x] User-visible impact stated (maintainer workflow change, no downstream adopter impact).
- [x] Readiness conditions and approvals summarized (APPROVED_WITH_FINDINGS; guide not used).
- [x] Known limitations disclosed (6 items, none buried).
- [x] Verification steps documented (9 file-level + 4 remote-ops).
- [x] Rollback plan documented (trigger, mechanism, data implications, communication — all non-empty).
- [x] Observability coverage noted (CI gate, Pages deploy log, PR discipline metric, counter-metric).
- [x] Communication plan ready (internal log updates, contributor notice, issue closure).
- [ ] Merged worktrees pruned — pending post-merge (human step after PR lands).
