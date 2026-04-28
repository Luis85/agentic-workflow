# How to add a new glossary term

**Goal:** add one new domain term to `docs/glossary/<slug>.md` so future agents and humans share the same vocabulary.

**When to use:** a new domain concept appeared in a workflow (a stage agent flagged an ambiguous word, a discovery sprint coined a label, a steering doc invented a name) and the term is not yet in [`docs/glossary/`](../glossary/).

**Prerequisites:**

- Working tree on a topic branch.
- A canonical, one-sentence definition of the term in mind. If you are still hedging, run [`grill`](../../.claude/skills/grill/SKILL.md) on the term first.
- The term is *domain language*, not an implementation detail (class names, transient flags, file paths don't belong in the glossary).

## Steps

1. Open Claude Code — `claude`.
2. Run the slash command — `/glossary:new "<Term in display case>"`. Example — `/glossary:new "Quality gate"`. The command invokes the [`new-glossary-entry`](../../.claude/skills/new-glossary-entry/SKILL.md) skill.
3. The skill slugifies the term, refuses to overwrite an existing entry (offers to refine in place instead), copies [`templates/glossary-entry-template.md`](../../templates/glossary-entry-template.md) to `docs/glossary/<slug>.md`, and pre-fills `term`, `slug`, and `last-updated` in the frontmatter.
4. Fill the body — five sections, one paragraph or one short list each:
   - **Definition** — one sentence in domain language. No implementation jargon.
   - **Why it matters** — what distinguishes this term from neighbours; cite the article, command, or skill that introduces it.
   - **Examples** — concrete usage. A short artifact excerpt or dialogue line beats abstract prose.
   - **Avoid** — synonyms, near-misses, common misuses. One line each.
   - **See also** — at least one related entry and the relative path that introduces the term.
5. Set `status: draft` initially; humans promote to `accepted` after review. Leave `aliases: []` empty unless you are renaming an existing term.
6. If the new entry relates to an existing one, add the new slug to the existing entry's `related:` list and `## See also` section so the link is bidirectional.
7. Commit — `git add docs/glossary/<slug>.md <related entries> && git commit -m "docs(glossary): add <slug>"`.

## Verify

`ls docs/glossary/<slug>.md` returns the new file; its frontmatter has `term`, `slug`, `status: draft`, and a real `last-updated` date; `npm run verify` is green.

## Related

- Reference — [`templates/glossary-entry-template.md`](../../templates/glossary-entry-template.md) — the section shape and frontmatter contract.
- Reference — [`docs/glossary/`](../glossary/) — the directory listing is the index.
- Explanation — [ADR-0010](../adr/0010-shard-glossary-into-one-file-per-term.md) — why the glossary is sharded one-file-per-term.
- How-to — [`add-adr.md`](./add-adr.md) — file an ADR if a new term forces a definitional shift in a load-bearing concept.

---
*Last desk-checked 2026-04-28 against commit `81ef60a`.*
