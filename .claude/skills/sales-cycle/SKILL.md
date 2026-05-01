---
name: sales-cycle
description: Drive a Sales Cycle end-to-end (Qualify → Scope → Estimate → Propose → Order → Delivery handoff) by gathering deal context from the user up front, then dispatching the right phase agent for each stage, persisting artifacts under sales/<deal-slug>/, and gating between phases with the user. Use when a service provider wants to manage a client opportunity, when someone says "we have a new lead", "we need to write a proposal", "we got an RFP", "help me scope this project for a client", "we need an SOW", or "let's run a sales cycle". Skip when the user already has a signed contract — go directly to /discovery:start or /spec:start instead.
argument-hint: [deal-slug or client/project description]
---

# Sales Cycle

Conductor of Sales Cycle Track in `docs/sales-cycle.md`. Job: **sequence phases** + **gate between**. Never do phase work. Each phase runs in specialist subagent (`.claude/agents/`); you persist state, surface choices, dispatch.

Shared rules (gating, escalation, constraints common to all conductors): [`../_shared/conductor-pattern.md`](../_shared/conductor-pattern.md).

## Read first

- `docs/sales-cycle.md` — 5-phase sales cycle definition.
- `memory/constitution.md` — principles every phase obey (especially Article VII: humans own intent, priorities, acceptance).
- `docs/sink.md` — where artifacts live.
- `sales/` directory — active deals to resume.

## Workflow you drive

| # | Phase | Subagent | Slash command | Artifact |
|---|---|---|---|---|
| — | Bootstrap | — | `/sales:start <deal-slug>` | `deal-state.md` |
| 1 | Qualify | `sales-qualifier` | `/sales:qualify` | `qualification.md` |
| 2 | Scope | `scoping-facilitator` | `/sales:scope` | `scope.md` |
| 3 | Estimate | `estimator` | `/sales:estimate` | `estimation.md` |
| 4 | Propose | `proposal-writer` | `/sales:propose` | `proposal.md` |
| 5 | Order | `proposal-writer` | `/sales:order` | `order.md` |
| → | Delivery | `orchestrate` or `discovery-sprint` | `/spec:start` or `/discovery:start` | downstream workflow |

## Steps

### Step 1 — Detect resume vs. fresh start

List `sales/*/deal-state.md` files with `status` `active` or `on-hold`. For each, show: `deal-slug | client | current_phase | last_updated`. **Batch one `AskUserQuestion`** asking user to pick:

- Resume listed deal (recommended-first by `last_updated`).
- Start new deal.

No active deals → skip to Step 2.

### Step 2 — Clarify deal context (single `AskUserQuestion`, ≤ 4 questions)

New deal, batch one call:

1. **Deal slug** — kebab-case, ≤ 6 words, format `<client>-<project>`. Derive from `$ARGUMENTS` if description given; offer as recommended.
2. **Client name** — who is prospect?
3. **Lead source** — inbound / referral / outbound / RFP.
4. **What we know so far** — materials available (RFP document, email thread, meeting notes, problem description)?

Resuming deal, ask: `Continue from <next phase>` (Recommended) / `Re-run <current phase>` / `Skip to specific phase`.

Don't ask "should I proceed?" — proceed once answers in.

### Step 3 — Bootstrap (fresh start only)

Invoke `/sales:start <deal-slug> <client-name>`. Creates `sales/<deal-slug>/` + `deal-state.md`. Don't edit those yourself.

### Step 4 — Run phases sequentially

Each phase:

1. **Pre-flight**: read `sales/<slug>/deal-state.md`, confirm every upstream artifact `complete` or `skipped`. `complete`/`skipped` passable; `pending`/`in-progress`/`blocked` = return-to-that-phase signal.

2. **Dispatch** slash command for phase (e.g., `/sales:qualify`). Hand off fully — don't duplicate agent's work.

3. **Wait** for phase complete + artifact exist.

4. **Gate with user** via single `AskUserQuestion`:
   - `Continue to <next phase>` (Recommended)
   - `Pause here` — set `status: on-hold`, exit; resume re-invoking `/sales-cycle`.
   - `Re-run <this phase> with feedback` — pass free-text as additional context.
   - `Mark as no-go` — set `status: closed`, `current_phase: no-go`, record reason in `deal-state.md`.

5. **Special gates:**

   - **After Phase 1 (Qualify):** `pursue` verdict needs explicit human confirmation. Present win probability score, top 3 supporting signals, top 3 red flags. Ask: `Confirm pursue` / `Override to no-go` / `Request more information`.

   - **After Phase 3 (Estimate):** Present cost range, confidence level, pricing model recommendation. Ask: `Proceed with this estimate` / `Re-run estimate with different inputs` / `Request engineering review first`.

   - **After Phase 4 (Propose):** Present internal review checklist result. Remind user: **you must send proposal — not automated**. Ask: `Mark as sent` / `Make revisions first`.

   - **After Phase 5 (Order):** Present Project Kickoff Brief summary + downstream workflow recommendation. Ask: `Open delivery workflow now` / `Wait — I'll start delivery separately`.

### Step 5 — Delivery handoff

User confirms order accepted, wants delivery workflow open:

- Read `order.md`'s `delivery_workflow` field: `discovery` or `spec`.
- `discovery`: invoke `/discovery:start <delivery_slug>`. Pass Project Kickoff Brief as input to frame phase.
- `spec`: invoke `/spec:start <delivery_slug>`. Analyst reads `order.md` as mandatory input to Stage 1.

Report full path to new delivery folder, confirm handoff complete.

### Step 6 — No-go handling

Any phase, verdict `no-go`:

1. Record no-go reason in `deal-state.md` under `Hand-off notes`.
2. Set `status: closed`, `current_phase: no-go`.
3. Report no-go verdict, reason, any learning informing future qualification/scoping.

No-go = successful outcome — prevented wasted engineering effort. Don't frame as failure.

## Constraints (sales-cycle-specific)

Generic conductor constraints + escalation pattern: [`../_shared/conductor-pattern.md`](../_shared/conductor-pattern.md). Specifics for this skill:

- **Never** send a document to external parties. Sending is always a human action.
- **Never** advance Qualify → Scope without a human-confirmed `pursue` verdict.
- **Never** produce a proposal quote below the 80% confidence interval from `estimation.md`.

## References

- `docs/sales-cycle.md` — full methodology: methods, quality gates, deal state machine.
- `docs/sink.md` — artifact location map (including `sales/` tree).
- `docs/discovery-track.md` — downstream track for exploratory mandates.
- `docs/specorator.md` — downstream track for defined mandates.
- `memory/constitution.md` — Article VII: humans own intent, priorities, acceptance.