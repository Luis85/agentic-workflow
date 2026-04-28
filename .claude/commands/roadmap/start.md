---
description: Roadmap Management Track - Bootstrap. Scaffold a roadmap workspace under roadmaps/<slug>/ with state and strategy artifacts.
argument-hint: <roadmap-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /roadmap:start

Bootstrap a roadmap workspace. Read [`docs/roadmap-management-track.md`](../../../docs/roadmap-management-track.md) for the methodology.

## Inputs

- `$1` - roadmap slug (kebab-case, required). Name the product, project, program, or planning scope.

## Procedure

1. If `$1` is missing, ask for a slug and planning scope.
2. If `roadmaps/$1/` exists, stop and recommend the `roadmap-management` skill.
3. Ask for:
   - roadmap owner
   - sponsor or final priority decision owner
   - roadmap scope: product, project, program, or mixed
   - primary audiences: leadership, delivery team, customers/clients, sales/support, or other
   - linked artifacts, if known (`specs/`, `projects/`, `portfolio/`, discovery outputs)
4. Create `roadmaps/$1/`.
5. Copy and fill:
   - `templates/roadmap-state-template.md` -> `roadmaps/$1/roadmap-state.md`
   - `templates/roadmap-strategy-template.md` -> `roadmaps/$1/roadmap-strategy.md`
6. Set `status: active`, `last_updated: <today>`, `last_agent: roadmap-manager`, and document statuses.
7. Print recommended next steps:
   - `/roadmap:shape $1` to build the outcome roadmap and delivery plan
   - `/roadmap:align $1` to prepare stakeholder and team communication

## Don't

- Don't create `roadmap-board.md`, `delivery-plan.md`, `stakeholder-map.md`, `communication-log.md`, or `decision-log.md`; later commands create them when ready.
- Don't edit linked `specs/`, `projects/`, `portfolio/`, or `discovery/` files.
