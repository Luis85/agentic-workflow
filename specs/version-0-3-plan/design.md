---
id: DESIGN-V03-001
title: Version 0.3 release plan — Design
stage: design
feature: version-0-3-plan
status: accepted
owner: architect
inputs:
  - PRD-V03-001
created: 2026-04-28
updated: 2026-04-28
---

# Design — Version 0.3 release plan

## Release shape

v0.3 is a release-planning concern with two implementation tracks:

1. **Example track:** complete the worked example and make it easy to browse.
2. **Validation track:** strengthen deterministic artifact checks and verification docs.

The tracks can ship as separate PRs if each keeps docs and verification consistent. The final v0.3 release readiness pass must name the validation baseline that v0.4 is allowed to promote into CI.

## User path

1. A new evaluator opens the README roadmap and follows the v0.3 plan link.
2. They open `examples/README.md` and choose the complete example.
3. They read the example overview, then inspect artifacts in lifecycle order.
4. A contributor changes or adds artifacts and runs `npm run verify`.
5. Validation reports missing artifacts, inconsistent workflow state, or traceability drift before review.

## Affected surfaces

| Surface | Change type |
|---|---|
| `examples/cli-todo/` | Complete missing lifecycle artifacts and overview. |
| `examples/README.md` | Update status and reading guidance. |
| `scripts/check-spec-state.ts` | Extend or confirm artifact completeness checks. |
| `scripts/check-traceability.ts` | Extend or confirm traceability coverage checks. |
| `tests/scripts/` | Add focused validator tests when behavior changes. |
| `scripts/README.md`, `docs/scripts/` | Document validation commands if script API docs change. |
| `README.md` | Link v0.3 plan and update release status when implemented. |
| `sites/index.html` | Review for user-visible positioning drift after v0.3 implementation. |

## Cross-version handoff

v0.3 is the evidence foundation for v0.4:

- Required validators are candidates for v0.4 PR CI gates.
- Advisory validators remain local or report-only until their false positives are controlled.
- Example completeness metrics become inputs for v0.4 workflow health reporting.
- Any skipped artifact rules must be documented clearly enough for v0.4 maturity criteria.

## Validation behavior

Validators should distinguish:

- **Complete/in-progress artifacts:** file must exist and satisfy required structure.
- **Pending artifacts:** file may be absent.
- **Skipped artifacts:** absence is allowed, but skip reason must be documented in workflow state.
- **Done workflows:** all canonical artifacts must be complete or validly skipped; retrospective must be complete.
- **Examples:** checked by the same state and traceability rules as specs, while staying clearly separate from active product work.

## Alternatives rejected

- **New example first:** Deferred because the existing CLI todo example already provides a low-friction path.
- **Validation-only release:** Rejected because the roadmap promises worked examples and adoption needs a concrete reading path.
- **CI-gated release:** Deferred to v0.4 to avoid combining local validation with CI policy rollout.

## ADR impact

No ADR is required for the plan. v0.3 should only need an ADR if implementation changes lifecycle governance, creates a new mandatory gate, or changes artifact ownership.

## Risks and mitigations

- RISK-V03-001: Keep validators state-aware and add tests for pending and skipped workflows.
- RISK-V03-002: Keep example prose concise and include an overview instead of repeating method docs.
- RISK-V03-003: Name v0.4 deferrals in tasks and PR descriptions.
- RISK-V03-004: Include a product-page review task.
- RISK-V03-005: Prevent v0.4 from guessing the validation baseline by recording required versus advisory checks in v0.3 release notes.
