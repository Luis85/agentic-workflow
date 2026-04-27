---
description: Sales Cycle Phase 5 — Order. Invokes the proposal-writer agent to record the accepted deal, document negotiated changes, and write the Project Kickoff Brief in order.md — the canonical handoff to the delivery workflow.
argument-hint: <deal-slug>
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /sales:order

Run **Phase 5 — Order**.

1. Resolve the deal slug from `$1` or by inspecting `sales/` for the active deal.
2. Confirm `sales/<slug>/deal-state.md` exists and `proposal.md` is `complete`. If not, block and report.
3. **Spawn the `proposal-writer` subagent** (Phase 5 mode) with:
   - All deal artifacts: `qualification.md`, `scope.md`, `estimation.md`, `proposal.md`
   - Acceptance details from the user's prompt: accepted proposal version, acceptance date, acceptance form, contract/PO reference, accepted-by name, any negotiated changes
   - Instruction to produce `sales/<slug>/order.md` from `templates/order-template.md`, including a complete Project Kickoff Brief
4. The agent produces `order.md` and runs the quality gate at the bottom.
5. Update `deal-state.md`: mark `order.md: complete`, set `current_phase: ordered`, set `status: ordered`.
6. Surface the downstream workflow recommendation to the user: entry point (discovery or spec), slug, and summary of the Project Kickoff Brief.
7. **Kickoff logistics reminder:** welcome email (target: within 1 hour of signature), internal PM briefing (target: within 24 hours), client kickoff meeting (target: within 5 business days). Ask the user to confirm which have been done.
8. Recommend the downstream workflow entry point: `/discovery:start <sprint-slug>` or `/spec:start <feature-slug>`, using the slug from `order.md`.
9. Report the deal as closed and complete.
