---
id: ADR-0009
title: Add opt-in Portfolio Manager role and P5 Express portfolio track
status: accepted
date: 2026-04-27
deciders: [human, portfolio-manager]
supersedes: ~
superseded-by: ~
---

# ADR-0006 — Add opt-in Portfolio Manager role and P5 Express portfolio track

## Status

Accepted

## Context

The Specorator models one feature's journey from idea to retrospective (Stages 1–11). Organisations using the kit as a **service provider** or running **multiple parallel features** need a second level of management — one that looks across the portfolio of programs and projects rather than within a single feature.

P5 Express (https://p5.express/) is a minimalist, practical portfolio management system. Its philosophy matches the kit's own design principles: small surface area, clear cadences, named documents, named roles. It defines:

- Three nested cycles: **X** (6-monthly strategic), **Y** (monthly tactical), **Z** (daily operational).
- **Five management documents**: Portfolio Definition, Portfolio Roadmap, Portfolio Progress Report, Portfolio Improvement Plan, Portfolio Operations Log.
- **Two roles**: Portfolio Manager (operational) and Portfolio Sponsor (strategic, always human).

The existing kit's design prohibits adding workflow layers without an ADR (AGENTS.md §"Don't expand the workflow with new stages or roles without an ADR."). This ADR records that decision.

## Decision

Add an **opt-in portfolio track** parallel to the Specorator lifecycle (Stages 1–11) and the Discovery Track (pre-stage 1). It:

- Lives at `portfolio/<portfolio-slug>/` at the repo root, parallel to `specs/` and `discovery/`.
- Is driven by four slash commands (`/portfolio:start`, `/portfolio:x`, `/portfolio:y`, `/portfolio:z`) and a conversational conductor skill (`portfolio-track`).
- Is served by a new `portfolio-manager` agent (`.claude/agents/portfolio-manager.md`).
- Reads `specs/*/workflow-state.md` files to collect project health signals but **never modifies them**.
- Produces the five P5 Express documents as markdown artifacts under `portfolio/<slug>/`.

The track is:

- **Opt-in** — users who never invoke `/portfolio:start` are not affected. No changes to existing workflow commands or agents.
- **Non-invasive** — read-only access to the Specorator artifact tree.
- **Cadence-driven** — separate commands for each cycle prevent conflating strategic (6-monthly) with operational (daily) work.
- **P5 Express–aligned** — activity names (X1/X2/X3, Y1–Y4, Z1–Z3) and the five documents follow the P5 Express manual directly.

## Alternatives considered

1. **Embed portfolio concerns in the orchestrator.** Rejected — the orchestrator scopes to one feature; mixing portfolio-level concerns would violate Article II (Separation of Concerns) of the constitution.
2. **Use an external tool (Jira roadmap, ProductPlan, etc.).** Rejected — the kit's philosophy is all artifacts in the repo as versioned markdown; externalising would break traceability and the single-source-of-truth principle.
3. **Build a custom portfolio methodology.** Rejected — P5 Express already exists, is minimalist, fits the kit's philosophy, and is free and open under Creative Commons Attribution. No benefit to reinventing it.
4. **Make portfolio management a stage in the Specorator lifecycle.** Rejected — portfolio management is orthogonal to feature development; it operates at a different level of abstraction, a different cadence, and a different ownership model. It must not become a mandatory gate on feature delivery.

## Consequences

**Positive:**
- Service providers and multi-team organisations get a structured, cadence-aware layer above the Specorator with no changes to the existing 11-stage workflow.
- Portfolio artifacts are versioned in the repo alongside feature specs, preserving the single-repo philosophy.
- The `portfolio-manager` agent synthesises health signals from many `workflow-state.md` files without duplicating or modifying them.
- P5 Express's Portfolio Sponsor role reinforces the constitution's Article VII (Human Oversight): humans own intent, priorities, and acceptance.

**Negative:**
- The template directory and `.claude/` directories grow: 1 agent, 4 commands, 6 templates, 1 skill, 1 track doc.
- Users must explicitly invoke `/portfolio:start`; there is no auto-discovery of existing `specs/` projects into a portfolio.
- Portfolio documents are not linked into the Specorator traceability chain (REQ → SPEC → T → code → TEST). They operate at a higher level and use their own ID scheme (P-NNN, I-NNN).

## References

- P5 Express: https://p5.express/
- P5 Express manual: https://p5.express/manual/
- ADR-0005 — Add Discovery Track before Stage 1 (same opt-in parallel-track pattern this ADR follows).
- `docs/portfolio-track.md` — full portfolio track methodology.
