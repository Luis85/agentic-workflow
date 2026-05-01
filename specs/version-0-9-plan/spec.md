---
id: SPECDOC-V09-001
title: Version 0.9 stakeholder sparring partner plan - Specification
stage: specification
feature: version-0-9-plan
status: accepted
owner: architect
inputs:
  - DESIGN-V09-001
created: 2026-05-01
updated: 2026-05-01
---

# Specification - Version 0.9 stakeholder sparring partner plan

### SPEC-V09-001 - Roadmap sparring command

- **Satisfies:** REQ-V09-001, REQ-V09-003, REQ-V09-004, REQ-V09-005, NFR-V09-003
- **Behavior:** A roadmap sparring command or skill accepts a roadmap slug and stakeholder role or audience, then creates role-specific preparation grounded in the roadmap workspace.
- **Acceptance:** The workflow refuses to proceed without `stakeholder-map.md` and names the selected stakeholder role before generating preparation output.

### SPEC-V09-002 - Evidence collector

- **Satisfies:** REQ-V09-002, REQ-V09-008, NFR-V09-001, NFR-V09-002
- **Behavior:** The workflow collects approved evidence from roadmap artifacts, linked lifecycle artifacts, and optional approved summaries.
- **Acceptance:** Every generated preparation entry lists evidence sources and separates assumptions from sourced facts.

### SPEC-V09-003 - Stakeholder sparring artifact

- **Satisfies:** REQ-V09-006, REQ-V09-010, NFR-V09-004, NFR-V09-005
- **Behavior:** `roadmaps/<slug>/stakeholder-sparring.md` stores preparation-only entries with simulation labels, evidence sources, likely questions, open questions, assumptions, and follow-up actions.
- **Acceptance:** Generated sparring entries are not appended to `communication-log.md` or `decision-log.md` as real feedback or decisions.

### SPEC-V09-004 - Named-stakeholder guardrails

- **Satisfies:** REQ-V09-007, NFR-V09-002, NFR-V09-004
- **Behavior:** For named stakeholders, the workflow constrains output to recorded role, documented requirements, known feedback, and explicit assumptions.
- **Acceptance:** Output avoids unsupported personal claims and includes a reminder to confirm material points with the stakeholder.

### SPEC-V09-005 - Roadmap guidance updates

- **Satisfies:** REQ-V09-009, NFR-V09-005
- **Behavior:** Roadmap docs, agent prompts, skill guidance, and command inventories describe how stakeholder sparring fits between `/roadmap:align` and `/roadmap:communicate`.
- **Acceptance:** A reader can tell that sparring is preparation-only and that sent updates still use `/roadmap:communicate`.

## Test scenarios

| ID | Requirement | Scenario | Expected result |
|---|---|---|---|
| TEST-V09-001 | REQ-V09-001 | The user runs sparring for a roadmap without `stakeholder-map.md`. | The workflow stops and asks for the baseline map. |
| TEST-V09-002 | REQ-V09-002 | The user runs sparring on a complete roadmap workspace. | The preparation entry lists roadmap and linked evidence sources. |
| TEST-V09-003 | REQ-V09-003 | The user selects a delivery-team stakeholder role. | Output includes likely questions, concerns, objections, and decision needs for that role. |
| TEST-V09-004 | REQ-V09-004 | The user asks how to present current project state to leadership. | Output emphasizes outcomes, trade-offs, risk, investment, decisions needed, and overclaiming warnings. |
| TEST-V09-005 | REQ-V09-005 | The user starts an interactive sparring session. | The agent states role, evidence basis, assumptions, and simulation boundary before responding. |
| TEST-V09-006 | REQ-V09-006 | A sparring session generates strong objections. | They are stored only as preparation or assumptions, not as real stakeholder feedback. |
| TEST-V09-007 | REQ-V09-007 | The user selects a named stakeholder. | Output avoids unsupported personal claims and asks the human to confirm important points. |
| TEST-V09-008 | REQ-V09-008 | There are unresolved roadmap and spec questions. | Output groups relevant questions by decision, risk, clarification, or communication gap. |
| TEST-V09-009 | REQ-V09-009 | A roadmap owner reads the docs. | Required inputs, command path, output location, and review rules are clear. |
| TEST-V09-010 | REQ-V09-010 | A malformed sparring artifact is checked. | Targeted validation reports missing labels, evidence sources, or frontmatter where practical. |
