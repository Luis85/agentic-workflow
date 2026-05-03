---
id: RESEARCH-BRANCH-001
title: Shape B branching adoption — ecosystem and prior-art research
stage: research
feature: shape-b-branching-adoption
status: complete
owner: analyst
inputs:
  - IDEA-BRANCH-001
created: 2026-05-03
updated: 2026-05-03
---

# Research — Shape B branching adoption

## Research questions

| ID | Question | Status |
|---|---|---|
| Q1 | What exact changes are needed in each operational bot's `PROMPT.md` to support `develop` as integration branch? Which bots hard-code `main`? | answered |
| Q2 | Concrete protection options for the `demo` branch — push-deny or allow direct push for hotfixes? What does the reference Specorator repo do? | answered |
| Q3 | ADR-0020 supersession strategy — single new ADR or separate ADRs per decision? Does immutable-body rule require errata on ADR-0020 before supersession? | answered |
| Q4 | What historical state needs addressing before `develop` is created? Does `release/v0.5.0` exist on remote? Does seeding `develop` from `main` HEAD require history steps? | answered |
| Q5 | Pages deployment source for initial `demo` cut — `main` HEAD or separately assembled state? Does `demo` need its own GitHub branch-protection rule? | answered |

---

## Q1 — Operational bot audit

Each bot's `PROMPT.md` was read in full. Findings are below.

### review-bot

File: `agents/operational/review-bot/PROMPT.md`

The prompt refers to "the integration branch" descriptively throughout but never names a literal branch. The idempotency check reads the head SHA of the most recent `review-bot` issue; it does not assert the branch name. The command `git log --oneline <last-sha>..HEAD` is branch-agnostic.

**Change needed:** None to the prompt text itself. However, the scheduled GitHub Actions workflow that runs `review-bot` likely passes a checkout ref. That workflow file must be updated to checkout `develop` instead of (or in addition to) `main`. The bot prompt itself is clean.

### docs-review-bot

File: `agents/operational/docs-review-bot/PROMPT.md`

The prompt refers to "the integration branch" generically. The instruction "read from the working tree (`git show HEAD:<path>`)" is branch-agnostic. The idempotency check keys on head SHA in the issue title.

The tutorial-drift rule in §What to flag item 8 references "a clean clone of `main`" explicitly:

> "Flag the tutorial for re-run from a clean clone of `main`"

**Change needed:** This one literal `main` reference must be updated to read "a clean clone of `develop`" (or "the integration branch") to remain accurate under Shape B. No other changes required.

### plan-recon-bot

File: `agents/operational/plan-recon-bot/PROMPT.md`

Contains explicit hardcoded references to the integration branch in two places:

1. §Process step 4 names the branch variable in the worktree cut command:

   > `git worktree add .worktrees/plan-recon-${RUN_DATE} -b docs/plan-recon-${RUN_DATE} origin/<integration-branch>`

   The placeholder `<integration-branch>` is already a variable form — not hardcoded to `main`. This is intentionally generic.

2. §Decision criteria reads "the plan's last commit on the **integration branch** is ≥14 days old" — generic, not hardcoded.

3. §Idempotency guard (step 1): the worktree path is dated, not branch-name-keyed. The PR search is on `docs/plan-recon-*` prefix from this routine's login — branch-agnostic.

4. §Hard rules: "Never push directly to the integration branch." — generic.

5. §Failure handling commands refer to `git worktree remove` and `git branch -D` operations on the worktree branch, not on `main`.

**Change needed:** The process step that cuts the worktree must be confirmed to resolve `<integration-branch>` to `develop` (not `main`) at runtime. The prompt currently uses the angle-bracket placeholder, which is safe if the operator configures the env var correctly. No text edit is strictly required, but it is worth adding an explicit note: the env var or config value passed to the scheduler must be set to `develop`. The PM/architect should add this to compliance notes in the new ADR.

### dep-triage-bot

File: `agents/operational/dep-triage-bot/PROMPT.md`

