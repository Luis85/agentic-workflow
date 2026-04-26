---
description: Stage 4 — Design. Sequences ux-designer, ui-designer, and architect to produce design.md (Parts A, B, C).
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /spec:design

Run **stage 4 — Design**. This stage has three contributors; sequence them deliberately.

1. Resolve slug; verify `requirements.md` is `complete`.
2. Initialise `specs/<slug>/design.md` from `templates/design-template.md` if it doesn't exist.
3. **Spawn `ux-designer`** to fill **Part A — UX**: flows, IA, empty/loading/error states, accessibility.
4. Once Part A is drafted, **spawn `ui-designer`** to fill **Part B — UI**: screen inventory, components, tokens, microcopy.
5. Once Parts A and B are drafted, **spawn `architect`** to fill **Part C — Architecture**: components, data flow, decisions (with ADRs via `/adr:new`), risks, alternatives.
6. The architect also fills the cross-cutting **Requirements coverage** table — every PRD requirement maps to at least one design section.
7. Run the design quality gate.
8. Update `workflow-state.md`. Recommend `/spec:specify` next.

## Note

For very small features, all three roles may collapse into a single pass. Don't skip *parts*; do collapse the agents.
