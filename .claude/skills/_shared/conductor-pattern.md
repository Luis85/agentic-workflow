# Conductor pattern (shared)

> Shared scaffolding for workflow-conductor skills. Linked from `orchestrate`, `discovery-sprint`, `sales-cycle`, `stock-taking`, `portfolio-track`. Not auto-loaded — the linking skill keeps trigger logic inline; this file owns the gating + escalation rules. Conductors that do not link this file (`project-run`, `project-scaffolding`, `roadmap-management`, `quality-assurance`, `specorator-improvement`) carry the intake gate inline by reference.

## AskUserQuestion is main-thread only

`AskUserQuestion` works only in the main thread. Subagents cannot ask the user anything. Every clarification happens in the conductor's turn — before, between, or after a phase — never inside a dispatched specialist.

## Intake gate — consult `inputs/` first

Before scoping any new work package, **list `inputs/` non-recursively** and surface every item to the user in a single `AskUserQuestion` (multi-select): "I see N items in `inputs/`. Which are relevant for this work?"

- If `inputs/` is empty, print one line ("`inputs/` is empty — no source material to consult") and proceed.
- **Never auto-extract** zips, PDFs, or compressed archives. If a relevant item is an archive, run a separate `AskUserQuestion` asking for explicit approval to extract.
- Read selected items at depth appropriate to the track. Cite paths into `inputs/` from the canonical artifact (`idea.md`, `chosen-brief.md`, `scope.md`, …) so source lineage stays auditable.
- After the work package is consumed, recommend a retention action (per-track default in [`docs/inputs-ingestion.md`](../../../docs/inputs-ingestion.md)) and let the user decide. Never delete from `inputs/` without confirmation.

Full contract: [`docs/inputs-ingestion.md`](../../../docs/inputs-ingestion.md). Decision: [ADR-0017](../../../docs/adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md).

## Detect resume vs. fresh start

Each conductor stores phase state under a track-specific directory (`specs/`, `discovery/`, `sales/`, `stock-taking/`, `projects/`, `portfolio/`). Always:

1. List the directory and read each state-file's `status` and `last_updated`.
2. Show resumable items (`active | paused | blocked`) recommended-first by `last_updated`.
3. Batch a single `AskUserQuestion`: resume listed item / start new / skip if applicable.
4. No resumable items → skip the menu.

## Per-phase loop

For each phase in the track's defined order:

1. **Pre-flight** — read the state-file, confirm every upstream artifact is `complete` or `skipped`. `pending | in-progress | blocked` = return-to-that-phase signal.
2. **Dispatch** the phase's slash command. Hand off fully — do not duplicate the specialist's work in your own turn.
3. **Wait** for the slash command to finish and the artifact to exist on disk.
4. **Run any opt-in gate** (e.g., `/spec:clarify`, `/spec:analyze`) the user selected for this transition.
5. **Gate with user** via a single `AskUserQuestion`:
   - `Continue to <next phase>` (Recommended)
   - `Pause here` — set `status: paused` (or track-specific equivalent) and exit; resume by re-invoking the conductor.
   - `Re-run <this phase> with feedback` — pass free-text "Other" answer as additional context.
   - Track-specific verdict gates (e.g., sales `pursue / no-go`, discovery `go / no-go / pivot`) when the phase produces a verdict.

Never ask more than one `AskUserQuestion` per gate — batch options.

## When a phase agent escalates

Subagent returns "blocked — needs human input": surface the question to the user via a single `AskUserQuestion`, capture the answer, re-dispatch the same slash command with the answer as additional context. Do not answer on the user's behalf.

## Constraints common to all conductors

- Never do specialist work in the conductor's turn. Drafting an artifact = drifted; stop and dispatch the right subagent.
- Never call `AskUserQuestion` from inside a subagent prompt — it fails silently.
- Never write to the track's state directory directly during normal phase execution; the slash command + specialist own those files. (Track-specific exceptions documented in each conductor.)
- Always update the state-file between phases — delegated to slash commands; conductor verifies.
- Always use the same slug across all artifacts in one engagement.
- Don't invent new sink locations. Use what `docs/sink.md` defines.
