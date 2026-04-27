---
name: orchestrate
description: Drive a feature end-to-end through the Spec Kit workflow (idea → retrospective) by gathering scope from the user up front, then dispatching the right stage subagent for each phase, persisting artifacts under specs/<slug>/, and gating between stages with the user. Use when the user wants to start a new feature, run the full workflow, drive something end-to-end, asks "what's next?" on an active feature, or mentions "orchestrate", "kick off", or "from scratch".
argument-hint: [feature-slug or one-line goal]
---

# Orchestrate

You are the conductor of the Spec Kit workflow defined in `docs/spec-kit.md`. Your job is to **sequence** stages and **gate** between them — never to do the stage work yourself. Each stage runs in its specialist subagent (`.claude/agents/`); you only persist state, surface choices, and dispatch.

`AskUserQuestion` only works in the main thread. Subagents cannot ask the user anything. So all clarification happens in *your* turn — before and between stages.

## Read first

Always start by reading these (they're the contract you're enforcing):

- `docs/spec-kit.md` — the 11-stage workflow definition.
- `memory/constitution.md` — principles every stage must obey.
- `docs/quality-framework.md` — gate criteria.
- The active `specs/<slug>/workflow-state.md` (if resuming).

## The workflow you're driving

| # | Stage | Subagent | Slash command | Artifact |
|---|---|---|---|---|
| 0 | Bootstrap | — | `/spec:start <slug> [AREA]` | `workflow-state.md` |
| 1 | Idea | `analyst` | `/spec:idea` | `idea.md` |
| 2 | Research | `analyst` | `/spec:research` | `research.md` |
| 3 | Requirements | `pm` | `/spec:requirements` | `requirements.md` |
| 4 | Design | `ux-designer` → `ui-designer` → `architect` | `/spec:design` | `design.md` |
| 5 | Specification | `architect` | `/spec:specify` | `spec.md` |
| 6 | Tasks | `planner` | `/spec:tasks` | `tasks.md` |
| 7 | Implementation | `dev` | `/spec:implement [task-id]` | code + `implementation-log.md` |
| 8 | Testing | `qa` | `/spec:test` | `test-plan.md`, `test-report.md` |
| 9 | Review | `reviewer` | `/spec:review` | `review.md` |
| 10 | Release | `release-manager` | `/spec:release` | `release-notes.md` |
| 11 | Learning | `retrospective` | `/spec:retro` | `retrospective.md` |

**Optional gates** between any two stages: `/spec:clarify` (interrogate active artifact) and `/spec:analyze` (cross-artifact consistency).

## What you do, step by step

### Step 1 — Detect resume vs. fresh start

```
ls specs/ 2>/dev/null
```

For each `specs/<slug>/workflow-state.md` whose `status` is `active`, `paused`, or `blocked` (all three are resumable per the schema), list `slug | status | current_stage | last_updated`. Then **batch one `AskUserQuestion`** asking the user to pick:

- Resume a listed feature (one option per feature, recommended-first by `last_updated`; show the status next to each).
- Start a new feature.

`done` workflows are not auto-listed; if the user names one explicitly, ask whether to amend with a related new workflow or just inspect. If no resumable features exist, skip straight to Step 2.

### Step 2 — Clarify scope (single `AskUserQuestion` call, ≤4 questions)

If the user is starting fresh **and you can't tell whether they have a brief**, first detect the blank-page case. Before calling the scope question, check `discovery/` for a `chosen-brief.md` they could feed in. If neither a brief nor a clear feature description exists in their prompt, recommend the [`discovery-sprint`](../discovery-sprint/SKILL.md) skill instead and exit. The Discovery Track produces a `chosen-brief.md` which then becomes the input to `/spec:idea`. See [`docs/discovery-track.md`](../../../docs/discovery-track.md).

When a brief or chosen-brief exists, batch into one call:

1. **Feature slug** — kebab-case, ≤6 words. Derive from `$ARGUMENTS` if a goal was given; offer it as the recommended option.
2. **Area code** — uppercase, used for ID prefixes (`REQ-<AREA>-NNN`). Derive from slug.
3. **Depth**: `Standard` (all 11 stages, recommended) / `Lean` (skip Idea + Research; jump to Requirements) / `Spike` (Idea + Research only, no implementation).
4. **Optional gates**: multi-select — `Run /spec:clarify after Requirements`, `Run /spec:clarify after Design`, `Run /spec:analyze after Tasks`.

If resuming, instead ask: `Continue from <next stage>` (Recommended) / `Re-run <current stage>` / `Run /spec:analyze first`.

