---
description: Discovery Track — Phase 3 (Converge). Invokes the facilitator to sequence critic (speed critique, RAT naming) and product-strategist (strategic-fit scoring). Produces convergence.md with a 1–3 concept shortlist and falsifiable hypotheses.
argument-hint: [sprint-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /discovery:converge

Run **Phase 3 — Converge** of the Discovery Track. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) §3.3.

1. Resolve the sprint slug from `$1` or `discovery-state.md`.
2. Confirm `divergence.md` is `complete`. If not, recommend `/discovery:diverge` first.
3. Confirm a Decider is named for this sprint (in `discovery-state.md`'s `## Specialists` table). If no human Decider exists, the facilitator must capture an explicit mandate to act as proxy.
4. **Spawn the `facilitator` subagent**. The facilitator will:
   - Sequence: `critic` first (speed critique, riskiest-assumption naming, falsification criteria), then `product-strategist` (strategic-fit scoring on the decision matrix).
   - Produce `discovery/<slug>/convergence.md` from [`templates/discovery-convergence-template.md`](../../../templates/discovery-convergence-template.md).
   - Capture Decider sign-off.
   - Run the quality gate.
5. Update `discovery-state.md`: mark `convergence.md: complete`, set `current_phase: prototype`, append a hand-off note.
6. Recommend `/discovery:prototype` next.

## Don't

- Don't shortlist a concept without a falsifiable hypothesis — the prototype phase has no test target otherwise.
- Don't skip the rejected-concepts table. The retrospective relies on it.
- Don't shortlist on vibes — every shortlisted concept has a quantitative falsification criterion.
