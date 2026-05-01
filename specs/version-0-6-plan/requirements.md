---
id: PRD-V06-001
title: Version 0.6 productization and trust plan
stage: requirements
feature: version-0-6-plan
status: accepted
owner: pm
inputs:
  - IDEA-V06-001
  - RESEARCH-V06-001
created: 2026-05-01
updated: 2026-05-01
---

# PRD - Version 0.6 productization and trust plan

## Summary

Plan v0.6 as the productization and trust release: improve first-run adoption, live proof, cross-tool compatibility, deterministic hooks, agentic security governance, and public positioning after v0.5 provides release and package distribution.

## Goals

- Make the template easier to adopt from a released distribution.
- Provide a live, verified golden path that proves the lifecycle works.
- Add first-class adapter surfaces for major AI coding agents.
- Add opt-in deterministic hook packs for common workflow guardrails.
- Add an agentic security review path aligned to current OWASP guidance.
- Clarify product positioning with adoption profiles and evidence-first messaging.
- Track ISO 9001:2026 impact without making premature compliance claims.

## Non-goals

- No Obsidian plugin implementation in v0.6.
- No mandatory new lifecycle stage.
- No replacement for v0.5 release and package publishing.
- No claim of ISO certification, OWASP compliance, or complete agent security coverage.
- No hosted telemetry, external analytics, or user behavior tracking.
- No requirement that downstream projects use every adapter or hook.

## Functional requirements (EARS)

### REQ-V06-001 - Fill Specorator product steering

- **Pattern:** ubiquitous
- **Statement:** The repository shall distinguish Specorator's own product steering from blank downstream steering templates.
- **Acceptance:** The docs explain which steering files describe this repository and where adopters find blank/template steering guidance.
- **Priority:** must
- **Satisfies:** IDEA-V06-001

### REQ-V06-002 - Provide a live golden-path demo

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide a verified golden-path demo that shows a first-time adopter what a successful Specorator run produces.
- **Acceptance:** The demo has expected artifacts, verification steps, and a recorded evidence note replacing the current desk-validation caveat.
- **Priority:** must
- **Satisfies:** IDEA-V06-001, RESEARCH-V06-001

### REQ-V06-003 - Add cross-tool adapter surfaces

- **Pattern:** ubiquitous
- **Statement:** The repository shall define first-class adapter surfaces for supported AI coding tools beyond Claude Code.
- **Acceptance:** Copilot, Codex, and at least one editor-agent adapter path are documented or generated from the canonical instructions, with drift checks or clear maintenance rules.
- **Priority:** must
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-004 - Preserve AGENTS.md as source of truth

- **Pattern:** unwanted behavior
- **Statement:** When adapter files are added, the repository shall not let them become independent sources of truth for workflow rules.
- **Acceptance:** Adapter docs point back to `AGENTS.md`, `.codex/`, `.claude/`, or generated inventories, and verification catches known drift where practical.
- **Priority:** must
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-005 - Add opt-in hook packs

- **Pattern:** optional feature
- **Statement:** Where maintainers enable workflow hooks, the repository shall provide opt-in hook packs for guardrails that must run deterministically.
- **Acceptance:** Hook packs cover at least worktree/main-branch protection, Markdown artifact checks, and secrets/destructive-command guardrails in advisory or dry-run mode first.
- **Priority:** should
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-006 - Document hook safety and disable paths

- **Pattern:** ubiquitous
- **Statement:** The repository shall document hook scope, risk, dry-run behavior, and disable or bypass procedures.
- **Acceptance:** Hook documentation explains authority boundaries, false-positive handling, local disable steps, and which hooks are safe to promote to blocking mode.
- **Priority:** must
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-007 - Add agentic security review path

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide an agentic security review path aligned to OWASP Agentic Applications risk categories.
- **Acceptance:** The path covers goal hijacking, tool misuse, excessive agency, memory or context poisoning, secrets exposure, and human authorization boundaries.
- **Priority:** must
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-008 - Avoid overstated security claims

- **Pattern:** unwanted behavior
- **Statement:** When the repository describes agentic security controls, it shall state limits and avoid implying certification or complete protection.
- **Acceptance:** Public and workflow docs describe the controls as internal risk-reduction guidance, not external certification or guaranteed security.
- **Priority:** must
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-009 - Add adoption profiles

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide adoption profiles that map common users to the smallest useful Specorator surface.
- **Acceptance:** Profiles exist for solo builder, product team, agency/client delivery, enterprise governance, and brownfield migration, each linking to existing docs instead of duplicating them.
- **Priority:** should
- **Satisfies:** IDEA-V06-001

### REQ-V06-010 - Sharpen public evidence-first positioning

- **Pattern:** event-driven
- **Statement:** When v0.6 adds live proof, adapters, hooks, and security guidance, the repository shall update public positioning to emphasize verification evidence and governed adoption.
- **Acceptance:** README and product page language reflect proof, verification, cross-tool support, and clear comparison against lighter spec-driven or prompt-library alternatives.
- **Priority:** should
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-011 - Track ISO 9001:2026 impact

- **Pattern:** event-driven
- **Statement:** When ISO 9001:2026 is published or the project prepares v1.0, the repository shall review the QA track for required updates.
- **Acceptance:** v0.6 adds a watch item or follow-up record that references the expected ISO/FDIS 9001 replacement timeline without changing QA requirements prematurely.
- **Priority:** should
- **Satisfies:** RESEARCH-V06-001

### REQ-V06-012 - Keep v0.6 opt-in and reversible

- **Pattern:** unwanted behavior
- **Statement:** When v0.6 introduces adapters, hooks, or security workflows, the repository shall keep them opt-in unless a later ADR or release plan promotes them.
- **Acceptance:** New surfaces document enablement and disablement, and no default workflow blocks contributors without explicit adoption.
- **Priority:** must
- **Satisfies:** IDEA-V06-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-V06-001 | usability | First-run adoption must be understandable without reading the whole repository. | Golden path plus adoption profiles point to the minimum needed docs. |
| NFR-V06-002 | maintainability | Adapter and hook surfaces must have clear ownership and drift checks where practical. | Generated inventories or validation docs identify source files and expected outputs. |
| NFR-V06-003 | safety | Hooks and security review automation must start opt-in and reversible. | Dry-run/advisory defaults unless explicitly promoted. |
| NFR-V06-004 | portability | New surfaces must preserve Markdown as the canonical artifact format. | No tool-specific data store replaces `specs/`, `docs/`, or `AGENTS.md`. |
| NFR-V06-005 | credibility | Public claims must be backed by repository evidence. | Claims link to demo evidence, verification output, or source docs. |

## Success metrics

- A first-time adopter can identify the right adoption profile in under five minutes.
- The first-feature tutorial no longer carries a "No live run yet" caveat after the demo is executed or replaced by verified evidence.
- At least three non-Claude adapter surfaces are documented or generated with drift rules.
- Hook packs can be enabled in advisory mode without changing the default contributor path.
- Agentic security review guidance exists and states its limits clearly.

## Quality gate

- [x] Functional requirements use EARS and stable IDs.
- [x] Acceptance criteria are testable.
- [x] Non-goals keep v0.6 from absorbing v0.5 publishing or v2.0 plugin work.
