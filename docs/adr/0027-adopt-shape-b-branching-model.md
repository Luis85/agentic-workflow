---
id: ADR-0027
title: Adopt Shape B branching model (develop / main / demo) for the template
status: proposed
date: 2026-05-03
deciders:
  - architect
consulted:
  - pm
  - analyst
  - release-manager
informed:
  - dev
  - qa
  - sre
supersedes: [ADR-0020]
superseded-by: []
tags: [branching, governance, release, pages]
---

# ADR-0027 — Adopt Shape B branching model (develop / main / demo) for the template

## Status

Proposed

## Context

ADR-0020 (2026-05-02) committed the template repository to Shape A — single `main` integration branch plus short-lived `release/vX.Y.Z` branches for release prep. The v0.5 release cycle proved that decision insufficient for two concrete reasons:

- **Integration window on `main`.** Release-prep commits land on `main` *before* the tag is cut. Between merge and tag, CI is green against partially-released content. ADR-0020's own errata (2026-05-02) records that the strict `tag SHA == main HEAD SHA` readiness check tripped twice during the v0.5.1 recovery dispatch because unrelated PRs and direct commits landed on `main` between draft and stable dispatches. The first-parent-history fix in `scripts/lib/release-readiness.ts` recovered the readiness check without removing the underlying integration window.
- **GitHub Pages reflects in-progress work.** `pages.yml` triggers on `main`, so the public preview shows whatever is on `main` HEAD — including release-prep commits and post-release fixes — rather than a validated, tagged state.

Forces in play in May 2026:

- v0.5 has shipped; the template is past the "v0 → v1" cadence threshold ADR-0020 named for Shape A.
- The reference Specorator repository (`Luis85/specorator`) already operates `develop` + `demo` with Pages from `demo`, providing prior-art proof the pattern works on the same toolchain.
- The bot audit (RESEARCH-BRANCH-001 §Q1) confirms minimal blast radius: only `docs-review-bot` requires a one-line PROMPT.md edit; the other four bots are branch-agnostic at the prompt level and need only scheduler reconfiguration.
- `develop` does not exist on the remote; `release/v0.5.0` is most likely already deleted; the seed step is non-destructive (`git push origin <main-SHA>:refs/heads/develop`).
- The deferred items from PRD-BRANCH-001 (NG1 `feat/` rename, NG2 squash-merge, NG3 tag-scheme change) remain out of scope; this ADR limits itself to the Shape B branching model and the `release/*` drop.

CLAR-003 and CLAR-004 from PRD-BRANCH-001 are resolved by this ADR (see §Compliance).

## Decision

We adopt **Shape B** as the active branching model for this template repository, with `develop` as the integration branch, `main` as the release-only branch, and `demo` as the GitHub Pages source. Specifically:

