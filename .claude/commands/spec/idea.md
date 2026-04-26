---
description: Stage 1 — Idea. Invokes the analyst to produce idea.md from a brief.
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write, WebSearch]
model: sonnet
---

# /spec:idea

Run **stage 1 — Idea**.

1. Resolve the feature slug from `$1` or by inspecting `specs/` for the active feature.
2. Confirm `specs/<slug>/workflow-state.md` exists; if not, propose `/spec:start <slug>` first.
3. **Spawn the `analyst` subagent** with the brief (the user's prompt + any prior notes in the workflow-state).
4. The analyst produces `specs/<slug>/idea.md` from `templates/idea-template.md` and runs the quality gate at the bottom.
5. Update `workflow-state.md`: mark `idea.md: complete` (or `in-progress` if blocked), set `current_stage: research`, append a hand-off note.
6. Recommend `/spec:research` next.
