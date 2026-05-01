# Worktrees

Every topic branch lives in its own `git worktree` under `.worktrees/<slug>/`. The main checkout stays on the integration branch and is **never** used for active feature work.

`.worktrees/` is gitignored.

## Why

A single shared checkout serialises feature work because package managers, test runners, build tools, and language servers all write to shared paths inside the working tree:

- `node_modules/`, `.venv/`, `vendor/`, `target/`
- `dist/`, `build/`, `out/`
- Test runner worker state (Vitest, pytest‑xdist, Jest, RSpec)
- IDE / language‑server caches

Worktrees give each branch its own filesystem view that shares the underlying `.git/` object database. Each worktree has independent caches and outputs; multiple agents can run verify in parallel without trashing each other's state.

## Lifecycle

```bash
# 1. Create a worktree for a new branch, off the integration branch
git fetch origin
git worktree add .worktrees/<slug> -b <prefix>/<slug> origin/<integration-branch>

# 2. Work inside it
cd .worktrees/<slug>
<install deps>                       # e.g. npm ci / uv sync / bundle install
<run verify>                         # see docs/verify-gate.md

# … implement, commit, push, open PR …

# 3. After the PR merges, clean up
cd ../..                             # back to the main checkout
git pull --ff-only                   # bring the integration branch to the merge commit
git worktree remove .worktrees/<slug>
git branch -d <prefix>/<slug>
git worktree prune                   # if needed
```

## Conventions

- **`<slug>` is short kebab‑case.** Match the branch suffix, e.g. `add-auth-flow`, `fix-rate-limit-bug`.
- **One worktree per topic branch.** If you need to branch off a topic branch (rare), create a separate worktree for the child branch.
- **Don't commit anything from `.worktrees/`.** The directory is gitignored on purpose.
- **Don't symlink dependency trees** (`node_modules`, `.venv`) between worktrees. The whole point is isolation.

## Search hygiene

When using **Glob** or **Grep** across the repo, exclude `.worktrees/**` unless you explicitly need to search inside one. Each worktree is a full repo copy — searching all of them inflates results, slows the search, and burns tokens. Examples:

- `Glob` — pass a project-relative path (e.g. `docs/**/*.md`) instead of an open `**/*.md`, or set `path: docs/`.
- `Grep` — pass `path: <subdir>` for a scoped search; avoid running at the repo root without a glob filter.
- Bash `find` — start the path inside a known subtree, or add `-not -path './.worktrees/*'`.

Multiplied across a session, this is a meaningful chunk of the token budget. (A repo-wide budget policy will land at `docs/token-budget.md` in a follow-up.)

## When to skip the worktree

For a one‑line typo fix or a docs‑only PR you'll merge in 30 seconds, the worktree overhead isn't worth it. Cut a topic branch in the main checkout, push, merge, switch back to the integration branch.

For anything that touches code, runs tests, or is reviewed by an automated reviewer (i.e. anything that takes more than 30 seconds), use a worktree.

## Common pitfalls

- **`git worktree add` against an existing branch.** Use `-b <new-branch>` to create + switch atomically. If the branch already exists, the prior fix is in flight; don't clobber it.
- **`git pull` while inside the main checkout's integration branch with worktrees open.** Safe — the worktrees see the new commits the next time they `fetch`.
- **Deleting a worktree directory with `rm -rf`.** Use `git worktree remove`. A bare `rm -rf` leaves a stale `.git/worktrees/<slug>` administrative entry; `git worktree prune` cleans that up after the fact.
- **Empty directories left under `.worktrees/`.** `npm run doctor` warns when a directory exists under `.worktrees/` but is not registered as a git worktree. Confirm it is empty and unrelated to active work before deleting it.
- **Merged local branches piling up.** `npm run doctor` warns when local topic branches are already merged into `origin/main`. Delete them after the PR merge is confirmed and the matching worktree is removed.

## Settings

The default `.claude/settings.json` allows the worktree subcommands by name. There are no deny rules around `.worktrees/` — agents are free to create and remove their own worktrees as needed.

## See also

- [`feedback_worktrees_required.md`](../.claude/memory/feedback_worktrees_required.md) — the rule itself.
- [`docs/branching.md`](./branching.md) — what "integration branch" means.
- [`.codex/workflows/pr-delivery.md`](../.codex/workflows/pr-delivery.md) — Codex's expected end-to-end worktree and PR loop.
- [`.gitignore`](../.gitignore) — confirm `.worktrees/` is ignored before relying on it.
