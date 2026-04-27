---
description: Project Manager Track — Status Report (on demand). Produces a client-facing status-report.md with RAG traffic lights for schedule, scope, and budget. Replaces the prior version on each run.
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /project:report

Generate a client-facing status report. Read [`docs/project-track.md`](../../../docs/project-track.md) §6 before starting.

## Pre-conditions

- `projects/<slug>/project-state.md` exists and `phase` is `executing`.
- At least one `/project:weekly` entry exists in `weekly-log.md`.

## Procedure

1. Read `project-description.md` — extract project name, client, sponsor, objectives, and timeline baseline.
2. Read `deliverables-map.md` — extract milestone table with baseline targets.
3. Read all linked `specs/<slug>/workflow-state.md` files — extract current stage and status per feature.
4. Read `followup-register.md` — identify open risks (H/M), open issues, and pending change requests.
5. Read the most recent entry in `weekly-log.md` — use its RAG as the starting point.

6. Compute RAG for each dimension:
   - **Schedule**: compare milestone actuals to targets. Apply thresholds from `docs/project-track.md` §9.3.
   - **Scope**: any unapproved changes in flight? Any deliverables removed without a change request?
   - **Budget**: if cost data exists, compare actuals to `project-description.md` baseline.

7. Write `status-report.md` (replace the entire file):

```markdown
---
project: <slug>
client: <name>
report-date: YYYY-MM-DD
prepared-by: project-manager
---

# Project Status Report — <Project Name>

**Period:** <start date> to <end date>

## Summary

[2–3 sentence executive summary in plain language. Lead with the most important news — good or bad.]

## Status

| Dimension | Status | Summary |
|---|---|---|
| Schedule | 🟢 / 🟡 / 🔴 | [one line] |
| Scope | 🟢 / 🟡 / 🔴 | [one line] |
| Budget | 🟢 / 🟡 / 🔴 | [one line] |

## Milestone progress

| Milestone | Planned | Forecast | Status |
|---|---|---|---|
| ... | ... | ... | 🟢 / 🟡 / 🔴 |

## Feature delivery

| Feature | Stage | Progress |
|---|---|---|
| [linked to specs/slug] | [stage name] | [% complete or stage] |

## Open risks and issues

| # | Type | Description | Impact | Custodian | Status |
|---|---|---|---|---|---|
| ... | risk/issue | ... | H/M/L | ... | open |

## Change requests

| # | Description | Status |
|---|---|---|
| ... | ... | pending approval / approved / rejected |

## Next milestone

**[Milestone name]** — target: [date]

What must happen to reach it: [bullet list]

## PM commentary

[Optional: context, trends, caveats, or anything the RAG status doesn't capture. Keep to 3–4 sentences.]
```

8. Update `project-state.md`: set `last_report_date: <today>` and `last_updated: <today>`.

## Quality bar

- Every RAG status derived from actual artifact data, not estimated or assumed.
- Executive summary is written in non-technical language — suitable for a client sponsor who doesn't read specs.
- Never include internal team commentary, individual performance notes, or anything that isn't appropriate for a client audience.
- If budget data is unavailable, omit the budget row and note it as "not tracked — fixed-fee engagement" or "TBD".

## Don't

- Don't invent milestone dates, completion percentages, or cost figures.
- Don't copy raw content from `weekly-log.md` directly — the status report is synthesised, not a dump.
- Don't email or share the report — leave that to the user.
