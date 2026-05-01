---
id: ADR-0015
title: Codify a bounded Codex review loop on every pull request
status: proposed
date: 2026-05-01
deciders:
  - human
consulted:
  - reviewer
  - dev
  - sre
informed:
  - all stage agents
  - operational bot owners
supersedes: []
superseded-by: []
tags: [workflow, github, review, automation, codex]
---

# ADR-0015 — Codify a bounded Codex review loop on every pull request

## Status

Proposed

## Context

Codex is wired to this repository as the always-on automated reviewer. When a pull request is marked **ready for review**, Codex inspects the diff and either reacts with a positive approval signal (thumbs-up) or leaves blocking comments. Today the project codifies three pieces of this surface:

- `.codex/workflows/review-response.md` — single-pass reaction to reviewer feedback.
- `.claude/memory/feedback_pr_workflow.md` — independent-PRs + batch + multi-pass review policy.
- `.claude/memory/feedback_autonomous_merge.md` — gates self-merge on a positive Codex signal, green CI, and `mergeStateStatus == CLEAN`.

What is **not yet codified** is the loop semantics that connect those three pieces: how many rounds of author↔Codex are expected, what the author must do after every push to keep the loop alive, what counts as an in-loop concern (review threads, CI failures, merge conflicts), and when the loop should escalate to a human.

Without an explicit loop, two failure modes appear:

1. **Stale approval.** The author pushes a fix; Codex's prior approval is treated as still valid; a regression slips into the integration branch.
2. **Open-ended ping-pong.** Author and Codex bounce minor findings indefinitely; no human is paged; the PR sits in the queue.

This decision codifies the loop so that all PRs follow the same shape.

## Decision

We adopt a bounded **Codex review loop** that applies to every pull request opened in this repository.

1. **Trigger.** Marking a PR `ready_for_review` (or pushing to a PR already in that state) requests a Codex review.
2. **Per-iteration contract for the PR author** (human or agent):
   - Read every Codex comment and CI failure.
   - Resolve merge conflicts in-loop with `git merge origin/<integration-branch>` (never rebase a PR with open review threads — see `feedback_parallel_pr_conflicts.md`).
   - Make the smallest change that addresses the findings; verify locally with `npm run verify`.
   - Push the fix; reply to each addressed thread with the commit SHA; resolve threads only after the fix is pushed.
   - **Re-request a fresh Codex review after every push.** A previous Codex approval does not survive a new commit. Approval must come from the *latest* round.
3. **Soft cap of 3 rounds.** After three full author↔Codex round-trips on the same PR, the loop emits an explicit warning in the PR body or a comment. The author may continue if they judge the remaining findings are tractable, or escalate to a human reviewer. The cap is **soft** — it surfaces a warning, it does not block.
4. **Scope.** The loop applies to **all PRs**, including documentation, memory, and template-only changes. Lightweight PRs typically clear in one round; the rule is uniform so authors never have to ask whether the loop applies.
5. **Exit condition.** The loop ends when Codex's most recent review on the head SHA is a positive approval signal AND CI is green AND `mergeStateStatus == CLEAN` AND no human review is currently requested. At that point, the autonomous-merge gate in `feedback_autonomous_merge.md` may fire.
6. **Escalation.** If the soft cap is hit, if Codex's findings are technically wrong, or if a finding requires a spec change, the author tags a human and pauses the loop. The autonomous-merge path is unavailable while a human review is requested.

## Considered options

### Option A — Rules-only codification (chosen)

- Pros: Cheap, reversible, leverages Codex wiring that already exists. The rule lives in memory + `.codex/workflows/`, so every contributor (human or agent) sees it before working a PR. No new CI surface.
- Cons: Relies on author discipline to re-request Codex after every push. Soft cap is advisory, not enforced.

### Option B — Add a GitHub Action that re-pings Codex on every `synchronize` event

- Pros: Removes the "author forgot to re-request review" failure mode.
- Cons: Adds CI surface and review-bot cost. Codex review credentials must be wired into the Action. Hard cap is harder to express in YAML than in policy.

### Option C — Hard cap at 3 with branch protection blocking merge after the third round

- Pros: Forces escalation; impossible to ping-pong silently.
- Cons: Penalises legitimate PRs that genuinely need a fourth round (rare but real). Branch protection isn't currently strict in this template (`docs/branching.md`); adding a blocking check inverts the project's process-light posture.

We choose Option A now and leave Option B as a follow-up if author discipline turns out to be insufficient. Option C is rejected because the project explicitly favours soft governance until evidence justifies hardening.

## Consequences

### Positive

- Approval signals can no longer go stale: the rule says approval must come from the *latest* round on the head SHA.
- Authors and reviewers (human or agent) share one mental model of how a PR converges.
- CI failures and merge conflicts are explicitly in-loop work, not separate side-quests.
- Escalation criteria are explicit, so the loop doesn't silently grind.

### Negative

- The "re-request Codex after every push" step is a new author obligation. Forgetting it stalls the PR.
- Soft cap is advisory; a determined ping-pong loop is not technically blocked.

### Neutral

- Loop applies to all PRs uniformly. Trivial PRs (typo fixes, memory edits) typically clear in one round, so the cost of the rule is the cost of one review request.
- Integration with `feedback_autonomous_merge.md` is additive: that ADR's four gates remain authoritative; this ADR pins down *when* they may fire.

## Compliance

- `.claude/memory/feedback_pr_review_loop.md` carries the operational rule and is indexed in `.claude/memory/MEMORY.md`.
- `.codex/workflows/review-response.md` reflects the per-iteration contract (re-request after every push, soft cap, in-loop scope of CI / conflicts).
- `.claude/memory/feedback_autonomous_merge.md` clarifies that the approval signal must be from the latest review round, not a stale one.
- No new CI surface ships with this ADR. If author discipline proves insufficient, a follow-up ADR may add a synchronize-triggered Action (Option B).

## References

- [`feedback_pr_review_loop.md`](../../.claude/memory/feedback_pr_review_loop.md)
- [`feedback_pr_workflow.md`](../../.claude/memory/feedback_pr_workflow.md)
- [`feedback_autonomous_merge.md`](../../.claude/memory/feedback_autonomous_merge.md)
- [`feedback_parallel_pr_conflicts.md`](../../.claude/memory/feedback_parallel_pr_conflicts.md)
- [`.codex/workflows/review-response.md`](../../.codex/workflows/review-response.md)
- [`.codex/workflows/pr-delivery.md`](../../.codex/workflows/pr-delivery.md)
- Constitution Article IV (Quality Gates), Article IX (Reversibility).

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
