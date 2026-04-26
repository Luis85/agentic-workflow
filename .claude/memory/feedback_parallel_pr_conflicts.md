# Parallel PRs hit shared‑file conflicts — merge, don't rebase

## Rule

When multiple in‑flight PRs all touch the same shared bookkeeping file (a roadmap plan, the RTM, a changelog), the second PR to be reviewed **resolves conflicts via merge from the integration branch**, not via rebase.

```bash
# in the PR's branch / worktree
git fetch origin
git merge origin/<integration-branch>
# resolve the conflict in the bookkeeping file
git add <file>
git commit
```

## Why

Automated reviewers (and human reviewers using sticky line comments) anchor their feedback to specific commit SHAs. A rebase rewrites those SHAs and orphans every comment, forcing the reviewer to start over. A merge commit keeps the original commits — and their line anchors — intact.

Roadmap plans and RTMs are *expected* to conflict when two PRs both flip rows; that's the whole point of the file. Resolving via merge is the cheap, comment‑preserving path.

## How to apply

- See a conflict on a shared bookkeeping file? `git merge origin/<integration-branch>`, resolve, commit.
- Don't rebase the topic branch even if `git pull` would prefer it. Configure `pull.ff = only` so an accidental rebase doesn't happen by reflex.

## Hard stops

- Do **not** rebase a topic branch with open review threads. Apply `git merge` even if the resulting history looks "less clean".
- Do **not** force‑push after the resolution. The merge commit is the resolution; force‑push would erase it and re‑orphan the reviewer's anchors.
