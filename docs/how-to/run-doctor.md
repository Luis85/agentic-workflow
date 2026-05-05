# How to run the doctor preflight

**Goal:** confirm your local toolchain, repo state, and dependency tree are healthy before you start (or resume) work — so the verify gate doesn't surprise you later.

**When to use:** you just cloned or forked the template; you switched branches; `npm run verify` reported a confusing environment error; you want a single command that summarises *"is my checkout sane?"*

**Prerequisites:**

- Repo cloned with a working tree on disk.
- `node` and `npm` on `PATH`.

## Steps

1. From the repo root, run — `npm run doctor`.
2. Read the output top-to-bottom. The script runs ten checks and prints one line per check (`pass` / `warn` / `fail`):
   - **Node** — version satisfies the engines field (`>=20.6`).
   - **npm** — present on `PATH`.
   - **git** — present on `PATH`.
   - **branch** — current branch, upstream, and ahead/behind state.
   - **git status** — clean / dirty.
   - **worktrees** — registered worktrees, unregistered `.worktrees/` directories, and merged local branches that are ready for cleanup.
   - **dependencies** — `node_modules/` matches `package.json`.
   - **ADR index** — re-runs `check:adr-index`.
   - **command inventories** — re-runs `check:commands`.
   - **verify gate** — re-runs `npm run verify` end-to-end.
3. For every `warn` line, read the `hint` to decide if it matters for your task. A stale integration branch usually means `git pull --ff-only`; a merged branch or unregistered worktree usually means cleanup after the related PR is confirmed merged.
4. For every `fail` line, fix the underlying cause before continuing. The doctor exits non-zero on any failure.
5. Re-run until the trailing line reads `doctor: ok`.

## Verify

`npm run doctor` exits 0 and the final line reads `doctor: ok`.

## Related

- Reference — [`docs/scripts/doctor/`](../scripts/doctor/) — what each check does and why it exists.
- Reference — [`scripts/doctor.ts`](../../scripts/doctor.ts) — the source of the check list.
- How-to — [`run-verify-gate.md`](./run-verify-gate.md) — the per-PR gate the doctor wraps.
- How-to — [`fork-and-personalize.md`](./fork-and-personalize.md) — first-clone flow that calls the doctor.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
