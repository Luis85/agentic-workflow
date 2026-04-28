---
id: IDEA-V04-001
title: Version 0.4 release plan
stage: idea
feature: version-0-4-plan
status: accepted
owner: analyst
created: 2026-04-28
updated: 2026-04-28
---

# Idea — Version 0.4 release plan

## Problem

The README roadmap names v0.4 as "CI quality gates, metrics, maturity model," but the repository has no canonical plan for that release. After v0.3 makes examples and local artifact validation stronger, v0.4 should decide how those checks become repeatable quality signals in CI, how maintainers see workflow health, and how adopters understand their maturity without turning the template into a heavy platform.

## Target users

- Maintainers who need repository-level confidence before merging workflow changes.
- Contributors who need predictable CI feedback that mirrors local verification.
- Template adopters who want a lightweight maturity model for staged adoption.

## Desired outcome

v0.4 should turn local quality signals into a documented CI and reporting layer: CI runs the right gates, metrics summarize workflow health, and a maturity model explains how teams can adopt Specorator progressively.

## Constraints

- v0.4 depends on v0.3 validation scope being implemented or deliberately narrowed.
- Keep CI checks deterministic, low-noise, and aligned with `npm run verify`.
- Avoid collecting private project data or introducing external telemetry.
- Preserve the process-light v0.1/v0.2 posture: CI helps contributors, it does not replace human stage acceptance.

## Open questions

- Which checks should be blocking in CI on pull requests versus advisory or scheduled?
- Which metrics are useful enough to maintain without becoming vanity dashboards?
- What maturity levels should adopters see first: individual practice adoption, repository automation, or team governance?
