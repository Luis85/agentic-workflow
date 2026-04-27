---
description: Discovery Track — Phase 4 (Prototype). Invokes the facilitator to sequence prototyper (storyboards, paper / Wizard-of-Oz / Frankenstein) and game-designer (MDA traceability, core-loop visibility checks). Produces prototype.md, one section per shortlisted concept.
argument-hint: [sprint-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /discovery:prototype

Run **Phase 4 — Prototype** of the Discovery Track. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) §3.4.

1. Resolve the sprint slug from `$1` or `discovery-state.md`.
2. Confirm `convergence.md` is `complete`. If not, recommend `/discovery:converge` first.
3. **Spawn the `facilitator` subagent**. The facilitator will:
   - Sequence: `prototyper` first (storyboard, materials, fidelity boundary, test script per shortlisted concept), then `game-designer` (MDA traceability + core-loop visibility check + Schell-lens spot-check).
   - Produce `discovery/<slug>/prototype.md` from [`templates/discovery-prototype-template.md`](../../../templates/discovery-prototype-template.md).
   - Optionally create `discovery/<slug>/assets/` for binary prototype files (sketches, screenshots, video). Markdown is the source of truth; assets are referenced from it.
   - Run the quality gate (every concept has a hypothesis, a falsification threshold, a non-designer-runnable test script).
4. Update `discovery-state.md`: mark `prototype.md: complete`, set `current_phase: validate`, append a hand-off note.
5. Recommend `/discovery:validate` next.

## Don't

- Don't add visual polish — sketchiness is a feature.
- Don't fake the riskiest mechanic. If the riskiest assumption is "users will pay," include a price and checkout in the prototype.
- Don't write production code — prototypes are disposable.
