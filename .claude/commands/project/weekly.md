---
description: Project Manager Track — Groups C+D (Weekly review). Appends a dated entry to weekly-log.md, updates followup-register.md, and optionally runs period-end activities (E group).
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /project:weekly

Run the P3.Express weekly management cycle (Groups C and D). Read [`docs/project-track.md`](../../../docs/project-track.md) §6 before starting.

## Pre-conditions

- `projects/<slug>/project-state.md` exists and `phase` is `executing`.
- The four management documents exist (run `/project:initiate` first).

## Inputs

- Optional flag `--end-of-period` — if set, also runs E-group (period closure) activities. Set this at the end of each sprint or monthly cycle.

## Procedure

### D group — Daily management catch-up

1. Read each linked `specs/<slug>/workflow-state.md` in `project-state.md`. For each:
   - Note stage, status, and any recent changes.
   - Flag completed stages as accepted deliverables (D02) in the weekly log entry.
2. Open `followup-register.md`. For each open item:
   - Check if the custodian's response deadline has passed. Flag overdue items.
   - Capture any new risks, issues, or changes raised since last week (D01).
   - Update statuses in-place with a dated note.

### C group — Weekly management

3. Calculate RAG status from `deliverables-map.md`:
   - **Schedule**: are milestones on track? Has anything slipped?
   - **Scope**: is any work happening that isn't in `deliverables-map.md`?
   - **Budget**: if cost data is available, compare to `project-description.md` baseline.
4. For any Amber or Red dimension, write a response plan entry in `followup-register.md` (C02).
5. Append a dated entry to `weekly-log.md` (C03, C04):

```markdown
## Week of YYYY-MM-DD

**RAG:** Schedule: 🟢 | Scope: 🟡 | Budget: 🟢

### Feature status
| Feature | Stage | Status | Notes |
|---|---|---|---|
| ... | ... | ... | ... |

### Follow-up register summary
- Open risks: N
- Open issues: N
- Open changes: N
- Overdue items: N
- New this week: ...

### Focused comms note
[One-paragraph update suitable for forwarding to stakeholders]

### Next-week focus
- ...
```

### E group (if `--end-of-period`)

6. Append to `weekly-log.md`:
   - **E01 — Satisfaction**: prompt to human: "Please rate stakeholder satisfaction this period (1–5): [link to register or ask inline]." Record response in `health-register.md`.
   - **E02 — Lessons**: list 2–3 lessons from this period. Add each as `type: lesson` entry in `followup-register.md`. Add improvement actions to `health-register.md`.
   - **E03 — Comms**: period-closure focused-comms note.

7. If the project has been running for ≥4 weeks with no monthly plan revision, flag in the log: "Plan revision recommended — run `/project:initiate` review or update `deliverables-map.md` manually."

## Quality bar

- Every RAG status is derived from actual artifact reads, not estimated.
- Every overdue follow-up item has a new response plan or escalation note.
- The focused-comms note is written in plain language suitable for a non-technical client.

## Don't

- Don't mark deliverables accepted (D02) unless the spec's `workflow-state.md` shows `status: done`.
- Don't update `project-description.md` or `deliverables-map.md` inline — changes go through `/project:change` first.
- Don't invent budget figures — mark `TBD` if cost data isn't available.
