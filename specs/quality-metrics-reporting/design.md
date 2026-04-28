---
id: DESIGN-QMR-001
title: Quality metrics reporting design
stage: design
feature: quality-metrics-reporting
status: accepted
owner: architect
inputs:
  - PRD-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# Design - Quality metrics reporting

## Approach

Use a read-only TypeScript CLI backed by reusable library functions. The CLI prints Markdown by default and JSON on request.

## Components

- `scripts/quality-metrics.ts` parses CLI flags and renders output.
- `scripts/lib/quality-metrics.ts` scans repository artifacts and computes KPIs.
- `tests/scripts/quality-metrics.test.ts` verifies collection and rendering against repository fixtures.
- `.claude/skills/quality-metrics/SKILL.md` describes agent usage and limitations.

## Quality signals

- Workflow artifact completion and presence.
- Frontmatter coverage on lifecycle artifacts and required metadata docs.
- Requirement downstream coverage through specs, tasks, and tests.
- EARS usage for functional requirements.
- Workflow blockers and open clarifications.
- QA checklist items and gap/nonconformity counts.

## Alternatives

- Failing verify check: rejected because active projects legitimately have incomplete metrics.
- Static dashboard: deferred until a maturity model exists.
