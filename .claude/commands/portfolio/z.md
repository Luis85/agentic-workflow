---
description: Portfolio Track — Z Cycle (Daily Operations). Manages follow-up items (Z1), applies start/stop/pause decisions to portfolio-definition.md (Z2), and balances resources (Z3). Appends to portfolio-log.md.
argument-hint: <portfolio-slug> [decisions e.g. "pause auth-feature"]
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /portfolio:z

Run the **Daily Operations Cycle (Z)** for a portfolio. Delegates to the `portfolio-manager` agent.

## Inputs

- `$1` — portfolio slug (required or auto-detected from single active portfolio).
- `$2+` — any human decisions to apply as Z2 actions, e.g.:
  - `"pause auth-feature"` — sets that project to On Hold in `portfolio-definition.md`.
  - `"start payments-redesign"` — sets that project to Active.
  - `"close legacy-api"` — sets that project to Closed.
  - Multiple decisions may be passed as a quoted string: `"pause auth-feature, start payments-redesign"`.
- `portfolio/$1/portfolio-state.md` — cycle state.
- `portfolio/$1/portfolio-definition.md` — current project registry (required; if missing, stop).
- `portfolio/$1/portfolio-log.md` — previous log entry for Z1 review (read-only for old entries).
- `templates/portfolio-log-template.md` — template for first log entry if file doesn't exist.

## Procedure

Invoke the `portfolio-manager` agent to run the Z cycle (Z1 → Z2 → Z3) as defined in `.claude/agents/portfolio-manager.md`:

1. **Z1** — Review open follow-up items from the last `portfolio-log.md` entry; mark resolved, open, or overdue.
2. **Z2** — Apply decisions from `$2+` arguments to `portfolio-definition.md` (Status column + Change log row). Apply only what was explicitly given — do not infer decisions.
3. **Z3** — Scan `portfolio-definition.md` Resource envelope for contention across Active projects; append dated entry to `portfolio-log.md`.
4. Update `portfolio-state.md`: `last_z` = today, `log: complete`, hand-off note.

## Don't

- Don't make stop/start/pause decisions without explicit input from `$2+` — Z2 applies only what is given.
- Don't edit previous entries in `portfolio-log.md` — it is strictly append-only.
- Don't edit `specs/` artifacts.
- Don't skip updating `portfolio-state.md`.
