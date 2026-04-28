# How to run a retrospective

**Goal:** run Stage 11 (`/spec:retro`) on a feature, capture what worked / didn't / what to change, and propose concrete amendments to templates, agents, or the constitution.

**When to use:** the feature has shipped or been killed; the retrospective is mandatory before marking the feature complete (Article X).

**Prerequisites:**

- Feature has reached Stage 9 (Review) with a verdict; Stage 10 (Release) is either done or explicitly skipped.
- `specs/<slug>/workflow-state.md` says `Active stage: Stage 11 — Retrospective`.
- Open Claude Code session, OR willingness to run the retrospective agent manually in another tool.

## Steps

1. Open Claude Code — `claude`.
2. Run `/spec:retro`. The retrospective agent reads every prior artifact in `specs/<slug>/` and walks you through the questions.
3. Answer each prompt. The agent captures three sections — **What worked**, **What didn't**, **Actions** (with owner and target date for each).
4. The agent writes `specs/<slug>/retrospective.md` and proposes amendments to templates, agents, or [`memory/constitution.md`](../../memory/constitution.md). Each amendment is a separate suggestion you accept or reject.
5. File accepted amendments as their own follow-up work — typically a `chore(memory): …` PR for `feedback_*.md`, or an ADR for constitution changes. See [`add-adr.md`](./add-adr.md).
6. Update `workflow-state.md` to `Active stage: Complete`.
7. Commit `retrospective.md` and any accepted amendments.

## Verify

`cat specs/<slug>/retrospective.md` shows the three sections filled, with at least one Action item (even *"none — feature shipped clean"* counts).

## Related

- Reference — [`docs/specorator.md`](../specorator.md) — Stage 11 definition.
- Reference — [`.claude/agents/retrospective.md`](../../.claude/agents/retrospective.md) — agent scope.
- Explanation — [`memory/constitution.md`](../../memory/constitution.md) — Article X on iteration.
- How-to — [`add-adr.md`](./add-adr.md) — for constitution-level amendments.
