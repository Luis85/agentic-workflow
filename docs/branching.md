# Branching model

A small, opinionated model designed to make automated review, parallel agents, and the operational bots in [`agents/operational/`](../agents/operational/) work without surprises.

## The branches

This template repository operates under **Shape B** as of [ADR-0027](adr/0027-adopt-shape-b-branching-model.md) (2026-05-03). Shape A is retained below as a documented option for downstream adopters who do not yet ship versioned releases; it is no longer the active model for template-own operations.

Pick **one** of the two shapes below for your project. Both are supported by this template's bots and skills.

### Shape B — separate integration and release (active for this template)

| Branch | Role | Direct push? |
| --- | --- | --- |
| `develop` | Integration. Always green. Topic PRs target `develop`. | **No** — PR only. |
| `main` | Release. Receives only promotion merges from `develop`. Tagged commits, no in‑flight work. | **No** — promoted from `develop`. |
| `demo` | GitHub Pages source. Receives only promotion merges from `main` after each tag. | **No** — promoted from `main` via the manual `chore/promote-demo` PR. |
| `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*` | Topic branches. Cut from `develop`, live in `.worktrees/<slug>/`. | Yes (topic branch only). |

### Shape A — single integration branch (adopter option)

Recommended for downstream projects that do not yet cut versioned releases.

| Branch | Role | Direct push? |
| --- | --- | --- |
| `main` | Integration + release. Always green. | **No** — PR only. |
| `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*` | Topic branches. Cut from `main`, live in `.worktrees/<slug>/`. | Yes (push the topic branch only). |

The default `.claude/settings.json` shipped with this template denies pushes to `main`, `develop`, and `demo` so either shape is safe out of the box. Loosen the denylist deliberately, never silently. The full set of rights the workflow needs across local git, GitHub, Pages, Packages, and the Claude Code harness is collected in [`docs/rbac.md`](rbac.md).

## Topic branch prefixes

