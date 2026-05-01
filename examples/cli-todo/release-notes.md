---
id: RELEASE-CLI-001
title: CLI Todo App — Release notes
stage: release
feature: cli-todo
version: example-v1
status: complete
owner: release-manager
inputs:
  - REVIEW-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Release notes — CLI Todo App — excerpt

> Trimmed top-level excerpt. Full release record (rollback plan, observability hooks, comms): [`full/release-notes.md`](./full/release-notes.md).

## v1 — initial release

Single-binary `todo` CLI: `add`, `list`, `done`, `rm`. JSON store under XDG config dir. macOS / Linux / Windows binaries on GitHub Releases. `go install` supported.
