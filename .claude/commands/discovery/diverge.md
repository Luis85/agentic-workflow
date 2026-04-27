---
description: Discovery Track — Phase 2 (Diverge). Invokes the facilitator to sequence divergent-thinker (concept generation) and game-designer (MDA / lens / motivation annotation). Produces divergence.md with ≥ 12 concepts.
argument-hint: [sprint-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /discovery:diverge

Run **Phase 2 — Diverge** of the Discovery Track. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) §3.2.

1. Resolve the sprint slug from `$1` or `discovery-state.md`.
2. Confirm `frame.md` is `complete`. If not, recommend `/discovery:frame` first.
3. **Spawn the `facilitator` subagent**. The facilitator will:
   - Sequence: `divergent-thinker` first (generation: lightning demos, Crazy 8s, catalog, SCAMPER, wild cards), then `game-designer` (annotation: MDA, core loop, Schell lenses, Bartle/SDT).
   - Produce `discovery/<slug>/divergence.md` from [`templates/discovery-divergence-template.md`](../../../templates/discovery-divergence-template.md).
   - Run the quality gate (≥ 12 concepts, all annotated).
4. Update `discovery-state.md`: mark `divergence.md: complete`, set `current_phase: converge`, append a hand-off note.
5. Recommend `/discovery:converge` next.

## Don't

- Don't reject concepts during Phase 2. Rejection is Phase 3.
- Don't filter for feasibility, cost, or polish.
- Don't stop at fewer than 12 concepts.
