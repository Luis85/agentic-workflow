---
term: Spec
slug: spec
aliases: [specification]
status: accepted
last-updated: 2026-04-28
related: [artifact, ears, traceability]
tags: [artifact, workflow]
---

# Spec

## Definition

A written description of exactly what to build — no ambiguity, no guessing.

## Why it matters

The Specorator workflow is **spec-driven**: code derives from specs, not the other way around (Article I of [`memory/constitution.md`](../../memory/constitution.md)). Every stage's output is a spec at a different level of resolution: `idea.md` is a coarse spec, `requirements.md` is a behavioural spec, `spec.md` (Stage 5) is the implementation-ready spec. If implementation reveals a missing requirement, the spec is updated *before* the code.

In this repo, the standalone file `specs/<slug>/spec.md` (Stage 5, owned by the architect) is the most resolved spec — it lists interfaces, data structures, edge cases, and test scenarios.

## Examples

> *"If implementation reveals a gap, escalate — don't silently invent a requirement. Update the spec first, then the code."* — `AGENTS.md`

A `requirements.md` clause that another stage can implement against:

> *"While the user has an unverified email address, when they request a password reset, the system shall reject the request with code `EMAIL_UNVERIFIED`."*

## Avoid

- *Design doc* — overlaps but is not the same. A spec describes behaviour and contracts; a design describes structure and interactions.
- *Ticket* — a ticket may *reference* a spec, but the spec lives in `specs/<slug>/`, not in the issue tracker.

## See also

- [artifact](./artifact.md) — every spec is also an artifact.
- [ears](./ears.md) — the notation used for spec clauses.
- [traceability](./traceability.md) — how each spec links to tasks, code, and tests.
- [`docs/specorator.md`](../specorator.md) — full workflow definition.
