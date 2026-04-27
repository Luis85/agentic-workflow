---
name: stock-taking
description: Drive a Stock-taking Engagement end-to-end (Scope → Audit → Synthesize → Handoff) by gathering project context from the user up front, then dispatching the legacy-auditor for each phase, persisting artifacts under stock-taking/<slug>/, and gating between phases with the user. Use when the user is building on a legacy system, needs to understand an existing system before starting a project, mentions "stock-taking", "legacy assessment", "inventory", "what do we already have", "existing system", "brownfield", or wants to catalogue processes and use-cases before building anything new.
argument-hint: [project-slug or one-line system description]
---

# Stock-taking

You are the conductor of the Stock-taking Track defined in [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md). Your job is to **sequence** phases and **gate** between them — never to do the auditor work yourself. Each phase runs through the `legacy-auditor` subagent ([`.claude/agents/legacy-auditor.md`](../../agents/legacy-auditor.md)).

`AskUserQuestion` only works in the main thread. Subagents cannot ask the user anything. So all clarification happens in *your* turn — before and between phases.

This is a **pre-workflow** entry. The output is a `stock-taking-inventory.md` that feeds either `/discovery:start` or `/spec:idea`. Do not run a stock-taking engagement when the team is starting from scratch with no existing system — recommend `/discovery:start` (blank page) or `/spec:idea` (clear brief) instead.

## Read first

Always start by reading these (they are the contract you are enforcing):

- [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) — the 3-phase definition + method library.
- [`docs/adr/0007-add-stock-taking-track-for-legacy-projects.md`](../../../docs/adr/0007-add-stock-taking-track-for-legacy-projects.md) — the why.
- [`memory/constitution.md`](../../../memory/constitution.md) — Articles II, III, VI, VII apply.
- The active `stock-taking/<project>/stock-taking-state.md` (if resuming).

## The flow you are driving

| # | Phase | Agent | Slash command | Artifact |
|---|---|---|---|---|
| 0 | Bootstrap | — | `/stock:start <slug>` | `stock-taking-state.md` |
| 1 | Scope | legacy-auditor | `/stock:scope` | `scope.md` |
| 2 | Audit | legacy-auditor | `/stock:audit` | `audit.md` |
| 3 | Synthesize | legacy-auditor | `/stock:synthesize` | `synthesis.md` |
| H | Handoff | legacy-auditor | `/stock:handoff` | `stock-taking-inventory.md` |

Engagement outcomes: `complete` → inventory produced → `/discovery:start` or `/spec:start` + `/spec:idea`. `incomplete` → inventory produced with open unknowns → downstream track treats open items as research agenda.

## What you do, step by step

### Step 1 — Detect resume vs. fresh start

```
ls stock-taking/ 2>/dev/null
```

For each `stock-taking/<slug>/stock-taking-state.md` whose `status` is `active`, `paused`, or `blocked`, list `slug | status | current_phase | last_updated`. Then **batch one `AskUserQuestion`** asking the user to pick:

- Resume a listed engagement (recommended-first by `last_updated`).
- Start a new engagement.
- Skip stock-taking entirely (when the user confirms there is no existing system to inventory).

If no resumable engagements exist, skip straight to Step 2.

### Step 2 — Confirm fit (single `AskUserQuestion`, ≤ 3 questions)

If starting fresh, batch into one call:

1. **Is there an existing system to inventory?** — `Yes (run stock-taking)` (Recommended) / `No existing system — skip to /discovery-sprint or /orchestrate`. If they pick the second, exit this skill and recommend the appropriate next step.
2. **Project slug** — kebab-case, ≤ 6 words, names the *system or system cluster* being inventoried (not the feature being built). Good: `crm-legacy-audit`, `billing-platform-baseline`. Bad: `new-invoice-feature`.
3. **Source material available?** — list what they have: code repos, architecture docs, database schemas, runbooks, subject-matter experts, or any combination. This seeds the `scope.md` source-material section and calibrates how deep the audit can go.

### Step 3 — Bootstrap (fresh start only)

Invoke `/stock:start <slug>`. This creates `stock-taking/<slug>/` and `stock-taking-state.md` with all artifacts set to `pending`. Do not edit those files yourself.

### Step 4 — Run phases sequentially

For each phase in order:

1. **Pre-flight** — read `stock-taking-state.md`, confirm the prior phase is `complete` (or `skipped` with documented compression).
2. **Dispatch** the slash command (`/stock:scope`, `/stock:audit`, `/stock:synthesize`). The slash command invokes the `legacy-auditor`.
3. **Wait** for the slash command to complete and the artifact to exist.
4. **Gate with the user** via a single `AskUserQuestion`:
   - `Continue to <next phase>` (Recommended)
   - `Pause here` — set `status: paused` in `stock-taking-state.md` and exit; resume by re-invoking `/stock-taking`.
   - `Re-run <this phase> with feedback` (free-text in "Other").
   - On Phase 3 only: also ask whether to proceed to `discovery`, `spec`, or `both` (this populates `recommended_next` in `synthesis.md` if the auditor left it as `TBD`).

### Step 5 — Handoff

After Phase 3, dispatch `/stock:handoff`. The `legacy-auditor` writes `stock-taking-inventory.md`. Then:

- If `recommended_next: discovery` — recommend `/discovery:start <sprint-slug>`.
- If `recommended_next: spec` — recommend `/spec:start <feature-slug> [<AREA>]` followed by `/spec:idea`.
- If `recommended_next: both` — recommend both paths with a note on which parts of the system scope feed into each.
- Confirm with the user whether to chain into `/discovery-sprint` or `/orchestrate` immediately or pause.
- Set `stock-taking-state.md` `status: complete`.

## Constraints

- **Never** do auditor work in your own turn. If you find yourself writing a process map or use-case catalog, you have drifted — stop and dispatch the `legacy-auditor`.
- **Never** call `AskUserQuestion` from inside a subagent prompt. It will fail.
- **Never** ask more than one `AskUserQuestion` per gate. Batch options.
- **Always** update `stock-taking-state.md` between phases (the slash commands and `legacy-auditor` do it; you verify).
- **Never** write to `stock-taking/<slug>/` directly during normal phase execution — the `legacy-auditor` owns those files.
- **Never** open `specs/<feature>/` or `discovery/<sprint>/` from inside this skill. That happens after handoff via `/spec:start` or `/discovery:start`.
- **Never** recommend stock-taking when the user confirms there is no existing system to inventory.

## When a phase is blocked

If the `legacy-auditor` returns "blocked — needs human input" (e.g. access to a source system is unavailable, a key stakeholder is unresponsive), surface its question to the user via `AskUserQuestion` in a single call, capture the answer, then re-dispatch the same slash command with the answer as additional context.

## References

- [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) — full methodology.
- [`docs/adr/0007-add-stock-taking-track-for-legacy-projects.md`](../../../docs/adr/0007-add-stock-taking-track-for-legacy-projects.md).
- [`docs/sink.md`](../../../docs/sink.md) — `stock-taking/` sink layout.
- [`.claude/agents/legacy-auditor.md`](../../agents/legacy-auditor.md) — the agent this skill dispatches.
