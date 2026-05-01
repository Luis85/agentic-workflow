---
id: RESEARCH-V09-001
title: Version 0.9 stakeholder sparring partner plan - Research
stage: research
feature: version-0-9-plan
status: accepted
owner: analyst
inputs:
  - IDEA-V09-001
created: 2026-05-01
updated: 2026-05-01
---

# Research - Version 0.9 stakeholder sparring partner plan

## Context reviewed

- `docs/roadmap-management-track.md` defines `stakeholder-map.md`, `communication-log.md`, and `decision-log.md` as the roadmap alignment and communication source of truth.
- `docs/specorator.md` positions roadmap management as an optional companion track that reads feature/project evidence and may recommend lifecycle work.
- `README.md` roadmap reserves pre-v1.0 releases for workflow hardening and productization.
- The constitution requires plain language, traceability, quality gates, and human ownership of intent, priorities, and acceptance.

## Alternatives considered

### Alternative A - Add a stakeholder sparring workflow to Roadmap Management

Extend `/roadmap:communicate` or add a new roadmap command/skill that assembles stakeholder evidence and produces a role-specific sparring brief or session prompt.

**Pros:** Reuses the existing stakeholder map and roadmap communication artifacts. Keeps the capability close to the user need. Fits pre-v1.0 workflow hardening.

**Cons:** Requires careful boundaries so simulated stakeholder responses are not mistaken for real stakeholder feedback.

### Alternative B - Add a separate stakeholder intelligence track

Create a new track for stakeholder profiles, conversation history, presentation prep, and influence mapping.

**Pros:** More room for a rich stakeholder management model.

**Cons:** Too large before v1.0, duplicates roadmap responsibilities, and risks making stakeholder records feel like a CRM.

### Alternative C - Add only a generic prompt template

Document a prompt that asks an agent to impersonate a stakeholder using manually pasted context.

**Pros:** Fast and lightweight.

**Cons:** Weak traceability, no durable source model, no quality gate, and easy to misuse with unevidenced assumptions.

## Recommendation

Choose Alternative A. v0.9 should implement stakeholder sparring as a bounded Roadmap Management Track extension. The feature should create a durable preparation artifact, define a strict evidence model, and require visible labels for simulated perspective, assumptions, open questions, and real stakeholder feedback.

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RISK-V09-001 | Simulated responses are mistaken for actual stakeholder commitments. | High | Require explicit labels and keep generated sparring outputs separate from sent communication and decision logs. |
| RISK-V09-002 | The agent invents personal motives or private views. | High | Ground output in role, recorded evidence, and declared assumptions only. |
| RISK-V09-003 | Raw past conversations introduce privacy or confidentiality problems. | Medium | Default to committed logs and approved summaries; document raw transcript handling as opt-in. |
| RISK-V09-004 | The workflow duplicates roadmap communication outputs. | Medium | Treat sparring as preparation; sent communications remain in `communication-log.md`. |
| RISK-V09-005 | The first version becomes too broad. | Medium | Limit v0.9 to one roadmap-oriented command or skill, one artifact contract, and deterministic checks where practical. |

## Inputs for requirements

- The source baseline is `stakeholder-map.md`.
- Evidence may include `communication-log.md`, `decision-log.md`, linked specs, project state, roadmap board, delivery plan, and approved conversation summaries.
- The output should support both asynchronous briefs and interactive sparring.
- The feature must preserve human approval for messages and commitments.
