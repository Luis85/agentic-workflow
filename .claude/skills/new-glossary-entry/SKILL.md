---
name: new-glossary-entry
description: Scaffold a glossary entry at docs/glossary/<slug>.md from template. Triggers /glossary:new, "glossary", "define this term", "add glossary entry", or terminology ambiguity. Replaces ubiquitous-language (ADR-0010).
argument-hint: "<term>"
allowed-tools: [Read, Edit, Write, Bash]
---

# new-glossary-entry — scaffold a new glossary entry

## Purpose

Create a new per-term file under `docs/glossary/` from `templates/glossary-entry-template.md`, with the slug, term, and `last-updated` pre-filled. The new file is the canonical home for one term — its definition, why it matters, examples, what to avoid, and links to related terms.

Use this skill when invoked via `/glossary:new "<term>"` or whenever a new term needs an entry.

For background on what counts as a glossary-worthy term and how the glossary is governed, see [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md), [`templates/glossary-entry-template.md`](../../../templates/glossary-entry-template.md), and **Article VIII — Plain Language** of the constitution.

## How to use

1. **Slugify the term.** Lowercase, alphanumerics and hyphens only; collapse runs of non-alphanumerics to a single hyphen; trim leading/trailing hyphens. Examples:
   - `Quality gate` → `quality-gate`
   - `EARS notation` → `ears-notation`
   - `Retrospective` → `retrospective`

2. **Check for an existing entry.** If `docs/glossary/<slug>.md` already exists, do **not** overwrite. Stop and report the existing path; offer to refine it in place instead (update the body, bump `last-updated`, add a `Refined <YYYY-MM-DD> in workflow <slug>` note in the Definition section).

3. **Compose the path:** `docs/glossary/<slug>.md`.

4. **Copy `templates/glossary-entry-template.md`** to that path and fill the frontmatter:
   - `term: "<canonical term in display case>"`
   - `slug: <slug>`
   - `aliases: []` (add known synonyms only if the user has explicitly named them as "avoid this synonym")
   - `status: draft` (a human flips to `accepted` after review)
   - `last-updated: <today's UTC date, YYYY-MM-DD>`
   - `related: []` (add slugs of obviously-related terms; leave empty if unsure)
   - `tags: []` (assign at most 2 — common tags: `workflow`, `role`, `artifact`, `governance`, `quality`, `process`)

5. **Draft body sections from conversation context.** If the user supplied a definition, fill `## Definition` with one sentence. Leave `## Examples`, `## Avoid`, and `## See also` empty for the user to complete unless they have already given that content.

6. **Cross-link from related entries** if any exist under `docs/glossary/`. Add the new slug to their `related:` frontmatter and to their `## See also` section. Keep links bidirectional.

7. **If invoked from inside a feature workflow,** append a dated one-line entry to that feature's `specs/<slug>/workflow-state.md` `## Hand-off notes` free-form section so the workflow has a paper trail. Per `docs/sink.md` §"Cross-cutting writes from skills". The frontmatter schema is fixed — do not add new keys.

## Reporting

On success, report:

```
Created glossary entry: <Term>
  path: docs/glossary/<slug>.md
  status: draft
  related: <list or none>
```

If the entry already existed, report:

```
Glossary entry already exists: <Term>
  path: docs/glossary/<slug>.md
  status: <existing status>
Refine in place? (skill will not overwrite)
```

## Do not

- Do **not** overwrite an existing entry. Refine in place instead, with a dated note.
- Do **not** delete a deprecated entry. It remains as historical record with `status: deprecated`. Renames create a new entry and link via `aliases:` from the new file.
- Do **not** mark a new entry `accepted` without explicit human approval. New entries start `draft`.
- Do **not** add an entry for an implementation detail or ephemeral identifier (e.g. specific class names, request IDs, transient feature flags). Glossary entries are domain language, not implementation language.
- Do **not** edit `docs/UBIQUITOUS_LANGUAGE.md` — that file is deprecated by ADR-0010. New terms go here.

## Relationship to other artifacts

- **`docs/CONTEXT.md`** (and `docs/contexts/<name>.md`) — uses these terms exactly; defers to `docs/glossary/<slug>.md` for definitions.
- **`docs/steering/product.md`** — uses these terms exactly; refining a term may require a steering update.
- **`specs/<slug>/requirements.md`** — every EARS clause uses these terms exactly (per `docs/ears-notation.md` discipline). The reviewer agent checks this at `/spec:review` time.
- **Code identifiers** — class, function, and variable names should mirror these terms within language conventions. The reviewer agent enforces this.
