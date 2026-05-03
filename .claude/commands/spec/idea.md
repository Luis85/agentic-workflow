---
description: Stage 1 — Idea. Invokes the analyst to produce idea.md from a brief.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /spec:idea

Run **stage 1 — Idea**.

1. Resolve the feature slug from `$1` or by inspecting `specs/` for the active feature.
2. Confirm `specs/<slug>/workflow-state.md` exists; if not, propose `/spec:start <slug>` first.
3. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
4. **Spawn the `analyst` subagent** with the brief (the user's prompt + any prior notes in the workflow-state).
5. The analyst produces `specs/<slug>/idea.md` from `templates/idea-template.md` and runs the quality gate at the bottom.
6. Update `workflow-state.md`: mark `idea.md: complete` (or `in-progress` if blocked), set `current_stage: research`, append a hand-off note.
7. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch. Do not mark PR ready yet — PR stays draft through planning stages.
8. Recommend `/spec:research` next.
