---
id: SPECDOC-V04-001
title: Version 0.4 release plan — Specification
stage: specification
feature: version-0-4-plan
status: accepted
owner: architect
inputs:
  - DESIGN-V04-001
created: 2026-04-28
updated: 2026-04-28
---

# Specification — Version 0.4 release plan

### SPEC-V04-001 — Pull request CI gate

- **Satisfies:** REQ-V04-001, REQ-V04-002, NFR-V04-001
- **Behavior:** Pull requests run a documented deterministic gate that is locally reproducible through `npm run verify` or a clearly documented subset.
- **Acceptance:** CI failure output identifies the failing command, and contributor docs show the local reproduction command.

### SPEC-V04-002 — CI readiness contract

- **Satisfies:** REQ-V04-001, REQ-V04-002, NFR-V04-002
- **Behavior:** Repository readiness checks verify that required workflow files contain the expected checkout, setup, dependency install, and verification steps.
- **Acceptance:** `npm run doctor` or a related check reports missing or malformed CI contract markers.

### SPEC-V04-003 — Workflow metrics report

- **Satisfies:** REQ-V04-003, REQ-V04-004, NFR-V04-002, NFR-V04-003
- **Behavior:** A deterministic report summarizes workflow health using local repository artifacts and emits both human-readable output and machine-readable JSON output for CI and future release automation.
- **Acceptance:** Metrics include active specs by stage, blocked specs, skipped artifacts, open clarifications, validation status, and completed examples when data exists.

### SPEC-V04-004 — Metrics documentation

- **Satisfies:** REQ-V04-004, NFR-V04-003
- **Behavior:** Documentation explains each metric, its decision use, and prohibited interpretations.
- **Acceptance:** Documentation states that metrics are repository health signals, not individual productivity measures.

### SPEC-V04-005 — Maturity model

- **Satisfies:** REQ-V04-005, REQ-V04-006, NFR-V04-004
- **Behavior:** A maturity model defines adoption levels with entry criteria, repository evidence, next steps, and caveats.
- **Acceptance:** Each level maps to observable artifacts, checks, or documented practices.

### SPEC-V04-006 — Public documentation alignment

- **Satisfies:** REQ-V04-007
- **Behavior:** README, workflow docs, and product page positioning are reviewed after v0.4 implementation.
- **Acceptance:** Public docs either describe CI gates, metrics, and maturity model accurately or record why they are unaffected.

### SPEC-V04-007 — v0.3 baseline promotion

- **Satisfies:** REQ-V04-008
- **Behavior:** CI gate design consumes the v0.3 validation baseline and records each candidate check as required, advisory, or deferred.
- **Acceptance:** Required CI gates have a documented v0.3 source, local reproduction command, and false-positive decision.

### SPEC-V04-008 — Release-quality output

- **Satisfies:** REQ-V04-009, NFR-V04-005
- **Behavior:** Metrics or readiness output exposes machine-readable quality signals for required CI status, validation status, open blockers, open clarifications, maturity evidence, and completed examples.
- **Acceptance:** v0.5 release readiness can consume the output without reimplementing metric collection.

## Test scenarios

| ID | Requirement | Scenario | Expected result |
|---|---|---|---|
| TEST-V04-001 | REQ-V04-001 | Open a PR with a deterministic verification failure. | CI reports the failing command and blocks the required gate. |
| TEST-V04-002 | REQ-V04-002 | Run the documented local command for a CI failure. | The same failure is reproducible locally. |
| TEST-V04-003 | REQ-V04-003 | Generate metrics for a repo with active, blocked, and done specs. | Report includes stage/status counts and blocked-state details. |
| TEST-V04-004 | REQ-V04-004 | Review metrics documentation. | Each metric has interpretation guidance and misuse warnings. |
| TEST-V04-005 | REQ-V04-005 | Review the maturity model for a repo at each level. | Each level has criteria, evidence, and next-step guidance. |
| TEST-V04-006 | REQ-V04-006 | Compare maturity criteria against repository evidence. | Criteria reference observable artifacts or checks. |
| TEST-V04-007 | REQ-V04-007 | Review public docs after implementation. | README/docs/product page are updated or explicitly unaffected. |
| TEST-V04-008 | REQ-V04-008 | Compare CI gate choices against the v0.3 validation baseline. | Every baseline check is required, advisory, or explicitly deferred. |
| TEST-V04-009 | REQ-V04-009 | Generate release-quality output for a repository with blockers. | Output includes machine-readable blockers and validation status. |
