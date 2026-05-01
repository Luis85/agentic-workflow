---
id: TASKS-V09-001
title: Version 0.9 stakeholder sparring partner plan - Tasks
stage: tasks
feature: version-0-9-plan
status: complete
owner: planner
inputs:
  - PRD-V09-001
  - SPECDOC-V09-001
created: 2026-05-01
updated: 2026-05-01
---

# Tasks - Version 0.9 stakeholder sparring partner plan

### T-V09-001 - Define sparring artifact contract

- **Description:** Add `stakeholder-sparring.md` template and artifact rules, including evidence sources, assumptions, simulation boundary, likely questions, open questions, and follow-up actions.
- **Satisfies:** REQ-V09-006, REQ-V09-010, NFR-V09-001, NFR-V09-004, SPEC-V09-003
- **Owner:** architect
- **Estimate:** M

### T-V09-002 - Add roadmap sparring command or skill

- **Description:** Add `/roadmap:spar <slug> <stakeholder-or-audience>` or equivalent skill path that reads the roadmap workspace and produces preparation output.
- **Satisfies:** REQ-V09-001, REQ-V09-003, REQ-V09-004, REQ-V09-005, NFR-V09-003, SPEC-V09-001
- **Depends on:** T-V09-001
- **Owner:** dev
- **Estimate:** L

### T-V09-003 - Implement evidence collection rules

- **Description:** Reuse or extend roadmap evidence collection so sparring can cite stakeholder map, roadmap board, delivery plan, communication log, decision log, linked lifecycle artifacts, and approved summaries.
- **Satisfies:** REQ-V09-002, REQ-V09-008, NFR-V09-001, NFR-V09-002, SPEC-V09-002
- **Depends on:** T-V09-001
- **Owner:** dev
- **Estimate:** M

### T-V09-004 - Add named-stakeholder guardrails

- **Description:** Document and enforce output rules for named stakeholders, including role-based constraints, assumption labels, and reminders to confirm material points directly.
- **Satisfies:** REQ-V09-007, NFR-V09-002, NFR-V09-004, SPEC-V09-004
- **Depends on:** T-V09-002
- **Owner:** reviewer
- **Estimate:** M

### T-V09-005 - Update roadmap manager guidance

- **Description:** Update `docs/roadmap-management-track.md`, roadmap-manager agent guidance, roadmap-management skill guidance, and command inventories to show how sparring fits between alignment and communication.
- **Satisfies:** REQ-V09-009, NFR-V09-005, SPEC-V09-005
- **Depends on:** T-V09-001, T-V09-002
- **Owner:** pm
- **Estimate:** M

### T-V09-006 - Add validation for sparring artifacts

- **Description:** Add deterministic checks or targeted documented validation for sparring frontmatter, evidence-source sections, simulation labels, and preparation-only boundaries.
- **Satisfies:** REQ-V09-010, NFR-V09-001, NFR-V09-004, SPEC-V09-003
- **Depends on:** T-V09-001
- **Owner:** qa
- **Estimate:** M

### T-V09-007 - Add examples and review scenarios

- **Description:** Add a minimal example roadmap sparring entry and test/review scenarios that cover leadership, delivery-team, customer/client, and sales/support audiences.
- **Satisfies:** REQ-V09-003, REQ-V09-004, REQ-V09-005, REQ-V09-008, SPEC-V09-001, SPEC-V09-002
- **Depends on:** T-V09-002, T-V09-003, T-V09-004
- **Owner:** qa
- **Estimate:** M

### T-V09-008 - Verify v0.9 release readiness

- **Description:** Run targeted roadmap, command-inventory, agent-artifact, link, traceability, and full `npm run verify` checks; document remaining risks and skipped checks.
- **Satisfies:** REQ-V09-001, REQ-V09-002, REQ-V09-003, REQ-V09-004, REQ-V09-005, REQ-V09-006, REQ-V09-007, REQ-V09-008, REQ-V09-009, REQ-V09-010, SPEC-V09-001, SPEC-V09-002, SPEC-V09-003, SPEC-V09-004, SPEC-V09-005
- **Depends on:** T-V09-005, T-V09-006, T-V09-007
- **Owner:** qa
- **Estimate:** S
