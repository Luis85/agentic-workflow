---
description: Project Manager Track — Group F (Project Closure). Produces project-closure.md and gates on human sponsor sign-off.
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /project:close

Run the P3.Express Group F — Project Closure activities. Read [`docs/project-track.md`](../../../docs/project-track.md) §6 before starting.

## Pre-conditions

- All deliverables have been accepted (D02 — confirmed in `weekly-log.md`).
- OR the project is being formally cancelled (note this in `project-closure.md`).

## Procedure

1. Read `project-description.md`, `deliverables-map.md`, `followup-register.md`, `health-register.md`, and all `weekly-log.md` entries.
2. Read all linked `specs/<slug>/retrospective.md` files for lessons to aggregate.

3. Draft `project-closure.md` from `templates/project-closure-template.md`:

   **F01 — Handover:**
   - What was delivered (deliverables accepted, referenced from `deliverables-map.md`).
   - What was out-of-scope and why (any scope reductions or deferrals, with change log references).
   - Known defects or follow-on work the client should be aware of.
   - Archive pointer: where are the code repos, documents, and access credentials?

   **F02 — Final satisfaction:**
   - Summarise satisfaction scores from `health-register.md` E01 entries.
   - Note any unresolved satisfaction issues.
   - Prompt for a final satisfaction rating (present to human to send to client).

   **F03 — Peer review:**
   - Self-check: are all `followup-register.md` items either `closed` or explicitly carried forward?
   - Are there any open risks that the client's team needs to take ownership of?
   - Is the `deliverables-map.md` fully reconciled (all planned items either delivered, deferred, or removed via change control)?

   **F04 — Archive:**
   - List of all documents in `projects/<slug>/`.
   - Links to `specs/<slug>/` folders in scope.
   - Storage location for any offline assets (contracts, signed documents, emails).
   - Note: the project folder is preserved as historical context, not deleted.

   **F05 — Celebration:**
   - One sentence acknowledging the team's work. (Named activity in P3.Express — not skippable.)

   **F06 — Focused comms:**
   - Closure announcement template: who to notify, what to say, tone.

   **Lessons summary:**
   - Aggregate all `type: lesson` entries from `followup-register.md` and E02 notes in `weekly-log.md`.
   - Group by theme (technical, process, communication, client management).

4. Present the closure document to the human and ask for sign-off.
5. On sign-off: update `project-state.md` to `phase: closed`, `closure_status: accepted`, `last_updated: <today>`.

## Don't

- Don't set `phase: closed` without explicit human approval.
- Don't delete any files — the project folder is preserved.
- Don't open `/project:post` from this command — that runs months later.
