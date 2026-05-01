---
description: Design Track — Phase 4 (Handoff). Invokes design-lead to sequence ui-designer and produce design-handoff.md, the gate artifact that leaves the track.
argument-hint: [design-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /design:handoff

Run **Phase 4 — Handoff** of the Design Track. Read [`docs/design-track.md`](../../../docs/design-track.md) §3.4. State machine and field names live in [`templates/design-state-template.md`](../../../templates/design-state-template.md).

1. Resolve the slug from `$1` or by inspecting `designs/` for a `design-state.md` whose `status` is `handoff-in-progress`, `handoff-in-progress-blocked`, or `mock-complete` (ready to advance).
2. Confirm `designs/<slug>/sketch.md` and Phase 3 mock decisions in `design-state.md` exist; if not, route to `/design:mock` first.
3. If `status` is `mock-complete`, advance it to `handoff-in-progress` before starting the phase.
4. **Spawn the `design-lead` subagent** with the slug. The design-lead will:
   - Sequence `ui-designer` to finalise component assignments, token references, microcopy, and accessibility checklist.
   - Produce `designs/<slug>/design-handoff.md` from [`templates/design-handoff-template.md`](../../../templates/design-handoff-template.md), synthesising brief → sketch → mock → final decisions.
   - Run the quality gate.
5. Update `design-state.md`:
   - Set `design-handoff.md` row in the Artifacts table to `complete`.
   - Append a hand-off note under `### After Handoff`.
   - Leave `status` at `handoff-in-progress` until the human approves.
6. **Block on human approval** of the handoff. Once approved, advance `status` from `handoff-in-progress` to `complete` and recommend downstream work (`/spec:design` for feature implementation against the new surface, or direct engineering pickup). If the human sends the handoff back for changes, leave `status` at `handoff-in-progress` (or use `handoff-in-progress-blocked`) — never set `complete` without approval.

## Don't

- Don't ship a handoff with unresolved "TBD" microcopy.
- Don't skip the accessibility checklist.
- Don't advance `status` to `complete` without explicit human approval.
