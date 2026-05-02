---
title: "Cross-tool walkthroughs"
folder: "docs/cross-tool"
description: "Entry point for using Specorator from AI coding tools other than Claude Code."
entry_point: true
---
# Cross-Tool Walkthroughs

Claude Code is the first-class runtime for Specorator commands, agents, and skills. These guides show how to use the same Markdown workflow from tools that do not execute `.claude/` commands directly.

| Tool | Guide | Use when |
|---|---|---|
| Codex | [`codex.md`](codex.md) | You want autonomous worktree, verify, commit, push, and PR delivery. |
| Cursor | [`cursor.md`](cursor.md) | You want an IDE assistant to read and edit workflow artifacts. |
| Aider | [`aider.md`](aider.md) | You want terminal-first pair programming over a controlled file set. |
| Copilot | [`copilot.md`](copilot.md) | You want GitHub-native assistance while keeping stage artifacts explicit. |
| Gemini | [`gemini.md`](gemini.md) | You want long-context review and planning over repository Markdown. |

Every guide covers Stage 1-3 entry, specialist-role invocation, artifact locations, and `npm run verify`.
