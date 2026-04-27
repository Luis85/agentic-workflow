---
description: Sales Cycle Phase 2 — Scope. Invokes the scoping-facilitator agent to produce scope.md — bounded problem statement, in/out-of-scope work, stakeholder map, NFRs, dependencies, and paid-discovery recommendation.
argument-hint: <deal-slug>
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /sales:scope

Run **Phase 2 — Scope**.

1. Resolve the deal slug from `$1` or by inspecting `sales/` for the active deal.
2. Confirm `sales/<slug>/deal-state.md` exists and `qualification.md` is `complete` with verdict `pursue`. If `qualification.md` is missing or verdict is not `pursue`, block and report.
3. **Spawn the `scoping-facilitator` subagent** with:
   - `sales/<slug>/qualification.md` (mandatory input)
   - Any additional client materials from the user's prompt (RFP, brief, meeting notes)
   - Instruction to produce `sales/<slug>/scope.md` from `templates/scope-template.md`
4. The agent produces `scope.md` and runs the quality gate at the bottom.
5. Update `deal-state.md`: mark `scope.md: complete` (or `blocked`), set `current_phase: estimating`, append a hand-off note.
6. Surface key outputs to the user: problem statement summary, in-scope must-have count, out-of-scope item count, open questions count, paid-discovery recommendation.
7. Recommend `/sales:estimate <slug>` next (or `/sales:estimate <slug>` after resolving open questions if any are unowned).
