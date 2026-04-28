---
id: ADR-0013
title: Add Obsidian as an opt-in UI layer
status: proposed
date: 2026-04-29
deciders:
  - human maintainer
consulted:
  - Codex
  - Obsidian documentation
informed:
  - Specorator contributors
supersedes: []
superseded-by: []
tags: [workflow, documentation, obsidian, ui-layer]
---

# ADR-0013 - Add Obsidian as an opt-in UI layer

## Status

Proposed

## Context

Specorator is intentionally Markdown-native. The source of truth lives in repository files under `specs/`, `docs/`, `projects/`, `roadmaps/`, `quality/`, and related workflow folders. This keeps the process portable and reviewable, but it gives new contributors no visual navigation layer for workflow state, ADRs, glossary entries, or cross-track relationships.

Obsidian can open the repository root as a vault. Its Bases core plugin stores query configuration in `.base` YAML files and reads Markdown frontmatter, while Canvas stores spatial views as `.canvas` JSON Canvas files. These formats can be committed without changing canonical artifacts.

ADR-0010 already shards glossary entries into one Markdown file per term, which makes glossary entries suitable for a simple Base.

## Decision

We will add an optional Obsidian UI layer under `docs/obsidian/`.

The layer includes:

- a setup guide at `docs/obsidian/README.md`
- committed Bases under `docs/obsidian/bases/`
- committed Canvas layouts under `docs/obsidian/canvas/`
- `.gitignore` rules for `.obsidian/` and `.trash/`
- a read-only `check:obsidian-assets` verification script
- ADR-0014 for the deferred shard pattern needed before Bases can show log-shaped registers

Obsidian is a UI layer only. Slash commands, agents, scripts, and Markdown artifacts remain the workflow control plane.

## Considered options

### Option A - Commit in-place Obsidian assets under `docs/obsidian/`

- Pros: no copy step, reviewable assets, clear ownership in the sink, no new top-level product area.
- Cons: committed `.base` syntax may need maintenance when Obsidian changes.

### Option B - Put assets under `templates/obsidian/`

- Pros: visually groups optional setup files as templates.
- Cons: `templates/` is for blank artifacts that workflow stages copy and fill. Obsidian Bases and Canvas files are used in place, so this would blur repository categories.

### Option C - Build a custom Obsidian plugin first

- Pros: could enforce stage transitions and dispatch workflow commands from inside Obsidian.
- Cons: much larger surface, new runtime, and more failure modes before the navigation value is proven.

## Consequences

### Positive

- Contributors can browse workflow state, ADRs, glossary entries, and track docs visually.
- The repository remains usable without Obsidian.
- User-specific Obsidian state is excluded from git.
- The check script prevents committed vault state and malformed shipped assets.

### Negative

- Bases syntax is relatively new and may need updates as Obsidian evolves.
- Obsidian users can edit Markdown and frontmatter directly; CI remains the recovery guard for broken state.

### Neutral

- Unknown frontmatter keys remain user-owned until a future ADR promotes them into the canonical schema.
- Empty Bases are valid when a repository has no matching artifacts yet.

## Compliance

- `npm run check:obsidian` validates Markdown frontmatter compatibility for the whole repository.
- `npm run check:obsidian-assets` validates committed Obsidian assets and rejects tracked `.obsidian/` or `.trash/` files.
- `npm run verify` runs both checks.
- PR review confirms the setup guide and sink ownership rules remain current.

## References

- [Obsidian Bases syntax](https://obsidian.md/help/bases/syntax)
- [Obsidian Canvas](https://obsidian.md/help/plugins/canvas)
- [Obsidian 1.9.0 changelog](https://obsidian.md/changelog/2025-05-21-desktop-v1.9.0/)
- [ADR-0010](0010-shard-glossary-into-one-file-per-term.md)
- [ADR-0014](0014-shard-log-shaped-artifacts-for-bases.md)
- [Obsidian UI layer design PR](https://github.com/Luis85/agentic-workflow/pull/73)

---

> **ADR bodies are immutable.** To change this decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
