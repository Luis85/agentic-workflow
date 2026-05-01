---
id: PRD-V09-001
title: Version 0.9 stakeholder sparring partner plan
stage: requirements
feature: version-0-9-plan
status: accepted
owner: pm
inputs:
  - IDEA-V09-001
  - RESEARCH-V09-001
created: 2026-05-01
updated: 2026-05-01
---

# PRD - Version 0.9 stakeholder sparring partner plan

## Summary

Plan v0.9 as a Roadmap Management Track extension that lets a roadmap agent act as a bounded stakeholder sparring partner. The workflow uses the stakeholder map as the baseline, consumes recorded evidence and open questions, and helps humans rehearse role-specific questions, concerns, and presentation framing before stakeholder communication.

## Goals

- Convert stakeholder maps into practical meeting and communication preparation.
- Support role-specific sparring based on evidence, requirements, decisions, and current state.
- Make open questions and likely stakeholder objections visible before presenting project state.
- Preserve clear boundaries between simulated perspective, evidence, assumptions, and real feedback.
- Keep generated preparation artifacts traceable and reviewable.

## Non-goals

- No replacement for actual stakeholder interviews, approvals, or decisions.
- No claim to infer private beliefs, motives, or unrecorded commitments.
- No CRM, relationship-history database, or persistent personal profiling system.
- No automatic sending of stakeholder communications.
- No ingestion of private raw transcripts by default.

## Functional requirements (EARS)

### REQ-V09-001 - Use stakeholder map as baseline

- **Pattern:** ubiquitous
- **Statement:** The stakeholder sparring workflow shall use `roadmaps/<slug>/stakeholder-map.md` as the baseline for stakeholder roles, needs, stance, cadence, decision ownership, and alignment risks.
- **Acceptance:** Running the workflow without a stakeholder map fails or asks for the missing baseline instead of inventing stakeholder roles.
- **Priority:** must
- **Satisfies:** IDEA-V09-001, RESEARCH-V09-001

### REQ-V09-002 - Collect approved evidence

- **Pattern:** ubiquitous
- **Statement:** The stakeholder sparring workflow shall collect evidence from approved roadmap, project, spec, decision, communication, and conversation-summary artifacts.
- **Acceptance:** The output lists the evidence sources used and distinguishes committed artifacts from optional human-supplied summaries.
- **Priority:** must
- **Satisfies:** RESEARCH-V09-001

### REQ-V09-003 - Generate role-specific questions and concerns

- **Pattern:** event-driven
- **Statement:** When a user selects a stakeholder role, the workflow shall generate likely questions, concerns, objections, and decision needs for that role.
- **Acceptance:** Generated questions cite stakeholder-map fields or evidence artifacts where practical and label unsupported inferences as assumptions.
- **Priority:** must
- **Satisfies:** IDEA-V09-001

### REQ-V09-004 - Prepare audience-specific project-state framing

- **Pattern:** event-driven
- **Statement:** When a user asks how to present current state to a stakeholder role, the workflow shall draft role-specific framing guidance based on current roadmap, delivery, requirement, and open-question state.
- **Acceptance:** The guidance states what to emphasize, what to avoid overclaiming, what decisions are needed, and which open questions should be surfaced.
- **Priority:** must
- **Satisfies:** IDEA-V09-001

### REQ-V09-005 - Support bounded sparring sessions

- **Pattern:** event-driven
- **Statement:** When a user requests a sparring session, the agent shall answer as the selected stakeholder role within explicit simulation boundaries.
- **Acceptance:** The session labels the selected role, evidence basis, assumptions, and simulation limits before role-based responses begin.
- **Priority:** should
- **Satisfies:** IDEA-V09-001

### REQ-V09-006 - Preserve real-feedback boundaries

- **Pattern:** unwanted behavior
- **Statement:** The workflow shall not record generated sparring responses as actual stakeholder feedback, decisions, or commitments.
- **Acceptance:** Generated preparation outputs are stored separately from sent communications and decisions, or clearly marked as preparation-only if referenced elsewhere.
- **Priority:** must
- **Satisfies:** RESEARCH-V09-001, RISK-V09-001

### REQ-V09-007 - Handle named people safely

- **Pattern:** unwanted behavior
- **Statement:** When the selected stakeholder is a named person, the workflow shall constrain responses to the recorded role, known requirements, documented feedback, and explicit assumptions.
- **Acceptance:** Output avoids unsupported personal claims and includes a reminder that the simulation is not a substitute for asking the stakeholder.
- **Priority:** must
- **Satisfies:** IDEA-V09-001, RESEARCH-V09-001

### REQ-V09-008 - Track open questions

- **Pattern:** ubiquitous
- **Statement:** The workflow shall surface open questions relevant to the selected stakeholder role from roadmap, project, spec, and preparation artifacts.
- **Acceptance:** Open questions are grouped by decision needed, risk, requirement clarification, or communication gap.
- **Priority:** must
- **Satisfies:** IDEA-V09-001

### REQ-V09-009 - Add maintainable workflow guidance

- **Pattern:** event-driven
- **Statement:** When stakeholder sparring is introduced, roadmap docs, agent guidance, and command or skill documentation shall explain how to run it and how to review outputs.
- **Acceptance:** A roadmap owner can identify required inputs, output locations, evidence rules, and quality gates without reading implementation code.
- **Priority:** must
- **Satisfies:** RESEARCH-V09-001

### REQ-V09-010 - Verify artifact contracts

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide deterministic validation or documented targeted checks for stakeholder sparring artifacts.
- **Acceptance:** Verification catches missing evidence-source sections, missing simulation labels, or malformed preparation artifact frontmatter where practical.
- **Priority:** should
- **Satisfies:** IDEA-V09-001, RESEARCH-V09-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-V09-001 | traceability | Sparring outputs must cite their source artifacts. | Every preparation artifact lists evidence sources and assumptions. |
| NFR-V09-002 | privacy | Raw conversation ingestion must be opt-in and documented. | Default workflow consumes committed logs and approved summaries only. |
| NFR-V09-003 | usability | A roadmap owner can run the preparation flow from an existing stakeholder map. | One command or skill path produces a useful first brief. |
| NFR-V09-004 | safety | Simulated roleplay must stay visibly bounded. | Output labels simulation, evidence, assumptions, and real-feedback limits. |
| NFR-V09-005 | maintainability | The feature must extend roadmap artifacts without creating a competing stakeholder system. | Docs describe sparring as preparation for roadmap communication. |

## Success metrics

- A roadmap owner can generate a stakeholder-specific preparation brief from a valid roadmap workspace.
- The brief includes likely questions, role-specific framing, relevant open questions, evidence sources, and assumptions.
- Generated sparring output cannot be confused with sent communication or real stakeholder decisions.
- The roadmap-manager guidance explains when to use sparring and when to escalate to a real stakeholder conversation.
- Local verification or targeted checks cover the preparation artifact contract.

## Quality gate

- [x] Functional requirements use EARS and stable IDs.
- [x] Acceptance criteria are testable.
- [x] Non-goals prevent the feature from becoming a CRM, transcript store, or substitute for real stakeholder approval.
