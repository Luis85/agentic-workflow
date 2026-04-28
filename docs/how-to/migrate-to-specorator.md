# How to migrate an existing project to Specorator

**Goal:** overlay the Specorator workflow on a brownfield project that is already shipping code, without disrupting in-flight work.

**When to use:** you want spec-driven discipline on a codebase that has history, contributors, and existing process.

**Prerequisites:**

- Repo cloned with write access.
- Time and budget to run a Stock-taking Track first — typically 1–3 days.
- Buy-in from at least one team lead.

## Steps

1. Run the Stock-taking Track first — `/stock:start <slug>` → `/stock:scope` → `/stock:audit` → `/stock:synthesize` → `/stock:handoff`. The output `stock-taking-inventory.md` becomes the input for the next steps. See [`docs/stock-taking-track.md`](../stock-taking-track.md).
2. Add Specorator scaffolding to the repo — copy `memory/`, `templates/`, `docs/specorator.md`, `docs/steering/`, `docs/quality-framework.md`, `.claude/agents/`, `.claude/skills/`, `.claude/commands/`, and `AGENTS.md` from the template repo. Do not overwrite existing files; merge where there is a name clash.
3. Adapt steering — follow [`adapt-steering.md`](./adapt-steering.md) so `docs/steering/*.md` reflects your real stack.
4. Adapt the constitution — copy `memory/constitution.md` from the template, then edit any article that conflicts with the team's existing principles.
5. File an ADR — `/adr:new "Adopt Specorator workflow"` — recording the date, the migrate-from state, the chosen subset of stages (you may opt-out of, e.g., the Discovery Track for now), and any modifications. See [`add-adr.md`](./add-adr.md).
6. Run `/spec:start <feature-slug>` for the next feature you ship; treat it as the first dogfood. Adjust the scaffolding based on what hurts.
7. After 2–3 features, run a retrospective focused on the migration itself; promote learnings into `feedback_*.md` files under `.claude/memory/`.

## Verify

`ls memory/ docs/specorator.md docs/steering/ .claude/agents/ AGENTS.md` all return successfully; the next feature uses the `/spec:*` flow end-to-end; an ADR documents the migration decision.

## Related

- Reference — [`docs/stock-taking-track.md`](../stock-taking-track.md) — the inventory step that runs first.
- Reference — [`docs/specorator.md`](../specorator.md) — the workflow being adopted.
- Explanation — [ADR-0007](../adr/0007-add-stock-taking-track-for-legacy-projects.md) — why brownfield gets its own track.
- How-to — [`fork-and-personalize.md`](./fork-and-personalize.md), [`adapt-steering.md`](./adapt-steering.md), [`add-adr.md`](./add-adr.md).

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