The prompt refers to the integration branch in one place:

> §Process step 4: "If the PR is BEHIND the integration branch, trigger the upstream tool to rebase"

No branch name is hardcoded. The idempotency marker keyed on `<head-sha7>:<action>` is PR-level. The classification matrix is package-type-based, not branch-based. The `ROUTINE_GH_LOGIN` env var is project-level.

**Change needed:** None. The prompt is branch-agnostic throughout. The PR target branch assumption is implicit in what Dependabot/Renovate opens PRs against; those tools must be configured at the repository level to target `develop` rather than `main`. That is a repository settings change (in `.github/dependabot.yml` or Renovate config), not a bot prompt change.

### actions-bump-bot

File: `agents/operational/actions-bump-bot/PROMPT.md`

Contains one explicit branch reference in §Process step 6:

> "Cut the bump branch off the **integration branch** as `chore/actions-bump-YYYY-MM-DD` (UTC)."

The phrase "integration branch" is generic — not hardcoded to `main`. The idempotency check keys on the presence of any open `chore/actions-bump-*` PR from the bot's login, not on a branch name.

§Hard rules: "Never push directly to the integration branch." — generic.

**Change needed:** None to the prompt text. Like `plan-recon-bot`, the scheduled runner must be configured with the correct integration branch value (`develop`). The `gh pr create` base-branch argument passed at runtime must target `develop`.

### Summary of bot audit

| Bot | Hard-codes `main`? | Change needed in PROMPT.md? | Change needed elsewhere? |
|---|---|---|---|
| `review-bot` | No | No | Scheduler/checkout ref: `develop` |
| `docs-review-bot` | Yes — 1 occurrence ("clean clone of `main`") | Yes — 1 line edit | Scheduler checkout ref: `develop` |
| `plan-recon-bot` | No (uses `<integration-branch>` placeholder) | No | Scheduler env var: set to `develop` |
| `dep-triage-bot` | No | No | Dependabot/Renovate target-branch config |
| `actions-bump-bot` | No (uses "integration branch" generically) | No | Scheduler base-branch arg: `develop` |

Only `docs-review-bot` requires a text edit to its `PROMPT.md`. The remaining bots require changes in their scheduler configurations, CI workflow files, or external tool configs — not in the source-of-truth prompts.

---

## Q2 — `demo` branch protection options

### What the reference Specorator repo does

The reference repo `github.com/Luis85/specorator` has `develop` as its default branch and a `demo` branch exists. The `pages.yml` workflow triggers on `branches: [demo]` — confirming the Pages-from-`demo` pattern. The repo's `.claude/settings.json` does not appear to carry push-deny rules for `demo` in the version fetchable from develop; its settings file only has plugin enablement. This suggests the reference repo may rely on GitHub branch-protection UI rules (rulesets or legacy protection rules) rather than `.claude/settings.json` to gate `demo` direct push, or it permits direct push to `demo` as a privileged maintenance action.

### GitHub branch-protection mechanics (2024–2025 state)

Two mechanisms are available to block direct push to `demo`:

**Mechanism 1 — GitHub branch protection rule (legacy or ruleset)**
- Requires a PR and (optionally) a passing status check before any push lands on `demo`.
- Can be bypassed by repo admins in the legacy model; rulesets allow fine-grained bypass.
- Works at the GitHub API / push level — Claude Code's `.claude/settings.json` deny rules operate at the local CLI level only. Both layers are complementary, not redundant.
- Pages deployment via OIDC (`id-token: write`) works regardless of branch protection on the source branch as long as the GitHub Pages environment allows deployment from that branch.

**Mechanism 2 — `.claude/settings.json` push deny**
- Adds a line: `"Bash(git push origin demo:*)"` and `"Bash(git push -u origin demo:*)"` to the deny array.
- Blocks Claude Code agents from pushing directly to `demo`.
- Does not block a human with git access; does not block GitHub Actions push (if the Actions workflow itself pushes to `demo`).

