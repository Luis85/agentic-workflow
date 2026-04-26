# PR hygiene — branch per concern, verify before push

## Rule

- **One concern per PR.** Multiple concerns in one session = multiple branches, each cut **fresh** from the integration branch (`develop` if you have one, otherwise `main`).
- **Never stack** topic branches. If branch B depends on unmerged branch A's diff, pause B until A merges.
- **Run the verify gate** (see [`feedback_verify_gate.md`](./feedback_verify_gate.md)) green locally **before** opening the PR.
- **Never** use `--no-verify` to bypass commit hooks. If a hook fails, the hook is right and the change is wrong; fix the change.
- **Authors don't merge their own PRs** unless the project explicitly opts in to autonomous self‑merge (see [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md)).

## Why

Stacked branches confuse automated reviewers (their line anchors break after rebases) and force humans to mentally diff against the wrong base. A single concern per PR means the review surface is small, the revert surface is small, and the failure surface — when something ships broken — is small.

`--no-verify` is how a `dist/` artifact, a test that fails locally, or a half‑baked refactor lands in `main`. The cost of a 20‑second hook run is far below the cost of a revert PR.

## How to apply

- Before any non‑trivial change: `git switch <integration-branch> && git pull --ff-only && git switch -c <slug>`.
- Before pushing: run the project's verify command (typically `npm run verify`, `make verify`, `pdm run verify`, etc. — see [`docs/verify-gate.md`](../../docs/verify-gate.md)).
- If you discover *during* implementation that a second concern needs touching, open a second branch — don't widen the current one.

## Exceptions

- **Tightly coupled changes that must land atomically** (e.g. a schema migration plus the code that reads the new column). Document the coupling in the PR body and explain why splitting would leave the repo broken between merges.
