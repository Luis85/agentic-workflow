---
description: Project Manager Track — Situational (Change Control). Logs a change request, assesses impact on scope/schedule/budget/risk, and escalates for human decision.
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /project:change

Log and assess a change request (P3.Express D01 — situational). Read [`docs/project-track.md`](../../../docs/project-track.md) §6 before starting.

## Inputs

The user describes a change the client or stakeholder has requested. It may arrive as:
- A Slack/email message forwarded into the conversation.
- A verbal description ("the client wants to add X").
- A newly discovered scope gap.

## Procedure

1. Collect the change details. If unclear, ask: what is being added, changed, or removed?
2. Open `projects/<slug>/followup-register.md`. Append a new entry with:
   - `type: change-request`
   - `description`: what is being requested (plain language, one paragraph)
   - `cause`: who raised it and why
   - `consequence`: what happens if approved vs. rejected
   - `impact`: rate H/M/L overall
   - `response`: filled in steps 3–5
   - `custodian`: TBD until assigned by sponsor
   - `status: open`
   - `dates.raised`: today

3. Assess **scope delta**: what exactly is being added, changed, or removed from `project-description.md` or `deliverables-map.md`? Quote the relevant sections and state the proposed change.

4. Assess **schedule impact**: how many additional days or sprint-weeks does this add to the critical path? If unknown, estimate the range (e.g., "2–5 sprint-days"). Update `deliverables-map.md` by adding a flagged "PENDING APPROVAL" entry.

5. Assess **budget impact**: estimated person-days or story points, and whether this falls within any agreed change budget. Mark `TBD` if cost data is unavailable.

6. Assess **risk delta**: does this change introduce new risks? If yes, add separate `type: risk` entries in `followup-register.md`.

7. Present the four-field assessment to the human and **ask for a decision**: approve / reject / defer.

8. Record the decision:
   - **Approved**: update `followup-register.md` entry `status: in-progress`. Update `project-description.md` and `deliverables-map.md` to incorporate the change (add a dated change note at the top of the relevant section). Update `project-state.md` `last_updated`.
   - **Rejected**: update entry `status: closed`. Note rejection reason.
   - **Deferred**: update entry `status: open`. Set a re-evaluation target date.

## Quality bar

- All four fields (scope / schedule / budget / risk) are populated before escalation. "TBD" is acceptable for cost only when no basis for estimate exists.
- Never approve a change without human confirmation. Never edit `project-description.md` or `deliverables-map.md` before approval.
- Never invent scope items. Only document what the client/stakeholder explicitly requested.
