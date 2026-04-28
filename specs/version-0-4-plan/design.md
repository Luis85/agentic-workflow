---
id: DESIGN-V04-001
title: Version 0.4 release plan — Design
stage: design
feature: version-0-4-plan
status: accepted
owner: architect
inputs:
  - PRD-V04-001
created: 2026-04-28
updated: 2026-04-28
---

# Design — Version 0.4 release plan

## Release shape

v0.4 has three tracks that share evidence:

1. **CI gates:** run deterministic repository checks on pull requests.
2. **Metrics:** summarize workflow health from checked artifacts.
3. **Maturity model:** explain progressive adoption levels using observable evidence.

The tracks should be implemented in that order. CI establishes trustworthy evidence, metrics summarize it, and maturity guidance translates it into adoption steps. The release also needs a structured output that v0.5 can reuse for pre-publish release readiness.

## User path

1. A contributor runs `npm run verify` locally.
2. They open a PR and CI runs the same required gate or a documented subset.
3. A maintainer reviews CI status plus any metrics report.
4. A team reviewing adoption reads the maturity model and compares its repository evidence with the level criteria.

## CI gate model

| Gate type | Purpose | Candidate checks |
|---|---|---|
| Required PR gate | Catch deterministic repository drift before merge. | `npm ci`, `npm run verify` or documented equivalent. |
| Advisory PR report | Surface useful but non-blocking signals. | Metrics report, maturity hints, long-running diagnostics. |
| Scheduled review | Catch slow drift outside active PRs. | Daily or weekly health report after local behavior is stable. |

Initial v0.4 scope should prefer required PR gates and local/advisory metrics. Scheduled automation can be included only if it remains read-only and low-noise.

## Cross-version inputs and outputs

| Direction | Contract |
|---|---|
| From v0.3 | v0.4 consumes the required/advisory validator baseline from v0.3 release readiness notes. |
| To v0.5 | v0.4 exposes deterministic quality signals that release readiness can check before GitHub Release or Package publication. |

v0.4 should avoid reimplementing v0.3 validation checks. It should promote, report, or defer them based on the v0.3 handoff.

## Metrics model

Metrics should be generated from repository artifacts, not external services:

- Workflow counts by status and stage.
- Blocked specs and open clarifications.
- Complete examples and example stage coverage.
- Validation failures by check.
- Skipped artifacts by reason.
- ADR, command, and script documentation drift when existing checks expose it.
- Release-readiness summary fields that v0.5 can consume: required CI status, required validation status, open blockers, open clarifications, and maturity evidence.

Each metric needs an interpretation note: what action it supports and what it must not be used for.

## Maturity model

Suggested levels:

| Level | Name | Evidence |
|---|---|---|
| 0 | Ad hoc | Repo has the template but inconsistent artifact use. |
| 1 | Documented | Core steering, constitution, and lifecycle artifacts exist. |
| 2 | Verified | Local verify gate runs and workflow artifacts pass deterministic checks. |
| 3 | Integrated | PR CI gates mirror local verification and docs stay current. |
| 4 | Managed | Metrics and retrospectives inform maintenance decisions. |
| 5 | Improving | Operational routines and maturity reviews drive continuous improvement. |

The maturity model should be guidance, not certification. It should avoid per-person scoring and avoid implying process compliance beyond the repository evidence.

## Affected surfaces

| Surface | Change type |
|---|---|
| `.github/workflows/` | Add or update PR CI gate workflow. |
| `scripts/verify.ts` | Confirm local and CI command alignment; adjust only if needed. |
| `scripts/doctor.ts`, `scripts/lib/doctor.ts` | Extend workflow readiness checks if CI contract changes. |
| `scripts/metrics*.ts`, `scripts/lib/` | Add deterministic metrics report if implementation chooses a script. |
| `tests/scripts/` | Add tests for metrics and readiness logic. |
| `docs/` | Add CI gate, metrics, and maturity documentation. |
| `README.md` | Link v0.4 plan and update roadmap status when implemented. |
| `sites/index.html` | Review product positioning after implementation. |
| `specs/version-0-5-plan/` | Consume structured release-quality outputs during v0.5 implementation. |

## ADR impact

No ADR is required for this plan. Implementation may need an ADR if v0.4 introduces a mandatory governance gate, changes merge authority, or adds scheduled automation with write permissions.

## Risks and mitigations

- RISK-V04-001: Start with deterministic PR gates and keep advisory reports non-blocking.
- RISK-V04-002: Require every metric to map to a maintenance decision.
- RISK-V04-003: Present maturity as adoption guidance, not compliance scoring.
- RISK-V04-004: Treat v0.3 validators as inputs and avoid reimplementing them in v0.4.
- RISK-V04-005: Keep release-readiness output structured so v0.5 does not scrape prose.
