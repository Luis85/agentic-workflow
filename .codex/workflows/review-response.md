# Review response workflow

Use this when a pull request has reviewer feedback.

## Steps

1. Fetch PR comments, review threads, and review submissions.
2. Identify actionable findings and distinguish them from informational comments.
3. Work in the existing PR worktree if it exists; otherwise create or restore a worktree for the PR branch.
4. Make the smallest change that addresses the review.
5. Update docs, issue records, or PR body text when the review changes the rationale or verification story.
6. Run targeted verification for the changed behavior.
7. Commit and push to the same PR branch.
8. Reply to each addressed review thread with the commit SHA and what changed.
9. Resolve threads only after the fix is pushed.
10. Re-check PR mergeability.
11. Tell the human what was fixed and ask whether to merge, request another review, or continue iterating.

## Reply style

Keep replies factual and short:

```text
Fixed in `<sha>`. I changed <file/behavior> so <result>, and verified with <check>.
```

Do not mark a thread resolved if the fix is only planned or local.
