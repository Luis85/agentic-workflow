---
id: RESEARCH-QMR-001
title: Quality metrics reporting research
stage: research
feature: quality-metrics-reporting
status: accepted
owner: analyst
inputs:
  - IDEA-QMR-001
created: 2026-04-28
updated: 2026-04-28
---

# Research - Quality metrics reporting

## Questions

- Which signals already exist in the repository?
- Which report shape is useful to humans and agents?
- Which signals should remain advisory instead of blocking verification?

## Findings

- `docs/quality-framework.md` defines six quality dimensions and per-stage gates.
- `specs/*/workflow-state.md` records artifact status, blockers, and clarifications.
- `docs/traceability.md` defines stable requirement, spec, task, and test IDs.
- `quality/` is the sink for QA reviews and checklist evidence.
- Existing script conventions use TypeScript CLI entries, reusable logic under `scripts/lib/`, tests under `tests/scripts/`, and generated TypeDoc references.

## Alternatives

- Add a failing `check:*` gate. Rejected for now because quality status can be incomplete during active project work.
- Add a read-only KPI command. Selected because it supports reporting without blocking local verification.

## Risks

- Medium: users may overinterpret a KPI score as certification. Mitigated by skill and docs language.
- Low: metrics may miss judgment-based quality defects. Mitigated by positioning the command as deterministic evidence for review.
