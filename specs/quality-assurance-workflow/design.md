---
id: DESIGN-QAW-001
title: Quality Assurance Track design
stage: design
feature: quality-assurance-workflow
status: accepted
owner: architect
inputs:
  - PRD-QAW-001
created: 2026-04-28
updated: 2026-04-28
---

# Design — Quality Assurance Track

The Quality Assurance Track is an opt-in companion workflow, not a new lifecycle stage. It owns a separate `quality/<slug>/` artifact tree so it can review projects, portfolios, releases, suppliers, or active feature folders without taking ownership away from lifecycle agents.

## Command flow

`/quality:start` -> `/quality:plan` -> `/quality:check` -> `/quality:review` -> `/quality:improve`

## Artifact flow

`quality-state.md` anchors scope and phase state. `quality-plan.md` defines readiness criteria and checklist set. `checklists/project-execution.md` stores evidence-backed checks. `quality-review.md` records readiness and findings. `improvement-plan.md` records corrective actions and effectiveness checks.

## Decision

No ADR required. This adds an optional workflow track and does not change lifecycle stage ownership, the constitution, or architecture.
