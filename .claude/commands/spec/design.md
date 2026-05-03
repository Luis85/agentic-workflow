---
description: Stage 4 — Design. Sequences ux-designer, ui-designer, and architect to produce design.md (Parts A, B, C).
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /spec:design

Run **stage 4 — Design**. This stage has three contributors; sequence them deliberately.

1. Resolve slug; verify `requirements.md` is `complete`. The three design agents read REQ IDs and EARS clauses from `requirements.md` as canonical input — a `skipped` requirements artifact is a hard escalation.
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. Initialise `specs/<slug>/design.md` from `templates/design-template.md` if it doesn't exist.
4. **Check for prior `design-twice` synthesis.** If `specs/<slug>/design-comparison.md` exists, read it and pass its recommendation + rejected-alternatives sections to each of the three design subagents below as additional context. The synthesis is the starting point; do not discard it.
5. **Check for an Arc42 baseline.** If `specs/<slug>/arc42-questionnaire.md` exists with frontmatter `status: answered`, read it and pass the **whole questionnaire** to the `architect` subagent as canonical input for Part C — every section (§1 introduction and goals, §2 constraints, §3 context and scope, §4 solution strategy, §5 building blocks, §6 runtime, §7 deployment, §8 crosscutting, §9 architecture decisions, §10 quality requirements, §11 risks and technical debt, §12 glossary, plus the Part II 12-Factor assessment) is inherited, not re-derived. The architect writes only the feature-specific deltas in `design.md` and links back to the questionnaire instead of duplicating any section. If the questionnaire is missing or `draft` and the feature is architecture-significant (new service boundaries, external integrations, non-trivial non-functional requirements), recommend the user run the `arc42-baseline` skill first before proceeding to Part C.
6. **Spawn `ux-designer`** to fill **Part A — UX**: flows, IA, empty/loading/error states, accessibility. **Wait for the agent to return** before continuing.
7. Once Part A is drafted, **spawn `ui-designer`** to fill **Part B — UI**: screen inventory, components, tokens, microcopy. **Wait for the agent to return** before continuing.
8. Once Parts A and B are drafted, **spawn `architect`** to fill **Part C — Architecture**: components, data flow, decisions, risks, alternatives. The architect drafts any required ADRs directly using `templates/adr-template.md` (it has `Edit`/`Write`); after this command exits, the user may run `/adr:new` to formalise additional ones if needed. (Slash commands are not invoked from inside subagents.)
9. The architect also fills the cross-cutting **Requirements coverage** table — every PRD requirement maps to at least one design section.
10. Run the design quality gate.
11. Update `workflow-state.md`.
12. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch. Do not mark PR ready yet — PR stays draft through planning stages.
13. Recommend `/spec:specify` next.

## Note

For very small features, all three roles may collapse into a single pass. Don't skip *parts*; do collapse the agents.

For architecture-significant features — any project type (SaaS, on-premises, embedded, internal tool, library) where service boundaries, external integrations, or non-trivial non-functional requirements are in scope — run the `arc42-baseline` skill **before** this command. It produces `specs/<slug>/arc42-questionnaire.md` with the cross-cutting decisions already locked, so Part C focuses on the feature-specific deltas.
