---
title: "Aider walkthrough"
folder: "docs/cross-tool"
description: "How to use Specorator with Aider while keeping file scope and stage gates explicit."
---
# Aider Walkthrough

## Stage 1-3 Entry

1. Start Aider from the repository root.
2. Add only the current stage files plus `AGENTS.md`, `memory/constitution.md`, and the relevant template.
3. Prompt Aider to produce one stage artifact at a time: `idea.md`, `research.md`, then `requirements.md`.

## Specialist Roles

Add the relevant `.claude/agents/<role>.md` file to the Aider context when you want the role contract. Remove it when moving to the next role so scope stays narrow.

## Artifacts

Use `specs/<feature>/` for stage artifacts and `docs/adr/` for irreversible decisions. Keep file additions small so Aider's diff stays reviewable.

## Verify

Run `npm run verify` outside Aider before pushing. If verification fails, add only the failing files and the diagnostic output back into Aider.
