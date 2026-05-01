---
id: SPECDOC-V06-001
title: Version 0.6 productization and trust plan - Specification
stage: specification
feature: version-0-6-plan
status: accepted
owner: architect
inputs:
  - DESIGN-V06-001
created: 2026-05-01
updated: 2026-05-01
---

# Specification - Version 0.6 productization and trust plan

### SPEC-V06-001 - Specorator steering profile

- **Satisfies:** REQ-V06-001, NFR-V06-001
- **Behavior:** Repository docs distinguish downstream steering templates from Specorator's own product steering and explain which agents should read which source.
- **Acceptance:** A contributor can identify the steering context for template improvements without overwriting adopter-facing template guidance.

### SPEC-V06-002 - Golden-path proof package

- **Satisfies:** REQ-V06-002, NFR-V06-005
- **Behavior:** A verified demo package includes tutorial updates, example artifacts, deterministic validation, and an evidence note with date, commit, commands, and caveats.
- **Acceptance:** The first-feature tutorial no longer relies only on desk validation.

### SPEC-V06-003 - Cross-tool adapter inventory

- **Satisfies:** REQ-V06-003, REQ-V06-004, NFR-V06-002, NFR-V06-004
- **Behavior:** Adapter surfaces for Copilot, Codex, and at least one editor-agent path are documented or generated from canonical workflow sources.
- **Acceptance:** Adapter files point back to `AGENTS.md` and the owning tool-specific directories, and drift ownership is explicit.

### SPEC-V06-004 - Hook pack contract

- **Satisfies:** REQ-V06-005, REQ-V06-006, REQ-V06-012, NFR-V06-003
- **Behavior:** Hook packs are opt-in and start in dry-run or advisory mode, with documented scope, false-positive handling, and disable paths.
- **Acceptance:** Enabling hooks does not silently add irreversible or blocking behavior.

### SPEC-V06-005 - Agentic security review

- **Satisfies:** REQ-V06-007, REQ-V06-008, NFR-V06-003, NFR-V06-005
- **Behavior:** The repository provides an OWASP-aligned review path for autonomous-agent risks and records findings, mitigations, residual risks, and follow-ups.
- **Acceptance:** Security docs describe risk reduction and limits without implying external certification or complete protection.

### SPEC-V06-006 - Adoption profiles

- **Satisfies:** REQ-V06-009, NFR-V06-001
- **Behavior:** Persona adoption profiles route users to the smallest useful Specorator surfaces for their situation.
- **Acceptance:** Profiles link to existing docs and do not duplicate the full method.

### SPEC-V06-007 - Evidence-first public positioning

- **Satisfies:** REQ-V06-010, NFR-V06-005
- **Behavior:** Public docs and product page emphasize verification evidence, live proof, cross-tool support, and governed adoption.
- **Acceptance:** Claims are backed by links to artifacts, checks, examples, or source documentation.

### SPEC-V06-008 - ISO 9001:2026 watch item

- **Satisfies:** REQ-V06-011
- **Behavior:** The repository records a follow-up to review the Quality Assurance Track when ISO 9001:2026 is published or during v1.0 readiness.
- **Acceptance:** QA docs avoid premature requirement changes while preserving a clear review trigger.

## Test scenarios

| ID | Requirement | Scenario | Expected result |
|---|---|---|---|
| TEST-V06-001 | REQ-V06-001 | A contributor searches for Specorator's own product steering. | The correct steering source is explicit and does not erase adopter templates. |
| TEST-V06-002 | REQ-V06-002 | A first-time user follows the golden-path docs. | The docs point to verified artifacts and evidence from a live or deterministic run. |
| TEST-V06-003 | REQ-V06-003 | A Copilot or Codex user looks for native setup files. | The adapter path exists and points to canonical workflow rules. |
| TEST-V06-004 | REQ-V06-004 | Adapter content is compared with canonical instructions. | Drift is prevented by generation, validation, or documented ownership. |
| TEST-V06-005 | REQ-V06-005 | A maintainer enables hook packs in advisory mode. | Hooks report guardrail findings without silently blocking unrelated work. |
| TEST-V06-006 | REQ-V06-006 | A hook false positive occurs. | Docs explain disable, bypass, or remediation steps. |
| TEST-V06-007 | REQ-V06-007 | A reviewer runs the agentic security review path. | Findings cover OWASP-aligned agent risks and human authorization boundaries. |
| TEST-V06-008 | REQ-V06-008 | Public docs describe security controls. | Claims are limited to internal risk reduction and avoid certification language. |
| TEST-V06-009 | REQ-V06-009 | A solo builder or enterprise evaluator chooses a profile. | The profile routes them to a minimal, concrete starting path. |
| TEST-V06-010 | REQ-V06-010 | README and product page are reviewed after v0.6 implementation. | Positioning emphasizes verification, proof, and cross-tool adoption accurately. |
| TEST-V06-011 | REQ-V06-011 | ISO 9001:2026 publication status changes. | A tracked follow-up prompts QA track review before v1.0 or the next QA release. |
| TEST-V06-012 | REQ-V06-012 | A default contributor runs normal verification after v0.6. | New adapters, hooks, and security docs do not impose mandatory opt-in behavior. |
