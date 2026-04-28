---
name: quality-metrics
description: Present deterministic quality KPIs for workflow deliverables, documentation, traceability, QA checklists, blockers, and clarifications. Use when the user asks for current quality status, project KPIs, workflow deliverable health, quality metrics, or an information-system quality report.
argument-hint: "[--feature <slug>] [--json]"
---

# Quality Metrics

Use this skill when the user asks for the current quality status or KPIs of a project built from this template. It reports deterministic signals from repository artifacts; it does not replace the judgment-based Quality Assurance Track.

## Command

Run the repository metrics command:

```bash
npm run quality:metrics
```

For one feature:

```bash
npm run quality:metrics -- --feature <feature-slug>
```

For machine-readable output:

```bash
npm run quality:metrics -- --json
```

## What It Measures

- Workflow deliverable completion from `specs/*/workflow-state.md` and `examples/*/workflow-state.md`.
- Required artifact presence for the Specorator lifecycle.
- Frontmatter coverage on workflow artifacts and Markdown files that require metadata.
- Requirement downstream coverage through spec items, tasks, and tests.
- EARS coverage for functional requirements.
- Open blockers and clarifications in workflow state.
- QA checklist volume and gap/nonconformity counts under `quality/`.
- Stage-aware score so future lifecycle evidence is not treated as a defect while work is still in progress.

## Reporting

Summarize:

- overall workflow score and stage-aware score,
- lowest-scoring workflow KPIs,
- active blockers and open clarifications,
- missing frontmatter or documentation hygiene signals,
- QA checklist gaps and nonconformities,
- whether the result is a deterministic KPI snapshot or a full QA readiness review.

Use `docs/quality-metrics.md` when explaining what a metric means, what action it supports, and what it must not be used to infer.

## Do Not

- Do not call the KPI score an ISO 9001 certification result.
- Do not hide blockers or gaps because the overall score is high.
- Do not mark quality gates complete based only on this script; use the relevant workflow gate and critic review.
