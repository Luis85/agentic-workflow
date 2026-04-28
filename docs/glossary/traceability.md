---
term: Traceability
slug: traceability
aliases: [trace, traceability matrix, RTM]
status: accepted
last-updated: 2026-04-28
related: [spec, ears, artifact, quality-gate]
tags: [process, quality, governance]
---

# Traceability

## Definition

The discipline of linking every piece of code back to a task, every task to a requirement, and every requirement to a test — so that any change can be reasoned about across the full chain.

## Why it matters

Article V of [`memory/constitution.md`](../../memory/constitution.md) makes traceability a first-class artifact requirement: no requirement may exist without a downstream chain by the time `/spec:review` runs. The full chain is:

```
Requirement (REQ-X-NNN)
   → Spec (SPEC-X-NNN)
   → Task (T-X-NNN)
   → Code (file:line)
   → Test (TEST-X-NNN)
   → Review finding (R-X-NNN)
```

The traceability matrix in `specs/<slug>/traceability.md` is **regenerable** from the artifacts (frontmatter plus marked-up per-item entries in body) — see [`docs/traceability.md`](../traceability.md). The reviewer agent rebuilds and validates it as part of Stage 9.

## Examples

> *"Trace everything. Every requirement, task, and test has an ID. Reference IDs in commits, PRs, and artifacts."* — `AGENTS.md`

A commit message that participates in the chain:

> *`feat(auth): add T-AUTH-014 password reset (implements REQ-AUTH-007, tested by TEST-AUTH-019)`*

A traceability row:

| Requirement | Spec | Task | Code | Test |
|---|---|---|---|---|
| REQ-AUTH-007 | SPEC-AUTH-012 | T-AUTH-014 | `src/auth/reset.ts:34` | TEST-AUTH-019 |

## Avoid

- *Audit trail* — narrower; an audit trail records *who did what when*. Traceability is about *what depends on what*.
- *Linking* — generic; "traceability" specifically means the requirement → test chain at the artifact level.

## See also

- [`docs/traceability.md`](../traceability.md) — ID scheme and per-artifact frontmatter conventions.
- [ears](./ears.md) — EARS shape makes 1:1 requirement-to-test traceability possible.
- [spec](./spec.md), [artifact](./artifact.md) — the things being traced.
- [quality-gate](./quality-gate.md) — Stage 9's gate fails if traceability is incomplete.
