---
title: "plan-recon-bot — operator notes"
folder: "agents/operational/plan-recon-bot"
description: "Operator entry point for plan reconciliation scheduling, scope, and outputs."
entry_point: true
---
# plan-recon-bot — operator notes

Companion to [`PROMPT.md`](./PROMPT.md). Schedules and observes the plan archival routine.

## What it does

Walks `docs/plans/*.md` weekly. For each plan that's clearly done (every row closed, tracker issue closed, ≥14 days quiet), it `git mv`s the file to `docs/archive/plans/` with a one‑line archived banner prepended. Opens **one PR per run** with all moves; falls back to a triage issue when something is ambiguous.

## Why this is a bot, not a slash command

Plans accumulate. Archiving them is rote, but easy to skip — every PR ships in a hurry, plans get marked `[x]` but stay in the active directory, and eventually `docs/plans/` reads as a six‑months‑stale list. A scheduled bot keeps the active list honest.

## Outputs

- **Archive PR:** title `docs(archive): plan reconciliation YYYY-MM-DD`, body lists every move with the evidence.
- **Triage issue:** label `plan-recon-bot`, opened only when no archive happened but there's at least one ambiguous plan that needs owner judgement.

## Setup checklist

1. Create `docs/archive/plans/` (already scaffolded — see [`docs/archive/README.md`](../../../docs/archive/README.md)).
2. Create the `plan-recon-bot` label.
3. Adopt the `YYYY-MM-DD-<slug>.md` naming for plans (see [`docs/plans/README.md`](../../../docs/plans/README.md)).
4. Run `DRY_RUN=1` and read the stdout dump.
5. Schedule weekly (typical: Friday 18:00 UTC, so the resulting PR is ready for Monday triage).

## Tuning

- **Quiet period.** Default 14 days. Shorten to 7 if your release cadence is weekly; lengthen to 30 if you want a higher bar.
- **Successor exception.** Default behaviour archives `superseded` plans even with open rows when the successor's tracker is closed. Disable in the prompt if your team prefers a stricter policy.

## Cost / noise tradeoff

This routine is the lowest‑noise of the seeded bots — most weeks it produces nothing. The cost is purely the schedule overhead. Adopt early if you use plans heavily; skip if your repo doesn't track plans.

## See also

- [`docs/plans/README.md`](../../../docs/plans/README.md) — naming + lifecycle.
- [`docs/archive/README.md`](../../../docs/archive/README.md) — archive convention + immutability.
