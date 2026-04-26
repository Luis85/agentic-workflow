# Verify gate — one command, all gates

## Rule

Every project that uses this workflow defines a single command — conventionally `verify` — that runs **all** of:

1. Format check (no auto‑write)
2. Lint
3. Static type / schema check
4. Test suite
5. Build / package

That command is the **pre‑PR gate**. If any stage fails, the PR doesn't open.

## Why

A single command is cacheable in muscle memory and in CI. It eliminates the "I forgot to run typecheck" failure mode. It also lets agents check pre‑PR readiness with one Bash call instead of memorising the project's tool zoo.

Bundling the build into verify catches a class of bugs (broken imports, dead exports, unresolved refs) that tests sometimes miss.

## How to apply

- **Project owners.** Wire `verify` so the stages run sequentially and the script exits non‑zero on first failure. Document it in the project's README and link [`docs/verify-gate.md`](../../docs/verify-gate.md).
- **Agents.** Before opening a PR, run verify. On failure, *re‑run the failing stage in isolation* so the output is readable, then fix.
- **Reporting.** On success: one line. On failure: name the failing stage, quote the first error, suggest the single command to reproduce.

## Hard stops

- Do **not** weaken any stage to make verify pass. Disabling a flaky test is acceptable only when paired with an issue and an owner.
- Do **not** skip stages with environment flags ("just run lint, the tests are slow"). The whole point is *one* command.
- Do **not** commit build artefacts (`dist/`, `target/`, `build/`) — verify's build step is a sanity check, not a deliverable.
