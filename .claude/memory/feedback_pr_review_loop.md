---
name: PR Codex review loop — bounded author↔Codex iteration on every PR
description: Defines the bounded review loop between PR author and Codex (the wired automated reviewer). Trigger, per-iteration contract, soft cap, scope, escalation. Applies to all PRs.
type: feedback
---

# PR Codex review loop

## Rule

Codex is wired as this repo's automated reviewer. When a PR is marked `ready_for_review`, Codex inspects the diff and either reacts with a positive approval signal (thumbs‑up) or leaves blocking comments. Every PR — code, docs, memory, template — runs the **same loop**:

1. **Trigger.** PR goes `ready_for_review` (or a fresh push lands on a PR already in that state). The author requests a Codex review.
2. **Per round (author):**
   - Read every Codex comment AND every CI failure on the head SHA.
   - Resolve merge conflicts in‑loop with `git merge origin/<integration-branch>`. **Never rebase** a PR with open review threads — it breaks Codex's line anchors. See [`feedback_parallel_pr_conflicts.md`](./feedback_parallel_pr_conflicts.md).
   - Make the smallest change that addresses the findings.
   - Run the verify gate locally (`npm run verify` in this template). Never `--no-verify`. See [`feedback_verify_gate.md`](./feedback_verify_gate.md).
   - Push the fix. Reply to each addressed thread with the commit SHA and what changed (template in [`.codex/workflows/review-response.md`](../../.codex/workflows/review-response.md)). Resolve threads only after the fix is pushed.
   - **Re-request a fresh Codex review on every push.** A previous Codex approval does not carry over. Approval must come from the *latest* round on the head SHA.
3. **Soft cap: 3 rounds.** After three full author↔Codex round‑trips on the same PR, leave a comment in the PR ("loop cap reached: <summary>") and either continue if the remaining findings are tractable or escalate to a human reviewer. The cap is **soft** — it warns, it does not block.
4. **Exit.** The loop ends when **all** of: Codex's most recent review on the head SHA is a positive approval signal, CI is green, `mergeStateStatus == CLEAN`, no human review is currently requested. At that point, the gates in [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md) may fire.

## Why

Two failure modes the loop prevents:

- **Stale approval.** Author pushes a fix; Codex's earlier thumbs‑up is treated as still valid; a regression slips into the integration branch. Re-requesting after every push pins approval to the head SHA.
- **Open-ended ping-pong.** Author and Codex bounce minor findings indefinitely; no human is paged; the PR sits. The soft cap surfaces the pattern instead of letting it run silently.

Treating CI failures and merge conflicts as in‑loop work (not separate side‑quests) keeps the PR's state machine simple: there is one queue of findings to address, and one approval signal that closes it.

The cap is soft because the project is process-light by design ([`AGENTS.md`](../../AGENTS.md) — "When the harness gets in your way"). A hard block would penalise legitimate fourth-round PRs; a warning is enough to surface the pattern when it's misuse.

## How to apply

- After **every push** to a PR branch in `ready_for_review` state, request a fresh Codex review. `gh pr ready` does not re-trigger automatically; explicit re-request is the contract.
- If Codex's findings are technically wrong, push back in the thread with evidence — do not silently address them. Receiving review feedback is not performative agreement (see `superpowers:receiving-code-review`).
- If a finding requires a spec / requirements change, pause the loop, open the spec change first, then resume. Do not invent requirements inside the PR.
- Track loop rounds informally — count threads resolved across pushes. If you reach round 3 and findings keep regenerating, that is the escalation signal.
- Lightweight PRs (typo fix, memory edit) typically clear in one round. The rule is uniform so authors never have to ask whether the loop applies.

## Hard stops

- Do **not** treat absence of new findings as approval. Approval must be a positive signal (reaction, label, "approved" comment) on the head SHA. See [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md).
- Do **not** carry a Codex approval forward across a new push. Re-request review.
- Do **not** rebase a PR with open review threads to "clean up" before re-requesting review. Use merge.
- Do **not** silently exceed the soft cap. Leave the cap-reached comment so the next reviewer (human or agent) can pick up cold.
- Do **not** self‑merge while a human review is requested, regardless of Codex status.

## Relation to the constitution

Consistent with **Article IV — Quality Gates** (errors resolved at the earliest stage; two-layer validation: CI then critic-agent review) and **Article IX — Reversibility** (merging is shared‑state and effectively irreversible; the loop's exit condition is the explicit authorisation Article IX requires).

Codified in [ADR-0015](../../docs/adr/0015-codify-codex-pr-review-loop.md).
