# verify — run the full pre‑PR gate

## Purpose

Run the project's complete pre‑PR quality gate as one command and report the result so failures are easy to act on. Invoke this before opening any PR, after pulling, and any time the agent is unsure whether the working tree is shippable.

The verify gate is a **project‑level contract**, not a Claude Code feature: every project that follows this workflow defines a `verify` command (e.g. `npm run verify`, `make verify`, `just verify`, `pdm run verify`) that runs all stages in order and exits non‑zero on first failure.

See [`docs/verify-gate.md`](../../../docs/verify-gate.md) for the contract that any project's `verify` script MUST implement.

## How to use

**Default path — one composite command:**

```bash
<project-verify-command>
```

For this template repository, the default command is `npm run verify`. Use `npm run check:fast`, `npm run check:content`, or `npm run check:workflow` only while iterating on that narrower surface; run the full gate before pushing. Use `npm run verify:json` when an agent or CI adapter needs structured diagnostics with rerun commands. Use `npm run self-check` when the user asks for a broader local quality review that combines verify diagnostics, workflow metrics, and learning evidence; use `npm run self-check -- --json` for programmatic consumers.

If verify fails, **re‑run only the failing stage** so its output is readable. Example, for an npm project:

```bash
npm run format:check   # if formatting is the issue
npm run lint           # if lint is the issue
npm run typecheck      # if types are the issue
npm test               # if a test is the issue
npm run build          # if the build is the issue
```

The same idea applies to Python (`ruff format --check`, `ruff check`, `mypy`, `pytest`, `python -m build`), Go (`gofmt -l`, `go vet`, `go build`, `go test`), or anything else — the stages are language‑agnostic; the commands are not.

## Reporting

- **Pass:** one line. `verify green — ready to PR.` Don't enumerate what passed.
- **Fail:** name the failing stage, quote the **first** error (not the last), and suggest the single command to reproduce. Don't dump full stack traces unless the user asks.

```
verify failed at typecheck.

  src/foo.ts:42:7 — Property 'bar' does not exist on type 'Baz'.

reproduce: npm run typecheck
```

## Auto‑fix shortcuts

If the project provides them, prefer the auto‑fix command over hand‑editing:

- Formatting → run the formatter in *write* mode (`prettier --write`, `ruff format`, `gofmt -w`).
- Linter auto‑fixable → run the linter in fix mode (`eslint --fix`, `ruff check --fix`).
- Typecheck / test failures → no auto‑fix; read the error and change the code.

## Do not

- Do **not** use `--no-verify` (or its equivalent) to skip commit hooks. See [`feedback_pr_hygiene.md`](../../memory/feedback_pr_hygiene.md).
- Do **not** disable a flaky test to make verify pass. Open an issue, document it, and skip with an explicit owner.
- Do **not** delete tests to reduce the test count. Every removed test needs a written justification in the PR body.
- Do **not** commit build outputs (`dist/`, `target/`, `build/`). The build stage of verify is a sanity check, not a deliverable.
