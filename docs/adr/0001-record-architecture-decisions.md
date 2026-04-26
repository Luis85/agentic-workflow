---
id: ADR-0001
title: Record architecture decisions
status: accepted
date: 2026-04-26
deciders: [repo-owner]
tags: [process, governance]
---

# ADR-0001 — Record architecture decisions

## Status

Accepted

## Context

This repository defines a workflow for spec-driven, agentic software development. Architectural and process decisions made during its evolution will compound: a choice taken in v0.1 (e.g., "use EARS", "use the constitution as a memory file") will shape every project that adopts the kit.

Without a record, the *rationale* behind those choices evaporates. New contributors (human or agent) will re-litigate settled questions or, worse, silently undo decisions they don't understand.

## Decision

We will record architecturally significant decisions as **Architecture Decision Records (ADRs)** under `docs/adr/`, following a lightweight Michael-Nygard-style template ([`templates/adr-template.md`](../../templates/adr-template.md)).

- Each ADR is a Markdown file named `NNNN-imperative-title.md`.
- ADRs are immutable. Changes are made by superseding, not editing.
- Statuses: `Proposed`, `Accepted`, `Deprecated`, `Superseded by ADR-NNNN`.
- An index in [`docs/adr/README.md`](README.md) lists all ADRs.
- Decisions affecting templates, agents, the constitution, or quality gates **must** be ADR-tracked.

## Consequences

### Positive

- Decisions are durable; rationale survives turnover.
- New contributors can self-onboard by reading the ADR log.
- Prevents silent regressions of settled questions.

### Negative

- Lightweight overhead per non-trivial decision.

### Neutral

- The `/adr:new` slash command and ADR template lower the friction of compliance.

## References

- Michael Nygard, *Documenting Architecture Decisions* — https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- joelparkerhenderson/architecture-decision-record — https://github.com/joelparkerhenderson/architecture-decision-record
