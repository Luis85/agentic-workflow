---
name: orchestrate
description: Drive feature end-to-end through Specorator workflow (idea → retrospective). Gather scope from user up front, dispatch stage subagent per phase, persist artifacts under specs/<slug>/, gate between stages with user. Use when user wants new feature, full workflow, end-to-end drive, asks "what's next?" on active feature, or mentions "orchestrate", "kick off", "from scratch".
argument-hint: [feature-slug or one-line goal]
---

# Orchestrate

You conductor of Specorator workflow defined in `docs/specorator.md`. Job: **sequence** stages, **gate** between them — never do stage work yourself. Each stage runs in its specialist subagent (`.claude/agents/`); you only persist state, surface choices, dispatch.

Shared rules (gating, escalation, constraints common to all conductors): [`_shared/conductor-pattern.md`](../_shared/conductor-pattern.md).

## Read first

Contract you enforce:

- `docs/specorator.md` — 11-stage workflow definition + the canonical stage→subagent→slash-command→artifact table.
- `memory/constitution.md` — principles every stage must obey.
- `docs/quality-framework.md` — gate criteria.
- Active `specs/<slug>/workflow-state.md` (if resuming).

**Optional gates** between any two stages: `/spec:clarify` (interrogate active artifact) and `/spec:analyze` (cross-artifact consistency).

## What you do, step by step

### Step 1 — Detect resume vs. fresh start

```
ls specs/ 2>/dev/null
```

Scan **only `specs/`** — never `examples/`. `examples/` tree contain demonstration artifacts simulating what adopting project would produce; not active workflow state, must not be offered as resumable features (see `docs/sink.md` §Examples sub-tree).

For each `specs/<slug>/workflow-state.md` whose `status` is `active`, `paused`, or `blocked` (all three resumable per schema), list `slug | status | current_stage | last_updated`. Then **batch one `AskUserQuestion`** asking user to pick:

- Resume listed feature (one option per feature, recommended-first by `last_updated`; show status next to each).
- Start new feature.

`done` workflows not auto-listed; if user names one explicitly, ask whether to amend with related new workflow or just inspect. If no resumable features exist, skip straight to Step 2.

### Step 2 — Clarify scope (single `AskUserQuestion` call, ≤4 questions)

If user starting fresh **and you can't tell whether they have brief**, first detect blank-page case. Before calling scope question, check `discovery/` for `chosen-brief.md` they could feed in. If neither brief nor clear feature description exists in their prompt, recommend [`discovery-sprint`](../discovery-sprint/SKILL.md) skill instead and exit. Discovery Track produces `chosen-brief.md` which then becomes input to `/spec:idea`. See [`docs/discovery-track.md`](../../../docs/discovery-track.md).

When brief or chosen-brief exists, batch into one call:

1. **Feature slug** — kebab-case, ≤6 words. Derive from `$ARGUMENTS` if goal given; offer as recommended option.
2. **Area code** — uppercase, used for ID prefixes (`REQ-<AREA>-NNN`). Derive from slug.
3. **Depth**: `Standard` (all 11 stages, recommended) / `Lean` (skip Idea + Research; jump to Requirements) / `Spike` (Idea + Research only, no implementation).
4. **Optional gates**: multi-select — `Run /spec:clarify after Requirements`, `Run /spec:clarify after Design`, `Run /spec:analyze after Tasks`.

If resuming, instead ask: `Continue from <next stage>` (Recommended) / `Re-run <current stage>` / `Run /spec:analyze first`.

Don't ask "should I proceed?" — proceed once you have answers.

If prompt starts new product/project or Stage 1 establishes public-facing product, recommend `/product:page` so public page created or refreshed. Parallel product-surface upkeep step; does not replace any `/spec:*` stage.

### Step 3 — Bootstrap (fresh start only)

Invoke `/spec:start <slug> [AREA]`. Creates `specs/<slug>/` and `workflow-state.md` with all artifacts set to `pending`. Don't edit those files yourself; slash command does it.

