---
id: DESIGN-CLI-001
title: CLI Todo App — Design
stage: design
feature: cli-todo
status: complete
owner: architect
collaborators:
  - ux-designer
  - ui-designer
  - architect
inputs:
  - PRD-CLI-001
  - RESEARCH-CLI-001
adrs: [ADR-CLI-0001]
created: 2026-04-27
updated: 2026-04-27
---

# Design — CLI Todo App — excerpt

> Trimmed top-level excerpt. Full design (UX flows, UI states, architecture, ADR): [`full/design.md`](./full/design.md).

## Part A — UX (summary)

Four imperative commands (`add`, `list`, `done`, `rm`). Empty-state message on first run. Listing shows ID, status glyph, text. Errors are single-line and actionable.

## Part B — UI (summary)

ANSI-colour status glyphs (green check, dim circle). One status line per task; long text wrapped. `--no-color` and `NO_COLOR` env both honoured.

## Part C — Architecture (summary)

`cmd/todo` (CLI parser) → `pkg/store` (atomic-rename JSON store). Single binary; no external services; no goroutines beyond input reading. ADR-CLI-0001 records the storage-format decision.

See [`full/design.md`](./full/design.md) for diagrams, full state machines, error catalogues, and accessibility notes.
