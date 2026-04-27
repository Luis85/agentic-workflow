---
description: Stock-taking Track — Handoff. Invokes the legacy-auditor to produce stock-taking-inventory.md (the consolidated inventory) and recommend the downstream track (Discovery or Specorator).
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /stock:handoff

Run the Handoff phase of a Stock-taking Engagement. Read [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) for the full methodology.

## Inputs

- `$1` — project slug (optional if only one engagement is active).
- Active `stock-taking/<slug>/stock-taking-state.md` with `current_phase: handoff`.
- Completed `scope.md`, `audit.md`, and `synthesis.md`.

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: handoff`.
2. Confirm all three phase artifacts are `complete` in `stock-taking-state.md`. If not, report the blocker.
3. Invoke the `legacy-auditor` agent with the following instruction:

   > Run the Handoff phase for the stock-taking engagement at `stock-taking/<slug>/`. Read all phase artifacts (`scope.md`, `audit.md`, `synthesis.md`), then create `stock-taking-inventory.md` from `templates/stock-taking-inventory-template.md`. Consolidate key findings from all phases. Set the `recommended_next` frontmatter field from `synthesis.md`'s recommendation. If open unknowns remain, set `status: incomplete` and list them in the open-items section. Update `stock-taking-state.md` to `status: complete` and `stock-taking-inventory.md: complete`.

4. Verify that `stock-taking/<slug>/stock-taking-inventory.md` exists.
5. Branch on `recommended_next`:
   - `discovery` — print: "Stock-taking complete. Recommended next: `/discovery:start <sprint-slug>`"
   - `spec` — print: "Stock-taking complete. Recommended next: `/spec:start <feature-slug> [<AREA>]` then `/spec:idea`"
   - `both` — print both recommendations with the split rationale from `synthesis.md`.
6. Print a final engagement summary (slug, all artifact statuses, inventory status, recommended downstream commands).

## Don't

- Don't do the auditor's work yourself.
- Don't open `specs/<feature>/` or `discovery/<sprint>/` — those are opened by their own commands after handoff.
- Don't skip the handoff when synthesis is complete — `stock-taking-inventory.md` is the mandatory input the downstream track reads; a verbal summary is not a substitute.
