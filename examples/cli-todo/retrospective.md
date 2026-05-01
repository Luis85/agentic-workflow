---
id: RETRO-CLI-001
title: CLI Todo App — Retrospective
stage: learning
feature: cli-todo
status: complete
owner: retrospective
inputs:
  - RELEASE-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Retrospective — CLI Todo App — excerpt

> Trimmed top-level excerpt. Full retrospective with what worked / didn't / actions: [`full/retrospective.md`](./full/retrospective.md).

## What worked

Strict TDD ordering paid for itself in zero rework. Storage module landing first kept the command handlers honest.

## What didn't

Cross-platform path handling required two iterations; spec was under-specified on Windows config-dir conventions.

## Actions

Captured one template-improvement candidate and one ADR follow-up. See [`full/retrospective.md`](./full/retrospective.md) for the full action list.
