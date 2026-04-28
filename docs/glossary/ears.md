---
term: EARS
slug: ears
aliases: [EARS notation, Easy Approach to Requirements Syntax]
status: accepted
last-updated: 2026-04-28
related: [spec, traceability]
tags: [process, quality]
---

# EARS

## Definition

A sentence format for requirements — *Easy Approach to Requirements Syntax* — that makes them unambiguous and 1:1 testable.

## Why it matters

Article VIII of [`memory/constitution.md`](../../memory/constitution.md) mandates EARS for functional requirements: every clause is shaped so that one test can decide whether the clause holds. This eliminates "interpret-then-test" drift between requirements and tests, and makes the requirements → spec → task → code → test chain mechanically traceable.

EARS clauses come in five shapes (ubiquitous, event-driven, state-driven, optional-feature, unwanted-behaviour) — see [`docs/ears-notation.md`](../ears-notation.md) for the full reference.

## Examples

> *"When the user submits the form, the system shall send a confirmation email."*

> *"While the account is locked, when the user attempts to sign in, the system shall reject the attempt and log a `LOCKED_SIGNIN_ATTEMPT` event."*

> *"If a payment provider returns a timeout, then the system shall retry up to three times with exponential backoff."*

## Avoid

- *Use case* — coarser; one use case may decompose into many EARS clauses.
- *User story* — a story names *who* and *why*; EARS names *what* the system does. They sit next to each other.
- *Acceptance criterion* — every EARS clause is an acceptance criterion, but not every acceptance criterion is in EARS form. The reviewer enforces EARS for functional requirements specifically.

## See also

- [`docs/ears-notation.md`](../ears-notation.md) — full notation reference and per-shape examples.
- [ADR-0003](../adr/0003-adopt-ears-for-functional-requirements.md) — the decision to adopt EARS.
- [spec](./spec.md) — EARS is the notation specs use for functional clauses.
- [traceability](./traceability.md) — EARS shape makes 1:1 mapping to tests possible.
