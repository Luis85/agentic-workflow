# How to open a pull request from a worktree

**Goal:** take a topic branch from a `.worktrees/<slug>/` checkout to an open PR on GitHub, with the verify gate green and one concern per PR.

**When to use:** you've finished a unit of work on a topic branch and need it reviewed and merged. Use this every time — there is no "small enough to skip the PR" case.

**Prerequisites:**

- Working tree under `.worktrees/<slug>/` on a topic branch (prefix `feat/`, `fix/`, `refactor/`, `chore/`, or `docs/`).
- Commits scoped to one concern. If the diff is two concerns, split it before pushing.
- `gh` CLI authenticated, OR willingness to open the PR in the browser at the URL `git push` prints.

## Steps

1. Confirm you are on the right branch and worktree — `git worktree list` and `git branch --show-current`. The branch name must match the `.worktrees/<slug>/` directory name (slug only, prefix optional).
2. Make sure your commits follow the project's message convention — imperative mood, reference IDs where relevant. Example — `feat(auth): add T-AUTH-014 password reset`. See [`AGENTS.md`](../../AGENTS.md) → "Repo conventions".
3. Run the verify gate — `npm run verify`. It must exit 0 before you push. See [`run-verify-gate.md`](./run-verify-gate.md). Never `--no-verify`.
4. Push — `git push -u origin HEAD`. The `-u` sets upstream so future pushes are bare `git push`. The deny list in [`.claude/settings.json`](../../.claude/settings.json) blocks pushes to `main` / `develop`; topic branches are allowed.
5. Open the PR. Two equivalent options:
   - **`gh` CLI** — write the PR body to a scratch file first, then pass it via `--body-file`. Replace `main` with `develop` if your project uses Shape B in [`docs/branching.md`](../branching.md).

     ```bash
     cat > /tmp/pr-body.md <<'EOF'
     ## Summary
     - bullet 1
     - bullet 2

     ## Test plan
     - [ ] verify gate green
     - [ ] <other checks>
     EOF

     gh pr create --base main \
       --title "<imperative summary>" \
       --body-file /tmp/pr-body.md
     ```
   - **Browser** — open the URL `git push` printed.
6. Confirm the PR uses the right base branch. For a fork, the base remote is the upstream repo, not your fork.
7. If the PR depends on another open PR, do *not* stack — close it, rebase the topic branch off the merged integration branch once the upstream PR lands, and re-push. See [`docs/branching.md`](../branching.md) and `feedback_pr_hygiene.md`.
8. Reply on the PR thread when CI / review feedback lands. Drain feedback in batches; one implementation pass + one sweep pass beats N serial round-trips.

## Verify

`gh pr view --json url,state,baseRefName` returns `state: OPEN`, `baseRefName: main` (or `develop`), and a non-empty URL — and the GitHub PR page shows your verify-gate green check.

## Related

- Reference — [`docs/branching.md`](../branching.md) — branch shapes and prefixes.
- Reference — [`docs/worktrees.md`](../worktrees.md) — worktree lifecycle, including cleanup after merge.
- Reference — [`AGENTS.md`](../../AGENTS.md) — commit-message convention and "branch per concern" rule.
- How-to — [`run-verify-gate.md`](./run-verify-gate.md) — the gate to run before pushing.
- How-to — [`run-doctor.md`](./run-doctor.md) — preflight if the gate reports environment errors.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
