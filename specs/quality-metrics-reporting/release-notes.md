---
id: RELEASE-QMR-001
title: Quality metrics reporting release notes
stage: release
feature: quality-metrics-reporting
status: complete
owner: release-manager
inputs:
  - REVIEW-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# Release notes - Quality metrics reporting

## Summary

Adds `npm run quality:metrics` for current project quality KPI reporting and adds a Claude skill for quality status requests.

## User-visible impact

Template users can ask for quality KPIs and receive a deterministic report from workflow deliverables, traceability, docs, blockers, clarifications, and QA checklists.

## Verification

- `npm run quality:metrics -- --feature=quality-assurance-workflow`
- `npm run verify`

## Limitations

The report is advisory evidence. It does not replace quality gates, critic review, or certification.
