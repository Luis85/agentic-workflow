---
title: "Codex walkthrough"
folder: "docs/cross-tool"
description: "How to use Specorator with Codex while preserving worktrees, artifacts, and verification."
---
# Codex Walkthrough

## Stage 1-3 Entry

1. Read `AGENTS.md`, `.codex/instructions.md`, and `memory/constitution.md`.
2. For a new feature, create or update `specs/<feature>/workflow-state.md`, then draft `idea.md`, `research.md`, and `requirements.md` in order.
3. Ask Codex to stop and surface clarifications when intent, requirements, or acceptance criteria are missing.

## Specialist Roles

Use role names from `.claude/agents/` as explicit instructions: "act as analyst for Stage 1", "act as pm for requirements", or "act as reviewer for this PR". Codex should follow the role scope even though it does not launch Claude subagents.

## Artifacts

Write feature work under `specs/<feature>/`. Keep task IDs, requirement IDs, tests, ADRs, and workflow-state status synchronized.

## Verify

For non-trivial changes, create a worktree under `.worktrees/<slug>`, run `npm run verify`, commit, push, and open a PR. Use `.codex/workflows/pr-delivery.md` for the delivery loop.
