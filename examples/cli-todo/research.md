---
id: RESEARCH-CLI-001
title: CLI Todo App — ecosystem, stack, and scope research
stage: research
feature: cli-todo
status: draft
owner: analyst
inputs:
  - IDEA-CLI-001
created: 2026-04-27
updated: 2026-04-27
---

# Research — CLI Todo App (excerpt)

> Trimmed top-level excerpt. Full version: [`full/research.md`](./full/research.md).

## Decisions narrowed

- **Storage:** newline-delimited JSON file under XDG config dir; atomic-rename writes; last-writer-wins on concurrent access.
- **Language:** Go — single-binary distribution, simple stdlib, easy cross-compile, idiomatic CLI ecosystem (`urfave/cli`, `cobra`).
- **v1 scope:** strictly add / list / done / rm. Defer due dates, priorities, tags to v2.
- **Distribution:** `go install` + GitHub Releases binaries.

## Open follow-ups

Edge cases around interrupted writes; localization of timestamps; man-page generation. See [`full/research.md`](./full/research.md) for the full survey, alternatives matrix, and risk analysis.
