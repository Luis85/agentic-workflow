# Review response workflow

Use this when a pull request has reviewer feedback (Codex, human, or both). The repo wires Codex as the always-on automated reviewer; this workflow is the per-iteration contract of the **PR Codex review loop** ([`feedback_pr_review_loop.md`](../../.claude/memory/feedback_pr_review_loop.md), [ADR-0015](../../docs/adr/0015-codify-codex-pr-review-loop.md)).

## Loop framing

Every PR converges through a bounded author↔Codex loop:

- **Trigger.** PR goes `ready_for_review`, or a fresh push lands on a PR already in that state.
- **One round.** = the steps below, executed once: fetch findings → fix → push → re-request Codex review.
- **Soft cap.** 3 rounds. After round 3 leave a `loop cap reached` comment summarising remaining findings and either continue (if tractable) or escalate to a human reviewer.
- **Exit.** Latest-round Codex approval on the head SHA + green CI + `mergeStateStatus == CLEAN` + no human review requested. Then [`feedback_autonomous_merge.md`](../../.claude/memory/feedback_autonomous_merge.md) gates fire.
- **Scope.** Applies to every PR — code, docs, memory, template.

## Steps (one round)

1. Fetch PR comments, review threads, review submissions, **and the latest CI status on the head SHA**.
2. Identify actionable findings and distinguish them from informational comments. Treat CI failures and merge conflicts as findings — they are in-loop work, not separate side-quests.
3. Work in the existing PR worktree if it exists; otherwise create or restore a worktree for the PR branch.
4. If the PR is behind the integration branch: `git merge origin/<integration-branch>` to pick up upstream changes. **Do not rebase** a PR with open review threads — it breaks Codex's line anchors.
5. Make the smallest change that addresses each finding.
6. Update docs, issue records, or PR body text when the review changes the rationale or verification story.
7. Run the verify gate (`npm run verify`) green locally before pushing. Never `--no-verify`.
8. Commit and push to the same PR branch (no force-push once review is requested; add follow-up commits).
9. Reply to each addressed review thread with the commit SHA and what changed.
10. Resolve threads only after the fix is pushed.
11. **Re-request a fresh Codex review.** A previous Codex approval does not survive a new commit — approval must come from the *latest* round on the head SHA. Use `gh pr edit --add-reviewer <codex-bot-handle>` or the equivalent re-request action your Codex wiring expects.
12. Re-check PR mergeability (`gh pr view --json mergeStateStatus,mergeable,statusCheckRollup`).
13. Tell the human what was fixed and ask whether to merge, request another review, or continue iterating.

## Reply style

Keep replies factual and short:

```text
Fixed in `<sha>`. I changed <file/behavior> so <result>, and verified with <check>.
```

Do not mark a thread resolved if the fix is only planned or local.

## Staying alive between rounds

After re-requesting Codex review (step 11) the agent does **not** idle until the next user message. It actively watches the PR until something actionable arrives. Two mechanisms, in preference order:

1. **Event listening (preferred).** If the harness exposes GitHub webhooks, an MCP-style event subscription, or `gh pr view --watch`, listen for `pull_request_review`, `check_run`, and `pull_request` (synchronize, edited) events and act the moment one lands. Zero polling overhead.
2. **Self-paced polling (fallback, default).** Poll the PR every **~5 minutes** with:

   ```bash
   gh pr view <num> --json reviews,statusCheckRollup,mergeStateStatus,mergeable,comments
   ```

   Compare against the previous snapshot. Act when **any** of these change: a new Codex review submission, a new comment, `statusCheckRollup` flips to a terminal state, or `mergeStateStatus` transitions (e.g. `UNSTABLE → CLEAN`, or `→ BEHIND`).

Use the harness's loop primitive (e.g. `/loop 5m <recheck>`) rather than ad-hoc sleeps — it survives session restarts and is observable. ~5 minutes matches typical CI runtime and Codex review latency in this repo; tighter polling burns context for no signal, longer polling adds wall-clock latency.

Stop polling on any of: loop exit conditions met (merge eligible), human review requested, soft cap reached and escalated, or the human explicitly tells the agent to stand down. Full rule in [`feedback_pr_review_loop.md`](../../.claude/memory/feedback_pr_review_loop.md).

## Soft-cap warning template

When you reach the third round on the same PR without converging, leave a single comment in the PR conversation:

```text
Loop cap reached (round 3). Outstanding findings:
- <finding 1>
- <finding 2>

Next step: <continue / escalate to human reviewer / open follow-up issue>.
```

Then continue or escalate. Do not silently exceed the cap — the comment is the breadcrumb for the next reviewer (human or agent) to pick up cold.

## Hard stops

- Do **not** treat absence of new findings as approval. Approval must be a positive Codex signal on the head SHA.
- Do **not** carry a Codex approval forward across a new push. Re-request review every time.
- Do **not** rebase a PR with open review threads. Use merge.
- Do **not** self-merge while a human review is requested, regardless of Codex status.
