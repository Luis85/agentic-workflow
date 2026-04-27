---
id: ADR-0007
title: Add a Stock-taking Track for projects that build on existing systems
status: accepted
date: 2026-04-27
deciders: [repo-owner]
consulted: []
informed: []
supersedes: []
superseded-by: []
tags: [process, agents, legacy, inventory, stock-taking]
---

# ADR-0007 — Add a Stock-taking Track for projects that build on existing systems

## Status

Accepted

## Context

Both the Specorator (Stages 1–11) and the Discovery Track (ADR-0005) assume the team is starting from a blank canvas with respect to prior system reality. Stage 2 (Research) can surface *alternatives*, and the Discovery Track can surface *opportunities*, but neither provides a structured way to answer: **"what exactly do we already have?"**

In practice, many projects are not greenfield. A new product must be built on top of, alongside, or as a replacement for one or more existing systems. The inputs to any subsequent planning work are only as good as the team's understanding of:

- **Existing processes** — how work actually flows through the organisation today (not how it was designed to flow).
- **Use-case inventory** — the full set of jobs users and systems perform against the existing solution, including undocumented workarounds.
- **Integrations and dependencies** — external systems, APIs, data feeds, and coupling points that any new solution must honour or explicitly cut.
- **Data landscape** — key entities, ownership, quality, and migration constraints.
- **Technical debt and pain points** — known issues, fragile components, and user frustrations that set the baseline for "better than today".

Without this inventory, teams risk:

1. **Scope blindness** — discovering mid-implementation that a critical existing use-case was never modelled.
2. **Integration surprises** — late-discovered coupling points that force redesign.
3. **Data migration under-estimation** — the classic "just migrate the data" assumption that blows budgets.
4. **Requirements that repeat known failures** — missing the lessons already encoded in the existing system's painful workarounds.

The Discovery Track (ADR-0005) solves "what should we build?" The Specorator solves "how do we build it correctly?" This ADR introduces the **Stock-taking Track** to solve "what do we already have?" — a prerequisite for both when legacy context exists.

The track is informed by established practices for legacy assessment:

- **Systems archaeology** — recovering the intended design from artefacts (code, docs, tribal knowledge). ([Feathers, *Working Effectively with Legacy Code*, 2004](https://www.oreilly.com/library/view/working-effectively-with/0131177052/))
- **Event Storming** as a domain-discovery technique for surfacing implicit processes rapidly. ([Brandolini, *Introducing EventStorming*, 2021](https://www.eventstorming.com/book/))
- **Business Process Mapping** (BPMN-lite) for swim-lane process documentation. ([OMG, BPMN 2.0 specification](https://www.bpmn.org/))
- **Use-Case 2.0** for iterative use-case slicing. ([Jacobson, Spence, Bittner, *Use-Case 2.0*, 2011](https://www.ivarjacobson.com/publications/white-papers/use-case-ebook))
- **Strangler Fig pattern** context-mapping for identifying what to replace vs. retain. ([Fowler, *StranglerFigApplication*, 2004](https://martinfowler.com/bliki/StranglerFigApplication.html))
- **Technical Debt Quadrant** for classifying debt along deliberate/inadvertent and reckless/prudent axes. ([Fowler, *Technical Debt Quadrant*, 2009](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html))

This is a **discovery-of-what-exists** activity, structurally different from both the *discovery-of-what-to-build* activity (Discovery Track) and the *specification-of-what-to-build* activity (Specorator). Merging it into either would violate **Article II — Separation of Concerns**.

## Decision

We adopt a **Stock-taking Track** as a sibling to the 11-stage lifecycle workflow and the Discovery Track:

- The track lives at the repo root under `stock-taking/<project-slug>/` (parallel to `discovery/` and `specs/`). One directory per stock-taking engagement. An engagement scopes to one system or bounded cluster of related systems.
- The track is **3 phases** plus a Handoff:

  | # | Phase | Goal | Output artifact |
  |---|---|---|---|
  | 1 | Scope | Define what is being inventoried — systems, processes, boundaries, stakeholders, and what is explicitly out of scope | `scope.md` |
  | 2 | Audit | Investigate in depth — processes, use-cases, integrations, data landscape, pain points, technical debt | `audit.md` |
  | 3 | Synthesize | Distil findings into a structured inventory — gap analysis, constraints, opportunities, migration considerations | `synthesis.md` |
  | — | Handoff | Produce the consolidated `stock-taking-inventory.md` and recommend the next track (Discovery or Specorator) | `stock-taking-inventory.md` |

- The track is owned by a single specialist agent, **`legacy-auditor`**, which shadows the human role of a Business/Systems Analyst or Enterprise Architect engaged in a legacy assessment. The agent carries all three phases; no facilitator-over-specialist split is used here because the domain expertise is concentrated (unlike the Discovery Track's multi-discipline divergence).

- Slash commands `/stock:start`, `/stock:scope`, `/stock:audit`, `/stock:synthesize`, `/stock:handoff` are added under `.claude/commands/stock-taking/`. Conversational entry is the `stock-taking` skill.

- The track ends with `/stock:handoff` writing `stock-taking-inventory.md`. The inventory's `recommended_next` field declares whether the team should proceed to the Discovery Track (`/discovery:start`) or directly to the Specorator (`/spec:start` + `/spec:idea`).

- A stock-taking engagement is **always project-level, not feature-level**. It scopes to a system or system cluster. Multiple features may emerge from a single engagement and fan out into multiple `specs/<feature>/` or `discovery/<sprint>/` folders.

- The track is **opt-in**. Teams building a new system from scratch skip it entirely. Teams replacing, extending, or integrating with an existing system run it before either track.

## Considered options

### Option A — Expand Stage 2 (Research) to cover legacy assessment (rejected)

Add a "legacy mode" to `/spec:research` that surfaces existing processes and use-cases.

- Pros: smallest delta; no new agents; reuses the existing `research.md` artifact.
- Cons: violates **Article II — Separation of Concerns** — legacy assessment is portfolio-level and precedes feature definition; a feature-scoped research stage cannot model cross-system coupling points or produce a multi-feature-spanning inventory; the analyst agent would need to wear five distinct hats; "no brief yet" scenarios cannot be served because Stage 2 requires a completed `idea.md`.

### Option B — A Discovery Track phase zero (rejected)

Add a "Phase 0 — Stock-taking" inside the Discovery Track, running before Frame.

- Pros: one track to learn; reuses the facilitator + specialist model.
- Cons: not every Discovery Sprint involves a legacy system, so the phase would frequently be skipped and add noise; the Discovery Track's methodology (diverge → converge → prototype → validate) is structurally incompatible with a *purely investigative* phase that produces an inventory rather than a brief; the stock-taking output outlives any single sprint and may be reused across multiple Discovery Sprints and Spec features — coupling it to a sprint would duplicate work unnecessarily.

### Option C — Stock-taking Track as a sibling track (chosen)

Add `stock-taking/<project-slug>/` at the repo root. New `/stock:*` slash commands. One new specialist agent (`legacy-auditor`). Handoff produces `stock-taking-inventory.md` which feeds Discovery Track or `/spec:idea`.

- Pros: respects Article II — assessment of what exists and discovery of what to build are genuinely different concerns; single specialist is appropriate because legacy assessment is one expert's job (not a multi-discipline sprint); inventory outlives any single feature and can be referenced by multiple downstream workflows; can be skipped entirely for greenfield projects; clean separation between what-exists inventory and what-to-build discovery.
- Cons: a third top-level track directory (`stock-taking/`) alongside `discovery/` and `specs/`; one new agent to maintain; the track boundary (scope → audit → synthesize) must be policed so it doesn't drift into requirements or design.

## Consequences

### Positive

- Teams inheriting a legacy system have a structured pre-workflow that prevents scope blindness and integration surprises.
- The inventory artifact (`stock-taking-inventory.md`) becomes a durable, cross-team reference: analysts, designers, architects, and PMs all start from the same baseline rather than each rediscovering the existing system independently.
- Discovery Sprints seeded from a stock-taking engagement produce better-framed opportunities because the Frame phase has concrete constraints and known pain points to work from rather than hypotheses.
- Stage 1 (Idea) and Stage 2 (Research) are unchanged. Teams with a clear brief and no legacy context proceed exactly as before.
- "This can't be done because of constraint X" is surfaced at stock-taking time, not at design or implementation time.

### Negative

- A third top-level directory (`stock-taking/`) alongside `discovery/` and `specs/` adds to the repo's top-level surface area for teams adopting the template.
- The `legacy-auditor` agent must be kept narrow to prevent it from drifting into requirements-writing or solution-design. The agent definition enforces this with explicit boundary rules.
- A stock-taking engagement requires access to existing systems, documentation, and people. When these are unavailable, the audit phase will produce an incomplete inventory — which is still more useful than none, but teams must not treat an incomplete inventory as complete.

### Neutral

- The `stock-taking/` directory sits at the repo root, parallel to `specs/` and `discovery/`. Its naming ("stock-taking") deliberately signals the *activity*, not the output domain.
- The Handoff phase is the *only* link between the stock-taking tree and the downstream trees. No `specs/<slug>/` or `discovery/<sprint>/` directory exists before handoff. After handoff, the inventory is referenced from `chosen-brief.md` (if proceeding via Discovery) or `idea.md` (if proceeding directly to Specorator) `inputs:` frontmatter.

## Compliance

How will we know this decision is being honoured?

- **The reviewer** (Stage 9) flags any `idea.md` or `frame.md` that references an existing system but lacks `inputs: [stock-taking/<project-slug>/stock-taking-inventory.md]` in its frontmatter — the inventory should be the input, not tribal knowledge.
- **The orchestrator** detects active stock-taking engagements (status `active` in `stock-taking-state.md`) and surfaces them before routing to the Discovery Track or Specorator.
- **The `legacy-auditor` agent** enforces its own boundary: it does not write to `specs/<feature>/` or `discovery/<sprint>/`, and does not author requirements, design decisions, or solution proposals. Findings that look like requirements are captured as "candidate requirements" in `synthesis.md` and handed off to the appropriate downstream track.
- **The retrospective** (Stage 11) includes a stock-taking section when the feature originated from a legacy-system engagement, capturing whether the inventory was accurate and what was missed.

## References

- Constitution: [`memory/constitution.md`](../../memory/constitution.md) — Articles II (Separation of Concerns), III (Incremental Progression), VI (Agent Specialisation), VII (Human Oversight).
- [`docs/specorator.md`](../specorator.md) — the 11-stage workflow this track precedes.
- [`docs/discovery-track.md`](../discovery-track.md) — the Discovery Track this track may precede.
- [`docs/stock-taking-track.md`](../stock-taking-track.md) — the full methodology for this track.
- [ADR-0002](0002-adopt-spec-driven-development.md) — specs are source of truth; this ADR extends it: inventory precedes specs when legacy systems are involved.
- [ADR-0005](0005-add-discovery-track-before-stage-1.md) — precedent for a sibling pre-workflow track; stock-taking uses the same structural pattern.

### External sources informing the design

- Feathers, M. *Working Effectively with Legacy Code.* Prentice Hall, 2004. [oreilly.com](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)
- Brandolini, A. *Introducing EventStorming.* Leanpub, 2021. [eventstorming.com/book](https://www.eventstorming.com/book/)
- Object Management Group. *Business Process Model and Notation (BPMN) 2.0.* [bpmn.org](https://www.bpmn.org/)
- Jacobson, I., Spence, I., Bittner, K. *Use-Case 2.0.* Ivar Jacobson International, 2011. [ivarjacobson.com](https://www.ivarjacobson.com/publications/white-papers/use-case-ebook)
- Fowler, M. *StranglerFigApplication.* martinfowler.com, 2004. [martinfowler.com/bliki/StranglerFigApplication.html](https://martinfowler.com/bliki/StranglerFigApplication.html)
- Fowler, M. *TechnicalDebtQuadrant.* martinfowler.com, 2009. [martinfowler.com/bliki/TechnicalDebtQuadrant.html](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)
- Evans, E. *Domain-Driven Design: Tackling Complexity in the Heart of Software.* Addison-Wesley, 2003. [domainlanguage.com/ddd](https://www.domainlanguage.com/ddd/)
- Richardson, C. *Microservices Patterns.* Manning, 2018. [microservices.io](https://microservices.io/)
- Cunningham, W. *The WyCash Portfolio Management System (Ward Explains Debt Metaphor).* 1992. [wiki.c2.com/?WardExplainsDebtMetaphor](http://wiki.c2.com/?WardExplainsDebtMetaphor)

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
