---
id: RESEARCH-V04-001
title: Version 0.4 release plan — Research
stage: research
feature: version-0-4-plan
status: accepted
owner: analyst
inputs:
  - IDEA-V04-001
created: 2026-04-28
updated: 2026-04-28
---

# Research — Version 0.4 release plan

## Context

The repository already has a local verification suite and GitHub Actions workflow-readiness checks. v0.3 is planned to complete worked examples and strengthen deterministic artifact validation. v0.4 should build on that base by deciding which checks belong in CI, what metrics are worth reporting, and how to present a maturity model for teams adopting the template.

## Current signals

- `npm run verify` already orchestrates script tests, links, ADR index, command docs, script docs, workflow docs, product page checks, frontmatter checks, spec state checks, and traceability checks.
- `scripts/doctor.ts` and `scripts/lib/doctor.ts` already inspect dependency and workflow readiness.
- `docs/daily-reviews/README.md` notes future aggregation of review counts through frontmatter.
- `docs/specorator.md` lists metrics, maturity model, and CI quality gates as future extensions.
- v0.3 plan keeps CI gates, metrics, and maturity model explicitly out of v0.3 scope.

## Alternatives

### Alternative A — CI first, then metrics and maturity from the same evidence

Define PR CI gates around `npm run verify`, add stable machine-readable output where needed, then derive a small metrics report and maturity model from the same checked artifacts.

**Pros:** Keeps one source of truth, avoids duplicate checks, and makes metrics explainable.

**Cons:** Requires care to keep CI from becoming noisy or too slow.

### Alternative B — Metrics dashboard first

Create a metrics report before introducing CI blocking rules.

**Pros:** Gives maintainers visibility without blocking contributors.

**Cons:** Risks measuring drift that CI still allows, and may encourage dashboard work before quality behavior is stable.

### Alternative C — Maturity model first

Document adoption levels and defer automation.

**Pros:** Useful for downstream adopters and low implementation risk.

**Cons:** Does not improve repository merge confidence and may become aspirational rather than evidence-backed.

## Recommendation

Choose Alternative A. v0.4 should establish a small CI quality-gate contract first, then add metrics and maturity language that explicitly derive from the same local and CI evidence.

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RISK-V04-001 | CI blocks contributors for noisy or environment-sensitive checks. | high | Start with deterministic checks and keep advisory reports separate from required PR gates. |
| RISK-V04-002 | Metrics become vanity counts rather than actionable quality signals. | medium | Tie every metric to a decision or maintenance action. |
| RISK-V04-003 | Maturity model feels like process certification. | medium | Present maturity as adoption guidance, not compliance scoring. |
| RISK-V04-004 | v0.4 duplicates v0.3 validation work. | medium | Treat v0.3 validators as inputs and only add CI/reporting/maturity layers. |

## Sources

- `README.md` roadmap row for v0.4.
- `docs/specorator.md` future extensions.
- `specs/version-0-3-plan/requirements.md` and `tasks.md`.
- `package.json` verification scripts.
- Existing workflow readiness logic in `scripts/lib/doctor.ts`.
