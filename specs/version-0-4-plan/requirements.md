---
id: PRD-V04-001
title: Version 0.4 release plan
stage: requirements
feature: version-0-4-plan
status: accepted
owner: pm
inputs:
  - IDEA-V04-001
  - RESEARCH-V04-001
created: 2026-04-28
updated: 2026-04-28
---

# PRD — Version 0.4 release plan

## Summary

Plan v0.4 as the quality-signal release: CI quality gates, evidence-backed metrics, and a lightweight maturity model that help maintainers and adopters understand workflow health without changing the lifecycle.

## Goals

- Define which repository checks run in CI and which are blocking.
- Provide a small metrics report that summarizes workflow health from existing artifacts.
- Document a maturity model for progressive adoption of Specorator.
- Keep CI, metrics, and maturity aligned with local verification and v0.3 artifact validation.
- Produce release-quality signals that v0.5 can use before publishing releases and packages.

## Non-goals

- No external telemetry, hosted dashboard, or analytics service.
- No mandatory new lifecycle stage.
- No replacement for human stage acceptance.
- No certification or compliance claim.
- No implementation of new v0.3 validators; v0.4 consumes the v0.3 validation baseline.

## Functional requirements (EARS)

### REQ-V04-001 — Define pull request CI gates

- **Pattern:** ubiquitous
- **Statement:** The repository shall define a pull request CI gate that runs the deterministic verification checks required for template contributions.
- **Acceptance:** The CI workflow documents the commands it runs, mirrors `npm run verify` where practical, and separates blocking checks from advisory checks.
- **Priority:** must
- **Satisfies:** IDEA-V04-001

### REQ-V04-002 — Preserve local-first verification

- **Pattern:** ubiquitous
- **Statement:** The repository shall keep `npm run verify` as the local source of truth for checks contributors can run before opening a PR.
- **Acceptance:** CI commands are documented as equivalent to or narrower than local verification, and contributors can reproduce failures locally.
- **Priority:** must
- **Satisfies:** RESEARCH-V04-001

### REQ-V04-003 — Report workflow health metrics

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide a deterministic metrics report that summarizes workflow health from repository artifacts.
- **Acceptance:** Metrics include actionable counts such as active specs by stage, blocked specs, skipped artifacts, open clarifications, validation failures, and completed examples when data exists.
- **Priority:** must
- **Satisfies:** RESEARCH-V04-001

### REQ-V04-004 — Document metric interpretation

- **Pattern:** ubiquitous
- **Statement:** The repository shall document what each metric means, when it should trigger action, and what it must not be used to infer.
- **Acceptance:** Metrics documentation distinguishes quality signals from productivity scoring and avoids individual contributor measurement.
- **Priority:** must
- **Satisfies:** RESEARCH-V04-001

### REQ-V04-005 — Define adoption maturity levels

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a maturity model that describes progressive adoption levels for teams using Specorator.
- **Acceptance:** The model includes clear level names, entry criteria, evidence examples, and next-step guidance tied to existing artifacts and checks.
- **Priority:** must
- **Satisfies:** IDEA-V04-001

### REQ-V04-006 — Keep maturity evidence-backed

- **Pattern:** unwanted behavior
- **Statement:** When the maturity model assigns or suggests a level, the template shall base that level on observable repository evidence rather than subjective scoring alone.
- **Acceptance:** Each maturity level maps to observable artifacts, checks, or documented practices.
- **Priority:** must
- **Satisfies:** RESEARCH-V04-001

### REQ-V04-007 — Review public positioning

- **Pattern:** event-driven
- **Statement:** When CI gates, metrics, or the maturity model are implemented, the release shall review public docs and the product page for stale positioning.
- **Acceptance:** README, `docs/specorator.md`, relevant docs, and `sites/index.html` are updated or explicitly marked unaffected.
- **Priority:** should
- **Satisfies:** IDEA-V04-001

### REQ-V04-008 — Consume v0.3 validation baseline

- **Pattern:** event-driven
- **Statement:** When v0.3 identifies required and advisory validation checks, v0.4 shall use that baseline to choose required CI gates and advisory reports.
- **Acceptance:** v0.4 CI gate documentation names the v0.3 baseline source and explains any check promoted, deferred, or downgraded.
- **Priority:** must
- **Satisfies:** RESEARCH-V04-001

### REQ-V04-009 — Expose release-quality signals for v0.5

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide quality signals that a later release workflow can use before publishing GitHub Releases or Packages.
- **Acceptance:** Metrics or readiness output includes CI status, validation status, open blockers, open clarifications, and maturity level evidence in a deterministic format.
- **Priority:** must
- **Satisfies:** RESEARCH-V04-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-V04-001 | reliability | CI gates must be deterministic and low-noise. | No check depends on external network calls except dependency installation and GitHub-hosted workflow execution. |
| NFR-V04-002 | maintainability | Metrics and maturity logic must reuse existing parsers and workflow schema where possible. | Shared logic lives under `scripts/lib/`; tests cover non-trivial behavior. |
| NFR-V04-003 | privacy | Metrics must stay local to the repository and avoid personal performance tracking. | No external telemetry and no per-person productivity metrics. |
| NFR-V04-004 | usability | Maturity guidance must be actionable for small teams and solo builders. | Each level has next-step guidance and examples. |
| NFR-V04-005 | machine readability | Release-quality signals must be usable by later automation without parsing prose. | JSON output or structured diagnostics are available for readiness checks. |

## Success metrics

- Contributors can reproduce CI failures locally with documented commands.
- Maintainers can see active, blocked, and completed workflow health without manually scanning every spec.
- Adopters can identify a realistic next maturity step without treating the model as certification.
- v0.5 release-readiness checks can consume v0.4 quality signals without duplicating metrics logic.

## Quality gate

- [x] Functional requirements use EARS and stable IDs.
- [x] Acceptance criteria are testable.
- [x] Non-goals prevent telemetry, certification, and lifecycle-stage expansion.
