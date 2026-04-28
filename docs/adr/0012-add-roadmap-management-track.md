---
id: ADR-0012
title: Add a Roadmap Management Track for product and project planning
status: proposed
date: 2026-04-28
deciders:
  - human
consulted:
  - roadmap-manager
  - pm
  - project-manager
informed:
  - all stage agents
  - skill authors
supersedes: []
superseded-by: []
tags: [workflow, roadmap, product-management, project-management, stakeholder-management]
---

# ADR-0012 - Add a Roadmap Management Track for product and project planning

## Status

Proposed

## Context

Specorator has strong support for feature delivery, discovery, project governance, and portfolio governance. It does not yet provide a focused artifact set for maintaining a product or project roadmap that communicates direction, priority, delivery confidence, dependencies, risks, and stakeholder messages.

Roadmap work is distinct from both requirements and project plans. A roadmap should guide product direction and stakeholder alignment, but it must not silently become an accepted requirements document or a false delivery commitment.

Current roadmapping practice favors outcome-led, audience-aware, continuously reviewed roadmaps. Product-management sources emphasize outcomes, themes, goals, metrics, and Now / Next / Later horizons. Project-management sources emphasize scope, milestones, dependencies, resources, risks, and communication. The template needs a track that combines these concerns without blurring ownership boundaries.

## Decision

We add an opt-in Roadmap Management Track.

- Roadmap artifacts live under `roadmaps/<roadmap-slug>/`.
- A new `roadmap-manager` agent owns roadmap artifacts and reads linked delivery evidence.
- A new `roadmap-management` skill conducts the flow conversationally.
- New slash commands live under `/roadmap:*`: start, shape, align, communicate, review.
- New templates define state, strategy, roadmap board, delivery plan, stakeholder map, communication log, and decision log.
- The track is read-only toward `specs/`, `projects/`, `portfolio/`, and `discovery/`.

## Considered options

### Option A - Extend the Portfolio Track

- Pros: Reuses existing strategic planning artifacts.
- Cons: Portfolio management governs many projects and stop/start investment decisions. It is too coarse for a product/project roadmap and team communication.

### Option B - Extend the Project Manager Track

- Pros: Reuses project governance and stakeholder reporting.
- Cons: Project management is delivery-commitment oriented. Product outcome roadmaps and discovery uncertainty need a separate surface.

### Option C - Add a dedicated Roadmap Management Track (chosen)

- Pros: Keeps roadmaps outcome-led, evidence-backed, and communication-ready while preserving boundaries with requirements and delivery governance.
- Cons: Adds another opt-in track and command namespace.

## Consequences

### Positive

- Product managers can maintain outcome-based roadmaps tied to measurable goals.
- Project managers can see delivery confidence, dependencies, risks, and milestone assumptions.
- Stakeholders get audience-specific communication rather than one overloaded roadmap.
- Teams get clearer priority, sequencing, and scope-boundary messages.

### Negative

- More artifacts and commands for users to learn.
- Roadmap-manager must be strict about not laundering ideas into requirements or commitments.

### Neutral

- The track is optional. Teams that already manage roadmaps elsewhere can ignore it or link to external tools from `roadmap-strategy.md`.

## Compliance

- `docs/roadmap-management-track.md` defines the methodology.
- `.claude/agents/roadmap-manager.md`, `.claude/skills/roadmap-management/SKILL.md`, and `.claude/commands/roadmap/*.md` provide operational entry points.
- `templates/roadmap-*-template.md` define artifact shapes.
- `docs/specorator.md`, `docs/workflow-overview.md`, `docs/sink.md`, `README.md`, and `AGENTS.md` reference the track.

## References

- [`docs/roadmap-management-track.md`](../roadmap-management-track.md)
- [`.claude/agents/roadmap-manager.md`](../../.claude/agents/roadmap-manager.md)
- [`.claude/skills/roadmap-management/SKILL.md`](../../.claude/skills/roadmap-management/SKILL.md)
- [`templates/roadmap-state-template.md`](../../templates/roadmap-state-template.md)

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