Do not ask "should I proceed?" — proceed once you have answers.

### Step 3 — Bootstrap (fresh start only)

Invoke `/spec:start <slug> [AREA]`. This creates `specs/<slug>/` and `workflow-state.md` with all artifacts set to `pending`. Do not edit those files yourself; the slash command does it.

### Step 3.5 — Apply depth-driven skips up front

Stage slash commands enforce strict preconditions and the **stage agents read upstream artifact *content***, not just status (e.g. `pm.md` reads `idea.md` and `research.md` as mandatory inputs). Marking an artifact `skipped` satisfies the slash command's status check but leaves the agent with nothing to read. So the orchestrator handles depth-driven skips two different ways:

- **Stub-and-mark-complete** when a downstream stage will actually run against the skipped artifact (Lean path).
- **Mark-skipped** when no downstream stage will run (Spike path: stages 3–10 are never dispatched, so their statuses are documentation only).

This is the one place the orchestrator owns artifact-content edits in `workflow-state.md` and the artifact files themselves; slash commands and stage agents own the rest.

For each depth:

- **Depth = Lean**: write minimal **stub artifacts** for `specs/<slug>/idea.md` and `specs/<slug>/research.md` containing one paragraph each: the user's brief (as `idea.md`'s content) and a one-line note (as `research.md`: "Lean depth — discovery skipped; scope captured directly in requirements"). Mark both `complete` in the YAML `artifacts:` map and the human-readable table. Add a `## Skips` line: `Lean depth — idea + research stubbed, full discovery skipped`. The PM agent will read the stubs and proceed with the brief as input.
- **Depth = Spike**: Spike is "Idea + Research only", so stages 3–10 are never dispatched. Mark all 10 of `requirements.md`, `design.md`, `spec.md`, `tasks.md`, `implementation-log.md`, `test-plan.md`, `test-report.md`, `review.md`, `traceability.md`, `release-notes.md` as `skipped` in the `artifacts:` map and table. Add one `## Skips` entry: `spike depth — research-only run, no implementation`. (Stage 11 retrospective is never skipped per `docs/spec-kit.md` §3.11.)
- **Depth = Standard**: nothing to mark.

Bump `last_updated` to today; set `last_agent: orchestrator`. The schema fields (`status`, `current_stage`, top-level enum) are not changed by this step.

### Step 4 — Run stages sequentially

For each stage in the agreed sequence, in order:

1. **Pre-flight**: read `specs/<slug>/workflow-state.md` and confirm every upstream artifact status is `complete` **or** `skipped` (per the artifact-status enum in `templates/workflow-state-template.md`: `pending | in-progress | complete | skipped | blocked`). Treat `complete` and `skipped` as passable; treat `pending`, `in-progress`, or `blocked` as a return-to-that-stage signal.
2. **Dispatch** the slash command for the stage (e.g. `/spec:research`). The slash command spawns the stage subagent, which reads upstream artifacts, writes its artifact, and updates `workflow-state.md`. Hand off control fully — do not duplicate the agent's work.
3. **Wait** for the slash command to complete and the artifact to exist.
4. **Run any opt-in gate** (`/spec:clarify` or `/spec:analyze`) the user selected for this transition.
5. **Gate with the user** via a single `AskUserQuestion`:
   - `Continue to <next stage>` (Recommended)
   - `Pause here` — set `status: paused` in `workflow-state.md` and exit; resume by re-invoking `/orchestrate`.
   - `Re-run <this stage> with feedback` (free-text in "Other" — pass as additional context to the slash command).
   - `Skip <next stage>` *(only offered when the next stage is in the skip-allowed set below)* — open `workflow-state.md`, set every artifact owned by the skipped stage from `pending` to `skipped` in the `artifacts:` YAML map (the canonical source) AND the human-readable table, append one `## Skips` line per artifact (or one summary line naming the stage), bump `last_updated`. Some stages own multiple artifacts and they must all be skipped together: stage 8 (Testing) → `test-plan.md` + `test-report.md`; stage 9 (Review) → `review.md` + `traceability.md`. This is required *before* dispatching the stage after the skipped one. Never mark the workflow's top-level `status` as anything other than `active | blocked | paused | done`.

     **Skip-allowed stages (per-stage gate):** **stage 10 (Release) only.** No downstream stage gates on `release-notes.md` content (retro reviews the workflow, not the release notes), so a `skipped` release is recoverable. For all other stages, do not offer Skip — instead suggest `Pause` (so the user can finish the stage manually later) or, for a research-only flow, suggest converting the workflow to Spike depth at workflow start (which pre-skips stages 3–10 deliberately because none of them are dispatched).

     **Skip-forbidden stages and why:**
     - Stages 1–2 (Idea, Research) — the PM agent reads `idea.md` and `research.md` as mandatory content. Skip these via Lean depth at workflow start instead, which writes stub artifacts the PM can read.
     - Stage 3 (Requirements) — `/spec:design`, `/spec:specify`, and `/spec:review` all read `requirements.md` content (REQ IDs, EARS clauses) and the RTM is gated on it.
     - Stage 4 (Design) — `/spec:specify` reads `design.md` content; the design template note explicitly says "Don't skip *parts*; do collapse the agents."
     - Stage 5 (Specification) — `/spec:tasks` decomposes `spec.md`; without it, the planner has no canonical input.
     - Stage 6 (Tasks) — `/spec:implement` resolves the next task from `tasks.md`; without it, dev has nothing to do.
     - Stage 7 (Implementation) — `/spec:test` needs implementation tasks marked `done`.
     - Stage 8 (Testing) — `/spec:review` requires `test-report.md` to have no S1/S2 open.
     - Stage 9 (Review) — `/spec:release` requires the review verdict to be `Approved` or `Approved with conditions` (`.claude/commands/spec/release.md` step 1). A `skipped` review has no verdict.
     - Stage 11 (Learning) — never skipped per `docs/spec-kit.md` §3.11.

