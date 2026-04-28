---
description: Roadmap Management Track - Align. Build stakeholder map and team communication plan for a roadmap.
argument-hint: <roadmap-slug>
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /roadmap:align

Align stakeholders and prepare team communication. Delegates to the `roadmap-manager` agent.

## Inputs

- `$1` - roadmap slug.
- `roadmaps/$1/roadmap-state.md`
- `roadmaps/$1/roadmap-strategy.md`
- `roadmaps/$1/roadmap-board.md`, if present.
- `roadmaps/$1/delivery-plan.md`, if present.
- `templates/roadmap-stakeholder-map-template.md`
- `templates/roadmap-communication-log-template.md`

## Procedure

Invoke the `roadmap-manager` agent to:

1. Identify stakeholder groups and decision owners.
2. Record influence, interest, stance, information needs, cadence, and channel in `stakeholder-map.md`.
3. Identify alignment risks, conflicting priorities, and missing decision owners.
4. Draft audience-specific communication guidance for leadership, delivery team, customers/clients, and supporting teams.
5. Create or update `communication-log.md` with planned communications.
6. Update `roadmap-state.md`.

## Don't

- Don't send or imply communication has been sent unless the human says it was sent.
- Don't use one message for every audience. Tailor by audience and decision need.
- Don't edit downstream delivery artifacts.
