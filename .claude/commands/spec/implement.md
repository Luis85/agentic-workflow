---
description: Stage 7 — Implementation. Routes a single task to dev / qa / sre based on its owner (or hands off to human), appends to implementation-log.md, and stages a per-task commit.
argument-hint: [task-id] [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Bash, Grep]
model: opus
---

# /spec:implement

Run **stage 7 — Implementation** for a single task.

1. Resolve slug and `task-id` from `$1`/`$2` or by inspecting `tasks.md` for the next ready task (dependencies satisfied, no blocker).
2. Look up the task in `tasks.md`. Confirm:
   - dependencies are `done`,
   - the task's owner role,
   - the spec sections it satisfies.
3. **Route by owner** (must match the task template's allowed values):
   - owner=`dev` → spawn `dev` agent.
   - owner=`qa` → spawn `qa` agent (for test tasks; the test must fail initially).
   - owner=`sre` → spawn `sre` agent (for ops / observability / runbook tasks).
   - owner=`human` → **stop**, surface the task to the user, append a hand-off note to `workflow-state.md`, and exit. Do not auto-execute.
   - any other value → escalate as a clarification; the task template restricts owners to `dev | qa | sre | human`.
4. The agent implements the task **to spec**, runs lint/types/unit tests for the changed surface, and **appends an entry** to `implementation-log.md`. (Skipped for `owner=human` — the user owns execution.)
5. **Stage the changes and propose a commit** with imperative mood referencing the task ID:
   ```
   feat(<area>): <task-id> <short title>
   ```
   Per-task commits are local-only and reversible (`git reset --soft HEAD~1` undoes the last). Do not push from this command. If `docs/steering/tech.md` opts out (`auto_commit: false`), stage only and surface the proposed message for the user to commit.
6. Update `workflow-state.md` (and the task's checkbox in `tasks.md`).
7. Recommend the next ready task. Recommend `/spec:test` only when **all non-skipped tasks** in `tasks.md` (every owner: dev / qa / sre / human) are checked done.

## Don't

- Don't bypass the spec. If the spec is unclear, stop and surface a clarification.
- Don't broaden scope to nearby files — open a follow-up task instead.
