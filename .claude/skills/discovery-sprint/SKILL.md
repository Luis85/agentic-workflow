---
name: discovery-sprint
description: Drive a Discovery Sprint end-to-end (Frame → Diverge → Converge → Prototype → Validate → Handoff) by gathering scope from the user up front, then dispatching the facilitator and consulted specialists for each phase, persisting artifacts under discovery/<slug>/, and gating between phases with the user. Use when the user wants to run a design sprint, ideate, brainstorm new product ideas, find a feature to build, or mentions "discovery sprint", "design sprint", "ideation", "brainstorm", "explore options", "from scratch with a blank page".
argument-hint: [sprint-slug or one-line outcome]
---

# Discovery Sprint

Conductor of Discovery Track defined in [`docs/discovery-track.md`](../../../docs/discovery-track.md). Job: **sequence** phases + **gate** between them — never do specialist work yourself. Each phase runs through `facilitator` subagent ([`.claude/agents/facilitator.md`](../../agents/facilitator.md)) which sequences consulted specialists.

`AskUserQuestion` only works in main thread. Subagents cannot ask user. So all clarification happens in *your* turn — before and between phases.

**Pre-workflow** entry. Output = `chosen-brief.md` feeding `/spec:idea`. Skip sprint if user has brief — recommend `/spec:start` + `/spec:idea` instead.

## Read first

Start by reading these (contract you enforce):

- [`docs/discovery-track.md`](../../../docs/discovery-track.md) — 5-phase definition + method library.
- [`docs/adr/0005-add-discovery-track-before-stage-1.md`](../../../docs/adr/0005-add-discovery-track-before-stage-1.md) — why.
- [`memory/constitution.md`](../../../memory/constitution.md) — Articles II, III, VI, VII apply.
- Active `discovery/<sprint>/discovery-state.md` (if resuming).

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

Outcomes: `go` → handoff produce ≥ 1 brief → `/spec:start` + `/spec:idea`. `no-go` → sprint close, no brief. `pivot` → re-frame or restart.

## What you do, step by step

### Step 1 — Detect resume vs. fresh start

```
ls discovery/ 2>/dev/null
```

For each `discovery/<slug>/discovery-state.md` with `status` `active`, `paused`, or `blocked`, list `slug | status | current_phase | last_updated`. Then **batch one `AskUserQuestion`** asking user to pick:

- Resume listed sprint (recommended-first by `last_updated`).
- Start new sprint.
- Skip sprint, go straight to `/orchestrate` (when user has brief).

No resumable sprints → skip to Step 2.

### Step 2 — Confirm fit (single `AskUserQuestion`, ≤ 3 questions)

Fresh start → batch into one call:

1. **Brief or blank page?** — `Blank page (run sprint)` (Recommended) / `Have a brief — go to /orchestrate`. Second → exit skill, recommend `/orchestrate`.
2. **Sprint slug** — kebab-case, ≤ 6 words. Push back on solution-named slugs ("loyalty-program"), propose outcome-named ones ("q2-retention-discovery").
3. **Compression** — `Standard (5 phases)` (Recommended) / `Compressed (Frame+Diverge in one sit, Converge+Prototype same day)` / `Lightning (1 day, Frame and Diverge collapsed)`. Document choice in `discovery-state.md` `## Skips` if compressed.

### Step 3 — Bootstrap (fresh start only)

Invoke `/discovery:start <slug>`. Creates `discovery/<slug>/` + `discovery-state.md` with all artifacts `pending`. Don't edit those files yourself.

### Step 4 — Confirm specialists in room

Ask user via `AskUserQuestion`: for each of 6 specialist roles (product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper), is there **human specialist** participating, or should **AI agent** carry role? Write answer into `discovery-state.md`'s `## Specialists` table.

Human specialist participating → AI agent = note-taker + cross-check, not substitute.

### Step 5 — Run phases sequentially

For each phase in order:

1. **Pre-flight** — read `discovery-state.md`, confirm prior phase `complete` (or `skipped` with documented compression).
2. **Dispatch** slash command (`/discovery:frame`, etc.). Slash command spawns `facilitator`, which sequences consulted specialists.
3. **Wait** for slash command complete + artifact exist.
4. **Gate with user** via single `AskUserQuestion`:
   - `Continue to <next phase>` (Recommended)
   - `Pause here` — set `status: paused` in `discovery-state.md`, exit; resume by re-invoking `/discovery-sprint`.
   - `Re-run <this phase> with feedback` (free-text in "Other").
   - Phase 5 only: `Hand off (verdict: go)` / `Close sprint (verdict: no-go)` / `Re-frame (verdict: pivot)`.

### Step 6 — Handoff

After Phase 5 with verdict `go`, dispatch `/discovery:handoff`. Facilitator writes one `chosen-brief.md` per surviving concept. Then:

- Sprint selected new product or materially changed product positioning → recommend `/product:page` so public page created/refreshed from chosen brief. Do before or alongside `/orchestrate`; page = product-facing surface, not implementation stage artifact.
- For each brief, recommend `/spec:start <recommended_feature_slug> [<AREA>]` then `/spec:idea`.
- Confirm with user: chain into `/orchestrate` now or pause.
- Set `discovery-state.md` `status: complete`.

## Constraints

- **Never** do specialist work in your turn. Drafting Lean Canvas or storyboard = drifted — stop, dispatch facilitator.
- **Never** call `AskUserQuestion` from inside subagent prompt. Fails.
- **Never** ask more than one `AskUserQuestion` per gate. Batch options.
- **Always** update `discovery-state.md` between phases (slash commands + facilitator do it; you verify).
- **Never** write to `discovery/<slug>/` directly during normal phase execution — facilitator subagent owns those files.
- **Never** open `specs/<feature>/` from inside this skill. Happens after handoff via `/spec:start`.
- **Never** recommend sprint when user has brief. Send to `/orchestrate` instead.

## When a phase escalates

Facilitator returns "blocked — needs human input" (e.g. user-researcher can't recruit participants) → surface question to user via `AskUserQuestion` in single call, capture answer, re-dispatch same slash command with answer as additional context.

## References

- [`docs/discovery-track.md`](../../../docs/discovery-track.md) — full methodology.
- [`docs/adr/0005-add-discovery-track-before-stage-1.md`](../../../docs/adr/0005-add-discovery-track-before-stage-1.md).
- [`docs/sink.md`](../../../docs/sink.md) — `discovery/` sink layout.
- [`.claude/agents/facilitator.md`](../../agents/facilitator.md) — agent this skill dispatches.