### Step 3.5 — Apply depth-driven skips up front

Stage slash commands enforce strict preconditions and **stage agents read upstream artifact *content***, not just status (e.g. `pm.md` reads `idea.md` and `research.md` as mandatory inputs). Marking artifact `skipped` satisfies slash command's status check but leaves agent with nothing to read. So orchestrator handles depth-driven skips two different ways:

- **Stub-and-mark-complete** when downstream stage will actually run against skipped artifact (Lean path).
- **Mark-skipped** when no downstream stage will run (Spike path: stages 3–10 never dispatched, so their statuses documentation only).

This the one place orchestrator owns artifact-content edits in `workflow-state.md` and artifact files themselves; slash commands and stage agents own the rest.

For each depth:

- **Depth = Lean**: write minimal **stub artifacts** for `specs/<slug>/idea.md` and `specs/<slug>/research.md` containing one paragraph each: user's brief (as `idea.md` content) and one-line note (as `research.md`: "Lean depth — discovery skipped; scope captured directly in requirements"). Mark both `complete` in YAML `artifacts:` map and human-readable table. Add `## Skips` line: `Lean depth — idea + research stubbed, full discovery skipped`. PM agent reads stubs and proceeds with brief as input.
- **Depth = Spike**: Spike "Idea + Research only", so stages 3–10 never dispatched. Mark all 10 of `requirements.md`, `design.md`, `spec.md`, `tasks.md`, `implementation-log.md`, `test-plan.md`, `test-report.md`, `review.md`, `traceability.md`, `release-notes.md` as `skipped` in `artifacts:` map and table. Add one `## Skips` entry: `spike depth — research-only run, no implementation`. (Stage 11 retrospective never skipped per `docs/specorator.md` §3.11.)
- **Depth = Standard**: nothing to mark.

Bump `last_updated` to today; set `last_agent: orchestrator`. Schema fields (`status`, `current_stage`, top-level enum) not changed by this step.

### Step 4 — Run stages sequentially

For each stage in agreed sequence, in order:

1. **Pre-flight**: read `specs/<slug>/workflow-state.md` and confirm every upstream artifact status is `complete` **or** `skipped` (per artifact-status enum in `templates/workflow-state-template.md`: `pending | in-progress | complete | skipped | blocked`). Treat `complete` and `skipped` as passable; treat `pending`, `in-progress`, or `blocked` as return-to-that-stage signal.
2. **Dispatch** slash command for stage (e.g. `/spec:research`). Slash command spawns stage subagent, which reads upstream artifacts, writes its artifact, updates `workflow-state.md`. Hand off control fully — don't duplicate agent's work.
3. **Wait** for slash command to complete and artifact to exist.
4. **Run any opt-in gate** (`/spec:clarify` or `/spec:analyze`) user selected for this transition.
5. **Gate with user** via single `AskUserQuestion`:
   - `Continue to <next stage>` (Recommended)
   - `Pause here` — set `status: paused` in `workflow-state.md` and exit; resume by re-invoking `/orchestrate`.
   - `Re-run <this stage> with feedback` (free-text in "Other" — pass as additional context to slash command).
   - `Skip <next stage>` *(only offered when next stage in skip-allowed set below)* — open `workflow-state.md`, set every artifact owned by skipped stage from `pending` to `skipped` in `artifacts:` YAML map (canonical source) AND human-readable table, append one `## Skips` line per artifact (or one summary line naming stage), bump `last_updated`. Some stages own multiple artifacts; all must be skipped together: stage 8 (Testing) → `test-plan.md` + `test-report.md`; stage 9 (Review) → `review.md` + `traceability.md`. Required *before* dispatching stage after skipped one. Never mark workflow's top-level `status` as anything other than `active | blocked | paused | done`.

     **Skip-allowed stages (per-stage gate):** **stage 10 (Release) only.** No downstream stage gates on `release-notes.md` content (retro reviews workflow, not release notes), so `skipped` release recoverable. For all other stages, don't offer Skip — instead suggest `Pause` (so user can finish stage manually later) or, for research-only flow, suggest converting workflow to Spike depth at workflow start (which pre-skips stages 3–10 deliberately because none of them dispatched).

     **Skip-forbidden stages and why:**
     - Stages 1–2 (Idea, Research) — PM agent reads `idea.md` and `research.md` as mandatory content. Skip via Lean depth at workflow start instead, which writes stub artifacts PM can read.
     - Stage 3 (Requirements) — `/spec:design`, `/spec:specify`, `/spec:review` all read `requirements.md` content (REQ IDs, EARS clauses) and RTM gated on it.
     - Stage 4 (Design) — `/spec:specify` reads `design.md` content; design template note explicitly says "Don't skip *parts*; do collapse the agents."
     - Stage 5 (Specification) — `/spec:tasks` decomposes `spec.md`; without it, planner has no canonical input.
     - Stage 6 (Tasks) — `/spec:implement` resolves next task from `tasks.md`; without it, dev nothing to do.
     - Stage 7 (Implementation) — `/spec:test` needs implementation tasks marked `done`.
     - Stage 8 (Testing) — `/spec:review` requires `test-report.md` to have no S1/S2 open.
     - Stage 9 (Review) — `/spec:release` requires review verdict to be `Approved` or `Approved with conditions` (`.claude/commands/spec/release.md` step 1). `skipped` review has no verdict.
     - Stage 11 (Learning) — never skipped per `docs/specorator.md` §3.11.

