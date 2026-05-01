---
id: SPECDOC-CLI-001
title: CLI Todo App — Specification
stage: specification
feature: cli-todo
status: complete
owner: architect
inputs:
  - PRD-CLI-001
  - DESIGN-CLI-001
created: 2026-04-27
updated: 2026-04-27
---

# Specification — CLI Todo App — excerpt

> Trimmed top-level excerpt. Full specification (all interfaces, data structures, state transitions, error handling, edge cases, test scenarios): [`full/spec.md`](./full/spec.md).

## Scope

Concrete contracts for the four commands plus the JSON storage format. Each command has: argument schema, exit codes, output shape, error catalogue, and at least one test scenario.

## Interfaces (summary)

- `todo add "<text>"` → emits new task ID on stdout, exit 0; non-empty text required.
- `todo list` → tab-delimited rows of `<id>\t<status>\t<text>`; exit 0; empty list still exit 0 with no rows.
- `todo done <id>` → mark complete; exit 1 if ID unknown.
- `todo rm <id>` → delete; exit 1 if ID unknown.

## Data shape

JSON object: `{ "next_id": int, "tasks": [{ "id": int, "text": string, "done": bool, "created_at": ISO8601 }] }`.

## Edge cases

Concurrent writes (lockfile-free, atomic rename), corrupted store (refuse-and-report), missing parent directory (auto-create), permission errors (single-line message + exit 2).

See [`full/spec.md`](./full/spec.md) for full test scenarios, error catalogue, and per-command expanded behaviour.
