# How to run the verify gate

**Goal:** run formatter, linter, type-checks, tests, and build locally and reach a green signal before pushing.

**When to use:** you are about to open or update a pull request and need to confirm the change does not break the gate.

**Prerequisites:**

- Working tree on a topic branch (not `main` / `develop`).
- Project dependencies installed.
- Claude Code installed (or the verify command shown in your project's [`docs/verify-gate.md`](../verify-gate.md)).

## Steps

1. Stage every file you intend to push — `git add -A` (or specific paths). The gate runs against the working tree, not stashed work.
2. Run the verify gate. Two equivalent entry points:
   - **From the shell** — `npm run verify`. This is the canonical command and what CI (`.github/workflows/verify.yml`) runs.
   - **From Claude Code** — open `claude`, then run `/verify`. The skill wraps the same composite for you.
3. Read the output top-to-bottom. A red line in any phase fails the gate; do not push.
4. Fix the failure, re-stage, and re-run the same command. Repeat until every phase reports green.
5. Push — `git push origin HEAD`. Never use `--no-verify`; the deny rule in [`.claude/settings.json`](../../.claude/settings.json) is intentional.

## Verify

The final line of the verify output reads `verify: OK` (or your project's equivalent green signal) and `git push` completes without a hook rejection.

## Related

- Reference — [`docs/verify-gate.md`](../verify-gate.md) — what each phase checks and how to extend it.
- Reference — [`docs/branching.md`](../branching.md) — branch naming and protected branches.
- Reference — [`docs/worktrees.md`](../worktrees.md) — running parallel branches without trashing caches.
- How-to — [`run-doctor.md`](./run-doctor.md) — preflight check when verify reports environment errors.
- How-to — [`add-adr.md`](./add-adr.md) — record a decision if you change what the gate checks.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
