---
description: Sales Cycle Phase 3 — Estimate. Invokes the estimator agent to produce estimation.md — WBS with three-point PERT estimates, risk register, risk multiplier, pricing model recommendation, and cost range.
argument-hint: <deal-slug>
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /sales:estimate

Run **Phase 3 — Estimate**.

1. Resolve the deal slug from `$1` or by inspecting `sales/` for the active deal.
2. Confirm `sales/<slug>/deal-state.md` exists and `scope.md` is `complete`. If not, block and report — estimation on an incomplete scope is unreliable.
3. **Spawn the `estimator` subagent** with:
   - `sales/<slug>/qualification.md` (for budget signals and risk context)
   - `sales/<slug>/scope.md` (authoritative scope input)
   - Any additional context from the user's prompt (day rates, historical velocity, team availability)
   - Instruction to produce `sales/<slug>/estimation.md` from `templates/estimation-template.md`
4. The agent produces `estimation.md` and runs the quality gate at the bottom.
5. Update `deal-state.md`: mark `estimation.md: complete` (or `blocked`), set `current_phase: proposing`, append a hand-off note.
6. Surface key outputs to the user: central estimate (days and cost range), confidence level, pricing model recommendation, top 3 risks.
7. Remind the user: engineering sign-off is required before using the estimate in a proposal. If the estimate was done without reviewing by the technical lead who will work on the project, flag this.
8. Recommend `/sales:propose <slug>` next.
