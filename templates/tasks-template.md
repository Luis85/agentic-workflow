---
id: TASKS-<AREA>-NNN
title: <Feature name> — Tasks
stage: tasks
feature: <feature-slug>
status: draft        # draft | accepted | in-progress | complete
owner: planner
inputs:
  - PRD-<AREA>-NNN
  - SPECDOC-<AREA>-NNN
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Tasks — <Feature name>

Each task ≤ ~½ day, has a stable ID, references ≥ 1 requirement, and has a Definition of Done.

> **TDD ordering:** test tasks for a requirement come **before** the implementation task for that requirement.

> **"May slice" annotation:** A task that touches more than one independent code path or artifact may legitimately ship as several PRs rather than one. Mark such tasks with 🪓 in the heading (in addition to the task-type emoji), and add a `**Slice plan:**` line under the task sketching the expected slices. PR planners should expect the task to land in pieces. The v0.3 retrospective filed this convention after T-V03-003 and T-V03-005 each shipped in multiple slices that were not anticipated by the original `tasks.md`.

## Legend

- 🧪 = test task
- 🔨 = implementation task
- 📐 = design / scaffolding task
- 📚 = documentation task
- 🚀 = release / ops task
- 🪓 = may slice (task touches multiple independent code paths; expect several PRs)

## Task list

### T-<AREA>-001 📐 — <short title>

- **Description:** …
- **Satisfies:** REQ-<AREA>-NNN, SPEC-<AREA>-NNN
- **Owner:** dev | qa | sre | human   *(`/spec:implement` only routes these four; `human` halts the command and hands back to the user)*
- **Depends on:** —
- **Estimate:** S | M (avoid L — split it)
- **Definition of done:**
  - [ ] …
  - [ ] …

### T-<AREA>-002 🧪 — <short title>

- **Description:** …
- **Satisfies:** REQ-<AREA>-NNN
- **Owner:** qa
- **Depends on:** T-<AREA>-001
- **Estimate:** S
- **Definition of done:**
  - [ ] Test exists and references requirement ID in name/metadata.
  - [ ] Test fails on the unimplemented branch.

### T-<AREA>-003 🔨 — <short title>

- **Description:** …
- **Satisfies:** REQ-<AREA>-NNN
- **Owner:** dev
- **Depends on:** T-<AREA>-002
- **Estimate:** M
- **Definition of done:**
  - [ ] T-<AREA>-002 now passes.
  - [ ] Lint + type checks green.
  - [ ] Implementation log entry added.

## Dependency graph

```mermaid
graph TD
  T001 --> T002
  T002 --> T003
  T003 --> T004
```

## Parallelisable batches

Batches whose tasks have no inter-dependencies and can run concurrently:

- **Batch 1:** T-<AREA>-001, T-<AREA>-005
- **Batch 2:** T-<AREA>-002, T-<AREA>-006
- …

---

## Quality gate

- [ ] Each task ≤ ~½ day (estimate S or M).
- [ ] Each task has a stable ID.
- [ ] Each task references ≥ 1 requirement / spec ID.
- [ ] Dependencies explicit.
- [ ] Each task has a Definition of Done.
- [ ] TDD ordering: test tasks precede implementation tasks for the same requirement.
- [ ] Owner assigned per task.
