---
description: Project Manager Track — Group A (Initiation). Produces project-description.md, deliverables-map.md, and seeds followup-register.md. Gates on human sponsor go/no-go.
allowed-tools: [Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /project:initiate

Run the P3.Express Group A — Initiation activities. Read [`docs/project-track.md`](../../../docs/project-track.md) §6 before starting.

## Pre-conditions

- `projects/<slug>/project-state.md` exists (run `/project:start` first).
- A client brief, statement of work, or equivalent source document is available. If not, ask the user to provide one before continuing.

## Procedure

1. Read `projects/<slug>/project-state.md` to confirm phase is `scaffolded`.
2. Read the client brief / source document (ask user for the path or content if unknown).
3. Draft `project-description.md` from `templates/project-description-template.md`:
   - Purpose and expected benefits (why this project exists; measurable outcomes if stated).
   - Expected cost and duration (indicative ranges; mark as `TBD` if not yet agreed).
   - Scope: explicit in-scope deliverables and explicit out-of-scope exclusions. Every item is a noun (a product or service), not a verb.
   - Requirements and quality expectations: high-level; link to `specs/<slug>/requirements.md` where they exist.
   - Stakeholders: list with name/role, interest level (H/M/L), influence level (H/M/L), and preferred communication channel.
4. Draft `deliverables-map.md` from `templates/deliverables-map-template.md`:
   - Hierarchy of deliverables. At this stage, only the top two levels need detail.
   - Milestones with target dates.
   - Link each deliverable to its planned `specs/<slug>/` folder (even if the folder doesn't exist yet).
5. Seed `followup-register.md` from `templates/followup-register-template.md`:
   - Add initial risks derived from the scope constraints, technology choices, and stakeholder dependencies.
   - Each risk: type=risk, description, cause, consequence, impact (H/M/L), initial response plan, custodian, status=open.
6. Create `health-register.md` from `templates/health-register-template.md`. Add a peer-review entry recording the self-check outcome.
7. Prepare a **go/no-go decision brief** for the human sponsor (one concise summary: what was decided, top 3 risks, recommended action). Present it and ask for approval.
8. On approval:
   - Update `project-state.md`: `phase: executing`, `initiation_status: approved`, `last_updated: <today>`.
   - Append kickoff focused-comms note to `weekly-log.md` (create file from template if needed).
9. On rejection or deferral: record reason in `project-state.md` under `open_blocking_items`.

## Quality bar

- Every scope item is a noun. No verbs, no vague items like "improvements" or "better UX."
- Out-of-scope section is explicitly populated — not left blank.
- Every stakeholder has both interest and influence rated.
- Every risk has a custodian and a response plan.
- No invented figures: mark unknowns `TBD — owner: <name>`.

## Don't

- Don't advance to `executing` without human approval.
- Don't write stakeholder quotes or client data you can't verify — mark as assumption.
- Don't create `specs/` folders — those are created by `/spec:start`.
