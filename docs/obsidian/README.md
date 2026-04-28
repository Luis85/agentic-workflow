---
title: "Obsidian UI Layer"
folder: "docs/obsidian"
description: "Setup guide and committed Obsidian Bases and Canvas assets for the optional repository UI layer."
entry_point: true
---
# Obsidian UI Layer

This folder contains optional Obsidian assets for browsing the Specorator repository as a vault. The canonical workflow remains the Markdown files, slash commands, agents, scripts, and git history in this repository.

## Setup

1. Install Obsidian 1.9.10 or newer.
2. Open the repository root as the vault.
3. Enable the core plugins **Bases**, **Canvas**, **Backlinks**, **Graph view**, **Properties view**, and **Templates**.
4. Open `docs/obsidian/canvas/home.canvas`.
5. Open each Base in `docs/obsidian/bases/` and confirm it renders.

Obsidian stores user-specific workspace state in `.obsidian/` and deleted files in `.trash/`. Both paths are ignored by git and must stay local.

## Assets

| Asset | Purpose |
|---|---|
| `bases/specs.base` | Shows lifecycle state files under `specs/`. |
| `bases/adrs.base` | Shows ADR records under `docs/adr/`. |
| `bases/glossary.base` | Shows glossary entries under `docs/glossary/`. |
| `bases/project-followups.base` | Shows Project Manager Track follow-up registers when projects exist. |
| `canvas/home.canvas` | Landing hub for primary repository navigation. |
| `canvas/lifecycle.canvas` | Visual map of the lifecycle and optional companion tracks. |

## Authoring Rules

- Use slash commands for new workflow artifacts and stage transitions.
- Treat Bases as a navigation and light editing surface, not as the workflow control plane.
- Do not commit `.obsidian/`, `.trash/`, screenshots, or local workspace layouts.
- User-added frontmatter keys are tolerated but ignored by agents until promoted through the normal ADR/spec process.

## Manual Acceptance Checklist

Record this checklist in the implementation PR before merge:

- [ ] Repository opened as a vault from a clean clone.
- [ ] Bases and Canvas core plugins enabled.
- [ ] `home.canvas` opened without errors.
- [ ] `lifecycle.canvas` opened without errors.
- [ ] `specs.base`, `adrs.base`, `glossary.base`, and `project-followups.base` opened.
- [ ] At least one Base rendered rows when matching artifacts existed, or showed an empty view when none existed.
- [ ] Time from clone to first rendered dashboard: not yet recorded.

## References

- [ADR-0013](../adr/0013-add-obsidian-as-ui-layer.md)
- [Obsidian Bases syntax](https://obsidian.md/help/bases/syntax)
- [Obsidian Canvas](https://obsidian.md/help/plugins/canvas)
