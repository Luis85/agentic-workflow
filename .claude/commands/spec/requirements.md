---
description: Stage 3 — Requirements (PRD). Invokes pm to produce requirements.md with EARS-formatted functional requirements.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write]
model: sonnet
---

# /spec:requirements

Run **stage 3 — Requirements**.

1. Resolve slug; verify `idea.md` and `research.md` are each `complete`. Lean depth produces stub artifacts marked `complete` containing the user's brief and a "discovery skipped" note — the PM agent reads those stubs as the source of truth for scope. A `skipped` upstream here means the file genuinely doesn't exist (PM has nothing to read); escalate.
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `pm` subagent.**
4. The PM produces `specs/<slug>/requirements.md` from `templates/prd-template.md`:
   - functional requirements use **EARS notation** (every one, no exceptions),
   - each REQ has a stable ID `REQ-<AREA>-NNN`,
   - non-functional requirements use the structured table,
   - non-goals are stated explicitly,
   - success metrics include a counter-metric,
   - release criteria are specified.
5. Run the quality gate. If any requirement is fuzzy, surface it under **Open clarifications** in `workflow-state.md` and **recommend the user run `/spec:clarify`** before accepting the PRD. Slash commands are user-invoked entry points; this command does not call them itself.
6. Update `workflow-state.md`.
7. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch. Do not mark PR ready yet — PR stays draft through planning stages.
8. Recommend `/spec:design` next (or `/spec:clarify` first if step 5 surfaced any).
9. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: requirements` and `artifact_path: specs/<slug>/requirements.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
