---
id: IDEA-CLI-001
title: A tiny CLI todo app
stage: idea
feature: cli-todo
status: draft
owner: analyst
created: 2026-04-27
updated: 2026-04-27
---

# Idea: CLI todo app

> Trimmed top-level excerpt. Full version: [`full/idea.md`](./full/idea.md).

## Brief

Solo engineers want to capture, list, and complete short-lived tasks without leaving the shell. A single-binary, local-first todo with ≤ 5 commands.

## User

Terminal-native engineers; contributors reading this kit's worked example.

## Outcome

A `todo` binary with `add`, `list`, `done`, `rm`. First `add → list → done` cycle in under two minutes, no docs other than `todo --help`.

## Constraints (summary)

- ~1–2 days of focused implementation.
- Zero infrastructure cost; local-only; no telemetry.
- Single binary; cross-platform (macOS, Linux, Windows).
- MIT-licensed; data under user's home/config dir.

## Open questions (research agenda)

Storage format · language · v1 scope · concurrent access · data-file location · distribution. See [`full/idea.md`](./full/idea.md) for the full list and rationale.

## Out of scope (v1)

Multi-user, sync, GUI/TUI, notifications, integrations, plugins, sub-tasks.
