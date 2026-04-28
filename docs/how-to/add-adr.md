# How to file a new Architecture Decision Record

**Goal:** capture an irreversible architectural decision in `docs/adr/` so future contributors can find the rationale, alternatives, and consequences.

**When to use:** you are about to make (or have just made) a load-bearing choice that would be expensive to undo — a database engine, a deployment topology, an auth model, a stage in the workflow.

**Prerequisites:**

- A clear, decided choice. Open questions belong in a spec, not in an ADR.
- The repo on a topic branch (not `main`).
- One or two sentences of rationale ready in your head.

## Steps

1. Open Claude Code in the repo — `claude`.
2. Run the slash command — `/adr:new "<short title>"`. Example — `/adr:new "use PostgreSQL for the primary store"`.
3. The command allocates the next number, scaffolds from [`templates/adr-template.md`](../../templates/adr-template.md), and pre-fills sections from the conversation context.
4. Review the draft — fix the **Context**, **Decision**, **Consequences**, and **Alternatives considered** sections so each is one paragraph at most.
5. Link the ADR from any artifact it constrains — `requirements.md`, `design.md`, `spec.md`, or the relevant steering file.
6. Commit — `git add docs/adr/<NNNN>-<slug>.md <linking files> && git commit -m "docs(adr): add ADR-<NNNN> <title>"`.

## Verify

`ls docs/adr/` shows your new file and `grep -l "ADR-<NNNN>" specs/ docs/` returns at least one upstream artifact linking back to it.

## Related

- Reference — [`docs/adr/`](../adr/) — index of every decision recorded so far.
- Reference — [`templates/adr-template.md`](../../templates/adr-template.md) — the section shape.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article VIII on why decisions are written in active voice and present tense.
- How-to — [`fork-and-personalize.md`](./fork-and-personalize.md) — personalization changes that warrant an ADR.
