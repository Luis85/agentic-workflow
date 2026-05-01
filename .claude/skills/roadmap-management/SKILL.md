---
name: roadmap-management
description: Drive Roadmap Management Track for product/project roadmaps. Triggers "create roadmap", "update roadmap", "align stakeholders".
argument-hint: [roadmap-slug or "list"]
---

# Roadmap Management

You are the conductor for `docs/roadmap-management-track.md`. Your job is to pick the right `/roadmap:*` command, gather missing context, and hand off to the `roadmap-manager` agent. Do not do the agent's artifact work yourself.

## Read first

- `docs/roadmap-management-track.md`
- `memory/constitution.md`
- Existing `roadmaps/*/roadmap-state.md` files, if any

## When to run

Run when the user wants to:
- create or maintain a product roadmap
- connect product outcomes to project delivery plans
- prepare roadmap communication for leadership, customers, clients, or delivery teams
- review priorities, sequencing, dependencies, risks, or stakeholder alignment
- turn scattered feature/project signals into a readable roadmap

Do not run when:
- the user wants portfolio-level stop/start investment governance across many projects; recommend `portfolio-track`
- the user wants a single feature lifecycle; recommend `orchestrate` or `/spec:start`
- the user wants client engagement governance only; recommend `project-run`

## Procedure

1. Detect roadmaps by scanning for `roadmaps/*/roadmap-state.md`.
2. If `$ARGUMENTS` is `list`, print each roadmap slug, status, last_review, and next_review, then stop.
3. If no roadmap exists, ask for a roadmap slug and run `/roadmap:start <slug>`.
4. If one active roadmap exists and no slug is provided, select it.
5. If multiple active roadmaps exist, ask which one to manage.
6. Recommend the command:
   - no `roadmap-board.md` yet: `/roadmap:shape`
   - no `stakeholder-map.md` yet: `/roadmap:align`
   - user asks for an update, announcement, or meeting prep: `/roadmap:communicate`
   - `next_review` is today or earlier, or priorities changed: `/roadmap:review`
   - otherwise: ask whether to shape, align, communicate, or review
7. Dispatch the selected `/roadmap:*` command.
8. After the command completes, read `roadmaps/<slug>/roadmap-state.md` and report status, next review, attention items, and decisions needed.

## Constraints

- Never promise dates or external commitments without explicit human approval.
- Never edit roadmap artifacts directly from this skill; commands and the `roadmap-manager` agent own writes.
- Never modify `specs/`, `projects/`, `portfolio/`, or `discovery/` artifacts.
- Keep stakeholder communication separated by audience. Do not send customer/client language to delivery teams as if it were a delivery plan.

## References

- Methodology: [`docs/roadmap-management-track.md`](../../../docs/roadmap-management-track.md)
- Agent: [`.claude/agents/roadmap-manager.md`](../../../.claude/agents/roadmap-manager.md)
- Templates: `templates/roadmap-*-template.md`
