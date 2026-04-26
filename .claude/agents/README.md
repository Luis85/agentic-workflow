# Subagents

One subagent per SDLC role. Each has:

- a **narrow scope** — it owns one stage and does not encroach on others;
- a **narrow tool list** — capability is a permission, not a default;
- a **steering context** — declares which `docs/steering/*.md` files it loads.

| Agent | Owns stage(s) | Tool surface |
|---|---|---|
| [`orchestrator`](orchestrator.md) | cross-cutting hand-off | Read, Grep |
| [`analyst`](analyst.md) | Idea, Research | Read, Edit, Write, WebSearch, WebFetch |
| [`pm`](pm.md) | Requirements | Read, Edit, Write |
| [`ux-designer`](ux-designer.md) | Design (UX) | Read, Edit, Write |
| [`ui-designer`](ui-designer.md) | Design (UI) | Read, Edit, Write |
| [`architect`](architect.md) | Design (architecture), Specification | Read, Edit, Write |
| [`planner`](planner.md) | Tasks | Read, Edit, Write |
| [`dev`](dev.md) | Implementation | Read, Edit, Write, Bash, Grep |
| [`qa`](qa.md) | Testing | Read, Edit, Write, Bash, Grep |
| [`reviewer`](reviewer.md) | Review | Read, Edit, Write, Grep, Bash |
| [`release-manager`](release-manager.md) | Release | Read, Edit, Write, Bash |
| [`sre`](sre.md) | Operations | Read, Edit, Write, Bash, Grep |
| [`retrospective`](retrospective.md) | Learning | Read, Edit, Write, Grep |

## Conventions

- **Frontmatter** uses Claude Code's standard fields: `name`, `description`, `tools`, `model`, optionally `color`.
- **`description`** is written in the imperative — Claude reads it to decide *when* to spawn this agent.
- **Body** is the system prompt. Keep it focused; rely on linked docs (`docs/spec-kit.md`, `docs/quality-framework.md`, the relevant template) for detail rather than restating.
- **No agent edits another agent's outputs across stages.** Within a single stage, agents may collaborate on a shared artifact when explicitly sequenced — stage 4 (`/spec:design`) is the canonical example: `ux-designer` (Part A) → `ui-designer` (Part B) → `architect` (Part C) all extend the same `design.md`, each in their named section. Outside such explicit collaborations, if you need a sibling artifact updated, raise a clarification or hand back to the orchestrator.

## Tool restrictions are deliberate

**Tool grants are coarse; scope is enforced by the prompt.** Most agents need `Edit`/`Write` to produce their artifacts, so `Edit`/`Write` cannot be path-restricted at the tool layer. The narrow scope is enforced in the agent's body prompt — `qa` may edit tests but not production source; `reviewer` may edit `review.md` and `traceability.md` only; `dev` may not change test assertions; `release-manager` may not deploy without explicit authorisation. The hard tool-layer restrictions are the *omissions*: `analyst` / `pm` / `ux-designer` / `ui-designer` / `architect` / `planner` / `retrospective` have no `Bash` (they don't run code or shells). The agents that *do* have `Bash` — `dev`, `qa`, `reviewer`, `release-manager`, `sre` — need it for builds, tests, git inspection, or release tooling, and their prompts constrain how it's used. Don't broaden tool grants without an ADR; don't loosen prompt scopes without one either.
