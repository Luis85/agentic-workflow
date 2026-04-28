---
description: Scaffold a new glossary entry under docs/glossary/<slug>.md from templates/glossary-entry-template.md, with frontmatter pre-filled and body sections drafted from conversation context.
argument-hint: "<term>"
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /glossary:new

Create a new glossary entry. Replaces the deprecated `/ubiquitous-language` flow per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md).

## Inputs

- `$ARGUMENTS` — the term to define (e.g. *quality gate*, *EARS*, *Discovery Track*). Required.

## Procedure

Invoke the [`new-glossary-entry`](../../skills/new-glossary-entry/SKILL.md) skill, which:

1. Slugifies the term to kebab-case.
2. Refuses to overwrite an existing entry; offers to refine in place instead.
3. Copies `templates/glossary-entry-template.md` to `docs/glossary/<slug>.md`.
4. Pre-fills `term`, `slug`, `last-updated`; leaves the body draft sections for the human or current agent to complete from conversation context.
5. Cross-links from related existing entries (bidirectional `related:` and `## See also` updates).
6. If invoked from inside a feature workflow, appends a one-line entry to that feature's `specs/<slug>/workflow-state.md` `## Hand-off notes` section.

## Don't

- Don't overwrite an existing entry. Refine in place with a dated note in the **Definition** section.
- Don't mark a new entry `accepted` without explicit human review. New entries start `draft`.
- Don't add an entry for an implementation detail (specific class names, transient flags). Glossary entries are domain language.
- Don't edit `docs/UBIQUITOUS_LANGUAGE.md` — deprecated by ADR-0010. New terms go in `docs/glossary/<slug>.md`.
