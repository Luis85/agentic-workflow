---
id: PRD-QMR-001
title: Quality metrics reporting
stage: requirements
feature: quality-metrics-reporting
status: accepted
owner: pm
inputs:
  - IDEA-QMR-001
  - RESEARCH-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# PRD - Quality metrics reporting

## Summary

Add deterministic quality KPI reporting for projects that use this template, and expose the procedure to Claude as a reusable skill.

## Functional requirements

### REQ-QMR-001 - Report repository quality KPIs

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a read-only command that reports current quality KPIs from workflow deliverables, Markdown metadata, traceability, blockers, clarifications, and QA checklist records.
- **Acceptance:** `npm run quality:metrics` prints a human-readable KPI report without modifying files.
- **Priority:** must
- **Satisfies:** IDEA-QMR-001, RESEARCH-QMR-001

### REQ-QMR-002 - Scope quality KPIs by feature

- **Pattern:** event-driven
- **Statement:** When a user provides a feature slug, the quality metrics command shall limit workflow KPI reporting to that feature.
- **Acceptance:** `npm run quality:metrics -- --feature <slug>` reports only matching workflow-state data.
- **Priority:** should
- **Satisfies:** IDEA-QMR-001

### REQ-QMR-003 - Emit machine-readable metrics

- **Pattern:** event-driven
- **Statement:** When a user requests JSON output, the quality metrics command shall emit machine-readable repository and workflow KPI data.
- **Acceptance:** `npm run quality:metrics -- --json` emits valid JSON.
- **Priority:** should
- **Satisfies:** RESEARCH-QMR-001

### REQ-QMR-004 - Teach Claude how to report quality status

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a Claude skill for presenting current quality status and KPIs from the metrics command.
- **Acceptance:** `.claude/skills/quality-metrics/SKILL.md` describes triggers, command usage, measured signals, reporting shape, and limitations.
- **Priority:** must
- **Satisfies:** IDEA-QMR-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-QMR-001 | maintainability | The implementation must follow existing repository script conventions. | CLI in `scripts/`, reusable logic in `scripts/lib/`, tests in `tests/scripts/`, generated docs updated. |
| NFR-QMR-002 | accuracy | Metrics must be presented as deterministic evidence, not as certification or final quality-gate approval. | Skill and docs include limitation language. |
