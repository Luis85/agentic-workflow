---
description: Stage 2 — Research. Invokes the analyst to produce research.md (alternatives, sources, risks).
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /spec:research

Run **stage 2 — Research**.

1. Resolve slug; verify `specs/<slug>/idea.md` exists and is `complete`. If not, escalate.
2. **Spawn the `analyst` subagent.** Pass the open questions from `idea.md` as the research agenda.
3. The analyst produces `specs/<slug>/research.md` from `templates/research-template.md`:
   - answers each open question (or marks it open with reason),
   - documents ≥ 2 substantively different alternatives,
   - cites sources by URL,
   - lists risks with severity + mitigation,
   - ends with a recommendation.
4. Run the quality gate.
5. Update `workflow-state.md`. Recommend `/spec:requirements` next (or `/spec:clarify` if anything is fuzzy).
