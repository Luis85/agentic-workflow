---
title: "Cursor walkthrough"
folder: "docs/cross-tool"
description: "How to use Specorator from Cursor with AGENTS.md and Markdown workflow artifacts."
---
# Cursor Walkthrough

## Stage 1-3 Entry

1. Open the repository folder in Cursor and pin `AGENTS.md`, `memory/constitution.md`, and `docs/specorator.md` as context.
2. Start with a precise prompt: "Follow Specorator Stage 1-3 for `<feature>`; ask clarifying questions before writing requirements."
3. Have Cursor draft `specs/<feature>/idea.md`, then `research.md`, then `requirements.md`.

## Specialist Roles

Invoke specialists by naming their role and source file: "Use `.claude/agents/pm.md` as the role contract for this requirements pass." Keep one stage per chat thread when the output needs review.

## Artifacts

All durable output belongs in `specs/<feature>/`. Use `workflow-state.md` as the pickup point when reopening Cursor later.

## Verify

Run `npm run verify` in the integrated terminal before committing. If the change touches generated command or script docs, run the matching `npm run fix:*` command first.
