---
id: TASKS-CLI-001
title: CLI Todo App — Tasks
stage: tasks
feature: cli-todo
status: complete
owner: planner
inputs:
  - PRD-CLI-001
  - SPECDOC-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Tasks — CLI Todo App — excerpt

> Trimmed top-level excerpt. Full TDD-ordered task list with dependencies and Definitions of Done: [`full/tasks.md`](./full/tasks.md).

## Decomposition (summary)

About a dozen ~half-day tasks decomposed in TDD order:

1. Repository scaffold + module layout.
2. Storage primitives (read/write atomic JSON).
3. Test harness for command-level behaviours.
4. `add` command (test → implement → review).
5. `list` command (test → implement → review).
6. `done` command.
7. `rm` command.
8. Error catalogue + `--help` formatting.
9. Cross-platform smoke (macOS / Linux / Windows).
10. Release readiness (binary build, README, install instructions).

Each task has its own Definition of Done in [`full/tasks.md`](./full/tasks.md).

## Owners

`dev` for implementation tasks; `qa` owns the harness + smoke pass; `release-manager` owns step 10.
