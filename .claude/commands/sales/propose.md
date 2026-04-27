---
description: Sales Cycle Phase 4 — Propose. Invokes the proposal-writer agent to produce proposal.md — the client-facing SOW / proposal synthesised from qualification, scope, and estimation artifacts.
argument-hint: <deal-slug>
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /sales:propose

Run **Phase 4 — Propose**.

1. Resolve the deal slug from `$1` or by inspecting `sales/` for the active deal.
2. Confirm `sales/<slug>/deal-state.md` exists and both `scope.md` and `estimation.md` are `complete`. If either is missing, block and report.
3. **Spawn the `proposal-writer` subagent** with:
   - `sales/<slug>/qualification.md` (client context, red flags, champion)
   - `sales/<slug>/scope.md` (scope boundary, stakeholders, NFRs)
   - `sales/<slug>/estimation.md` (cost range, pricing model, assumptions)
   - Any additional context from the user's prompt (team profiles, case studies, rate card)
   - Instruction to produce `sales/<slug>/proposal.md` from `templates/proposal-template.md`
4. The agent produces `proposal.md`, runs the internal review checklist, and marks `status: internal-review`.
5. Update `deal-state.md`: mark `proposal.md: in-progress`, set `current_phase: proposing`.
6. Surface the internal review checklist result to the user. If any item is flagged, list it explicitly.
7. **Do not send the proposal.** Report that the proposal is ready for human review and that the user must send it. This is not automated.
8. After the user confirms the proposal is sent, update `deal-state.md`: mark `proposal.md: complete`, set `current_phase: negotiating`.
9. Recommend `/sales:order <slug>` when the client accepts or negotiation concludes.
