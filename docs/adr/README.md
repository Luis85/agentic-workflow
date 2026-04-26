# Architecture Decision Records (ADRs)

Records of architecturally significant decisions. Format follows Michael Nygard's lightweight template (see [`templates/adr-template.md`](../../templates/adr-template.md)).

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-adopt-spec-driven-development.md) | Adopt spec-driven development | Accepted |
| [0003](0003-adopt-ears-for-functional-requirements.md) | Adopt EARS for functional requirements | Accepted |

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
