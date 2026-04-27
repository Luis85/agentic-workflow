---
description: Discovery Track — Phase 1 (Frame). Invokes the facilitator to sequence product-strategist and user-researcher. Produces frame.md with strategic outcome, JTBD, HMW questions, and riskiest assumptions.
argument-hint: [sprint-slug]
allowed-tools: [Agent, Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /discovery:frame

Run **Phase 1 — Frame** of the Discovery Track. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) §3.1.

1. Resolve the sprint slug from `$1` or by inspecting `discovery/` for the active sprint (whose `discovery-state.md` has `status: active` and `current_phase: frame`).
2. Confirm `discovery/<slug>/discovery-state.md` exists; if not, propose `/discovery:start <slug>` first.
3. **Spawn the `facilitator` subagent** with the user's brief and the sprint slug. The facilitator will:
   - Sequence the consulted specialists: `product-strategist` first, then `user-researcher`.
   - Produce `discovery/<slug>/frame.md` from [`templates/discovery-frame-template.md`](../../../templates/discovery-frame-template.md).
   - Run the quality gate at the bottom of the template.
4. Update `discovery-state.md`: mark `frame.md: complete` (or `in-progress` if blocked), set `current_phase: diverge`, append a hand-off note.
5. Recommend `/discovery:diverge` next.

## Don't

- Don't generate concepts in this phase — Phase 2 is for that.
- Don't skip the strategic-outcome step. A sprint without a North Star drifts.
