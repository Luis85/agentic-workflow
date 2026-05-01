---
id: PRD-CLI-001
title: CLI Todo App — v1
stage: requirements
feature: cli-todo
status: complete
owner: pm
inputs:
  - IDEA-CLI-001
  - RESEARCH-CLI-001
created: 2026-04-27
updated: 2026-04-27
---

# PRD — CLI Todo App (v1) — excerpt

> Trimmed top-level excerpt. Full PRD with EARS-formatted requirements, NFRs, success metrics, and release criteria: [`full/requirements.md`](./full/requirements.md).

## Functional requirements (summary)

A `todo` binary covering four commands: `add` (create with non-empty text), `list` (show open tasks one per line with sequential IDs), `done` (mark by ID), `rm` (delete by ID). State persists across invocations.

## Non-functional requirements (summary)

Single static binary; first `add → list → done` cycle in under two minutes; cross-platform (macOS, Linux, Windows); local-only — no network calls; data file under user config dir; atomic-rename writes for crash safety.

## Out of scope (v1)

Multi-user collaboration; sync; GUI/TUI; recurrence; due dates; priorities; tags; sub-tasks.

See [`full/requirements.md`](./full/requirements.md) for individual REQ/NFR identifiers, EARS clauses, success metrics, and release criteria.
