---
title: "Copilot walkthrough"
folder: "docs/cross-tool"
description: "How to use Specorator with GitHub Copilot and explicit repository artifacts."
---
# Copilot Walkthrough

## Stage 1-3 Entry

1. Open the repository in an editor or GitHub workspace with Copilot Chat.
2. Reference `AGENTS.md`, `docs/specorator.md`, and the stage template in the prompt.
3. Ask Copilot to draft Stage 1-3 artifacts in order and to list unresolved clarifications before editing requirements.

## Specialist Roles

Tell Copilot which role contract to follow, for example: "Use `.claude/agents/analyst.md` for Stage 1" or "Use `.claude/agents/pm.md` for Stage 3." Review each artifact before moving forward.

## Artifacts

Commit only repository artifacts: `specs/<feature>/idea.md`, `research.md`, `requirements.md`, and `workflow-state.md`. Use issue or PR comments for transient discussion.

## Verify

Run `npm run verify` locally or rely on the Verify GitHub Action after pushing. Local verification is preferred because it catches link, traceability, and generated-doc drift before review.
