---
id: ADR-0026
title: Freeze the v1.0 workflow track taxonomy
status: accepted
date: 2026-05-02
deciders:
  - human maintainer
consulted:
  - architect
  - release-manager
informed:
  - all agents
supersedes: []
superseded-by: []
tags: [workflow, tracks, v1]
---

# ADR-0026 - Freeze the v1.0 workflow track taxonomy

## Status

Accepted

## Context

The repository now has several workflow surfaces that describe tracks from different angles: `AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, `.claude/skills/README.md`, `README.md`, and the public product page. Those surfaces drifted:

- `CLAUDE.md` listed only a subset of opt-in tracks.
- `AGENTS.md` listed most agent classes but did not identify one canonical v1.0 track set.
- `sites/index.html` still said "Eight more tracks" while newer Design and Issue Breakdown work existed.
- `.claude/skills/README.md` listed conductor skills but not every first-party track conductor.
- v0.6 planning introduced an agentic security review path that could be misread as a new track.

Issue #192 blocks v1.0 readiness until the project can name the final track set and stop adding implicit tracks through scattered documentation.

## Decision

We freeze the v1.0 workflow taxonomy at **12 first-party tracks**:

| # | Track | Type | Primary entry | State home | Source |
|---|---|---|---|---|---|
| 1 | Lifecycle | Core | `/spec:start` | `specs/<slug>/workflow-state.md` | `docs/specorator.md` |
| 2 | Discovery | Opt-in pre-workflow | `/discovery:start` | `discovery/<slug>/discovery-state.md` | ADR-0005 |
| 3 | Stock-taking | Opt-in pre-workflow | `/stock-taking:start` | `stock-taking/<slug>/stock-taking-state.md` | ADR-0007 |
| 4 | Sales Cycle | Opt-in pre-contract | `/sales:start` | `sales/<slug>/deal-state.md` | ADR-0006 |
| 5 | Project Manager | Opt-in governance | `/project:start` | `projects/<slug>/project-state.md` | ADR-0008 |
| 6 | Roadmap Management | Opt-in planning | `/roadmap:start` | `roadmaps/<slug>/roadmap-state.md` | ADR-0012 |
| 7 | Portfolio | Opt-in governance | `/portfolio:start` | `portfolio/<slug>/portfolio-state.md` | ADR-0009 |
| 8 | Quality Assurance | Opt-in readiness | `/quality:start` | `quality/<slug>/quality-state.md` | `docs/quality-assurance-track.md` |
| 9 | Project Scaffolding | Opt-in onboarding | `/scaffold:start` | `scaffolding/<slug>/scaffolding-state.md` | ADR-0011 |
| 10 | Design | Opt-in surface creation | `/design:start` | `designs/<slug>/design-state.md` | ADR-0019 |
| 11 | Issue Breakdown | Opt-in post-tasks parallelisation | `/issue:breakdown` | `specs/<slug>/issue-breakdown-log.md` | ADR-0022 |
| 12 | Specorator Improvement | Opt-in template improvement | `/specorator:update` | existing docs/spec artifacts | `docs/specorator.md` |

No additional first-party track may enter the v1.0 set without a superseding ADR. New checklists, skills, commands, or docs that extend one of these tracks do not count as new tracks unless they add a new top-level workflow with its own state, entry point, and methodology.

Two current ambiguity points are resolved:

1. The **Design Track remains opt-in** for surface creation. It is not promoted into the core lifecycle, and Stage 4 remains the feature-level design stage.
2. The v0.6 **agentic security review path is not a thirteenth track**. It is a QA/reviewer extension: a review checklist or skill that can be used inside Quality Assurance, Review, or Release readiness without adding a new state-bearing workflow.

This ADR is the canonical source for track count and classification. Other docs may summarize the list, but they should link back here when they need to make a count claim.

## Considered options

### Option A - Freeze the current set and classify security as an extension

- Pros: Stabilizes v1.0, avoids adding another track while v0.6 is still open, preserves ADR-0019's opt-in Design Track decision.
- Cons: Agentic security does not get a standalone workflow identity.

### Option B - Add agentic security as a thirteenth track

- Pros: Gives security a visible entry point and state home.
- Cons: Expands the pre-v1.0 surface area and conflicts with the goal of a stable mental model.

### Option C - Collapse Design into Stage 4

- Pros: Reduces the track count by one.
- Cons: Supersedes ADR-0019 and conflates surface creation with feature-level design.

## Consequences

### Positive

- v1.0 readiness has one canonical track inventory.
- Public and agent-facing docs can stop carrying inconsistent counts.
- v0.6 agentic security work can proceed as an extension without waiting for a new-track decision.

### Negative

- Future track proposals before v1.0 now require a superseding ADR.
- Some existing docs must be updated to replace local counts with this ADR.

### Neutral

- Issue Breakdown remains proposed under ADR-0022 but is still counted because it has already shipped as a first-party opt-in track surface.
- Quality Assurance remains a first-party track even though it was introduced through a methodology doc rather than a numbered ADR.

## Compliance

- `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/specorator.md`, `.claude/skills/README.md`, and `sites/index.html` link or align with this track taxonomy.
- `specs/version-0-6-plan/workflow-state.md` resolves CLAR-V06-002 as a QA/reviewer extension, not a new track.
- Reviewers treat any new state-bearing first-party workflow proposal before v1.0 as requiring a superseding ADR.

## References

- Issue #192 - Track-count freeze before v1.0.
- Issue #195 - v0.6 scope-cut decision.
- Issue #196 - unresolved clarification inventory.
- ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0011, ADR-0012, ADR-0019, ADR-0022.
- `docs/specorator.md`
- `docs/specorator-product/product.md`
- `specs/version-0-6-plan/workflow-state.md`

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
