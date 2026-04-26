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

```bash
# Create
git worktree add .worktrees/<slug> -b <slug> origin/<integration-branch>

# Work inside it
cd .worktrees/<slug>
<install deps for this project>     # e.g. npm ci, uv sync, bundle install
<run verify>                         # see feedback_verify_gate.md

# After the PR merges
git worktree remove .worktrees/<slug>
git branch -d <slug>                 # from any checkout
git worktree prune                   # if needed
```

## Hard stops

- Do **not** symlink `node_modules/` (or any other dependency tree) between worktrees. The whole point is isolation.
- Do **not** commit anything from `.worktrees/`. The directory is gitignored on purpose.
- Do **not** create a worktree on the integration branch itself. Worktrees are for the *topic* branch; the main checkout stays on the integration branch.

See [`docs/worktrees.md`](../../docs/worktrees.md) for the full guide.