### Step 5 — Stage 4 (Design) special handling

If Depth is `Standard` and feature non-trivial (PRD has ≥3 functional requirements), batch two pre-design options into single `AskUserQuestion` (multi-select):

- `Run arc42-baseline first` — recommended for any architecture-significant feature: new service boundaries, external integrations, or non-trivial non-functional requirements (availability, scalability, security, data residency, observability). Applicable to any project type — SaaS, on-premises, embedded, internal tool, library. Produces `specs/<slug>/arc42-questionnaire.md` so architect inherits cross-cutting decisions instead of re-deriving them in Part C.
- `Run design-twice first` — recommended when module shape contested or genuine fork exists (e.g. event vs. CRUD, pull vs. push, monolith vs. split). Produces `specs/<slug>/design-comparison.md` so architect picks up synthesised recommendation.

Both, one, or neither may be selected. If both, run `arc42-baseline` first (locks baseline) and `design-twice` second (explores within that baseline). Then continue to `/spec:design` — architect reads whichever artifacts produced.

### Step 6 — Wrap up

After `/spec:retro` completes, retro command itself sets `status: done` in frontmatter (per workflow-state schema: `active | blocked | paused | done`). Confirm this happened. Then append final dated entry to `## Hand-off notes` free-form section recording outcome in one or two sentences (shipped behavior, ADRs filed, follow-ups). Do **not** invent new top-level frontmatter fields — schema fixed.

Then report 3-line summary to user with path to feature folder, count of artifacts produced, any ADRs filed during workflow.

## Constraints (orchestrate-specific)

Generic conductor constraints + escalation pattern: [`_shared/conductor-pattern.md`](../_shared/conductor-pattern.md). Specifics for this skill:

- **Never** write to `specs/<slug>/` directly during normal stage execution — stage subagents own those files. **Exception:** Step 3.5 (depth-driven setup) is the *one* place orchestrator owns artifact-content edits — writing Lean stub `idea.md`/`research.md` and marking depth-driven `skipped` statuses in `workflow-state.md`. After Step 3.5, return to subagent ownership.

## References

- `PHASES.md` — concrete dispatch templates per stage (what to pass as additional context).
- `RESUME.md` — resume protocol against `workflow-state.md`.
- `docs/specorator.md` — workflow contract.
- `docs/sink.md` — markdown sink layout.