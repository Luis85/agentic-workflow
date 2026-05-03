---
title: "Gemini walkthrough"
folder: "docs/cross-tool"
description: "How to use Specorator with Gemini for long-context planning and review."
---
# Gemini Walkthrough

## Stage 1-3 Entry

1. Provide Gemini with `AGENTS.md`, `memory/constitution.md`, `docs/specorator.md`, and the current `specs/<feature>/workflow-state.md`.
2. Ask for Stage 1-3 outputs in separate passes so each artifact can be reviewed before the next is drafted.
3. Require a `clarifications` section when Gemini cannot derive intent from the supplied sources.

## Specialist Roles

Paste or attach the relevant `.claude/agents/<role>.md` file for the current stage. Treat the role file as binding scope, not background reading.

## Artifacts

Move accepted output into `specs/<feature>/`. Do not let chat summaries become the source of truth; the repository artifact wins.

## Verify

Run `npm run verify` in the repository after applying Gemini's proposed changes. Feed only failing diagnostics back into Gemini for repair.
