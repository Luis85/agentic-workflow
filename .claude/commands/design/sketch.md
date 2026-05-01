---
description: Design Track — Phase 2 (Sketch). Invokes design-lead to sequence ux-designer for flow, screen, and state mapping. Produces sketch.md.
argument-hint: [design-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /design:sketch

Run **Phase 2 — Sketch** of the Design Track. Read [`docs/design-track.md`](../../../docs/design-track.md) §3.2.

1. Resolve the slug from `$1` or by inspecting `designs/` for the active design at `current_phase: sketch`.
2. Confirm `designs/<slug>/design-brief.md` exists and is human-approved; if not, route to `/design:frame` first.
3. **Spawn the `design-lead` subagent** with the slug. The design-lead will:
   - Sequence `ux-designer` to map flows, key screens, entry/exit conditions, and empty/loading/error states.
   - Produce `designs/<slug>/sketch.md` from [`templates/design-sketch-template.md`](../../../templates/design-sketch-template.md).
   - Run the quality gate.
4. Update `design-state.md`: mark `sketch.md: complete`, set `current_phase: mock`, append a hand-off note.
5. Recommend `/design:mock`.

## Don't

- Don't pick colors, components, or fonts — those are Phase 3.
- Don't accept "standard error message" as a state — write the explicit specification.
- Don't skip accessibility notes for any interactive element.