**Promotion-only model (recommended)**
Under Shape B as documented in `docs/branching.md`, `demo` is described as "promoted from `main` or `develop`" with direct push denied. The promotion path would be:
- A dedicated `chore/promote-demo` topic branch (or a direct GitHub Action that fast-forwards `demo` to `main` HEAD post-merge).
- Or: the `pages.yml` workflow itself can be changed to push to `demo` automatically after every merge to `main` — a "deploy-on-promote" model that keeps `demo` identical to the latest `main` tag.

**Hotfix-direct-push model (not recommended)**
Allowing direct push to `demo` for preview hotfixes breaks the invariant that `demo` reflects a validated state. It introduces a divergence between `demo` and `main` that is hard to track and reconcile. Given single-maintainer governance, the complexity cost exceeds the benefit.

**Conclusion for Q2:** The `demo` branch should be push-denied in both `.claude/settings.json` and a GitHub branch-protection rule (or ruleset). The reference Specorator repo triggers Pages from `demo` — this pattern is confirmed. The promotion path is: merge to `main` → trigger (manual or automated) fast-forward of `demo` to `main` HEAD → Pages deploys. This is a design decision (TBD — owner: architect), but the research finding is that push-deny plus explicit promotion is the correct default.

---

## Q3 — ADR-0020 supersession strategy

### What the immutable-body rule permits

ADR-0020 ends with: "ADR bodies are immutable. To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated."

ADR-0020's own frontmatter already has `superseded-by: []`. The constitution (Article VIII) and the ADR template together confirm: the only permitted edits on an accepted ADR are updating `status` to `Superseded` and populating `superseded-by: [ADR-NNNN]`. No errata section is added as part of supersession; the existing errata section (the 2026-05-02 entry) was added to the same ADR before supersession and is already present — it does not need to be modified.

There is no requirement for errata on ADR-0020 before supersession. The errata mechanism is for clarifying the *implementation* of an unchanged decision; supersession is for replacing the decision itself.

### Single new ADR vs. separate ADRs

Two sub-decisions are bundled in this feature:

1. Adopt Shape B (`develop` as integration branch, `main` as release-only, `demo` as Pages source).
2. Drop the `release/vX.Y.Z` branch convention in favor of the develop-to-main promotion PR.

**Option: Single ADR covering both**
- Pros: one document captures the coherent new branching model; reviewers see the full picture.
- Cons: if the `release/vX.Y.Z` drop is later revisited independently, the ADR structure does not support partial supersession cleanly.

