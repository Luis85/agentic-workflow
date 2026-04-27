---
description: Portfolio Track — X Cycle (6-Monthly Strategic Review). Evaluates generated value (X1), optimises the value generation strategy (X2), and produces a stakeholder communication (X3). Updates portfolio-roadmap.md.
argument-hint: <portfolio-slug>
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /portfolio:x

Run the **6-Monthly Strategic Cycle (X)** for a portfolio. Delegates to the `portfolio-manager` agent.

## Inputs

- `$1` — portfolio slug (required). If omitted, check for a single active portfolio under `portfolio/`; use it. If multiple exist, ask.
- `portfolio/$1/portfolio-state.md` — cycle state (read to validate timing).
- `portfolio/$1/portfolio-definition.md` — scope of projects managed.
- `specs/*/workflow-state.md` — project health signals (read-only).
- `specs/*/retrospective.md`, `specs/*/release-notes.md` — value and sentiment signals (read-only, where present).
- `portfolio/$1/portfolio-roadmap.md` — previous roadmap, if it exists.
- `templates/portfolio-roadmap-template.md` — template if creating fresh.

## Timing guard

Before running, check `portfolio/$1/portfolio-state.md`:
- If `last_x` is not null and fewer than 90 days have passed since `last_x`, warn the user:
  > "X cycle last ran <N> days ago (last_x: <date>). P5 Express recommends a 6-monthly cadence. Continue anyway?"
- If the user confirms, proceed. If not, exit.

## Procedure

Invoke the `portfolio-manager` agent to run the X cycle (X1 → X2 → X3) as defined in `.claude/agents/portfolio-manager.md`:

1. **X1** — Evaluate generated value across all projects in the portfolio definition.
2. **X2** — Optimise value generation strategy; update `portfolio-roadmap.md`.
3. **X3** — Produce executive summary section in `portfolio-roadmap.md` for stakeholder distribution.
4. Update `portfolio-state.md`: `last_x` = today, `roadmap: complete`, cycle history entry, hand-off note.

## Don't

- Don't edit `specs/` artifacts.
- Don't make stop/start decisions — surface them for the Portfolio Sponsor.
- Don't skip updating `portfolio-state.md`.
