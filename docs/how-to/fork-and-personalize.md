# How to fork and personalize the template

**Goal:** turn a fresh clone of this template into a project of your own, with your principles, stack, and quality bar baked in.

**When to use:** you are starting a new project from this template and have not yet made your first commit.

**Prerequisites:**

- A fork or clone of the repo on disk.
- Claude Code installed (`claude --version` works).
- Write access to the new remote.

## Steps

1. Clone the template — `git clone <your-fork-url> my-project && cd my-project`.
2. Open [`memory/constitution.md`](../../memory/constitution.md) and replace the placeholder principles with the ones your team actually follows.
3. Open [`docs/steering/product.md`](../steering/product.md) and write one paragraph on what the product does and who it serves.
4. Open [`docs/steering/tech.md`](../steering/tech.md) and list your language, framework, datastore, and any non-default tooling agents need to know about.
5. Open [`docs/steering/quality.md`](../steering/quality.md) and capture your test, lint, and review expectations.
6. Replace the project-name in [`README.md`](../../README.md) line 1 and the `## What is this?` section.
7. Stage and commit — `git add -A && git commit -m "chore: personalize template for <project name>"`.

## Verify

`git log --oneline -1` shows your personalization commit and `cat docs/steering/tech.md` returns your stack, not the placeholder.

## Related

- Reference — [`docs/specorator.md`](../specorator.md) — full workflow definition.
- Reference — [`docs/steering/`](../steering/) — what each steering file is for.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — why principles are loaded ahead of every command.
- How-to — [`add-adr.md`](./add-adr.md) — record any constitution change as a decision.
