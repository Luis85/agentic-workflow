---
name: discovery-sprint
description: Drive a Discovery Sprint end-to-end (Frame → Diverge → Converge → Prototype → Validate → Handoff) by gathering scope from the user up front, then dispatching the facilitator and consulted specialists for each phase, persisting artifacts under discovery/<slug>/, and gating between phases with the user. Use when the user wants to run a design sprint, ideate, brainstorm new product ideas, find a feature to build, or mentions "discovery sprint", "design sprint", "ideation", "brainstorm", "explore options", "from scratch with a blank page".
argument-hint: [sprint-slug or one-line outcome]
---

# Discovery Sprint

You are the conductor of the Discovery Track defined in [`docs/discovery-track.md`](../../../docs/discovery-track.md). Your job is to **sequence** phases and **gate** between them — never to do the specialist work yourself. Each phase runs through the `facilitator` subagent ([`.claude/agents/facilitator.md`](../../agents/facilitator.md)) which in turn sequences the consulted specialists.

`AskUserQuestion` only works in the main thread. Subagents cannot ask the user anything. So all clarification happens in *your* turn — before and between phases.

This is the **pre-workflow** entry. The output is a `chosen-brief.md` that feeds `/spec:idea`. Do not run a sprint when the user already has a brief — recommend `/spec:start` + `/spec:idea` instead.

## Read first

Always start by reading these (they're the contract you're enforcing):

- [`docs/discovery-track.md`](../../../docs/discovery-track.md) — the 5-phase definition + method library.
- [`docs/adr/0005-add-discovery-track-before-stage-1.md`](../../../docs/adr/0005-add-discovery-track-before-stage-1.md) — the why.
- [`memory/constitution.md`](../../../memory/constitution.md) — Articles II, III, VI, VII apply.
- The active `discovery/<sprint>/discovery-state.md` (if resuming).

## The flow you're driving

| # | Phase | Owner | Consulted | Slash command | Artifact |
|---|---|---|---|---|---|
| 0 | Bootstrap | — | — | `/discovery:start <slug>` | `discovery-state.md` |
| 1 | Frame | facilitator | product-strategist, user-researcher | `/discovery:frame` | `frame.md` |
| 2 | Diverge | facilitator | divergent-thinker, game-designer | `/discovery:diverge` | `divergence.md` |
| 3 | Converge | facilitator | critic, product-strategist | `/discovery:converge` | `convergence.md` |
| 4 | Prototype | facilitator | prototyper, game-designer | `/discovery:prototype` | `prototype.md` |
| 5 | Validate | facilitator | user-researcher, critic | `/discovery:validate` | `validation.md` |
| H | Handoff | facilitator | product-strategist | `/discovery:handoff` | `chosen-brief.md` (0..N) |

Sprint outcomes: `go` → handoff produces ≥ 1 brief → `/spec:start` + `/spec:idea`. `no-go` → sprint closes, no brief. `pivot` → re-frame or restart.

## What you do, step by step

### Step 1 — Detect resume vs. fresh start

```
ls discovery/ 2>/dev/null
```

For each `discovery/<slug>/discovery-state.md` whose `status` is `active`, `paused`, or `blocked`, list `slug | status | current_phase | last_updated`. Then **batch one `AskUserQuestion`** asking the user to pick:

- Resume a listed sprint (recommended-first by `last_updated`).
- Start a new sprint.
- Skip the sprint entirely and go straight to `/orchestrate` (when the user actually has a brief).

If no resumable sprints exist, skip straight to Step 2.

### Step 2 — Confirm fit (single `AskUserQuestion`, ≤ 3 questions)

If starting fresh, batch into one call:

1. **Do you have a brief, or a blank page?** — `Blank page (run sprint)` (Recommended) / `Have a brief — go to /orchestrate`. If they pick the second, exit this skill and recommend `/orchestrate`.
2. **Sprint slug** — kebab-case, ≤ 6 words. Push back on solution-named slugs ("loyalty-program") and propose outcome-named ones ("q2-retention-discovery").
3. **Compression** — `Standard (5 phases)` (Recommended) / `Compressed (Frame+Diverge in one sit, Converge+Prototype same day)` / `Lightning (1 day, Frame and Diverge collapsed)`. Document the choice in `discovery-state.md` `## Skips` if compressed.

### Step 3 — Bootstrap (fresh start only)

Invoke `/discovery:start <slug>`. This creates `discovery/<slug>/` and `discovery-state.md` with all artifacts set to `pending`. Do not edit those files yourself.

### Step 4 — Confirm specialists in the room

Ask the user via `AskUserQuestion`: for each of the 6 specialist roles (product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper), is there a **human specialist** participating, or should the **AI agent** carry the role? Write the answer into `discovery-state.md`'s `## Specialists` table.

When a human specialist is participating, the AI agent serves as note-taker and cross-check, not as substitute.

### Step 5 — Run phases sequentially

For each phase in order:

1. **Pre-flight** — read `discovery-state.md`, confirm the prior phase is `complete` (or `skipped` with documented compression).
2. **Dispatch** the slash command (`/discovery:frame`, etc.). The slash command spawns the `facilitator`, which sequences the consulted specialists.
3. **Wait** for the slash command to complete and the artifact to exist.
4. **Gate with the user** via a single `AskUserQuestion`:
   - `Continue to <next phase>` (Recommended)
   - `Pause here` — set `status: paused` in `discovery-state.md` and exit; resume by re-invoking `/discovery-sprint`.
   - `Re-run <this phase> with feedback` (free-text in "Other").
   - On Phase 5 only: `Hand off (verdict: go)` / `Close sprint (verdict: no-go)` / `Re-frame (verdict: pivot)`.

### Step 6 — Handoff

After Phase 5 with verdict `go`, dispatch `/discovery:handoff`. The facilitator writes one `chosen-brief.md` per surviving concept. Then:

- If the sprint selected a new product or materially changed product positioning, recommend `/product:page` so the public page is created or refreshed from the chosen brief. Do this before or alongside `/orchestrate`; the page is a product-facing surface, not an implementation stage artifact.
- For each brief, recommend `/spec:start <recommended_feature_slug> [<AREA>]` followed by `/spec:idea`.
- Confirm with the user whether to chain into `/orchestrate` immediately or pause.
- Set `discovery-state.md` `status: complete`.

## Constraints

- **Never** do specialist work in your own turn. If you find yourself drafting a Lean Canvas or a storyboard, you've drifted — stop and dispatch the facilitator.
- **Never** call `AskUserQuestion` from inside a subagent prompt. It will fail.
- **Never** ask more than one `AskUserQuestion` per gate. Batch options.
- **Always** update `discovery-state.md` between phases (the slash commands and facilitator do it; you verify).
- **Never** write to `discovery/<slug>/` directly during normal phase execution — the facilitator subagent owns those files.
- **Never** open `specs/<feature>/` from inside this skill. That happens after handoff via `/spec:start`.
- **Never** recommend a sprint when the user already has a brief. Send them to `/orchestrate` instead.

## When a phase escalates

If the facilitator returns "blocked — needs human input" (e.g. the user-researcher can't recruit participants), surface its question to the user via `AskUserQuestion` in a single call, capture the answer, then re-dispatch the same slash command with the answer as additional context.

## References

- [`docs/discovery-track.md`](../../../docs/discovery-track.md) — full methodology.
- [`docs/adr/0005-add-discovery-track-before-stage-1.md`](../../../docs/adr/0005-add-discovery-track-before-stage-1.md).
- [`docs/sink.md`](../../../docs/sink.md) — `discovery/` sink layout.
- [`.claude/agents/facilitator.md`](../../agents/facilitator.md) — the agent this skill dispatches.
