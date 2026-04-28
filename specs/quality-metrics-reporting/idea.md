---
id: IDEA-QMR-001
title: Quality metrics reporting
stage: idea
feature: quality-metrics-reporting
status: accepted
owner: analyst
created: 2026-04-28
updated: 2026-04-28
---

# Idea - Quality metrics reporting

Users adopting this template need a fast way to ask for current project quality status and receive evidence-backed KPIs from their workflow deliverables, docs, and QA records.

## Users

- Template adopters building an information system.
- Claude agents asked to report project quality status.
- Reviewers and project leads preparing for release or quality review.

## Desired outcome

A read-only script reports quality KPIs, and a Claude skill teaches agents when to run it and how to summarize the result.

## Constraints

- The report is deterministic and advisory.
- It does not replace stage quality gates, critic review, or ISO 9001 certification.
- The change remains independent of the v0.3 plan, which deferred broader maturity-model work.
