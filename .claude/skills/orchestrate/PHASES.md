# Per-stage dispatch templates

The orchestrate skill dispatches the existing `/spec:*` slash commands rather than calling subagents directly — the slash commands already wire the right agent and pass the right inputs. This file documents the **additional context** the orchestrator should pass when re-running a stage with user feedback or with cross-stage context.

**How feedback is delivered.** Slash commands accept their feature slug as an argument; user feedback is *not* a CLI flag. Instead, the orchestrator delivers feedback as **conversational context in the same turn** as the slash command — the spawned stage subagent reads the surrounding conversation and treats explicit "Re-run with feedback: …" lines as constraint on its draft. State the feedback as a short paragraph immediately before invoking the slash command; do not embed it in the command's `$ARGUMENTS`.

The slash commands are defined in `.claude/commands/spec/` and own the agent invocation. Do **not** duplicate their logic here — only document how to enrich them when re-dispatching.

## Stage dispatch reference

### Stage 1 — Idea (`/spec:idea`)
- **Initial:** dispatch as-is once `workflow-state.md` exists.
- **Re-run with feedback:** prepend the user's feedback to the dispatch as `Re-run with feedback: <text>`. The analyst will treat it as constraint on the new draft.

### Stage 2 — Research (`/spec:research`)
- **Initial:** dispatch as-is. The analyst reads `idea.md` open questions as the agenda.
- **Re-run with feedback:** specify which research questions need deeper treatment.
- **Suggested skills the analyst may pull:** `grill` (when interrogating ambiguity), `domain-context` (when discovering domain terms).

### Stage 3 — Requirements (`/spec:requirements`)
- **Initial:** dispatch as-is. The pm reads `research.md` recommendation as the starting point.
- **Suggested skills:** `grill` (for non-functional requirement discovery), `ubiquitous-language` (whenever a new domain term lands in EARS clauses).
- **Mandatory:** every functional requirement uses EARS notation per `docs/ears-notation.md`.
- **Optional gate:** offer `/spec:clarify` after this stage if the user enabled it in Step 2.

### Stage 4 — Design (`/spec:design`)
- **Initial path A (default):** dispatch as-is. The slash command sequences ux → ui → architect.
- **Initial path B (deep features):** if the user opted into `design-twice` in Step 5, dispatch `design-twice` first; pass its synthesis to `/spec:design` as additional context.
- **Suggested skills:** `design-twice`, `record-decision` (when the architect identifies a hard-to-reverse choice).
- **Optional gate:** offer `/spec:clarify` after this stage if the user enabled it.

### Stage 5 — Specification (`/spec:specify`)
- **Initial:** dispatch as-is.
- **Re-run with feedback:** name the spec sections that need tightening.

### Stage 6 — Tasks (`/spec:tasks`)
- **Initial:** dispatch as-is.
- **Suggested skills:** `tracer-bullet` (for vertical slicing).
- **Optional gate:** offer `/spec:analyze` after this stage if the user enabled it. This is the strongest natural place for `/spec:analyze` — it cross-checks REQ → SPEC → T coverage.

### Stage 7 — Implementation (`/spec:implement`)
- **One task per dispatch.** `/spec:implement` is scoped to a single task per call (`.claude/commands/spec/implement.md` step 1). The dev agent does **not** walk the backlog inside one invocation; the orchestrator must loop dispatches until no ready implementation tasks remain.
- **Initial dispatch:** read `tasks.md`, find the first ready task (dependencies satisfied per its `Blocked by:` field, no blockers, status `pending`), dispatch `/spec:implement <T-AREA-NNN>`. Wait for return.
- **Loop:** after each `/spec:implement` returns, branch on the dev agent's outcome — **only mark the task `done` when the agent explicitly reports successful completion** (all acceptance criteria green, full suite passing, log entry appended). Outcome handling:
  - **Completed successfully** → mark the task `done` in `tasks.md`, re-scan for the next ready task in dependency order, dispatch again.
  - **Blocked** (the dev agent escalated mid-task — couldn't pass a test in two attempts, hit a missing decision, etc.) → leave the task as `in-progress`, append the blocker to the `## Blocks` section of `workflow-state.md`, set the workflow `status: blocked`, and surface the blocker to the user via `AskUserQuestion`. Do *not* advance.
  - **Partial / incomplete** (some criteria green, others not) → leave `in-progress`, escalate to the user; do not mark `done`. The next /spec:test would otherwise run against unfinished work.
  - **Failed** (e.g. test suite went red and couldn't be recovered) → leave `in-progress`, escalate.
  Continue looping only on the *Completed successfully* branch. The loop terminates when (a) all implementation tasks are `done` (advance to gate), (b) the next ready task is gated for human oversight (gate now), or (c) any non-success outcome above (escalate, do not advance).
- **Gating cadence:** gate after each task if the user wants tight oversight; gate after each "slice" (group of tasks satisfying one requirement) for normal cadence; gate once at the end of all implementation tasks for autonomous mode (default for trivial features).
- **Suggested skills:** `tdd-cycle` (mandatory inside the dev agent — strict red/green/refactor scoped to the dispatched task only).
- **Definition of done for the stage:** every task in `tasks.md` is `done`; `implementation-log.md` is `complete` (the dev agent appends one entry per task).

### Stage 8 — Testing (`/spec:test`)
- **Initial:** dispatch as-is. The qa agent generates `test-plan.md` then runs and reports `test-report.md`.
- **Re-run with feedback:** name failing tests or coverage gaps.

### Stage 9 — Review (`/spec:review`)
- **Initial:** dispatch as-is. The reviewer agent verifies RTM completeness and quality gates.
- **Required:** RTM at `specs/<slug>/traceability.md` must be complete before this exits.

### Stage 10 — Release (`/spec:release`)
- **Initial:** dispatch as-is.
- **Pre-flight check:** confirm `review.md` verdict is `Approved` or `Approved with conditions` (per the verdict checkboxes in `templates/review-template.md`). If the verdict is `Blocked`, return to Stage 9 (Review) — do not dispatch `/spec:release`.

### Stage 11 — Learning (`/spec:retro`)
- **Mandatory:** runs even on clean ships (per `docs/specorator.md` §3.11).
- **Initial:** dispatch as-is.

## Cross-stage helpers

- **ADR detected mid-stage:** any subagent may flag a decision that needs an ADR. The orchestrator should run `/adr:new "<title>"` on the user's behalf (after a one-question `AskUserQuestion` confirmation) and append a dated line to the `## Hand-off notes` free-form section of `workflow-state.md` recording the ADR path. Do **not** invent an `adrs:` frontmatter field — the schema in `templates/workflow-state-template.md` is fixed.
- **Domain term coined:** if a subagent reports a new term, append it to `docs/UBIQUITOUS_LANGUAGE.md` via the `ubiquitous-language` skill (lazy creation if file doesn't exist).
- **Context shift:** if a subagent reports that the domain context map has changed, dispatch the `domain-context` skill to update `docs/CONTEXT.md`.

## What the orchestrator must NOT pass

- The full content of upstream artifacts. The slash command and stage agent read those themselves from disk.
- Implementation details. The orchestrator only knows scope, depth, and the user's gating choices.
- Conversation history beyond the current gating round. Each stage is a fresh subagent context.
