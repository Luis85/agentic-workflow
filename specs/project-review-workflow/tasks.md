---
id: T-PRV-SET
title: Project-review workflow tasks
status: complete
created: 2026-05-03
inputs:
  - specs/project-review-workflow/requirements.md
---

# Tasks — Project-review workflow

## Task list

### T-PRV-001 — Document the workflow

- **Satisfies:** REQ-PRV-001, REQ-PRV-002, REQ-PRV-003, REQ-PRV-004, REQ-PRV-005, REQ-PRV-006
- **Description:** Add `docs/project-review-workflow.md` describing purpose, inputs, outputs, phases, quality gates, agent boundary, and handoff.

### T-PRV-002 — Add templates

- **Satisfies:** REQ-PRV-002, REQ-PRV-003, REQ-PRV-006
- **Description:** Add project-review state, plan, history, findings, and proposals templates.

### T-PRV-003 — Add invocation surfaces

- **Satisfies:** REQ-PRV-001, REQ-PRV-004, REQ-PRV-005
- **Description:** Add `project-reviewer` agent, `project-review` skill, and `/project-review:*` slash commands.

### T-PRV-004 — Update discovery references

- **Satisfies:** REQ-PRV-006
- **Description:** Update AGENTS, Specorator docs, workflow overview, sink documentation, and skill catalog so the workflow is discoverable.

### T-PRV-005 — Verify and deliver

- **Satisfies:** REQ-PRV-001, REQ-PRV-004
- **Description:** Run generated-reference repair where needed, verify locally, commit, push, open an issue, and open a draft PR.

## Quality gate

- [x] Each task references at least one requirement.
- [x] Tasks are scoped to the first draft of the workflow.
- [x] Delivery task includes issue and draft PR handoff.
