# Subagents

One subagent per SDLC role. Each has:

- a **narrow scope** — it owns one stage and does not encroach on others;
- a **narrow tool list** — capability is a permission, not a default;
- a **steering context** — declares which `docs/steering/*.md` files it loads.

| Agent | Owns stage(s) | Tool surface |
|---|---|---|
| [`orchestrator`](orchestrator.md) | cross-cutting hand-off | Read |
| [`analyst`](analyst.md) | Idea, Research | Read, WebSearch, WebFetch |
| [`pm`](pm.md) | Requirements | Read, Edit, Write |
| [`ux-designer`](ux-designer.md) | Design (UX) | Read, Edit, Write |
| [`ui-designer`](ui-designer.md) | Design (UI) | Read, Edit, Write |
| [`architect`](architect.md) | Design (architecture), Specification | Read, Edit, Write |
| [`planner`](planner.md) | Tasks | Read, Edit, Write |
| [`dev`](dev.md) | Implementation | Read, Edit, Write, Bash |
| [`qa`](qa.md) | Testing | Read, Edit, Write, Bash |
| [`reviewer`](reviewer.md) | Review | Read, Edit, Write, Grep, Bash |
| [`release-manager`](release-manager.md) | Release | Read, Edit, Write |
| [`sre`](sre.md) | Operations | Read, Edit, Write, Bash |
| [`retrospective`](retrospective.md) | Learning | Read, Edit, Write |

## Conventions

- **Frontmatter** uses Claude Code's standard fields: `name`, `description`, `tools`, `model`, optionally `color`.
- **`description`** is written in the imperative — Claude reads it to decide *when* to spawn this agent.
- **Body** is the system prompt. Keep it focused; rely on linked docs (`docs/spec-kit.md`, `docs/quality-framework.md`, the relevant template) for detail rather than restating.
- **No agent edits another agent's outputs.** If you need a sibling artifact updated, raise a clarification or hand back to the orchestrator.

## Tool restrictions are deliberate

`qa` doesn't have `Edit` on production code — it changes tests, not source. `reviewer` has `Edit` / `Write` only to produce its own artifacts (`review.md`, `traceability.md`); its prompt forbids editing specs, code, or other agents' outputs. `analyst` doesn't have `Bash` — research doesn't need a shell. Don't broaden these without an ADR.
