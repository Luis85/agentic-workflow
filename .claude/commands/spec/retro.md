---
description: Stage 11 — Learning (Retrospective, mandatory). Invokes the retrospective agent to capture what worked / didn't / actions and propose amendments to the kit.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Grep]
model: sonnet
---

# /spec:retro

Run **stage 11 — Learning**. Mandatory after every feature, including clean ships.

1. Resolve slug; the release should be done (or the feature aborted with a documented reason).
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `retrospective` subagent.** It produces `specs/<slug>/retrospective.md`:
   - outcome (shipped on plan? metrics moved? surprises?),
   - what worked (specific),
   - what didn't (specific),
   - spec adherence (drift assessment),
   - process observations (gates kept / tuned, agents that needed intervention),
   - actions (each with owner + due),
   - amendments (proposed changes to templates / agents / constitution; each non-trivial change opens an ADR),
   - lessons.
4. Update `workflow-state.md`: mark `retrospective.md: complete`, set `status: done`.
5. If amendments touch the kit, the retrospective **drafts** the proposed change inside `retrospective.md` (Actions table); the human (not the agent) sequences any PR against `templates/`, `.claude/agents/`, `docs/quality-framework.md`, or `memory/constitution.md`.
6. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage: retro`, `roadmap_status: shipped`, `updated_at`), push the branch, and mark the PR ready for review.
7. Print closing summary: feature complete; suggest `/spec:start <slug>` for the next feature, plus a list of open action items from the retro.
