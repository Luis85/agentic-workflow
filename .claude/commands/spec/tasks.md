---
description: Stage 6 — Tasks. Invokes planner to produce TDD-ordered tasks.md with dependencies and DoDs.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /spec:tasks

Run **stage 6 — Tasks**.

1. Resolve slug; verify `spec.md` is `complete`.
2. **Spawn the `planner` subagent.**
3. The planner produces `specs/<slug>/tasks.md` from `templates/tasks-template.md`:
   - each task ≤ ~½ day (S or M),
   - each task has a stable ID `T-<AREA>-NNN`,
   - each task references ≥ 1 requirement / spec ID,
   - dependencies explicit; dependency graph included,
   - **TDD ordering** — test tasks for a requirement come before implementation tasks for the same requirement,
   - owner assigned per task.
4. Run the quality gate.
5. Update `workflow-state.md`. Recommend `/spec:implement <first-task-id>` next.