| Prefix | Use for |
| --- | --- |
| `feat/` | New behaviour or capability. |
| `fix/` | Bug fix. |
| `refactor/` | Internal change, no behaviour change. |
| `chore/` | Dependencies, tooling, CI, repo maintenance. |
| `docs/` | Documentation only. |
| `release/` | *(Shape A only)* Versioned release prep — see [Release path under Shape B](#release-path-under-shape-b) for the active flow and the Shape A historical callout. Not used under Shape B; promotion replaces the dedicated release branch. |
| `claude/` | Agent‑opened branches (this is the convention `Claude Code` uses by default). |

The active prefixes (`feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `claude/`, `portfolio/`) match the allowlist in `.claude/settings.json` and the regexes in the operational bots' branch‑name idempotency checks. The `release/` prefix is Shape A only and is not pre-approved in the default allowlist; Shape A adopters must add `Bash(git push origin release/*)` and the `-u` variant to their own `.claude/settings.json`. Adding any new prefix means updating both the allowlist and the bot regexes.

## Pull request titles

PR titles are validated by [`.github/workflows/pr-title.yml`](../.github/workflows/pr-title.yml), so every PR title must use a Conventional Commits type from the CI allowlist:

`feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, or `revert`.

Scopes are optional. The expected shape is `<type>: <subject>` or `<type>(<scope>): <subject>`. The subject must start with an alphanumeric character and must not end with a period.

Use `docs:` for planning artifacts, specs, workflow notes, README changes, and other documentation-only work. Do not use descriptive-but-unsupported types such as `plan:`, `release:`, or `workflow:` unless the CI allowlist is updated in the same concern.

## Required ruleset for `develop`, `main`, `demo`

This upstream repository protects all three Shape B branches with a single GitHub ruleset whose `conditions.ref_name.include` covers `refs/heads/main`, `refs/heads/develop`, and `refs/heads/demo`. Downstream projects should reproduce the same contract on every protected branch they operate, whether that is `main` alone in Shape A or all three in Shape B.

The ruleset must:

- block branch deletion;
- block non-fast-forward updates;
- require pull requests before merge;
- require the branch to be up to date before merge;
- require all review threads to be resolved before merge;
- require these always-running status checks:
  - `Verify`
  - `Conventional Commits PR title`
  - `spell check`
  - `scan for committed secrets`

**Bypass list.** The maintainer is the sole bypass actor on `demo` so the manual `chore/promote-demo` PR can be merged via the GitHub UI without a PAT. No bypass actors on `main` or `develop`.

Workflow-path security checks (`actionlint`, `zizmor static analysis`, and `dependency review`) stay path-triggered so ordinary docs and script PRs are not blocked by jobs that never run. When a PR changes `.github/workflows/**`, `.github/actions/**`, or dependency manifests, the relevant path-triggered checks must be green before merge; require them in a path-scoped ruleset if the repository configuration supports that shape.

Approving reviews are intentionally not required in the upstream ruleset yet. Solo-maintainer and agent-heavy iteration currently gets more value from required CI, PR-only integration, and resolved review threads than from mandatory approval ceremony. Revisit this when there is a regular second reviewer or code-owner model.

## Rules

1. **No direct commits on `main` (or `develop`)** — *ever*. Every change lands via a topic branch and a merged PR. This applies to code, docs, ADRs, glossary entries, memory files, brainstorm output, planning artifacts, and generated docs. There is no "small enough" exception. The `.claude/settings.json` push deny is a backstop; the rule applies even to local commits, because extracting a stray `main` commit into a topic branch later costs more than cutting the branch up front. See [`feedback_no_main_commits.md`](../.claude/memory/feedback_no_main_commits.md).
2. **One concern per topic branch.** See [`feedback_pr_hygiene.md`](../.claude/memory/feedback_pr_hygiene.md).
3. **Cut every topic branch fresh** from the integration branch. Don't pull one PR into another. See [`feedback_pr_workflow.md`](../.claude/memory/feedback_pr_workflow.md).
4. **Topic branches live in worktrees** under `.worktrees/<slug>/`. See [`docs/worktrees.md`](./worktrees.md).
5. **Verify before push.** See [`docs/verify-gate.md`](./verify-gate.md).
6. **Resolve conflicts via merge, not rebase**, once a PR has open review threads. See [`feedback_parallel_pr_conflicts.md`](../.claude/memory/feedback_parallel_pr_conflicts.md).
7. **Maintainer (or autonomous‑merge rule) merges**, not the author. See [`feedback_autonomous_merge.md`](../.claude/memory/feedback_autonomous_merge.md).
8. **Codex opens the PR when it makes the change.** See [`.codex/workflows/pr-delivery.md`](../.codex/workflows/pr-delivery.md) for the expected worktree → verify → push → PR → next-step loop.

## Why `develop` and `demo` exist now

[ADR-0027](adr/0027-adopt-shape-b-branching-model.md) (2026-05-03) supersedes ADR-0020 and activates Shape B for this template:

1. **Releases are durable.** `main` only carries commits that have been promoted. Reverts on `develop` don't pollute the release history.
2. **The operational bots key off the integration branch.** A separate `develop` keeps `review-bot`, `plan-recon-bot`, etc. from spinning up against half‑shipped release commits.
3. **GitHub Pages serves a validated state.** `pages.yml` triggers on `demo`, so the public preview reflects the last tagged `main` HEAD rather than in-progress work.

If your project doesn't ship versioned releases, Shape A is enough. Don't introduce `develop` until you actually need it.

## Release path under Shape B

Under Shape B the release path is the **`develop → main` promotion PR** plus a follow-up **`chore/promote-demo` PR**. There is no dedicated `release/vX.Y.Z` branch — release-prep work (version bump, `CHANGELOG.md` entry, lifecycle release-notes finalization) lands on `develop` like any other docs/chore PR before the promotion.

1. **Release-prep on `develop`.** Cut ordinary topic branches from `develop` for the version bump in `package.json`, the `CHANGELOG.md` entry, lifecycle release-notes finalization in `specs/<feature>/release-notes.md`, and any release-only documentation updates. Each of these is a normal topic PR targeting `develop` — one concern per PR, verify before push.
2. **Promotion PR `develop → main`.** Once `develop` carries the full release contents, the maintainer opens a promotion PR from `develop` into `main`. The v0.5 release readiness check runs on the PR. After CI is green, the maintainer merges the promotion PR.
3. **Tag from `main`.** The `vX.Y.Z` tag is cut on the merge commit on `main` — never on `develop`, never on a topic branch. Traceability stays clean: tag → commit on `main` → merged promotion PR → CHANGELOG entry → release notes.
4. **Demo promotion `main → demo`.** After the tag is cut, the maintainer opens a `chore/promote-demo` PR that fast-forwards `demo` to the tagged commit on `main`. The maintainer is the sole bypass actor in the ruleset for `demo`, so this PR can be merged via the GitHub UI without a PAT. `pages.yml` triggers on push to `demo` and deploys via OIDC.
5. **Authorization boundary.** Cutting and merging the promotion PRs is ordinary topic-branch work and follows the normal review and verify gate. **Publishing** the GitHub Release and (when enabled) the GitHub Package is a separate, manually authorized step: only an authorized maintainer triggers the `workflow_dispatch` release workflow, and only after the readiness check, v0.4 quality signals, and human authorization input are all green ([REQ-V05-002](../specs/version-0-5-plan/requirements.md), SPEC-V05-002). Pre-merge release prep is reversible; tag creation and publish are not.

> **Shape A only — historical convention.** Adopters operating Shape A may use a dedicated `release/vX.Y.Z` topic branch for release prep ([ADR-0020](adr/0020-v05-release-branch-strategy.md), superseded for this template by ADR-0027). The Shape A flow is: cut `release/vX.Y.Z` from `main`, land version bump + CHANGELOG + release notes on it, open a PR back into `main`, run the readiness check, merge, tag from `main`, delete the release branch. This template no longer follows that flow; the active release path is the `develop → main` promotion PR described above.

## Settings

The default `.claude/settings.json` permission rules assume:

- Push to `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `claude/*` is allowed.
- Push to `main`, `develop`, and `demo` is denied. Force‑push to any of the three is denied.
- `git commit --no-verify` and `git push --no-verify` are denied.

If your project uses non‑standard prefixes, update both the allowlist and the bots' regexes.
