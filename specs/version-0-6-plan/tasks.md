---
id: TASKS-V06-001
title: Version 0.6 productization and trust plan - Tasks
stage: tasks
feature: version-0-6-plan
status: complete
owner: planner
inputs:
  - PRD-V06-001
  - SPECDOC-V06-001
created: 2026-05-01
updated: 2026-05-01
---

# Tasks - Version 0.6 productization and trust plan

### T-V06-001 - Decide steering profile location

- **Description:** Decide whether Specorator's own steering lives in `docs/steering/`, a new product-specific folder, or another documented location; add an ADR if ownership semantics change.
- **Satisfies:** REQ-V06-001, NFR-V06-001, SPEC-V06-001
- **Owner:** architect
- **Estimate:** M

### T-V06-002 - Fill Specorator product steering

- **Description:** Add or update product, UX, tech, quality, and operations steering for this template repository while preserving blank downstream guidance.
- **Satisfies:** REQ-V06-001, NFR-V06-001, SPEC-V06-001
- **Depends on:** T-V06-001
- **Owner:** pm
- **Estimate:** M

### T-V06-003 - Define golden-path demo contract

- **Description:** Define the demo subject, expected artifacts, evidence note format, validation scope, and success criteria for the first verified adopter path.
- **Satisfies:** REQ-V06-002, NFR-V06-005, SPEC-V06-002
- **Owner:** analyst
- **Estimate:** M

### T-V06-004 - Execute and record golden-path evidence

- **Description:** Run or deterministically validate the golden-path demo, record date/commit/commands/caveats, and update the tutorial to remove desk-only caveats when justified.
- **Satisfies:** REQ-V06-002, NFR-V06-005, SPEC-V06-002
- **Depends on:** T-V06-003
- **Owner:** qa
- **Estimate:** L

### T-V06-005 - Design cross-tool adapter inventory

- **Description:** Map canonical source files to Copilot, Codex, Cursor/Aider, and generic agent adapter surfaces, including ownership and drift policy.
- **Satisfies:** REQ-V06-003, REQ-V06-004, NFR-V06-002, NFR-V06-004, SPEC-V06-003
- **Owner:** architect
- **Estimate:** M

### T-V06-006 - Add first cross-tool adapters

- **Description:** Add or document first-class adapter paths for Copilot, Codex, and at least one editor-agent surface without duplicating workflow authority.
- **Satisfies:** REQ-V06-003, REQ-V06-004, NFR-V06-002, NFR-V06-004, SPEC-V06-003
- **Depends on:** T-V06-005
- **Owner:** dev
- **Estimate:** L

### T-V06-007 - Add adapter drift checks or maintenance docs

- **Description:** Add deterministic checks where practical, or explicit maintenance docs where generation is not yet stable, so adapter surfaces do not silently drift.
- **Satisfies:** REQ-V06-004, NFR-V06-002, SPEC-V06-003
- **Depends on:** T-V06-006
- **Owner:** dev
- **Estimate:** M

### T-V06-008 - Design opt-in hook packs

- **Description:** Define hook packs for worktree, branch, Markdown, secrets/risky commands, and handoff context, including dry-run behavior and promotion criteria.
- **Satisfies:** REQ-V06-005, REQ-V06-006, REQ-V06-012, NFR-V06-003, SPEC-V06-004
- **Owner:** architect
- **Estimate:** M

### T-V06-009 - Implement advisory hook examples

- **Description:** Add opt-in hook examples and docs in advisory or dry-run mode, with disable and false-positive procedures.
- **Satisfies:** REQ-V06-005, REQ-V06-006, REQ-V06-012, NFR-V06-003, SPEC-V06-004
- **Depends on:** T-V06-008
- **Owner:** dev
- **Estimate:** L

### T-V06-010 - Add agentic security review path

- **Description:** Add an OWASP-aligned agentic security review doc, checklist, or skill covering goal hijacking, tool misuse, excessive agency, memory/context poisoning, secrets exposure, and human authorization boundaries.
- **Satisfies:** REQ-V06-007, REQ-V06-008, NFR-V06-003, NFR-V06-005, SPEC-V06-005
- **Owner:** reviewer
- **Estimate:** L

### T-V06-011 - Add adoption profiles

- **Description:** Add concise persona profiles for solo builder, product team, agency/client delivery, enterprise governance, and brownfield migration.
- **Satisfies:** REQ-V06-009, NFR-V06-001, SPEC-V06-006
- **Owner:** pm
- **Estimate:** M

### T-V06-012 - Update evidence-first public positioning

- **Description:** Update README and product page language for live proof, cross-tool adapters, hook guardrails, agentic security, and comparison against lighter spec-driven or prompt-library alternatives.
- **Satisfies:** REQ-V06-010, NFR-V06-005, SPEC-V06-007
- **Depends on:** T-V06-004, T-V06-006, T-V06-010, T-V06-011
- **Scope note:** Hook guardrail positioning is deferred until T-V06-009 lands in v0.7; v0.6 public positioning should omit hook-pack claims.
- **Owner:** release-manager
- **Estimate:** M

### T-V06-013 - Add ISO 9001:2026 follow-up

- **Description:** Record a watch item or follow-up issue for QA track review after ISO 9001:2026 publication or during v1.0 readiness.
- **Satisfies:** REQ-V06-011, SPEC-V06-008
- **Owner:** qa
- **Estimate:** S

### T-V06-014 - Verify v0.6 release readiness

- **Description:** Run targeted checks, adapter/hook/security validation, link checks, product page checks, quality metrics, and `npm run verify`; document skipped automation and remaining risks.
- **Satisfies:** REQ-V06-001, REQ-V06-002, REQ-V06-003, REQ-V06-004, REQ-V06-005, REQ-V06-006, REQ-V06-007, REQ-V06-008, REQ-V06-009, REQ-V06-010, REQ-V06-011, REQ-V06-012, SPEC-V06-001, SPEC-V06-002, SPEC-V06-003, SPEC-V06-004, SPEC-V06-005, SPEC-V06-006, SPEC-V06-007, SPEC-V06-008
- **Depends on:** T-V06-012, T-V06-013
- **Owner:** qa
- **Estimate:** S
