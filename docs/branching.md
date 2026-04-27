# Branching model

A small, opinionated model designed to make automated review, parallel agents, and the operational bots in [`agents/operational/`](../agents/operational/) work without surprises.

## The branches

Pick **one** of the two shapes below for your project. Both are supported by this template's bots and skills.

### Shape A — single integration branch (recommended for v0 → v1)

| Branch | Role | Direct push? |
| --- | --- | --- |
| `main` | Integration + release. Always green. | **No** — PR only. |
| `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*` | Topic branches. Cut from `main`, live in `.worktrees/<slug>/`. | Yes (push the topic branch only). |

### Shape B — separate integration and release (recommended once you ship)

| Branch | Role | Direct push? |
| --- | --- | --- |
| `develop` | Integration. Always green. PRs land here. | **No** — PR only. |
| `main` | Release. Tagged commits, no in‑flight work. | **No** — promoted from `develop`. |
| `demo` (optional) | Deployable preview / GitHub Pages. | **No** — promoted from `main` or `develop`. |
| `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*` | Topic branches. Cut from `develop`. | Yes (topic branch only). |

The default `.claude/settings.json` shipped with this template denies pushes to both `main` and `develop` so either shape is safe out of the box. Loosen the denylist deliberately, never silently.

## Topic branch prefixes

| Prefix | Use for |
| --- | --- |
| `feat/` | New behaviour or capability. |
| `fix/` | Bug fix. |
| `refactor/` | Internal change, no behaviour change. |
| `chore/` | Dependencies, tooling, CI, repo maintenance. |
| `docs/` | Documentation only. |
| `claude/` | Agent‑opened branches (this is the convention `Claude Code` uses by default). |

These prefixes match the allowlist in `.claude/settings.json` and the regexes in the operational bots' branch‑name idempotency checks. Adding a new prefix means updating both.

## Rules

1. **One concern per topic branch.** See [`feedback_pr_hygiene.md`](../.claude/memory/feedback_pr_hygiene.md).
2. **Cut every topic branch fresh** from the integration branch. Don't pull one PR into another. See [`feedback_pr_workflow.md`](../.claude/memory/feedback_pr_workflow.md).
3. **Topic branches live in worktrees** under `.worktrees/<slug>/`. See [`docs/worktrees.md`](./worktrees.md).
4. **Verify before push.** See [`docs/verify-gate.md`](./verify-gate.md).
5. **Resolve conflicts via merge, not rebase**, once a PR has open review threads. See [`feedback_parallel_pr_conflicts.md`](../.claude/memory/feedback_parallel_pr_conflicts.md).
6. **Maintainer (or autonomous‑merge rule) merges**, not the author. See [`feedback_autonomous_merge.md`](../.claude/memory/feedback_autonomous_merge.md).

## Why `develop` exists in Shape B

Two reasons:

1. **Releases are durable.** `main` only carries commits that have been promoted. Reverts on `develop` don't pollute the release history.
2. **The operational bots key off the integration branch.** A separate `develop` keeps `review-bot`, `plan-recon-bot`, etc. from spinning up against half‑shipped release commits.

If your project doesn't ship versioned releases, Shape A is enough. Don't introduce `develop` until you actually need it.

## Promotion (Shape B only)

`develop` → `main` is a fast‑forward (or merge commit if you prefer). It happens at release time, not continuously. The release ADR template (`templates/release-notes-template.md`) covers the artifacts.

## Settings

The default `.claude/settings.json` permission rules assume:

- Push to `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `claude/*` is allowed.
- Push to `main` and `develop` is denied. Force‑push to either is denied.
- `git commit --no-verify` and `git push --no-verify` are denied.

If your project uses non‑standard prefixes, update both the allowlist and the bots' regexes.
