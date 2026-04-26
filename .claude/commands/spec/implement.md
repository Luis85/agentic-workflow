---
description: Stage 7 — Implementation. Invokes dev (or qa for test tasks) to execute one task and append to implementation-log.md.
argument-hint: [task-id] [feature-slug]
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: opus
---

# /spec:implement

Run **stage 7 — Implementation** for a single task.

1. Resolve slug and `task-id` from `$1`/`$2` or by inspecting `tasks.md` for the next ready task (dependencies satisfied, no blocker).
2. Look up the task in `tasks.md`. Confirm:
   - dependencies are `done`,
   - the task's owner role,
   - the spec sections it satisfies.
3. **Spawn the right subagent:**
   - owner=`dev` → `dev` agent.
   - owner=`qa` → `qa` agent (for test tasks; the test must fail initially).
4. The agent implements the task **to spec**, runs lint/types/unit tests for the changed surface, and **appends an entry** to `implementation-log.md`.
5. Commit with imperative mood referencing the task ID:
   ```
   feat(<area>): <task-id> <short title>
   ```
6. Update `workflow-state.md` (and the task's checkbox in `tasks.md`).
7. Recommend the next task or, if all `dev` tasks are done, recommend `/spec:test`.

## Don't

- Don't bypass the spec. If the spec is unclear, stop and surface a clarification.
- Don't broaden scope to nearby files — open a follow-up task instead.
