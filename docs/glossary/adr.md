---
term: ADR
slug: adr
aliases: [Architecture Decision Record]
status: accepted
last-updated: 2026-04-28
related: [spec, artifact, retrospective]
tags: [governance, artifact]
---

# ADR

## Definition

A one-page record of an irreversible architectural decision — what was decided, why, what alternatives were considered, and what trade-offs were accepted.

## Why it matters

Article VIII of [`memory/constitution.md`](../../memory/constitution.md) requires ADRs for irreversible decisions; Article IX (Reversibility) is the test of whether an ADR is needed. ADRs preserve rationale that the team will otherwise forget — six months from now nobody remembers *why* PostgreSQL was chosen over DynamoDB, but the ADR does.

ADR bodies are **immutable** from the moment they are accepted. To change a decision, file a new ADR that supersedes the old one; the predecessor's `status` and `superseded-by` pointer fields are the only things that may be updated. This is enforced by [ADR-0001](../adr/0001-record-architecture-decisions.md) and the reviewer agent.

ADRs are the canonical example of the one-file-per-item pattern that the [glossary](../glossary/) itself follows (per [ADR-0010](../adr/0010-shard-glossary-into-one-file-per-term.md)).

## Examples

File one for any decision that:

- Constrains future implementation choices (e.g. *"Adopt EARS for functional requirements"* — [ADR-0003](../adr/0003-adopt-ears-for-functional-requirements.md)).
- Is hard to reverse — data shape, public API, vendor commitment, security boundary.
- Trades off in a way the team will forget the rationale for.

> *"Don't expand the workflow with new stages or roles without an ADR."* — `CLAUDE.md`

## Avoid

- *Design doc* — much longer, covers structure not just rationale; ADR is intentionally one page.
- *Spike* — exploratory; an ADR is the *outcome* of a spike, not the spike itself.
- *Comment in code* — code comments rot; ADRs are durable.

## See also

- [`templates/adr-template.md`](../../templates/adr-template.md) — canonical shape.
- [`.claude/skills/new-adr/SKILL.md`](../../.claude/skills/new-adr/SKILL.md) — scaffolding skill (`/adr:new`).
- [`docs/adr/README.md`](../adr/README.md) — index of all accepted ADRs.
- [spec](./spec.md) — specs reference relevant ADRs in their `## References` section.
