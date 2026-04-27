# Cleanup after merge workflow

Use this after the human says a PR has merged.

## Steps

1. Confirm the PR state on GitHub.
2. Fetch and prune remotes.
3. Fast-forward the local integration branch.
4. Confirm the PR worktree is clean.
5. Remove the PR worktree with `git worktree remove`.
6. Delete the local topic branch with `git branch -d`.
7. If normal branch deletion fails because GitHub used a merge or squash shape, ask before `git branch -D`.
8. Run `git worktree prune`.
9. Report the final local state.

## Final state checklist

- Integration branch is clean and up to date with origin.
- No worktree remains for the merged branch.
- No stale local branch remains, unless the human declined force deletion.
- No uncommitted changes are present.
