---
description: File a new Architecture Decision Record. Allocates the next number, scaffolds from templates/adr-template.md, drafts content from the conversation context.
argument-hint: "<imperative title>"
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /adr:new

Create a new ADR.

## Inputs

- `$ARGUMENTS` — the imperative title (e.g. *Adopt event sourcing for order history*). Required.

## Procedure

1. List existing ADRs in `docs/adr/` to determine the next number `NNNN` (zero-padded, monotonic, never reused).
2. Compute the slug from the title (kebab-case).
3. Copy `templates/adr-template.md` to `docs/adr/NNNN-<slug>.md`.
4. Fill the ADR from the current conversation:
   - **Context** — what's forcing the decision now? Cite the artifact (PRD, design, spec) that triggered it.
   - **Decision** — active voice, present tense.
   - **Considered options** — list with pros/cons if the choice is non-trivial.
   - **Consequences** — positive, negative, neutral.
   - **Compliance** — how we'll know we're honouring it (linter? review checklist? dashboard?).
   - **References** — linked artifacts, external docs, related ADRs.
5. Add the new ADR to the index in `docs/adr/README.md`.
6. If the ADR was triggered by a feature artifact, link the ADR ID into that artifact's `adrs:` frontmatter list.

## Don't

- Don't edit existing ADRs. If you need to change a decision, supersede it (status: `Superseded by ADR-NNNN` on the old one; status: `Accepted` on the new one).
- Don't file an ADR for routine, easily reversible choices. ADRs are for decisions that constrain future implementation.
