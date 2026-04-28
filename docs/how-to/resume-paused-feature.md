# How to resume a paused feature

**Goal:** pick up an in-progress feature at the correct stage without losing context or skipping a quality gate.

**When to use:** a feature in `specs/<slug>/` was started in an earlier session and you (or a teammate) need to continue it.

**Prerequisites:**

- The feature directory `specs/<slug>/` exists.
- Claude Code installed.
- A `workflow-state.md` is present under that directory.

## Steps

1. Read the state file — `cat specs/<slug>/workflow-state.md`. The frontmatter has `current_stage` (one of `idea | research | requirements | design | specification | tasks | implementation | testing | review | release | learning`), `status` (`active | blocked | paused | done`), `last_updated`, `last_agent`, and an `artifacts:` map. Use these to identify where the feature is.
2. List the artifacts present — `ls specs/<slug>/`. Cross-check against the `artifacts:` map: every key marked `complete` must have its file on disk; anything marked `pending` or `in-progress` is your candidate for the next move.
3. Open Claude Code — `claude`.
4. Resume conversationally — say `continue the <slug> feature`. The `orchestrate` skill reads `current_stage` and dispatches the right specialist agent.
5. Or resume manually — run the matching `/spec:*` command for the active stage (`/spec:design`, `/spec:tasks`, `/spec:implement`, etc.).
6. If the state file is missing or contradictory (artifact map disagrees with files on disk), escalate — do not invent the stage. Rebuild state from the artifacts present plus a brief from a human.

## Verify

After your first action, `cat specs/<slug>/workflow-state.md` shows an updated `last_updated` date and `last_agent`, and the new stage's artifact appears in `specs/<slug>/` and is no longer marked `pending` in the `artifacts:` map.

## Related

- Reference — [`templates/workflow-state-template.md`](../../templates/workflow-state-template.md) — the frontmatter shape and stage table.
- Reference — [`docs/specorator.md`](../specorator.md) — full stage definitions and gates.
- Reference — [`docs/workflow-overview.md`](../workflow-overview.md) — slash-command cheat sheet.
- Reference — [`docs/sink.md`](../sink.md) — which artifact each stage produces.
- How-to — [`run-verify-gate.md`](./run-verify-gate.md) — gate to run before pushing once implementation resumes.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
