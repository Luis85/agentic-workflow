# CLAUDE.md

Entry point for Claude Code in this repository.

## Primary context

@AGENTS.md
@memory/constitution.md

## What this repo is

A template for **spec-driven, agentic software development**. The workflow itself is the deliverable. See `docs/spec-kit.md` for the full definition and `README.md` for the map of files.

## How to work here

1. Pick or start a feature: `specs/<feature-slug>/`.
2. Read `specs/<feature-slug>/workflow-state.md` to learn what stage is active and what's already produced.
3. Use the slash command for the active stage: `/spec:idea`, `/spec:research`, `/spec:requirements`, `/spec:design`, `/spec:specify`, `/spec:tasks`, `/spec:implement`, `/spec:test`, `/spec:review`, `/spec:release`, `/spec:retro`. Quality gates: `/spec:clarify` and `/spec:analyze`.
4. Each command spawns the appropriate subagent from `.claude/agents/`. Don't bypass — agent scoping is intentional.
5. When you finish a stage, update `specs/<feature-slug>/workflow-state.md` and move on.

## Conventions specific to Claude Code

- Subagents are project-scoped (`.claude/agents/`). They have intentionally narrow tool lists — if a tool seems missing, that's a feature, not a bug.
- For irreversible architectural decisions, run `/adr:new "<title>"`.
- Don't add `.claudeignore` exclusions silently — note them in `docs/steering/tech.md`.

## What not to do

- Don't expand the workflow with new stages or roles without an ADR.
- Don't write code from a vague brief — always run the upstream stages first or explicitly mark them as skipped.
- Don't merge feature work directly into the workflow template files (`docs/`, `templates/`, `.claude/`) unless you're improving the *template itself*.
