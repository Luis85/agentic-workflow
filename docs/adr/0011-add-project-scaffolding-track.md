---
id: ADR-0011
title: Add a Project Scaffolding Track for source-led template adoption
status: proposed
date: 2026-04-28
deciders:
  - human
consulted:
  - architect
  - project-scaffolder
informed:
  - all stage agents
  - skill authors
supersedes: []
superseded-by: []
tags: [workflow, onboarding, scaffolding, documentation]
---

# ADR-0011 — Add a Project Scaffolding Track for source-led template adoption

## Status

Proposed

## Context

Specorator already has entry points for three starting conditions:

- Discovery Track: the team has a blank page and must find the right thing to build.
- Stock-taking Track: the team is building around an existing system that must be inventoried first.
- Lifecycle Track: the team has a clear brief and can start at Stage 1.

There is another common adoption path. A team installs the template for an already-discussed project and has scattered source material: meeting notes, Markdown exports, strategy docs, research summaries, or a client packet. That material is too valuable to ignore, but it is not yet clean enough to be treated as accepted steering, requirements, or design.

Without a dedicated track, agents will either jump straight to `/spec:idea` and lose source traceability, run Discovery despite having usable context, or overwrite steering files with unreviewed synthesis. All three violate the repo's preference for explicit sources, staged ownership, and human acceptance.

## Decision

We add a Project Scaffolding Track.

- The track lives under `scaffolding/<project-slug>/`.
- The track has four phases: Intake, Extract, Assemble, Handoff.
- A new `project-scaffolder` agent owns the artifacts.
- A new `project-scaffolding` skill conducts the flow conversationally.
- New slash commands live under `/scaffold:*`.
- Templates define `scaffolding-state.md`, `intake.md`, `source-inventory.md`, `extraction.md`, `starter-pack.md`, and `handoff.md`.
- The track produces drafts and promotion checklists first. Promotion into canonical locations remains a human-reviewed handoff action.

## Considered options

### Option A — Treat source-led adoption as Discovery

- Pros: Reuses an existing pre-workflow track.
- Cons: Discovery is designed for blank-page ideation. It does not inventory source reliability or produce steering/project starter drafts.

### Option B — Treat source-led adoption as Stock-taking

- Pros: Reuses evidence-first inventory patterns.
- Cons: Stock-taking is scoped to existing systems. General project notes, strategy docs, and first-feature ideas are broader than legacy-system inventory.

### Option C — Add a dedicated Project Scaffolding Track (chosen)

- Pros: Makes first-project onboarding explicit; preserves source traceability; creates reviewable starter documents; routes to the correct downstream track.
- Cons: Adds another opt-in track and command namespace.

## Consequences

### Positive

- Teams adopting the template can start from existing documentation without losing evidence.
- Steering and starter artifacts are drafted in one place before canonical promotion.
- The handoff can route honestly to Discovery, Specorator, Project Manager Track, or Stock-taking.
- The distinction between context extraction and requirements creation stays clear.

### Negative

- More documentation and commands for new users to learn.
- The scaffolder must be strict about source confidence to avoid laundering weak source material into polished but false drafts.

### Neutral

- The track is opt-in. Teams with a blank page or clear brief can ignore it.

## Compliance

- `docs/project-scaffolding-track.md` defines the methodology.
- `docs/sink.md`, `docs/specorator.md`, `docs/workflow-overview.md`, `README.md`, and `AGENTS.md` mention the track.
- `.claude/agents/project-scaffolder.md`, `.claude/skills/project-scaffolding/SKILL.md`, and `.claude/commands/scaffold/*.md` provide the operational entry points.
- `templates/scaffolding-*-template.md` define the artifact shapes.

## References

- [`docs/project-scaffolding-track.md`](../project-scaffolding-track.md)
- [`templates/scaffolding-state-template.md`](../../templates/scaffolding-state-template.md)
- [`.claude/agents/project-scaffolder.md`](../../.claude/agents/project-scaffolder.md)
- [`.claude/skills/project-scaffolding/SKILL.md`](../../.claude/skills/project-scaffolding/SKILL.md)

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
