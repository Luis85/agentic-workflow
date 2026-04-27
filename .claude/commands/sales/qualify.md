---
description: Sales Cycle Phase 1 — Qualify. Invokes the sales-qualifier agent to produce qualification.md with a go/no-go verdict.
argument-hint: <deal-slug>
allowed-tools: [Agent, Read, Edit, Write, WebSearch]
model: sonnet
---

# /sales:qualify

Run **Phase 1 — Qualify**.

1. Resolve the deal slug from `$1` or by inspecting `sales/` for the active deal.
2. Confirm `sales/<slug>/deal-state.md` exists; if not, propose `/sales:start <slug>` first.
3. Read `sales/<slug>/deal-state.md`; confirm `current_phase` is `qualifying` or that `qualification.md` is `pending`.
4. **Spawn the `sales-qualifier` subagent** with all available lead material (email threads, RFP, meeting notes, user's context from the prompt) plus instructions to produce `sales/<slug>/qualification.md` from `templates/qualification-template.md`.
5. The agent produces `qualification.md` and runs the quality gate at the bottom.
6. Update `deal-state.md`: mark `qualification.md: complete` (or `blocked`), set `current_phase: scoping` if pursuing.
7. Surface the verdict to the user: `pursue` / `no-go` / `more-info`. If `no-go`, set `status: closed` and report the rationale. If `more-info`, list the open questions.
8. If `pursue`: recommend `/sales:scope <slug>` next. Remind the user that human sign-off on the verdict is required before advancing.
