# Worktrees required for parallel work

## Rule

Every topic branch lives in a dedicated `git worktree` under `.worktrees/<slug>/`. The main checkout stays on the integration branch (`develop` if you have one, otherwise `main`) and is **never** used for active feature work.

`.worktrees/` is gitignored.

## Why

Multiple agents (or humans) working in parallel collide on:

- `node_modules/` / `.venv/` / build caches written by package managers
- Test runner worker state (Vitest, pytest‑xdist, Jest)
- Build outputs (`dist/`, `target/`, `build/`)
- IDE / language‑server caches

A single shared checkout serialises this work. Worktrees give each branch its own filesystem view that shares the underlying `.git/` object database — fast to create, cheap to throw away, fully isolated for everything except git history itself.

## How to apply

The **branch name** must carry one of the canonical prefixes from [`docs/branching.md`](../../docs/branching.md) (`feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `release/`, `claude/`). The default `.claude/settings.json` allowlist only permits pushes from these prefixes; an unprefixed branch will be denied at push time. The on-disk worktree path (`.worktrees/<slug>`) is unconstrained — only the branch name has to satisfy the allowlist.

```bash
# Create — branch name is <prefix>/<slug>; worktree path is the slug alone
git worktree add .worktrees/<slug> \
  -b <prefix>/<slug> origin/<integration-branch>

# Work inside it
cd .worktrees/<slug>
<install deps for this project>     # e.g. npm ci, uv sync, bundle install
<run verify>                         # see feedback_verify_gate.md

# After the PR merges (run from the main checkout, not the worktree)
git worktree remove .worktrees/<slug>
git branch -d <prefix>/<slug>
git worktree prune                   # if needed
```

## Hard stops

- Do **not** symlink `node_modules/` (or any other dependency tree) between worktrees. The whole point is isolation.
- Do **not** commit anything from `.worktrees/`. The directory is gitignored on purpose.
- Do **not** create a worktree on the integration branch itself. Worktrees are for the *topic* branch; the main checkout stays on the integration branch.
- Do **not** use the main checkout to work on multiple feature branches sequentially. Staged-for-addition files carry across `git checkout` because git does not track them to a branch — the next commit silently picks them all up. Use one worktree per branch to get an isolated index. Run `npm run check:index-bleed` before committing if you are in the main checkout. See [docs/worktrees.md#common-pitfalls](../../docs/worktrees.md#common-pitfalls) and [Issue #261](https://github.com/Luis85/agentic-workflow/issues/261).

See [`docs/worktrees.md`](../../docs/worktrees.md) for the full guide.
