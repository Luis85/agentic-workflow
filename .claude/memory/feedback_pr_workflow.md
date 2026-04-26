# PR workflow — independent + batch + multi‑pass

## Rule

When a session produces multiple independent PRs:

1. **Cut every PR's branch fresh** from the integration branch. Don't pull one PR into another.
2. **Open all the PRs first** — don't wait for review on PR #1 before opening PR #2.
3. **Then sweep the review feedback** PR by PR until each is green.
4. **Address findings with follow‑up commits**, not rebases. Rebases break the line anchors automated reviewers leave on review threads.
5. **Resolve each thread in the UI** when fixed so the reviewer doesn't re‑surface it.
6. **Maintainer (or the autonomous‑merge rule) merges**, not the author. Cleanup happens after merge.

## Why

One implementation pass + one sweep pass beats N serial pass‑pairs. Reviewers (human or automated) tend to batch their attention; matching that with batched submissions cuts wall‑clock time roughly in half.

Rebasing mid‑review re‑points a reviewer's line comments at the wrong commit (or an orphaned commit) and forces them to re‑read the diff from scratch.

## How to apply

- Plan the wave: list every PR up front, label which are independent and which are sequential.
- For each independent PR: branch → implement → verify → push → open. Move on; don't wait.
- After the last PR is open, sweep: read review threads, push fixup commits, mark resolved.
- For sequential PRs: only start PR N+1 after PR N has merged into the integration branch.

## Hard stops

- Do **not** force‑push a topic branch once a review has been requested. Add a follow‑up commit instead.
- Do **not** rebase a topic branch that has open review threads. Use `git merge origin/<integration-branch>` to pick up upstream changes.
- Do **not** bundle independent concerns into one PR to "save" review rounds. The cost of an extra PR is small; the cost of conflated review feedback is large.
