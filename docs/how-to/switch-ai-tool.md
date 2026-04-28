# How to switch from Claude Code to Codex / Cursor / Aider

**Goal:** continue an in-progress feature in a different AI coding tool without losing stage state, traceability, or the workflow contract.

**When to use:** your team is moving (or experimenting with moving) to a non-Claude-Code tool, **or** a teammate on a different tool needs to pick up your work.

**Prerequisites:**

- Feature directory `specs/<slug>/` exists and is up to date in git.
- The destination tool installed and configured.
- Working tree on a topic branch.

## Steps

1. Confirm the destination tool reads [`AGENTS.md`](../../AGENTS.md) as its root context. All Specorator-supported tools do (Codex, Cursor, Aider, Copilot, Gemini). If your tool has a tool-specific config, point it at `AGENTS.md` via `@import` or the tool's equivalent.
2. Commit and push any in-flight work in your current tool. The destination picks up from the *committed* state in `specs/<slug>/`.
3. Open the destination tool in the repo root. Confirm it has loaded `AGENTS.md` and [`memory/constitution.md`](../../memory/constitution.md).
4. Read `specs/<slug>/workflow-state.md`. Identify the active stage.
5. Drive the matching stage manually — slash commands won't auto-run on most non-Claude-Code tools, so invoke the equivalent stage workflow by reading the relevant template under `templates/` and the agent definition under `.claude/agents/<role>.md`.
6. Update `specs/<slug>/workflow-state.md` after you advance a stage, exactly as the slash commands would.
7. Run `npm run verify` before pushing — it works regardless of tool.

## Verify

The destination tool successfully advances one stage and updates `workflow-state.md`; `npm run verify` is green; `git log --author=...` shows your commit on the destination tool.

## Related

- Reference — [`AGENTS.md`](../../AGENTS.md) — cross-tool root context every supported tool reads.
- Reference — [`.codex/`](../../.codex/) — Codex-specific instructions.
- Explanation — [`docs/specorator.md`](../specorator.md) — why the workflow is tool-agnostic.