1. **`develop`** is the integration branch. Every topic-branch PR (`feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `claude/*`) targets `develop`. `develop` is push-denied at both the Claude Code permission layer (`.claude/settings.json`) and the GitHub remote layer (a ruleset).
2. **`main`** is the release-only branch. It receives one merge commit at a time via a **promotion PR** from `develop`. Tags (`vX.Y.Z`) are cut on `main` HEAD after a promotion PR merges. `main` carries no release-prep commits ahead of the tag — release-prep lives on `develop`. `main` is push-denied at both layers.
3. **`demo`** is the GitHub Pages source. After each `main` tag is cut, the maintainer opens a `chore/promote-demo` PR that fast-forwards `demo` to the tagged commit on `main`. `pages.yml` triggers on push to `demo` and deploys via OIDC. `demo` is push-denied at both layers; the maintainer is in the ruleset bypass list so the manual fast-forward is permitted via the GitHub PR merge UI.
4. **The `release/vX.Y.Z` branch convention is dropped.** The `develop → main` promotion PR replaces the dedicated release-prep branch. Release-prep work (version bump, CHANGELOG entry, lifecycle release-notes finalization) lands on `develop` like any other docs/chore PR before the promotion.
5. **Branches are seeded non-destructively.** At adoption time, `develop` and `demo` are created as new branch pointers at the current `main` HEAD SHA. No history is rewritten, squashed, or rebased.
6. **The change set is one coherent piece.** Documentation (`docs/branching.md`, `docs/worktrees.md`, `AGENTS.md`, `CLAUDE.md`), settings (`.claude/settings.json`), workflow (`pages.yml`), bot prompt (`docs-review-bot/PROMPT.md`), bot scheduler configs, Dependabot config, and this ADR all move to Shape B together — there is no "Shape A in some files, Shape B in others" intermediate state on the merged result.

This decision supersedes ADR-0020 in full. ADR-0020's `status` is updated to `Superseded` and its `superseded-by` field is set to `[ADR-0027]`. ADR-0020's body remains immutable per the rule restated at the bottom of every ADR.

## Considered options

### Option A — Adopt Shape B (chosen)

- Pros:
  - Eliminates the integration window on `main` — `main` carries only promoted, tagged commits.
  - GitHub Pages serves a validated state (`demo` = last tagged `main`), not in-progress work.
  - Provides downstream adopters with a live Shape B reference implementation to inspect.
  - Bot blast radius is small (one PROMPT.md line edit; four scheduler config updates).
  - Seeding is non-destructive (`develop` and `demo` are new pointers at existing `main` HEAD).
  - The reference Specorator repo proves the pattern works on the same toolchain.
- Cons:
  - One-time coordination cost across `.claude/settings.json`, `pages.yml`, `docs/branching.md`, four scheduler configs, Dependabot config, two ADRs.
  - Manual `chore/promote-demo` PR per release adds a step to the release checklist.
  - GitHub Pages environment allow-list update is a manual UI action that cannot be expressed in tracked files.

### Option B — Keep Shape A and add `demo` as a Pages-only branch

- Pros:
  - Smallest possible diff. Solves the Pages staleness problem in isolation.
  - No bot reconfiguration; no `release/*` drop.
- Cons:
  - Leaves the integration-window defect on `main` unaddressed — the original v0.5.1 readiness-check failure mode is still possible.
  - Template continues operating Shape A despite the docs noting Shape A is "recommended for v0 → v1" — the repo is past v0.5.
  - Adopters still cannot inspect a live Shape B reference.

### Option C — Trunk-Based Development (collapse to a single trunk, deploy on every push)

- Pros: Maximum CI velocity for small teams; no promotion discipline needed.
- Cons: Fundamentally incompatible with the goal of `main` carrying only promoted, tagged commits. Eliminates the protection that motivates this whole feature. Would require a much larger ADR and rewrite of `docs/branching.md`. Does not address Pages staleness; the same content lives on the same branch.

### Option D — Auto-promote `demo` via a CI workflow on `main` tag creation

- Pros: Removes the manual `chore/promote-demo` step.
- Cons: Requires write credentials against a protected branch (`demo`) — either a PAT or a GitHub App token, both of which expand the threat surface. Single-maintainer cadence is too low to justify the new credential management. Reversible later by adding a workflow if cadence rises; recorded under §Revisit triggers.

## Consequences

### Positive

- Release-prep commits no longer ride on `main` ahead of the tag. The integration-window class of bug — including the readiness-check tag-chase recorded in ADR-0020 errata — is structurally removed.
- The `github-pages` environment serves the last validated tagged state. Public preview is stable.
- `release/vX.Y.Z` branch overhead is gone. The promotion PR is the release path; one fewer branch type to remember and clean up.
- Downstream adopters who inspect this template see the same Shape B model the docs recommend at versioned-release cadence.
- The `.claude/settings.json` deny-coverage expands: `demo` joins `main` and `develop` under explicit push-deny, with symmetric `reset` / `checkout` / `branch -D/-d` deny entries.

### Negative

- The maintainer must remember the `chore/promote-demo` PR after every release. Forgotten promotion = stale public Pages.
- The `github-pages` environment "Deployment branches" allow-list update must be done in the GitHub UI before `pages.yml` flips to trigger on `demo`. If this ordering is reversed, Pages deploys fail until the allow-list is fixed.
- Four bot scheduler configurations require updates outside `agents/operational/`; some of these may live in workflow files not currently tracked under that path.
- Contributors with muscle memory may continue opening PRs against `main` for the first days. The default-branch flip in repo settings (so `gh pr create` defaults to `develop`) reduces this risk but does not eliminate it.

### Neutral

- The `release/*` allow entries in `.claude/settings.json` are removed, narrowing the agent push surface from five long-lived prefixes to four. Nothing in the template currently uses `release/*` after this ADR is accepted.
- ADR-0020 stays in `docs/adr/` with `status: Superseded`. Its rationale and errata remain readable as historical context.
- The reference Specorator repo's `.claude/settings.json` does not currently carry `demo` push-deny; this template chooses to be stricter, since adding a deny entry costs nothing and matches NFR-BRANCH-005's monotonic-coverage rule.

## Compliance

How we know this decision is honoured:

- **`docs/branching.md`** designates Shape B as the active model, names `develop` as the PR target for topic branches, names `main` as the release-only branch, names `demo` as the Pages source, and does not prescribe `release/vX.Y.Z` as a required release step. Reviewers check release PRs against that doc.
- **`.claude/settings.json`** denies `git push origin {main,develop,demo}:*` and the `-u` variants, denies hard-resets and force-checkouts of all three, and does not include `release/*` in the allow list. The deny count for the three protected branches is monotonically non-decreasing across edits (NFR-BRANCH-005).
- **GitHub rulesets (CLAR-004 resolution).** A repository ruleset targets `main`, `develop`, `demo` and enforces: require PR before merge; restrict creations and deletions; bypass list = the maintainer (so the manual `demo` promotion via PR merge works without a PAT). Rulesets are chosen over legacy branch-protection rules because rulesets are available on free-tier personal accounts for public repos and provide a single allow-list spanning all three branches; legacy rules are being phased out by GitHub. The exact ruleset configuration is documented in the implementation log; the ADR records the choice.
- **`demo` promotion (CLAR-003 resolution).** Promotion is a manual `chore/promote-demo` PR cut by the maintainer after each `main` tag, listed in the release checklist. Auto-promotion via CI is rejected in this iteration (Option D); revisit if release cadence rises above one per month or if the maintainer pool grows.
- **`.github/workflows/pages.yml`** lists `demo` (and only `demo`) under `on.push.branches`. The `github-pages` environment "Deployment branches" allow-list includes `demo`.
- **`agents/operational/docs-review-bot/PROMPT.md`** does not contain the literal string `clean clone of \`main\`` and instead references `develop` (or "the integration branch") in the tutorial-drift rule.
- **Bot scheduler configs** for `review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot` pass `develop` as the integration-branch argument.
- **`.github/dependabot.yml`** (or Renovate config) sets `target-branch: develop` so automated dependency PRs land on `develop`, not `main`.
- **`docs/worktrees.md`, `AGENTS.md`, `CLAUDE.md`** name `develop` as the integration / cut-from / PR-target branch wherever they describe the workflow.
- **ADR-0020 frontmatter** carries `status: Superseded` and `superseded-by: [ADR-0027]`. The body of ADR-0020 is unchanged.
- **Counter-metric.** Zero PRs targeting `main` as a topic-branch base in the 30 days following adoption. Zero `develop → main` promotions skipped (no direct commits landing on `main`). Zero `main → demo` promotions skipped after a `main` tag. A non-zero count on any of these is the signal Shape B discipline is not holding.
- **Revisit triggers.** Auto-promotion of `demo` (Option D) is reconsidered if (a) release cadence exceeds one promotion per month for two consecutive months, or (b) the maintainer pool grows beyond one. Tag-scheme change, topic-prefix rename, and squash-merge default each remain out of scope; revisit only via their own ADRs when cause appears.

## References

- PRD-BRANCH-001 — `specs/shape-b-branching-adoption/requirements.md` — 15 EARS requirements + 6 NFRs.
- DESIGN-BRANCH-001 — `specs/shape-b-branching-adoption/design.md` — Part C architecture, key decisions, rollout sequence.
- RESEARCH-BRANCH-001 — `specs/shape-b-branching-adoption/research.md` — Q1 bot audit, Q2 demo protection options, Q3 supersession strategy, Q4 historical state, Q5 Pages source.
- ADR-0020 — `docs/adr/0020-v05-release-branch-strategy.md` — superseded by this ADR.
- `docs/branching.md` — branching model documentation, updated by this feature.
- `.claude/settings.json` — agent permission boundary, updated by this feature.
- `.github/workflows/pages.yml` — Pages deploy workflow, retargeted to `demo` by this feature.
- Reference Specorator repo — `github.com/Luis85/specorator` — confirmed prior art for `develop` + `demo` pattern.
- GitHub Docs — [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
