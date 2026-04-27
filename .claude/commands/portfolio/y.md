---
description: Portfolio Track — Y Cycle (Monthly Tactical Review). Evaluates stakeholder satisfaction (Y1), project health (Y2), plans improvements (Y3), and produces a focused communication (Y4). Updates portfolio-progress.md and portfolio-improvements.md.
argument-hint: <portfolio-slug>
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /portfolio:y

Run the **Monthly Tactical Cycle (Y)** for a portfolio. Delegates to the `portfolio-manager` agent.

## Inputs

- `$1` — portfolio slug (required or auto-detected from single active portfolio).
- `portfolio/$1/portfolio-state.md` — cycle state.
- `portfolio/$1/portfolio-definition.md` — scope of projects managed (required; if missing, stop and tell the user to run `/portfolio:start`).
- `specs/*/workflow-state.md` — health signals (read-only).
- `specs/*/retrospective.md`, `specs/*/review.md`, `specs/*/release-notes.md` — satisfaction signals (read-only, where present).
- `portfolio/$1/portfolio-improvements.md` — previous improvement plan for carry-overs (read-only, if exists).
- `templates/portfolio-progress-template.md` — template if creating fresh.
- `templates/portfolio-improvements-template.md` — template if creating fresh.

## Procedure

Invoke the `portfolio-manager` agent to run the Y cycle (Y1 → Y2 → Y3 → Y4) as defined in `.claude/agents/portfolio-manager.md`:

1. **Y1** — Evaluate stakeholder satisfaction (🟢/🟡/🔴 per project with cited source).
2. **Y2** — Evaluate ongoing programs/projects (RAG health status from `workflow-state.md`).
3. **Y3** — Plan improvements (write/update `portfolio-improvements.md` with carry-overs).
4. **Y4** — Produce `portfolio-progress.md` as a publishable stakeholder communication.
5. Update `portfolio-state.md`: `last_y` = today, `progress: complete`, `improvements: complete`, cycle history entry, hand-off note.

## Don't

- Don't run Y if `portfolio-definition.md` does not exist — block and tell the user to run `/portfolio:start` first.
- Don't edit `specs/` artifacts.
- Don't carry over improvements without explicitly flagging them as carry-overs with the original deadline preserved.
- Don't make stop/start decisions — surface them in `portfolio-improvements.md` and in "Decisions required from Sponsor".
