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

Cut every topic branch from the integration branch — `develop` for this template repo under Shape B ([ADR-0027](adr/0027-adopt-shape-b-branching-model.md)), `main` for adopters operating Shape A. The examples below use `develop`; substitute `main` if your project follows Shape A.

```bash
# 1. Create a worktree for a new branch, cut from develop (the integration branch)
git fetch origin
git worktree add .worktrees/<slug> -b <prefix>/<slug> origin/develop

# 2. Work inside it
cd .worktrees/<slug>
<install deps>                       # e.g. npm ci / uv sync / bundle install
<run verify>                         # see docs/verify-gate.md

# … implement, commit, push, open PR …

# 3. After the PR merges, clean up
cd ../..                             # back to the main checkout on develop
git pull --ff-only                   # bring develop to the merge commit
git worktree remove .worktrees/<slug>
git branch -d <prefix>/<slug>
git worktree prune                   # if needed
```

## Conventions

- **`<slug>` is short kebab‑case.** Match the branch suffix, e.g. `add-auth-flow`, `fix-rate-limit-bug`.
- **One worktree per topic branch.** If you need to branch off a topic branch (rare), create a separate worktree for the child branch.
- **Don't commit anything from `.worktrees/`.** The directory is gitignored on purpose.
- **Don't symlink dependency trees** (`node_modules`, `.venv`) between worktrees. The whole point is isolation.

## When to skip the worktree

For a one‑line typo fix or a docs‑only PR you'll merge in 30 seconds, the worktree overhead isn't worth it. Cut a topic branch in the main checkout, push, merge, switch back to the integration branch.

For anything that touches code, runs tests, or is reviewed by an automated reviewer (i.e. anything that takes more than 30 seconds), use a worktree.

## Common pitfalls

- **`git worktree add` against an existing branch.** Use `-b <new-branch>` to create + switch atomically. If the branch already exists, the prior fix is in flight; don't clobber it.
- **`git pull` while inside the main checkout's integration branch with worktrees open.** Safe — the worktrees see the new commits the next time they `fetch`.
- **Deleting a worktree directory with `rm -rf`.** Use `git worktree remove`. A bare `rm -rf` leaves a stale `.git/worktrees/<slug>` administrative entry; `git worktree prune` cleans that up after the fact.
- **Empty directories left under `.worktrees/`.** `npm run doctor` warns when a directory exists under `.worktrees/` but is not registered as a git worktree. Confirm it is empty and unrelated to active work before deleting it.
- **Merged local branches piling up.** `npm run doctor` warns when local topic branches are already merged into the integration branch (`origin/develop` under Shape B; `origin/main` under Shape A). Delete them after the PR merge is confirmed and the matching worktree is removed.
- **Staged new files bleeding across branches on `git checkout`.** When you switch branches while the index contains files staged for addition that are not tracked on either branch, git carries them into the new branch's index. A subsequent commit — even one that targets a single specific file — silently includes every staged file, pulling work from the wrong branch into your commit. **The fix is worktrees:** each worktree has its own index, so files staged in one branch never appear in another. If you must use the main checkout, run `npm run check:index-bleed` before committing; see [Issue #261](https://github.com/Luis85/agentic-workflow/issues/261) for the full incident report.

## Settings

The default `.claude/settings.json` allows the worktree subcommands by name. There are no deny rules around `.worktrees/` — agents are free to create and remove their own worktrees as needed.

## See also

- [`feedback_worktrees_required.md`](../.claude/memory/feedback_worktrees_required.md) — the rule itself.
- [`docs/branching.md`](./branching.md) — what "integration branch" means.
- [`.codex/workflows/pr-delivery.md`](../.codex/workflows/pr-delivery.md) — Codex's expected end-to-end worktree and PR loop.
- [`.gitignore`](../.gitignore) — confirm `.worktrees/` is ignored before relying on it.