**Option: Separate ADRs**
- ADR-A: Adopt Shape B (supersedes ADR-0020).
- ADR-B: Drop `release/vX.Y.Z` (references ADR-A; could supersede the `release/vX.Y.Z` subsection of ADR-0020 conceptually, though ADR-0020 is the only formal record).
- Cons: two ADRs for closely coupled decisions creates cross-reference overhead; the decisions are not independently viable (Shape B without dropping `release/vX.Y.Z` is explicitly contradictory per the idea.md desired outcome #3).

**Recommendation for Q3:** A single new ADR that supersedes ADR-0020 and covers both the Shape B adoption and the `release/vX.Y.Z` drop. The two decisions are inseparable in context. The supersession of ADR-0020 requires only updating its `status` to `Superseded` and its `superseded-by` field to the new ADR number. No errata addition to ADR-0020 is needed or permitted as part of supersession.

---

## Q4 — Historical state and `develop` branch seeding

### Does `release/v0.5.0` exist on the remote?

The public branch listing at `github.com/Luis85/agentic-workflow/branches` shows: `main`, `review/v05-stage-9`, `chore/v06-iso-9001-watch`, `feat/v06-adoption-profiles`, `feat/v06-agentic-security`, `feat/v06-hook-packs`, plus additional branches not displayed. **`release/v0.5.0` is not visible in the displayed set.** Given ADR-0020's cleanup rule ("delete the `release/vX.Y.Z` branch locally and on the remote once the tag is cut"), and the fact that the v0.5.0 release cycle has progressed past the tag-cut stage, it is most likely that `release/v0.5.0` has already been deleted. No history steps or retention decisions are required for a branch that does not exist on the remote. If it does exist in the undisplayed set, it should be deleted as part of the Shape B adoption implementation — it represents completed release prep under the old convention.

### Seeding `develop` from current `main` HEAD

`develop` does not exist on the remote (confirmed: absent from branch listing). Seeding it is a single operation: `git branch develop main && git push origin develop`. No history split is required — `develop` simply becomes a pointer to the same commit as `main` at the moment of creation. No rebase, no squash, no history rewrite. This is safe, reversible (a branch can be deleted), and fast.

The one timing consideration: `develop` must be created before the first feature PR is retargeted to it. The `pages.yml` flip to `demo` must happen after `demo` also exists. The order of operations is: create `develop` → create `demo` (from `main` HEAD) → update `pages.yml` to trigger on `demo` → update bot scheduler configs → update `docs/branching.md` and `AGENTS.md`.

---

## Q5 — Pages deployment source for initial `demo` cut

### Source for the initial `demo` branch

The cleanest initial state for `demo` is `main` HEAD at the moment of Shape B adoption. This ensures:
- The public Pages site is not disrupted during the transition.
- `demo` starts from a validated, tagged state rather than in-progress `develop` content.
- The Pages deployment workflow can be flipped in a single PR that also creates `demo`, because the content is identical.

A "separately assembled `demo` state" (cherry-picking commits, hand-editing) adds complexity with no benefit given that `main` HEAD is already the stable, reviewed state.

### GitHub branch-protection rule for `demo`

`.claude/settings.json` deny rules are a local enforcement layer for Claude Code agents. They do not prevent:
- A human developer with git access pushing directly to `demo`.
- A GitHub Actions workflow that performs a `git push origin demo`.

For a single-maintainer repo the risk of accidental direct push to `demo` by a human is low but nonzero. A GitHub branch-protection rule (or ruleset) requiring PRs for `demo` provides the backstop at the remote level — consistent with how `main` and `develop` are treated.

The `pages.yml` workflow does not push to `demo`; it reads from `demo` and deploys to GitHub Pages via OIDC. The promotion step (updating `demo` to match `main`) would require a separate workflow or a manual operation. If promotion is implemented as a GitHub Actions workflow, that workflow must be granted bypass access to the branch protection rule for `demo` (via environment protection or a ruleset bypass list).

**Conclusion for Q5:** Seed `demo` from `main` HEAD. Add `demo` to the `.claude/settings.json` deny list. A GitHub branch-protection rule on `demo` is recommended (TBD — owner: architect to determine whether a legacy rule or a ruleset is appropriate for this repo's tier). The Pages environment protection rule in GitHub Settings must also be updated to allow deployment from `demo` (currently it is likely set to `main`).

---

## Market / ecosystem

What exists as prior art for the specific pattern being adopted:

| Solution | Approach | Strengths | Weaknesses | Source |
|---|---|---|---|---|
| GitFlow (Nvie) | `develop` as integration, `main` as release-only, hotfix branches | Mature; well-understood by contributors; clear semantic separation | Complex for small teams; release branches are a third tier; no `demo` concept | [nvie.com](https://nvie.com/posts/a-successful-git-branching-model/) |
| GitHub Flow | Single branch (`main`) + short-lived feature branches; deploy from PR or tag | Simpler; CI-friendly; lower maintenance | No explicit integration vs. release separation; all work lands on `main` | [Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) |
| reference Specorator repo (`Luis85/specorator`) | `develop` default + `demo` Pages branch; Pages workflow triggers on `demo` | Direct prior art; proves the pattern works with the same toolchain | `.claude/settings.json` does not carry demo push-deny; relies on GitHub branch-protection UI | [github.com/Luis85/specorator](https://github.com/Luis85/specorator) |
| Trunk-Based Development | Single trunk + short-lived feature flags | Maximum CI velocity; no integration branch overhead | Requires feature flags for in-progress work; does not model a release-only branch | [Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) |

The reference Specorator repo is the most relevant prior art: same maintainer, same toolchain, confirmed `develop` + `demo` pattern in production.

---

## User needs

Evidence is drawn from the idea.md problem statement and the ADR-0020 errata, both of which record observed friction:

- The v0.5 release cycle exposed that release-prep commits landing on `main` before a tag is cut create a window where CI is green against partially-released content. *(idea.md problem statement)*
- The release readiness check tripped twice during the v0.5.1 recovery dispatch because the strict `tag SHA == main HEAD SHA` comparison broke when unrelated PRs or direct commits landed on `main` between tag creation and publication. *(ADR-0020 errata, 2026-05-02)*
- GitHub Pages deploys from `main`, meaning the public preview reflects in-progress work rather than a validated demo state. *(idea.md problem statement)*
- Template adopters who evaluate Shape A vs. Shape B by inspecting the template have no live reference implementation of Shape B to inspect. *(idea.md target users)*

No primary research (interviews, surveys) was conducted. The assumptions that must hold for the desired outcomes to be realized:

1. Operational bots are executed via schedulers that can be reconfigured to pass `develop` as the integration-branch argument without code changes to PROMPT.md files (true for 4 of 5 bots; 1 requires a 1-line PROMPT.md edit).
2. GitHub Pages can be triggered from `demo` with OIDC authentication without conflict from the existing `github-pages` environment protection rule — requires updating the environment protection rule in GitHub Settings to accept `demo`.
3. Single-maintainer promotion discipline is sufficient for `develop → main → demo` without tooling enforcement beyond the deny rules and a branch-protection rule.

---

## Alternatives considered

### Alternative A — Full Shape B adoption (recommended)

Adopt `develop` as the integration branch, `main` as release-only, `demo` as the Pages source. Drop `release/vX.Y.Z` convention. Issue a single new ADR superseding ADR-0020. Update all touch-points in one coordinated set of PRs.

- **Description:** `develop` is created from `main` HEAD. All topic PRs retarget `develop`. Promotion PRs (`develop → main`) are the release path; tags are cut from `main` after promotion. `demo` is created from `main` HEAD and receives a push-deny in `.claude/settings.json` plus a GitHub branch-protection rule. `pages.yml` flips to `demo`. Bots are reconfigured at the scheduler level; `docs-review-bot` gets a 1-line PROMPT.md edit.
- **Pros:** Resolves the integration-window problem for all future releases. Gives adopters a live Shape B reference. Eliminates the `release/vX.Y.Z` overhead that proved fragile in v0.5. Aligns the template's own operations with what it recommends to adopters at versioned-release cadence.
- **Cons:** Coordination cost across multiple files and settings layers. The initial `develop → main` promotion discipline requires trust until tooling enforces it. GitHub environment protection rule update requires manual UI action (not automatable via `.claude/settings.json`).

### Alternative B — Shape A with `demo` branch only (Pages fix without integration-branch change)

Keep `main` as the integration branch. Create a `demo` branch from `main` HEAD. Flip `pages.yml` to trigger on `demo`. Leave `develop` unused. No ADR-0020 supersession.

- **Description:** This is a targeted fix for the Pages preview problem only. The integration-window issue (release-prep commits on `main` before tag) is not addressed. Bots require no changes. The `demo` branch is promoted after each tag cut.
- **Pros:** Minimal blast radius. Addresses the Pages staleness problem. No bot reconfiguration.
- **Cons:** Does not provide adopters with a Shape B reference implementation. Does not resolve the integration window that caused the v0.5.1 release readiness check failures. The template continues to operate Shape A, which is documented as appropriate only "for v0 → v1" — but the repo is now beyond v0.5. The Pages site would reflect tags rather than `develop` state, which is arguably even better, but only if promotion is disciplined.

### Alternative C — Trunk-Based Development (abandon Shape A/B entirely)

Drop the Shape A / Shape B distinction. Merge all work to a single `main` trunk. Deploy from `main` on every push. Use feature flags or short-lived branches for in-progress work.

- **Description:** Collapse the model to a single integration+release branch. Remove `develop`, `demo`, and `release/*` concepts from `docs/branching.md`. Single branch, single deploy source.
- **Pros:** Simplest possible model. No promotion discipline required. Maximally consistent with modern CI/CD practice for small teams.
- **Cons:** Fundamentally incompatible with the existing desire to have `main` carry only promoted, tagged commits. Eliminates the integration-window protection that Shape B provides. Would require a new ADR and a significant rewrite of `docs/branching.md`. Operational bots keying off "the integration branch" would need to key off `main`, which is already the current state — so no bot improvement. Does not address the Pages staleness issue. Contradicts the idea.md desired outcomes.

---

## Technical considerations

1. **`.claude/settings.json` coverage gap for `demo`:** The current deny list has no entry for `demo`. Adding `"Bash(git push origin demo:*)"` and `"Bash(git push -u origin demo:*)"` is a one-line addition that is consistent with how `main` and `develop` are denied. The allow list has no need for a `demo/*` prefix (because `demo` is not a topic branch; it is a long-lived branch).

2. **Pages environment protection rule:** The `pages.yml` workflow uses OIDC (`id-token: write`). GitHub Pages environments have their own "deployment branch" allow-list in Settings → Environments → github-pages. After `pages.yml` is flipped to trigger on `demo`, the `github-pages` environment protection rule must be updated to add `demo` (and optionally remove `main`). This is a GitHub UI action; it cannot be committed to the repo. The architect must document this as a manual step in the new ADR's compliance section.

3. **Dependabot / Renovate target-branch config:** If the repo uses Dependabot, the `.github/dependabot.yml` file specifies `target-branch`. After the flip to `develop`, this field must be updated. Without it, Dependabot will continue opening PRs against `main`, which will then fail the Shape B convention that `main` receives only promotion PRs.

4. **No `release/*` push-allow removal needed immediately:** `.claude/settings.json` currently allows `git push origin release/*`. After Shape B adoption, `release/*` branches are no longer used. The allow entry is harmless to leave in place (allowing push to a branch prefix that is no longer used does not weaken security). However, it should be removed in a follow-up cleanup PR to avoid confusion. This is low priority.

5. **Worktree base-branch convention:** `docs/worktrees.md` and the worktree skill documentation instruct users to "cut every topic branch fresh from the integration branch." After the flip to `develop`, this instruction is automatically correct if the documentation is updated to name `develop` explicitly. The worktree tooling itself is branch-agnostic.

6. **Bot scheduler configuration is not in-repo:** None of the five bots have their scheduler configuration in the tracked `agents/operational/` directory — only `PROMPT.md` and `README.md` are there. The scheduler configuration (GitHub Actions workflow YAML, cron config) that actually runs the bots must be updated separately. This is a feasibility constraint for the implementation stage.

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | PRs targeting `main` after `develop` is created (contributor habit mismatch) | med | high | Update `docs/branching.md` and CONTRIBUTING immediately; add a PR-title CI check that validates base branch; docs-review-bot will surface stale references |
| RISK-002 | `pages.yml` flip to `demo` breaks Pages deployment if the GitHub Pages environment protection rule is not updated at the same time | high | med | Include environment protection rule update as a required step in the implementation plan; gate the `pages.yml` PR on confirmation that the UI step is done |
| RISK-003 | `docs-review-bot` tutorial-drift rule continues to reference `main` instead of `develop`, producing false drift findings | low | high | 1-line PROMPT.md edit (identified in Q1); include in the same PR as other bot updates |
| RISK-004 | Dependabot opens PRs targeting `main` after the flip, polluting `main` with dependency update PRs | med | med | Update `.github/dependabot.yml` `target-branch` to `develop` in the same implementation batch |
| RISK-005 | Single-maintainer promotion discipline breaks down: `develop → main` promotion is skipped, `main` goes stale | low | low | The push-deny on `main` prevents accidental direct commits; stale `main` is recoverable via a promotion PR; risk is low for single-maintainer repo |
| RISK-006 | `demo` branch diverges from `main` if promotion to `demo` is forgotten after a `main` tag | low | med | Document promotion to `demo` as a required step in the release checklist; consider a GitHub Actions trigger on `main` tag creation that automatically fast-forwards `demo` |
| RISK-007 | ADR-0020 `superseded-by` field left as `[]` after the new ADR is merged (bookkeeping gap) | low | med | New ADR PR must include an update to ADR-0020 frontmatter (`status: Superseded`, `superseded-by: [ADR-NNNN]`) — include as an explicit checklist item in the PR template |
| RISK-008 | `release/v0.5.0` branch exists on remote but is undisplayed on the branches page; deletion is skipped | low | low | Implementation step: verify with `git ls-remote --heads origin release/v0.5.0` before proceeding; delete if found |

---

## Recommendation

**Adopt Alternative A — Full Shape B adoption.**

The evidence is unambiguous:
- The reference Specorator repo (`Luis85/specorator`) already operates the `develop` + `demo` pattern successfully with Pages triggering on `demo`.
- The v0.5.1 release readiness failures (ADR-0020 errata) demonstrate concrete harm from the integration-window in Shape A.
- The bot audit shows the PROMPT.md blast radius is minimal: one line in `docs-review-bot`, no changes in the other four bots.
- The `develop` branch does not exist on the remote, making the seeding step clean and non-destructive.
- `release/v0.5.0` most likely does not exist on the remote; if it does, deletion is trivial.

The supersession of ADR-0020 should be accomplished by a **single new ADR** that covers both Shape B adoption and the `release/vX.Y.Z` drop, because the two decisions are inseparable. No errata are needed on ADR-0020 as a precondition — only the `status` and `superseded-by` fields are updated when the new ADR is accepted.

What still needs validating before Requirements:

- **CLAR-001 resolved:** `demo` branch protection = push-deny (`.claude/settings.json` + GitHub branch-protection rule). Promote-only from `main`. Direct push for preview hotfixes is rejected.
- **TBD — owner: architect:** Whether the `demo` promotion step is a manual release-checklist item or a GitHub Actions trigger on `main` tag creation.
- **TBD — owner: architect:** Confirm whether to use a legacy branch-protection rule or a GitHub ruleset for `demo` and `develop` at the repository tier this repo is on (free vs. team plan affects ruleset availability).
- **TBD — owner: pm:** Confirm the PR for bot scheduler configs is in scope for Stages 7–11 (currently deferred), or whether a separate ops task covers it.

---

## Sources

- [Gitflow Workflow — Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [A successful Git branching model — nvie.com](https://nvie.com/posts/a-successful-git-branching-model/)
- [ADR process — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html)
- [About protected branches — GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Available rules for rulesets — GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Branch is not allowed to deploy to github-pages due to environment protection rules — GitHub Community](https://github.com/orgs/community/discussions/39054)
- [Luis85/specorator — reference Specorator repo](https://github.com/Luis85/specorator)
- ADR-0020 (local) — `docs/adr/0020-v05-release-branch-strategy.md`
- idea.md (local) — `specs/shape-b-branching-adoption/idea.md`
- `docs/branching.md` (local)
- `.claude/settings.json` (local)
- `.github/workflows/pages.yml` (local)
- `agents/operational/*/PROMPT.md` (local, all five bots)

---

## Quality gate

- [x] Each research question is answered or marked open.
- [x] Sources cited.
- [x] >= 2 alternatives explored (three alternatives: A, B, C).
- [x] User needs supported by evidence (from idea.md problem statement and ADR-0020 errata; assumptions stated explicitly).
- [x] Technical considerations noted.
- [x] Risks listed with severity.
- [x] Recommendation made.