### Step 5 — Stage 4 (Design) special handling

If Depth is `Standard` and the feature is non-trivial (PRD has ≥3 functional requirements), batch the two pre-design options into a single `AskUserQuestion` (multi-select):

- `Run arc42-baseline first` — recommended for any architecture-significant feature: new service boundaries, external integrations, or non-trivial non-functional requirements (availability, scalability, security, data residency, observability). Applicable to any project type — SaaS, on-premises, embedded, internal tool, or library. Produces `specs/<slug>/arc42-questionnaire.md` so the architect inherits cross-cutting decisions instead of re-deriving them in Part C.
- `Run design-twice first` — recommended when the module shape is contested or there's a genuine fork (e.g. event vs. CRUD, pull vs. push, monolith vs. split). Produces `specs/<slug>/design-comparison.md` so the architect picks up a synthesised recommendation.

Both, one, or neither may be selected. If both, run `arc42-baseline` first (it locks the baseline) and `design-twice` second (it explores within that baseline). Then continue to `/spec:design` — the architect reads whichever artifacts were produced.

### Step 6 — Wrap up

After `/spec:retro` completes, the retro command itself sets `status: done` in the frontmatter (per the workflow-state schema: `active | blocked | paused | done`). Confirm this happened. Then append a final dated entry to the `## Hand-off notes` free-form section recording the outcome in one or two sentences (shipped behavior, ADRs filed, follow-ups). Do **not** invent new top-level frontmatter fields — the schema is fixed.

Then report a 3-line summary to the user with the path to the feature folder, the count of artifacts produced, and any ADRs filed during the workflow.

## Constraints

- **Never** do stage work in your own turn. If you find yourself reading source code, writing the PRD, or editing implementation files, you've drifted — stop and dispatch the right subagent.
- **Never** call `AskUserQuestion` from inside a subagent prompt. It will fail.
- **Never** ask more than one `AskUserQuestion` per gate. Batch options into a single question.
- **Always** update `workflow-state.md` between stages (delegated to the slash commands).
- **Always** use the same slug across all artifacts in one feature.
- **Never** write to `specs/<slug>/` directly during normal stage execution — the stage subagents own those files. **Exception:** Step 3.5 (depth-driven setup) is the *one* place the orchestrator owns artifact-content edits — writing Lean stub `idea.md`/`research.md` and marking depth-driven `skipped` statuses in `workflow-state.md`. After Step 3.5, return to subagent ownership for the rest of the workflow.
- **Don't** invent new sink locations. Use what `docs/sink.md` defines.

## When a stage agent escalates

If a subagent returns "blocked — needs human input" (e.g. the analyst can't resolve ambiguity), surface its question to the user via `AskUserQuestion` in a single call, capture the answer, then re-dispatch the same slash command with the answer as additional context. Don't try to answer on the user's behalf.

## References

- `PHASES.md` — concrete dispatch templates per stage (what to pass as additional context).
- `RESUME.md` — resume protocol against `workflow-state.md`.
- `docs/spec-kit.md` — workflow contract.
- `docs/sink.md` — markdown sink layout.
