---
name: quality-metrics
description: Report deterministic quality KPIs (deliverables, traceability, blockers, maturity, trend). Triggers "quality status", "quality metrics".
argument-hint: "[--feature <slug>] [--json] [--compare] [--save]"
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

For a trend baseline or comparison:

```bash
npm run quality:metrics -- --save
npm run quality:metrics -- --compare
```

The slash-command entry point is:

```bash
/quality:status [--feature <feature-slug>] [--compare] [--save] [--json]
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
- Evidence-backed maturity level with evidence, gaps, and next-step guidance.
- Optional saved trend snapshots under `quality/metrics/` for score, maturity, blocker, clarification, frontmatter, and QA-gap deltas.

## Reporting

Summarize:

- overall workflow score and stage-aware score,
- maturity level, evidence, gaps, and next step,
- lowest-scoring workflow KPIs,
- active blockers and open clarifications,
- missing frontmatter or documentation hygiene signals,
- QA checklist gaps and nonconformities,
- trend deltas when `--compare` is used,
- whether the result is a deterministic KPI snapshot or a full QA readiness review.

Use `docs/quality-metrics.md` when explaining what a metric means, what action it supports, and what it must not be used to infer.

## Agent Hooks

- `orchestrator`: use `/quality:status` or this skill when the user asks "what's next?" and quality status would affect the recommendation.
- `qa`: run feature-scoped metrics before finalizing `test-plan.md` or `test-report.md`; include blockers, clarifications, and traceability/test gaps as testing risks.
- `reviewer`: run feature-scoped JSON metrics as deterministic evidence before writing the review verdict; do not let a high score replace review judgment.
- `release-manager`: run `--feature <slug> --compare` before release readiness when a saved baseline exists; otherwise run `--feature <slug>` and disclose that no trend baseline exists.
- `retrospective`: run `--feature <slug> --save` after learning-stage conclusions so future work can compare quality drift.
- `project-manager`, `portfolio-manager`, and `roadmap-manager`: prefer `--json` when folding quality status into reports or dashboards.

## Do Not

- Do not call the KPI score an ISO 9001 certification result.
- Do not hide blockers or gaps because the overall score is high.
- Do not mark quality gates complete based only on this script; use the relevant workflow gate and critic review.
