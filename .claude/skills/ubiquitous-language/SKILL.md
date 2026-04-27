---
name: ubiquitous-language
description: Maintain a living glossary at docs/UBIQUITOUS_LANGUAGE.md — the canonical vocabulary every agent and human uses when talking about the system. Flags ambiguities, picks opinionated canonical terms, and lazily creates the file on first need. Use when a new domain term is coined or refined, when stage agents disagree on terminology, when the user mentions "glossary", "DDD", "ubiquitous language", or whenever a requirement uses fuzzy language that needs sharpening.
argument-hint: [optional new term to add or refine]
---

# Ubiquitous language

After Evans's "ubiquitous language" and Pocock's `ubiquitous-language` skill. The glossary is the contract for vocabulary across the spec → design → spec → tasks → code chain. Drift here causes drift everywhere downstream.

## File layout

```
docs/UBIQUITOUS_LANGUAGE.md
```

Single file at repo root. Never sharded — sharding defeats the purpose of a single shared vocabulary.

## Format

```markdown
# Ubiquitous language

_Last updated: <YYYY-MM-DD> by <agent>_

The canonical vocabulary for talking about this system. Every requirement, design, spec, task, ADR, and code identifier should use these terms exactly. If a term is missing or fuzzy, file a PR or run the `ubiquitous-language` skill to add it.

## Subdomain: <Subdomain name>

| Term | Definition | Synonyms (avoid) | Notes |
|---|---|---|---|
| **Subscriber** | A user who has an active paid plan. | Customer, paying user | Distinguished from **Trialist** (active trial) and **Lapsed** (canceled). |

(Repeat per subdomain. Subdomains map to bounded contexts in `docs/CONTEXT.md` or to top-level product areas.)

## Flagged ambiguities

Terms that are currently ambiguous, with the active workflow that will resolve them.

- **Account** vs **User** vs **Profile** — _resolving in workflow `2026-04-26-add-user-profile`_

## Example dialogue

A 3–5 exchange dialogue using the glossary correctly, so an agent reading this file knows what "good" sounds like in this project's voice.
```

## Procedure

### When a new term is coined

1. Read the current `UBIQUITOUS_LANGUAGE.md`. If absent, scaffold from the template.
2. Identify the **subdomain** the term belongs to.
3. Check for collisions:
   - Same word, different meaning elsewhere? Disambiguate explicitly (`Account (billing)` vs `Account (auth)`).
   - Different word, same meaning? Pick **one** canonical term and list the others as "avoid" synonyms.
4. Write the entry: term in **bold**, one-sentence definition in domain language, list of synonyms to avoid, optional notes.
5. Update `Last updated` and `by`.

### When a term is refined (definition shifts)

1. Update the definition in place.
2. **Search the codebase and `specs/`** for old usages — ambiguous usages are bugs. Surface a list to the user; don't silently rewrite spec files.
3. Add a one-line note in the term's row: `Refined <YYYY-MM-DD> in workflow <slug>`.

### When ambiguity is flagged

A stage agent may report that a requirement uses a term in two senses. Add an entry to **Flagged ambiguities** linking to the active workflow. The next iteration of the relevant stage must resolve it.

## Rules

- **One canonical term per concept.** No synonyms in active use. Synonyms are explicitly listed as "avoid."
- **Domain language, not implementation language.** "Subscriber" not "UserModel"; "Order" not "OrderRecord".
- **Examples beat definitions.** When a definition is hard to write, add one to the example dialogue.
- **Lazy creation.** Don't scaffold an empty glossary. Wait for the first real term.
- **Plain Markdown.** No framework-specific syntax, no front-matter — this file should survive any tooling change.

## Relationship to other artifacts

- **`docs/CONTEXT.md`** — uses these terms exactly; defers to this file for definitions.
- **`docs/steering/product.md`** — uses these terms exactly; refining a term may require a steering update.
- **`specs/<slug>/requirements.md`** — every EARS clause uses these terms exactly (per `docs/ears-notation.md` discipline).
- **Code identifiers** — class, function, and variable names should mirror these terms (within language conventions). The reviewer agent enforces this.
