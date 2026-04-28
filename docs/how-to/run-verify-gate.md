# How to run the verify gate

**Goal:** run formatter, linter, type-checks, tests, and build locally and reach a green signal before pushing.

**When to use:** you are about to open or update a pull request and need to confirm the change does not break the gate.

**Prerequisites:**

- Working tree on a topic branch (not `main` / `develop`).
- Project dependencies installed.
- Claude Code installed (or the verify command shown in your project's [`docs/verify-gate.md`](../verify-gate.md)).

## Steps

1. Stage every file you intend to push — `git add -A` (or specific paths). The gate runs against the working tree, not stashed work.
2. Open Claude Code — `claude`.
3. Run the verify skill — `/verify`. The skill chains the configured formatter, linter, type-checker, test runner, and build for your stack.
4. Read the output top-to-bottom. A red line in any phase fails the gate; do not push.
5. Fix the failure, re-stage, and re-run `/verify`. Repeat until every phase reports green.
6. Push — `git push origin HEAD`. Never use `--no-verify`; the deny rule in [`.claude/settings.json`](../../.claude/settings.json) is intentional.

## Verify

The final line of the verify output reads `verify: OK` (or your project's equivalent green signal) and `git push` completes without a hook rejection.

## Related

- Reference — [`docs/verify-gate.md`](../verify-gate.md) — what each phase checks and how to extend it.
- Reference — [`docs/branching.md`](../branching.md) — branch naming and protected branches.
- Reference — [`docs/worktrees.md`](../worktrees.md) — running parallel branches without trashing caches.
- How-to — [`add-adr.md`](./add-adr.md) — record a decision if you change what the gate checks.
