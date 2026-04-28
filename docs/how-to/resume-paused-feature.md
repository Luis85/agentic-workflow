# How to resume a paused feature

**Goal:** pick up an in-progress feature at the correct stage without losing context or skipping a quality gate.

**When to use:** a feature in `specs/<slug>/` was started in an earlier session and you (or a teammate) need to continue it.

**Prerequisites:**

- The feature directory `specs/<slug>/` exists.
- Claude Code installed.
- A `workflow-state.md` is present under that directory.

## Steps

1. Read the state file — `cat specs/<slug>/workflow-state.md`. Identify the `Active stage` and the last completed stage.
2. List the artifacts present — `ls specs/<slug>/`. Confirm every stage marked complete has its expected file (e.g. `requirements.md` for Stage 3, `design.md` for Stage 4).
3. Open Claude Code — `claude`.
4. Resume conversationally — say `continue the <slug> feature`. The `orchestrate` skill picks up at the active stage and dispatches the right specialist agent.
5. Or resume manually — run the matching `/spec:*` command for the active stage (`/spec:design`, `/spec:tasks`, `/spec:implement`, etc.).
6. If the state file is missing or contradictory, escalate — do not invent the stage. Rebuild state from the artifacts present plus a brief from a human.

## Verify

After your first action, `cat specs/<slug>/workflow-state.md` shows an updated `Last activity` timestamp and the new stage's artifact appears in `specs/<slug>/`.

## Related

- Reference — [`docs/specorator.md`](../specorator.md) — full stage definitions and gates.
- Reference — [`docs/workflow-overview.md`](../workflow-overview.md) — slash-command cheat sheet.
- Reference — [`docs/sink.md`](../sink.md) — which artifact each stage produces.
- How-to — [`run-verify-gate.md`](./run-verify-gate.md) — gate to run before pushing once implementation resumes.
