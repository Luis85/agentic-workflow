---
id: ADR-0014
title: Shard log-shaped artifacts for Bases
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
tags: [workflow, documentation, obsidian, data-model]
---

# ADR-0014 - Shard log-shaped artifacts for Bases

## Status

Proposed

## Context

Obsidian Bases renders one row per matched file. This works for file-per-entity artifacts such as `specs/<slug>/workflow-state.md`, ADR files, and glossary entries, but it does not work for single Markdown files that contain many entries in sections or tables.

The affected log-shaped artifacts include:

- `projects/<slug>/followup-register.md`
- `projects/<slug>/health-register.md`
- `projects/<slug>/weekly-log.md`
- `roadmaps/<slug>/decision-log.md`
- `roadmaps/<slug>/communication-log.md`
- `quality/<slug>/improvement-plan.md`

ADR-0010 already established a successful shard pattern for glossary entries: one entity per Markdown file with frontmatter that tools can query.

## Decision

We will shard log-shaped artifacts into one file per entry before adding Obsidian Bases dashboards for those entries.

Each track owns its own migration. This ADR records the architectural direction, not the migration schedule. A future per-track PR will define the exact folder shape, templates, agent instructions, migration behavior, and check scripts for that track.

## Considered options

### Option A - Keep log-shaped artifacts as single files

- Pros: no migration and fewer files.
- Cons: Bases can only show one row per register file, which does not satisfy the dashboard goal.

### Option B - Build a custom Obsidian parser plugin

- Pros: could display table rows or headings without changing artifact layout.
- Cons: introduces a runtime plugin and duplicates repository parsing rules outside CI.

### Option C - Shard per track

- Pros: gives each entry first-class identity, frontmatter, backlinks, and Base rows while keeping migration blast radius local to one track.
- Cons: requires template, agent, and script updates per track.

## Consequences

### Positive

- Future Bases can show follow-ups, decisions, communications, and improvement actions as real dashboard rows.
- Entry IDs can become stable file slugs and backlink targets.
- Per-track migrations stay reviewable and reversible.

### Negative

- The repository will contain more Markdown files.
- Scripts and agents that currently read a single register file must be updated per migrated track.
- Historical register content needs either migration or an explicit cutoff note.

### Neutral

- Phase 1 of the Obsidian UI layer ships only file-per-entity Bases.
- This ADR can remain proposed until the first track migration accepts the pattern in practice.

## Compliance

- Per-track shard PRs must update that track's templates, agent or skill instructions, sink entries, and checks together.
- No Base over a log-shaped artifact should be added until the source artifact is sharded.
- `check:obsidian-assets` validates shipped `.base` files, but it does not validate semantic usefulness of unsharded log dashboards.

## References

- [ADR-0010](0010-shard-glossary-into-one-file-per-term.md)
- [ADR-0013](0013-add-obsidian-as-ui-layer.md)
- [Obsidian Bases syntax](https://obsidian.md/help/bases/syntax)
- [Obsidian UI layer design PR](https://github.com/Luis85/agentic-workflow/pull/73)

---

> **ADR bodies are immutable.** To change this decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
