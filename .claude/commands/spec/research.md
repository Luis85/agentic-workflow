---
description: Stage 2 — Research. Invokes the analyst to produce research.md (alternatives, sources, risks).
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, WebSearch, WebFetch]
model: sonnet
---

# /spec:research

Run **stage 2 — Research**.

1. Resolve slug; verify `specs/<slug>/idea.md` exists and is `complete`. (Lean depth produces a stub marked `complete`; Spike depth never invokes this command since stages 3+ are not dispatched.) If `pending`, `in-progress`, `blocked`, or `skipped`, escalate.
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `analyst` subagent.** Pass the open questions from `idea.md` as the research agenda.
4. The analyst produces `specs/<slug>/research.md` from `templates/research-template.md`:
   - answers each open question (or marks it open with reason),
   - documents ≥ 2 substantively different alternatives,
   - cites sources by URL,
   - lists risks with severity + mitigation,
   - ends with a recommendation.
5. Run the quality gate.
6. Update `workflow-state.md`.
7. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch, and mark the PR ready for review.
8. Recommend `/spec:requirements` next (or `/spec:clarify` if anything is fuzzy).
