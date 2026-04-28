---
description: Roadmap Management Track - Shape. Build or refresh the outcome roadmap and delivery plan for product and project management.
argument-hint: <roadmap-slug>
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /roadmap:shape

Shape or refresh the roadmap. Delegates to the `roadmap-manager` agent.

## Inputs

- `$1` - roadmap slug (required unless exactly one active roadmap exists).
- `roadmaps/$1/roadmap-state.md`
- `roadmaps/$1/roadmap-strategy.md`
- Existing `roadmap-board.md` and `delivery-plan.md`, if present.
- Linked `specs/`, `projects/`, `portfolio/`, and `discovery/` artifacts listed in `roadmap-strategy.md`.
- `templates/roadmap-board-template.md`
- `templates/roadmap-delivery-plan-template.md`

## Procedure

Invoke the `roadmap-manager` agent to:

1. Collect candidate roadmap items from user input and linked artifacts.
2. Convert candidates into outcome hypotheses with measurable success signals.
3. Sort items into `Now`, `Next`, and `Later`.
4. Add confidence, risks, dependencies, owner, decision needed, and source artifact columns.
5. Create or update `roadmap-board.md`.
6. Create or update `delivery-plan.md` for committed or date-sensitive items.
7. Update `roadmap-state.md` document statuses, `last_updated`, and hand-off notes.

## Don't

- Don't turn roadmap items into requirements or tasks.
- Don't commit to external dates without human approval.
- Don't edit files outside `roadmaps/$1/`.
