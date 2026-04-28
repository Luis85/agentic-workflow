---
description: Report deterministic quality KPIs, maturity, attention signals, and optional trend deltas for the repository or one feature.
argument-hint: "[--feature <slug>] [--compare] [--save] [--json]"
allowed-tools: [Read, Bash]
model: sonnet
---

# /quality:status

Present the current quality KPI status using the [`quality-metrics`](../../skills/quality-metrics/SKILL.md) skill.

## Inputs

- `--feature <slug>` — optional feature scope.
- `--compare` — compare with the latest saved snapshot for the same scope.
- `--save` — persist the current snapshot under `quality/metrics/<scope>/`.
- `--json` — emit machine-readable output for agents, status reports, or dashboards.

## Procedure

1. Run the quality metrics command with the provided arguments:

   ```bash
   npm run quality:metrics -- $ARGUMENTS
   ```

2. Summarize the result for the user:
   - overall workflow score,
   - maturity level, evidence, gaps, and next step,
   - lowest-scoring workflows or current feature score,
   - active blockers and open clarifications,
   - QA checklist gaps or nonconformities,
   - trend deltas when `--compare` is present,
   - saved snapshot path when `--save` is present.

3. If the report shows maturity gaps, blockers, QA gaps, or negative trend movement, recommend the owning workflow action:
   - active feature issue → return to the owning `/spec:*` stage,
   - release readiness concern → run `/quality:start <slug> <scope>` or fix the release gate,
   - recurring drift → save snapshots and review the trend in `/spec:retro` or a Quality Assurance Track review.

## Don't

- Don't call the KPI report certification, audit approval, or human acceptance.
- Don't hide blockers because the overall score is high.
- Don't mark a lifecycle gate complete based only on this command; use the relevant stage gate and critic review.
