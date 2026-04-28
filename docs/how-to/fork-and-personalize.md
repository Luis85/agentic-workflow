# How to fork and personalize the template

**Goal:** turn a fresh clone of this template into a project of your own, with your principles, stack, and quality bar baked in.

**When to use:** you are starting a new project from this template and have not yet made your first commit.

**Prerequisites:**

- A fork or clone of the repo on disk.
- Claude Code installed (`claude --version` works).
- Write access to the new remote.

## Steps

1. Clone the template — `git clone <your-fork-url> my-project && cd my-project`.
2. Install the verify-gate dependencies — `npm install`. The repo ships a Node-based gate (`npm run verify`) you'll need before opening PRs; see [`run-verify-gate.md`](./run-verify-gate.md).
3. Run the doctor once to confirm the toolchain is happy — `npm run doctor`. See [`run-doctor.md`](./run-doctor.md).
4. Open [`memory/constitution.md`](../../memory/constitution.md) and replace the placeholder principles with the ones your team actually follows.
5. Open [`docs/steering/product.md`](../steering/product.md) and write one paragraph on what the product does and who it serves.
6. Open [`docs/steering/tech.md`](../steering/tech.md) and list your language, framework, datastore, and any non-default tooling agents need to know about.
7. Open [`docs/steering/quality.md`](../steering/quality.md) and capture your test, lint, and review expectations.
8. Replace the project-name in [`README.md`](../../README.md) line 1 and the `## What is this?` section.
9. Stage and commit — `git add -A && git commit -m "chore: personalize template for <project name>"`.

## Verify

`git log --oneline -1` shows your personalization commit, `cat docs/steering/tech.md` returns your stack (not the placeholder), and `npm run verify` exits 0.

## Related

- Reference — [`docs/specorator.md`](../specorator.md) — full workflow definition.
- Reference — [`docs/steering/`](../steering/) — what each steering file is for.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — why principles are loaded ahead of every command.
- How-to — [`run-doctor.md`](./run-doctor.md) — confirm the toolchain after install.
- How-to — [`run-verify-gate.md`](./run-verify-gate.md) — pre-PR gate.
- How-to — [`add-adr.md`](./add-adr.md) — record any constitution change as a decision.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
