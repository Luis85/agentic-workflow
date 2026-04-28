# How to adapt steering for your own stack

**Goal:** rewrite `docs/steering/*.md` so every stage agent reads accurate context about your product, stack, UX, quality bar, and operational constraints.

**When to use:** you just forked the template, **or** your stack / product / quality bar shifted enough that the existing steering files would mislead an agent.

**Prerequisites:**

- Cloned repo on disk.
- A clear picture of the product, stack, and operational reality.
- Working tree on a topic branch.

## Steps

1. List the steering files — `ls docs/steering/`. Open [`docs/steering/README.md`](../steering/README.md) to see what each file is for.
2. Open `docs/steering/product.md`. Replace placeholder content with one paragraph on what the product does and who it serves.
3. Open `docs/steering/tech.md`. List language, framework, datastore, build system, deploy target, and any non-obvious tooling. Note anything that would surprise a new contributor.
4. Open `docs/steering/ux.md`. Describe the design system, accessibility floor, and target devices. Skip if you have no UI.
5. Open `docs/steering/quality.md`. Capture test expectations, lint rules, code-coverage floor, and review expectations.
6. Open `docs/steering/operations.md` (or the project's equivalent). Note observability stack, on-call expectations, deploy cadence, and post-incident review rules.
7. Commit each file with a focused message — `docs(steering): adapt tech.md to <stack>`.

## Verify

`git log --oneline docs/steering/` shows your edit commits, and an agent run on a tiny feature (e.g. `/spec:requirements`) cites your stack instead of the placeholder text.

## Related

- Reference — [`docs/steering/`](../steering/) — the files an agent reads.
- How-to — [`fork-and-personalize.md`](./fork-and-personalize.md) — first-time personalization.
- Explanation — [`docs/specorator.md`](../specorator.md) — how steering plugs into stage agents.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
