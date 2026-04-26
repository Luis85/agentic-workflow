---
description: Stage 11 — Retrospective (mandatory). Invokes retrospective agent to capture what worked / didn't / actions and propose amendments to the kit.
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write, Grep]
model: sonnet
---

# /spec:retro

Run **stage 11 — Learning**. Mandatory after every feature, including clean ships.

1. Resolve slug; the release should be done (or the feature aborted with a documented reason).
2. **Spawn the `retrospective` subagent.** It produces `specs/<slug>/retrospective.md`:
   - outcome (shipped on plan? metrics moved? surprises?),
   - what worked (specific),
   - what didn't (specific),
   - spec adherence (drift assessment),
   - process observations (gates kept / tuned, agents that needed intervention),
   - actions (each with owner + due),
   - amendments (proposed changes to templates / agents / constitution; each non-trivial change opens an ADR),
   - lessons.
3. Update `workflow-state.md`: mark `retrospective.md: complete`, set `status: done`.
4. If amendments touch the kit, the retrospective opens follow-up tasks (or PRs) against `templates/`, `.claude/agents/`, `docs/quality-framework.md`, or `memory/constitution.md`.
