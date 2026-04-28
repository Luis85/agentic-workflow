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
4. Review the draft. The template has these top-level sections — fill each at one paragraph or one short list:
   - **Status** — `Proposed`, `Accepted`, `Deprecated`, or `Superseded by ADR-<NNNN>`.
   - **Context** — what forces this decision. Link upstream requirements, research, or steering files.
   - **Decision** — the choice, in active voice and present tense.
   - **Considered options** — at least two alternatives. The template uses **Option A / Option B / …** sub-headings; keep that shape.
   - **Consequences** — sub-headings **Positive**, **Negative**, **Neutral**. One bullet each is enough.
   - **Compliance** — how a future reader can tell if the decision is being followed.
   - **References** — links to upstream artifacts, related ADRs, external sources.
5. Link the ADR from any artifact it constrains — `requirements.md`, `design.md`, `spec.md`, or the relevant steering file.
6. Commit — `git add docs/adr/<NNNN>-<slug>.md <linking files> && git commit -m "docs(adr): add ADR-<NNNN> <title>"`.

## Verify

`ls docs/adr/` shows your new file and `grep -l "ADR-<NNNN>" specs/ docs/` returns at least one upstream artifact linking back to it.

## Related

- Reference — [`docs/adr/`](../adr/) — index of every decision recorded so far.
- Reference — [`templates/adr-template.md`](../../templates/adr-template.md) — the section shape.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article VIII (Plain Language) on why decisions are written in active voice and present tense.
- How-to — [`fork-and-personalize.md`](./fork-and-personalize.md) — personalization changes that warrant an ADR.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
