---
id: ADR-0010
title: Shard the glossary into one file per term under docs/glossary/
status: proposed
date: 2026-04-28
deciders:
  - human
consulted:
  - architect
  - ubiquitous-language skill author
informed:
  - all stage agents
  - all skill authors
supersedes: []
superseded-by: []
tags: [docs, glossary, terminology, ubiquitous-language]
---

# ADR-0010 — Shard the glossary into one file per term under `docs/glossary/`

## Status

Proposed

## Context

The repo is a template for spec-driven, agentic software development. As the methodology has grown — Specorator's 11 stages, the Discovery Track, the Sales Cycle, the Stock-taking Track, the Project Manager Track, the Portfolio Track, plus 14 skills — so has the vocabulary the project relies on. Today, definitions live in three places:

- `README.md` has a 9-row "Plain-English glossary" table aimed at newcomers.
- The `ubiquitous-language` skill targets a single file at `docs/UBIQUITOUS_LANGUAGE.md` (lazy, never created in this repo) whose format is one tabular row per term, organised by subdomain.
- Every other definition is scattered inline across `docs/specorator.md`, `AGENTS.md`, the steering docs, and individual `SKILL.md` files.

The single-file model from the `ubiquitous-language` skill explicitly prohibits sharding ("Never sharded — sharding defeats the purpose of a single shared vocabulary"). That stance optimises for *one place to look*. As the term count grows past ~30 entries with cross-references, examples, and "avoid" lists, the cost of a single file dominates: long-form per-term content does not fit in a table row; refining one term forces a diff that touches the whole file; cross-linking from artifacts to a specific term requires anchor links that drift on re-ordering; and the file becomes a merge-conflict hotspot when multiple workflows coin terms in parallel.

The repo already has a **one-file-per-item** convention used by `docs/adr/`, `docs/issues/`, `docs/plans/`, and `docs/postmortems/`. ADRs prove the pattern scales — they are navigable by directory listing alone, each entry is independently linkable, and the template + scaffolding skill (`/adr:new`) keeps shape consistent.

## Decision

We shard the glossary into one markdown file per term under `docs/glossary/<slug>.md`.

- **Filename** is the kebab-case slug of the term (`docs/glossary/quality-gate.md`). No numeric prefix. No ID. The term is its own identifier.
- **Per-entry shape** follows `templates/glossary-entry-template.md`: YAML frontmatter (`term`, `slug`, `aliases`, `status`, `last-updated`, `related`, `tags`) plus standard sections (Definition, Why it matters, Examples, Avoid, See also).
- **Scaffolding** is via the new `/glossary:new <term>` slash command and the `new-glossary-entry` skill, mirroring `/adr:new` and the `new-adr` skill.
- **No `docs/glossary/README.md` index.** The directory listing is the index. This is a deliberate departure from `docs/adr/README.md` — ADRs need an index because they are decision *narratives* whose titles do not slugify well. Glossary terms slugify perfectly to their canonical form, so no second index is needed.
- **Lifecycle** is mutable and additive: refinements update the file in place and bump `last-updated`; renames create a new file and add the old slug to the new file's `aliases:` (the deprecated file remains as historical record with `status: deprecated`).
- **`docs/UBIQUITOUS_LANGUAGE.md`** remains a recognised artifact location in `docs/sink.md` for backward compatibility with projects that adopted earlier versions of this template, but it is marked deprecated. The `ubiquitous-language` skill is annotated with a deprecation banner pointing here.

## Considered options

### Option A — Keep the single-file `UBIQUITOUS_LANGUAGE.md` model

- Pros: One canonical place; matches Evans's original "ubiquitous language" framing; existing skill works; no new artifact location.
- Cons: Doesn't fit long-form per-term content (examples, "avoid" lists, cross-links); merge-conflict hotspot under parallel workflows; cross-linking via anchors drifts; doesn't reuse the proven `docs/adr/`-style pattern.

### Option B — Shard into `docs/glossary/<slug>.md` (chosen)

- Pros: Matches the repo's one-file-per-item convention; each entry independently linkable, diffable, and refinable; supports long-form content; merge conflicts localised; no manual index to maintain (folder listing suffices).
- Cons: Loses "one file to grep through" for a quick scan; requires migrating existing terms; supersedes a published skill; small initial cost to author the template + skill + command.

### Option C — Hybrid: `UBIQUITOUS_LANGUAGE.md` keeps a tabular index; `docs/glossary/<slug>.md` holds long-form

- Pros: Single-file scan still works; per-term files supply detail.
- Cons: Two sources of truth invite drift between them; agents must update two files for every refinement; doubles the surface for cross-linking confusion.

## Consequences

### Positive

- One-file-per-term mirrors the established `docs/adr/` pattern, so contributors and agents already know the shape.
- Cross-references from artifacts (specs, ADRs, skills) point at stable per-term URLs that survive re-ordering.
- Long-form per-term content (examples, "avoid", "see also") becomes natural rather than crammed into a table row.
- Parallel workflows can coin terms without merge conflicts on a shared file.
- The `new-glossary-entry` skill makes adding a term as cheap as adding an ADR — a single `/glossary:new <term>` invocation.

### Negative

- A single-file scan ("grep one file for all terms") is replaced by listing a directory. Mitigated: the folder listing *is* the index, and `grep -r docs/glossary/` answers the same questions.
- The `ubiquitous-language` skill is deprecated. Existing forks that already adopted `docs/UBIQUITOUS_LANGUAGE.md` continue to work but no longer receive new content from this template.
- One more artifact location for agents to be aware of. Mitigated by recording it in `docs/sink.md`, `AGENTS.md`, and `CLAUDE.md` in the same change.

### Neutral

- The existing 9 newcomer terms in `README.md`'s "Plain-English glossary" are migrated to per-file entries; the README section becomes a pointer.

## Compliance

- `docs/sink.md` lists `docs/glossary/<slug>.md` in §Layout and the Ownership table, and adds the `new-glossary-entry → docs/glossary/<slug>.md` row to §"Cross-cutting writes from skills".
- `AGENTS.md` and `CLAUDE.md` reference `docs/glossary/` and the `/glossary:new` command in their conventions sections.
- The `ubiquitous-language` skill carries a deprecation banner pointing at this ADR; `domain-context`, `grill`, `design-twice`, `arc42-baseline`, `tdd-cycle`, `tracer-bullet`, `orchestrate`, and `.claude/skills/README.md` cross-references are updated to read `docs/glossary/` rather than `UBIQUITOUS_LANGUAGE.md`.
- The reviewer agent enforces, at `/spec:review` time, that any term used by an EARS clause exists as a `docs/glossary/<slug>.md` file. (Implementation of that check is a follow-up.)

## References

- [`templates/glossary-entry-template.md`](../../templates/glossary-entry-template.md) — per-entry shape.
- [`.claude/skills/new-glossary-entry/SKILL.md`](../../.claude/skills/new-glossary-entry/SKILL.md) — scaffolding skill.
- [`.claude/commands/glossary/new.md`](../../.claude/commands/glossary/new.md) — `/glossary:new` slash command.
- [`.claude/skills/ubiquitous-language/SKILL.md`](../../.claude/skills/ubiquitous-language/SKILL.md) — superseded skill (deprecation banner).
- [ADR-0001](0001-record-architecture-decisions.md) — establishes ADR immutability and the one-file-per-decision convention this ADR mirrors.
- Evans, *Domain-Driven Design* — original framing of "ubiquitous language" that the prior model invoked.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
