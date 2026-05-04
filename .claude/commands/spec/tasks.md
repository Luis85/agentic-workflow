---
description: Stage 6 — Tasks. Invokes planner to produce TDD-ordered tasks.md with dependencies and DoDs.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /spec:tasks

Run **stage 6 — Tasks**.

1. Resolve slug; verify `spec.md` is `complete`. The planner agent reads `spec.md` as its primary source artifact (see `.claude/agents/planner.md`); a `skipped` upstream removes the canonical input for SPEC→T traceability and must escalate.
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `planner` subagent.**
4. The planner produces `specs/<slug>/tasks.md` from `templates/tasks-template.md`:
   - each task ≤ ~½ day (S or M),
   - each task has a stable ID `T-<AREA>-NNN`,
   - each task references ≥ 1 requirement / spec ID,
   - dependencies explicit; dependency graph included,
   - **TDD ordering** — test tasks for a requirement come before implementation tasks for the same requirement,
   - owner assigned per task.
5. Run the quality gate.
6. Update `workflow-state.md`.
7. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch. Do not mark PR ready yet — PR stays draft through planning stages.
8. Recommend `/spec:implement <first-task-id>` next.
9. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: tasks` and `artifact_path: specs/<slug>/tasks.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
