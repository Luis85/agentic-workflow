---
id: DESIGN-V09-001
title: Version 0.9 stakeholder sparring partner plan - Design
stage: design
feature: version-0-9-plan
status: accepted
owner: architect
inputs:
  - PRD-V09-001
created: 2026-05-01
updated: 2026-05-01
---

# Design - Version 0.9 stakeholder sparring partner plan

## User flow

1. A roadmap owner maintains `roadmaps/<slug>/stakeholder-map.md` during `/roadmap:align`.
2. Before a meeting or update, the owner runs the stakeholder sparring workflow for one stakeholder role or audience.
3. The workflow reads the stakeholder map, roadmap board, delivery plan, communication log, decision log, linked lifecycle artifacts, and approved conversation summaries.
4. The workflow creates a preparation output with:
   - selected role or audience;
   - evidence sources;
   - current project-state framing;
   - likely questions, objections, and decisions needed;
   - open questions and assumptions;
   - optional sparring prompt boundaries.
5. If the user starts an interactive sparring session, the agent responds as the role while keeping simulation limits visible.
6. The human decides what to send. Sent communication still goes through `/roadmap:communicate` and is logged separately.

## Artifact model

v0.9 should add one preparation artifact under each roadmap workspace:

```text
roadmaps/<slug>/
|-- stakeholder-map.md
|-- communication-log.md
|-- decision-log.md
|-- stakeholder-sparring.md   # preparation-only briefs and session summaries
```

`stakeholder-sparring.md` is append-oriented for preparation records. It must not replace `communication-log.md` or `decision-log.md`.

Each entry should include:

- date;
- requested stakeholder role or named stakeholder;
- purpose;
- evidence sources;
- current-state framing;
- likely questions and concerns;
- open questions;
- assumptions;
- simulation boundary;
- follow-up actions.

## Command and skill surface

Preferred command shape:

```text
/roadmap:spar <slug> <stakeholder-or-audience>
```

The command may be backed by a `roadmap-sparring` skill so tools without slash-command support can use the same method.

## Evidence rules

- Required: `stakeholder-map.md`.
- Recommended: `roadmap-board.md`, `delivery-plan.md`, `communication-log.md`, `decision-log.md`.
- Optional: linked `specs/`, `projects/`, `quality/`, `portfolio/`, issue or PR summaries, and approved conversation-summary files.
- Excluded by default: private raw transcripts, direct-message logs, and unapproved personal notes.

## Safety and UX boundaries

- Start every roleplay output with "Simulation boundary" and "Evidence basis".
- Prefer stakeholder roles over named-person impersonation.
- For named people, use only recorded role, requirements, feedback, and assumptions.
- Keep commitments out of sparring output. Decisions remain human-owned and logged in `decision-log.md`.
- Treat low-evidence claims as questions to ask, not facts to state.

## Affected surfaces

| Surface | Change |
|---|---|
| `docs/roadmap-management-track.md` | Add sparring phase/command, artifact rules, quality gate, and safety boundaries. |
| `.claude/agents/roadmap-manager.md` | Teach the roadmap manager how to run sparring and when to escalate. |
| `.claude/skills/roadmap-management/SKILL.md` | Add the conversational entry path for stakeholder sparring. |
| `templates/` | Add `stakeholder-sparring-template.md` or extend roadmap templates. |
| `scripts/` | Add or extend roadmap validation for sparring artifact structure where practical. |
| `README.md` and command inventory | Document `/roadmap:spar` when implementation lands. |

## Quality gate

- [x] Uses the existing Roadmap Management Track as the owning context.
- [x] Separates preparation-only output from real communication and decisions.
- [x] Names evidence, privacy, and simulation boundaries.
- [x] Keeps v0.9 implementation surfaces bounded.
