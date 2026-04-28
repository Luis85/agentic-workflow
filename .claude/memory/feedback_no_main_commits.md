---
name: No direct commits on main / develop
description: Every change — code, docs, memory, or otherwise — lands via a topic branch and a merged PR. Never commit straight to main or develop, even locally.
type: feedback
---

# No direct commits on main / develop

## Rule

**Every change to this repo lands via a topic branch and a merged pull request. Never commit directly to `main` (or `develop` in Shape B), even locally.**

This applies to all change types:
- Source code, scripts, configuration.
- Documentation (`docs/`, `README.md`, `AGENTS.md`, `CLAUDE.md`).
- Memory edits under `.claude/memory/` (their own dedicated PR — see [`feedback_memory_edits.md`](./feedback_memory_edits.md)).
- ADRs, glossary entries, sink updates.
- Brainstorm output under `docs/superpowers/specs/` and any planning artifact.
- Generated docs that the verify gate refreshes.

There is **no** "small enough to land directly on `main`" exception. Typo fixes, version bumps, README touch-ups — all go through a branch.

## Why

- **`.claude/settings.json` denies pushes to `main` and `develop`** as the last line of defence. Local commits on the integration branch are *only* caught when push fails — which is the wrong moment to discover the rule, because by then the branch has already drifted and extracting the work into a topic branch costs time. Treat the deny rule as a backstop, not a gate.
- **Operational bots key off the integration branch.** Half-shipped commits on `main` confuse `review-bot`, `plan-recon-bot`, and the others, and may produce reports against an unreviewed commit.
- **Reviewer line anchors live on the topic branch's commits.** When work lives on `main` and is later cherry-picked or moved, every PR review thread loses its anchor.
- **History stays clean.** A merged PR carries one merge commit per concern; a `main` linear history of "fix typo" / "actually fix typo" / "fix the fix" makes bisects and reverts harder.

## How to apply

Before *any* change to a file under version control:

1. From the integration branch, run `git switch <integration-branch> && git pull --ff-only`.
2. Cut a topic branch with one of the allowed prefixes — `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `claude/`. See [`docs/branching.md`](../../docs/branching.md).
3. Make changes inside that branch, ideally inside a worktree under `.worktrees/<slug>/` per [`feedback_worktrees_required.md`](./feedback_worktrees_required.md).
4. Verify, push the branch, open a PR.
5. The maintainer (or the autonomous-merge rule per [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md)) merges — never the author from inside the same change.

If you discover that work has accidentally landed on `main` locally:

1. Create a topic branch at HEAD: `git branch <prefix>/<slug>`.
2. Reset `main` back to the upstream tip: `git fetch origin && git reset --hard origin/main`. This is the *only* sanctioned use of `git reset --hard` against `main` and only because the work is preserved on the new branch.
3. Push the topic branch and open the PR there.

## Exceptions

There are none in this repo. The `.codex/workflows/pr-delivery.md` Codex loop also follows the rule — Codex creates a worktree, commits there, pushes the topic branch, and opens the PR; it does not commit on `main`.
