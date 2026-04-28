# How to run a retrospective

**Goal:** run Stage 11 (`/spec:retro`) on a feature, capture what worked / didn't / what to change, and propose concrete amendments to templates, agents, or the constitution.

**When to use:** the feature has shipped or been killed; the retrospective is mandatory before marking the feature complete (Article X — Iteration).

**Prerequisites:**

- Feature has reached Stage 9 (Review) with a verdict; Stage 10 (Release) is either done or explicitly skipped.
- `specs/<slug>/workflow-state.md` frontmatter has `current_stage: learning` (set automatically when `/spec:release` finishes).
- Open Claude Code session, OR willingness to run the retrospective agent manually in another tool.

## Steps

1. Open Claude Code — `claude`.
2. Run `/spec:retro`. The retrospective agent reads every prior artifact in `specs/<slug>/` and walks you through the questions.
3. Answer each prompt. The agent fills the seven template sections — **Outcome**, **What worked**, **What didn't work**, **Spec adherence**, **Process observations**, **Actions** (table with Action / Type / Owner / Due), and **Lessons** (one-liners worth remembering).
4. The agent writes `specs/<slug>/retrospective.md` and proposes amendments to templates, agents, or [`memory/constitution.md`](../../memory/constitution.md). Each amendment becomes a row in the **Actions** table with `Type` set to `template`, `agent`, `adr`, or `constitution`.
5. File accepted amendments as their own follow-up work — typically a `chore(memory): …` PR for `feedback_*.md`, or an ADR for constitution changes. See [`add-adr.md`](./add-adr.md).
6. The retrospective agent updates `workflow-state.md` to `current_stage: learning` with `status: complete`. Do not edit by hand.
7. Commit `retrospective.md` and any accepted amendments.

## Verify

`cat specs/<slug>/retrospective.md` shows the seven sections filled, with at least one row in the Actions table (even *"none — feature shipped clean"* counts).

## Related

- Reference — [`templates/retrospective-template.md`](../../templates/retrospective-template.md) — the section list and Actions table shape.
- Reference — [`docs/specorator.md`](../specorator.md) — Stage 11 definition.
- Reference — [`.claude/agents/retrospective.md`](../../.claude/agents/retrospective.md) — agent scope.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article X (Iteration) on why retrospectives are mandatory.
- How-to — [`add-adr.md`](./add-adr.md) — for constitution-level amendments.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
