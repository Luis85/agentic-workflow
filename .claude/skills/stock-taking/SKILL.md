---
name: stock-taking
description: Drive Stock-taking Engagement end-to-end (Scope → Audit → Synthesize → Handoff). Gather project context from user up front, dispatch legacy-auditor each phase, persist artifacts under stock-taking/<slug>/, gate phases with user. Use when user building on legacy system, needs understand existing system before project, mentions "stock-taking", "legacy assessment", "inventory", "what do we already have", "existing system", "brownfield", or wants catalogue processes + use-cases before building new.
argument-hint: [project-slug or one-line system description]
---

# Stock-taking

You conduct Stock-taking Track defined in [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md). Job: **sequence** phases + **gate** between — never do auditor work yourself. Each phase runs through `legacy-auditor` subagent ([`.claude/agents/legacy-auditor.md`](../../agents/legacy-auditor.md)).

Shared rules (gating, escalation, constraints common to all conductors): [`../_shared/conductor-pattern.md`](../_shared/conductor-pattern.md).

This **pre-workflow** entry. Output = `stock-taking-inventory.md` feeding `/discovery:start` or `/spec:idea`. Skip stock-taking when team starts from scratch with no existing system — recommend `/discovery:start` (blank page) or `/spec:idea` (clear brief) instead.

## Read first

Always start by reading these (contract you enforcing):

- [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) — 3-phase definition + method library.
- [`docs/adr/0007-add-stock-taking-track-for-legacy-projects.md`](../../../docs/adr/0007-add-stock-taking-track-for-legacy-projects.md) — why.
- [`memory/constitution.md`](../../../memory/constitution.md) — Articles II, III, VI, VII apply.
- Active `stock-taking/<project>/stock-taking-state.md` (if resuming).

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

For each `stock-taking/<slug>/stock-taking-state.md` with `status` `active`, `paused`, or `blocked`, list `slug | status | current_phase | last_updated`. Then **batch one `AskUserQuestion`** asking user pick:

- Resume listed engagement (recommended-first by `last_updated`).
- Start new engagement.
- Skip stock-taking entirely (when user confirms no existing system to inventory).

No resumable engagements exist → skip to Step 2.

### Step 2 — Confirm fit (single `AskUserQuestion`, ≤ 3 questions)

Fresh start → batch into one call:

1. **Existing system to inventory?** — `Yes (run stock-taking)` (Recommended) / `No existing system — skip to /discovery-sprint or /orchestrate`. Second pick → exit skill, recommend appropriate next step.
2. **Project slug** — kebab-case, ≤ 6 words, names *system or system cluster* being inventoried (not feature being built). Good: `crm-legacy-audit`, `billing-platform-baseline`. Bad: `new-invoice-feature`.
3. **Source material available?** — list what they have: code repos, architecture docs, database schemas, runbooks, SMEs, any combination. Seeds `scope.md` source-material section + calibrates audit depth.

### Step 3 — Bootstrap (fresh start only)

Invoke `/stock:start <slug>`. Creates `stock-taking/<slug>/` + `stock-taking-state.md` with all artifacts `pending`. Don't edit those files yourself.

### Step 4 — Run phases sequentially

Each phase in order:

1. **Pre-flight** — read `stock-taking-state.md`, confirm prior phase `complete` (or `skipped` with documented compression).
2. **Dispatch** slash command (`/stock:scope`, `/stock:audit`, `/stock:synthesize`). Slash command invokes `legacy-auditor`.
3. **Wait** for slash command complete + artifact exist.
4. **Gate with user** via single `AskUserQuestion`:
   - `Continue to <next phase>` (Recommended)
   - `Pause here` — set `status: paused` in `stock-taking-state.md`, exit; resume by re-invoking `/stock-taking`.
   - `Re-run <this phase> with feedback` (free-text in "Other").
   - Phase 3 only: also ask whether proceed to `discovery`, `spec`, or `both` (populates `recommended_next` in `synthesis.md` if auditor left as `TBD`).

### Step 5 — Handoff

After Phase 3, dispatch `/stock:handoff`. `legacy-auditor` writes `stock-taking-inventory.md`. Then:

- `recommended_next: discovery` → recommend `/discovery:start <sprint-slug>`.
- `recommended_next: spec` → recommend `/spec:start <feature-slug> [<AREA>]` followed by `/spec:idea`.
- `recommended_next: both` → recommend both paths with note on which parts of system scope feed into each.
- Confirm with user whether chain into `/discovery-sprint` or `/orchestrate` immediately or pause.
- Set `stock-taking-state.md` `status: complete`.

## Constraints (stock-taking-specific)

Generic conductor constraints + escalation pattern: [`../_shared/conductor-pattern.md`](../_shared/conductor-pattern.md). Specifics for this skill:

- **Never** open `specs/<feature>/` or `discovery/<sprint>/` from inside this skill — that happens after handoff via `/spec:start` or `/discovery:start`.
- **Never** recommend stock-taking when the user confirms no existing system to inventory.

## References

- [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) — full methodology.
- [`docs/adr/0007-add-stock-taking-track-for-legacy-projects.md`](../../../docs/adr/0007-add-stock-taking-track-for-legacy-projects.md).
- [`docs/sink.md`](../../../docs/sink.md) — `stock-taking/` sink layout.
- [`.claude/agents/legacy-auditor.md`](../../agents/legacy-auditor.md) — agent this skill dispatches.