---
title: "Architecture Decision Records (ADRs)"
folder: "docs/adr"
description: "Entry point for Architecture Decision Record policy and the ADR index."
entry_point: true
---
# Architecture Decision Records (ADRs)

Records of architecturally significant decisions. Format follows Michael Nygard's lightweight template (see [`templates/adr-template.md`](../../templates/adr-template.md)).

## Index

<!-- BEGIN GENERATED: adr-index -->
| # | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-adopt-spec-driven-development.md) | Adopt spec-driven development as the workflow spine | Accepted |
| [0003](0003-adopt-ears-for-functional-requirements.md) | Adopt EARS notation for functional requirements | Accepted |
| [0004](0004-adopt-operational-agents-alongside-lifecycle-agents.md) | Adopt operational agents alongside lifecycle agents | Accepted |
| [0005](0005-add-discovery-track-before-stage-1.md) | Add a Discovery Track that precedes Stage 1 (Idea) | Accepted |
| [0006](0006-add-sales-cycle-track-before-discovery.md) | Add a Sales Cycle Track that precedes the Discovery Track and Stage 1 | Accepted |
| [0007](0007-add-stock-taking-track-for-legacy-projects.md) | Add a Stock-taking Track for projects that build on existing systems | Accepted |
| [0008](0008-add-project-manager-track.md) | Add an opt-in Project Manager Track based on P3.Express | Accepted |
| [0009](0009-add-portfolio-manager-role.md) | Add opt-in Portfolio Manager role and P5 Express portfolio track | Accepted |
| [0010](0010-shard-glossary-into-one-file-per-term.md) | Shard the glossary into one file per term under docs/glossary/ | Proposed |
| [0011](0011-add-project-scaffolding-track.md) | Add a Project Scaffolding Track for source-led template adoption | Proposed |
| [0012](0012-add-roadmap-management-track.md) | Add a Roadmap Management Track for product and project planning | Proposed |
| [0013](0013-add-obsidian-as-ui-layer.md) | Add Obsidian as an opt-in UI layer | Proposed |
| [0014](0014-shard-log-shaped-artifacts-for-bases.md) | Shard log-shaped artifacts for Bases | Proposed |
| [0015](0015-codify-codex-pr-review-loop.md) | Codify a bounded Codex review loop on every pull request | Proposed |
| [0016](0016-design-system-as-skill.md) | Adopt the specorator-design skill as the canonical brand source | Proposed |
| [0017](0017-adopt-inputs-folder-as-canonical-ingestion-zone.md) | Adopt `inputs/` as the canonical ingestion folder for new work packages | Proposed |
| [0018](0018-sites-consumes-tokens.md) | Flip sites/styles.css to consume design-system tokens | Proposed |
| [0019](0019-add-design-track.md) | Add a Design Track as an opt-in first-party workflow | Proposed |
| [0020](0020-v05-release-branch-strategy.md) | Adopt Shape A with release/vX.Y.Z branches for v0.5 releases | Accepted |
| [0021](0021-release-package-fresh-surface.md) | Ship the released template package as a fresh-surface starter | Accepted |
<!-- END GENERATED: adr-index -->

## Conventions

- Files are named `NNNN-imperative-title.md`. Numbers are zero-padded, monotonic, never reused.
- Title is in the imperative mood: *"Use PostgreSQL"*, not *"PostgreSQL was chosen"*.
- Status is one of: `Proposed`, `Accepted`, `Deprecated`, `Superseded by ADR-NNNN`.
- ADR **bodies** are immutable. To change a decision, supersede it; only the predecessor's `status` and `superseded-by` pointer fields may be updated.

## When to file an ADR

File one for any decision that:

- Constrains future implementation choices.
- Is hard to reverse (data shape, public API, vendor commitment, security boundary).
- Trades off in a way the team will forget the rationale for.

Don't file one for routine, easily-reversible choices.

## How

Run `/adr:new "<imperative title>"` (Claude Code) or copy [`templates/adr-template.md`](../../templates/adr-template.md) and add it to the index above.
