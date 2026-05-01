# Per-stage dispatch templates

Orchestrate skill dispatches existing `/spec:*` slash commands not subagents — slash commands already wire right agent + pass right inputs. This file documents **additional context** orchestrator pass when re-running stage with user feedback or cross-stage context.

**How feedback delivered.** Slash commands accept feature slug as argument; user feedback *not* CLI flag. Instead, orchestrator deliver feedback as **conversational context same turn** as slash command — spawned stage subagent reads surrounding conversation, treats explicit "Re-run with feedback: …" lines as constraint on draft. State feedback as short paragraph immediately before invoking slash command; do not embed in command's `$ARGUMENTS`.

Slash commands defined in `.claude/commands/spec/`, own agent invocation. Do **not** duplicate logic here — only document how to enrich when re-dispatching.

## Stage dispatch reference

### Stage 1 — Idea (`/spec:idea`)
- **Initial:** dispatch as-is once `workflow-state.md` exists.
- **Re-run with feedback:** prepend user feedback to dispatch as `Re-run with feedback: <text>`. Analyst treat as constraint on new draft.

### Stage 2 — Research (`/spec:research`)
- **Initial:** dispatch as-is. Analyst reads `idea.md` open questions as agenda.
- **Re-run with feedback:** specify which research questions need deeper treatment.
- **Suggested skills analyst may pull:** `grill` (interrogating ambiguity), `domain-context` (discovering domain terms).

### Stage 3 — Requirements (`/spec:requirements`)
- **Initial:** dispatch as-is. Pm reads `research.md` recommendation as starting point.
- **Suggested skills:** `grill` (non-functional requirement discovery), `new-glossary-entry` via `/glossary:new "<term>"` (whenever new domain term lands in EARS clauses; per ADR-0010, supersedes deprecated `ubiquitous-language` skill).
- **Mandatory:** every functional requirement uses EARS notation per `docs/ears-notation.md`.
- **Optional gate:** offer `/spec:clarify` after this stage if user enabled in Step 2.

### Stage 4 — Design (`/spec:design`)
- **Initial path A (default):** dispatch as-is. Slash command sequences ux → ui → architect.
- **Initial path B (deep features):** if user opted into `design-twice` in Step 5, dispatch `design-twice` first; pass synthesis to `/spec:design` as additional context.
- **Suggested skills:** `design-twice`, `record-decision` (when architect identifies hard-to-reverse choice).
- **Optional gate:** offer `/spec:clarify` after this stage if user enabled.

### Stage 5 — Specification (`/spec:specify`)
- **Initial:** dispatch as-is.
- **Re-run with feedback:** name spec sections needing tightening.

### Stage 6 — Tasks (`/spec:tasks`)
- **Initial:** dispatch as-is.
- **Suggested skills:** `tracer-bullet` (vertical slicing).
- **Optional gate:** offer `/spec:analyze` after this stage if user enabled. Strongest natural place for `/spec:analyze` — cross-checks REQ → SPEC → T coverage.

### Stage 7 — Implementation (`/spec:implement`)
- **One task per dispatch.** `/spec:implement` scoped to single task per call (`.claude/commands/spec/implement.md` step 1). Dev agent does **not** walk backlog inside one invocation; orchestrator must loop dispatches until no ready implementation tasks remain.
- **Initial dispatch:** read `tasks.md`, find first ready task (dependencies satisfied per `Blocked by:` field, no blockers, status `pending`), dispatch `/spec:implement <T-AREA-NNN>`. Wait for return.
- **Loop:** after each `/spec:implement` returns, branch on dev agent outcome — **only mark task `done` when agent explicitly reports successful completion** (all acceptance criteria green, full suite passing, log entry appended). Outcome handling:
  - **Completed successfully** → mark task `done` in `tasks.md`, re-scan for next ready task in dependency order, dispatch again.
  - **Blocked** (dev agent escalated mid-task — couldn't pass test in two attempts, hit missing decision, etc.) → leave task `in-progress`, append blocker to `## Blocks` section of `workflow-state.md`, set workflow `status: blocked`, surface blocker to user via `AskUserQuestion`. Do *not* advance.
  - **Partial / incomplete** (some criteria green, others not) → leave `in-progress`, escalate to user; do not mark `done`. Next /spec:test would otherwise run against unfinished work.
  - **Failed** (e.g. test suite went red, couldn't recover) → leave `in-progress`, escalate.
  Continue looping only on *Completed successfully* branch. Loop terminates when (a) all implementation tasks `done` (advance to gate), (b) next ready task gated for human oversight (gate now), or (c) any non-success outcome above (escalate, do not advance).
- **Gating cadence:** gate after each task if user wants tight oversight; gate after each "slice" (group of tasks satisfying one requirement) for normal cadence; gate once at end of all implementation tasks for autonomous mode (default for trivial features).
- **Suggested skills:** `tdd-cycle` (mandatory inside dev agent — strict red/green/refactor scoped to dispatched task only).
- **Definition of done for stage:** every task in `tasks.md` is `done`; `implementation-log.md` is `complete` (dev agent appends one entry per task).

### Stage 8 — Testing (`/spec:test`)
- **Initial:** dispatch as-is. Qa agent generates `test-plan.md` then runs and reports `test-report.md`.
- **Re-run with feedback:** name failing tests or coverage gaps.

### Stage 9 — Review (`/spec:review`)
- **Initial:** dispatch as-is. Reviewer agent verifies RTM completeness + quality gates.
- **Required:** RTM at `specs/<slug>/traceability.md` must be complete before this exits.

### Stage 10 — Release (`/spec:release`)
- **Initial:** dispatch as-is.
- **Pre-flight check:** confirm `review.md` verdict is `Approved` or `Approved with conditions` (per verdict checkboxes in `templates/review-template.md`). If verdict `Blocked`, return to Stage 9 (Review) — do not dispatch `/spec:release`.
- **Readiness guide:** if the release has multiple stakeholder approvals, user-visible or commercial impact, operational risk, security/privacy/compliance implications, or conditions, expect the release manager to create `release-readiness-guide.md` from `templates/release-readiness-guide-template.md` before finalizing `release-notes.md`.

### Stage 11 — Learning (`/spec:retro`)
- **Mandatory:** runs even on clean ships (per `docs/specorator.md` §3.11).
- **Initial:** dispatch as-is.

## Cross-stage helpers

- **ADR detected mid-stage:** any subagent may flag decision needing ADR. Orchestrator run `/adr:new "<title>"` on user's behalf (after one-question `AskUserQuestion` confirmation) and append dated line to `## Hand-off notes` free-form section of `workflow-state.md` recording ADR path. Do **not** invent `adrs:` frontmatter field — schema in `templates/workflow-state-template.md` is fixed.
- **Domain term coined:** if subagent reports new term, scaffold per-term file at `docs/glossary/<slug>.md` via `/glossary:new "<term>"` (the `new-glossary-entry` skill). Per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md) legacy `ubiquitous-language` → `docs/UBIQUITOUS_LANGUAGE.md` flow deprecated.
- **Context shift:** if subagent reports domain context map changed, dispatch `domain-context` skill to update `docs/CONTEXT.md`.

## What the orchestrator must NOT pass

- Full content of upstream artifacts. Slash command + stage agent read those themselves from disk.
- Implementation details. Orchestrator only knows scope, depth, user's gating choices.
- Conversation history beyond current gating round. Each stage = fresh subagent context.
