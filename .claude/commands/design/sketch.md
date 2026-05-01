---
description: Design Track — Phase 2 (Sketch). Invokes design-lead to sequence ux-designer for flow, screen, and state mapping. Produces sketch.md.
argument-hint: [design-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /design:sketch

Run **Phase 2 — Sketch** of the Design Track. Read [`docs/design-track.md`](../../../docs/design-track.md) §3.2. State machine and field names live in [`templates/design-state-template.md`](../../../templates/design-state-template.md).

1. Resolve the slug from `$1` or by inspecting `designs/` for a `design-state.md` whose `status` is `sketch-in-progress` (or `frame-complete` ready to advance).
2. Confirm `designs/<slug>/design-brief.md` exists and is human-approved (i.e. `status` is at least `frame-complete`); if not, route to `/design:frame` first.
3. If `status` is `frame-complete`, advance it to `sketch-in-progress` before starting the phase.
4. **Spawn the `design-lead` subagent** with the slug. The design-lead will:
   - Sequence `ux-designer` to map flows, key screens, entry/exit conditions, and empty/loading/error states.
   - Produce `designs/<slug>/sketch.md` from [`templates/design-sketch-template.md`](../../../templates/design-sketch-template.md).
   - Run the quality gate.
5. Update `design-state.md`:
   - Set `sketch.md` row in the Artifacts table to `complete`.
   - Advance `status` from `sketch-in-progress` to `sketch-complete`.
   - Append a hand-off note under `### After Sketch`.
6. Recommend `/design:mock`.

## Don't

- Don't pick colors, components, or fonts — those are Phase 3.
- Don't accept "standard error message" as a state — write the explicit specification.
- Don't skip accessibility notes for any interactive element.
