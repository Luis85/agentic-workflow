# Autonomous merge — only after green review + clean state

## Rule

In **agent‑driven** runs (where a coding agent owns the PR end‑to‑end), self‑merge is allowed *only* when **all** of these are true:

1. The configured automated reviewer (Codex, Copilot review, Claude review, internal critic, …) has signalled approval — usually a `+1` reaction or an issue‑level "approved" comment, not the absence of new findings.
2. CI is green on the head SHA.
3. The PR's mergeable state is `CLEAN` (not `BLOCKED`, not `BEHIND`).
4. No human review is currently requested.

In **human‑driven** runs, self‑merge is off by default — the maintainer merges.

## Why

The point of the automated reviewer + CI gates is to be the floor, not the ceiling, of "is this safe to merge?" When all the gates are green and no human review is outstanding, blocking on a manual maintainer click adds latency without adding signal. When *any* gate is red — or the reviewer hasn't actually approved, only fallen silent — self‑merge is shipping a guess.

The `mergeStateStatus == CLEAN` clause matters: a `BEHIND` PR can still pass CI on its head while being incompatible with the integration branch's tip.

## How to apply

- Wire the project so the automated reviewer leaves a *positive* approval signal (reaction, label, comment), not "no findings = approval". The absence of a finding is not consent.
- Before merging, re‑check `mergeStateStatus` — don't trust the value from minutes ago.
- After merge: clean up worktree, branch, and any per‑PR state markers.

## Hard stops

- Do **not** self‑merge if the automated reviewer's last action was a finding, even one you addressed in a follow‑up commit. Wait for the next review pass.
- Do **not** self‑merge a PR that has a "request changes" review from a human, ever. Human review supersedes the automated path.
- Do **not** disable required status checks to unblock a self‑merge. If a check is wrong, fix the check.

## Relation to the constitution

This rule is consistent with **Article IX — Reversibility** of the constitution: merging into the integration branch is shared‑state and effectively irreversible (revert PRs are public and have a cost). The four gates above are the explicit authorisation Article IX requires.
