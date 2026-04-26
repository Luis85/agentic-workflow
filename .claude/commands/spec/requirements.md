---
description: Stage 3 — Requirements (PRD). Invokes pm to produce requirements.md with EARS-formatted functional requirements.
argument-hint: [feature-slug]
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /spec:requirements

Run **stage 3 — Requirements**.

1. Resolve slug; verify `idea.md` and `research.md` are `complete`.
2. **Spawn the `pm` subagent.**
3. The PM produces `specs/<slug>/requirements.md` from `templates/prd-template.md`:
   - functional requirements use **EARS notation** (every one, no exceptions),
   - each REQ has a stable ID `REQ-<AREA>-NNN`,
   - non-functional requirements use the structured table,
   - non-goals are stated explicitly,
   - success metrics include a counter-metric,
   - release criteria are specified.
4. Run the quality gate. **Run `/spec:clarify` if any requirement is fuzzy.** Don't accept the PRD with open clarifications.
5. Update `workflow-state.md`. Recommend `/spec:design` next.
