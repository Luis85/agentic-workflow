# CLAUDE.md

Entry point for Claude Code in this repository.

## Primary context

@AGENTS.md
@memory/constitution.md
@.claude/memory/MEMORY.md

## What this repo is

A template for **spec-driven, agentic software development**. The workflow itself is the deliverable. See `docs/spec-kit.md` for the full definition and `README.md` for the map of files.

## How to work here

1. To start a *new* feature, run `/spec:start <feature-slug>` — it scaffolds `specs/<feature-slug>/` and sets `workflow-state.md` to the first stage.
2. To resume work, read `specs/<feature-slug>/workflow-state.md` to learn what stage is active and what's already produced.
3. Use the slash command for the active stage: `/spec:idea`, `/spec:research`, `/spec:requirements`, `/spec:design`, `/spec:specify`, `/spec:tasks`, `/spec:implement`, `/spec:test`, `/spec:review`, `/spec:release`, `/spec:retro`. Quality gates: `/spec:clarify` and `/spec:analyze`.
4. Each command spawns the appropriate subagent from `.claude/agents/`. Don't bypass — agent scoping is intentional.
5. When you finish a stage, update `specs/<feature-slug>/workflow-state.md` and move on.

## Conventions specific to Claude Code

- Subagents are project-scoped (`.claude/agents/`). They have intentionally narrow tool lists — if a tool seems missing, that's a feature, not a bug.
- Skills (`.claude/skills/`) are reusable how-tos any agent can invoke — `verify`, `new-adr`, `review-fix`. They never override an agent's tool list; they only encode "we always do it this way".
- Operational bots live under `agents/operational/`. Each is a `PROMPT.md` + `README.md` pair; the prompt is the source of truth the scheduled run loads.
- Permission rules live in `.claude/settings.json`. Pushes to `main` / `develop` are denied by default; `--no-verify` is denied. See `docs/branching.md`.
- Topic branches live in worktrees under `.worktrees/<slug>/`. See `docs/worktrees.md`.
- Run the verify gate before opening a PR. See `docs/verify-gate.md`.
- For irreversible architectural decisions, run `/adr:new "<title>"`.
- Don't add `.claudeignore` exclusions silently — note them in `docs/steering/tech.md`.

## What not to do

- Don't expand the workflow with new stages or roles without an ADR.
- Don't write code from a vague brief — always run the upstream stages first or explicitly mark them as skipped.
- Don't merge feature work directly into the workflow template files (`docs/`, `templates/`, `.claude/`) unless you're improving the *template itself*.
