---
term: Discovery Track
slug: discovery-track
aliases: [discovery sprint, design sprint]
status: accepted
last-updated: 2026-04-28
related: [spec, artifact, agent, quality-gate]
tags: [workflow, process]
---

# Discovery Track

## Definition

A structured ideation mini-sprint — Frame → Diverge → Converge → Prototype → Validate → Handoff — used when there is no clear brief yet. Produces a `chosen-brief.md` that feeds Stage 1 (Idea) of the Specorator lifecycle.

## Why it matters

The Discovery Track is the **opt-in pre-Stage-1 track** introduced by [ADR-0005](../adr/0005-add-discovery-track-before-stage-1.md). It exists because Article II of [`memory/constitution.md`](../../memory/constitution.md) — Separation of Concerns — forbids writing code from a vague brief. When you have a problem but no clear solution, running discovery first is how you produce a brief crisp enough to enter Stage 1 cleanly.

The track is sequenced by the `facilitator` agent and a set of consulted specialists (`product-strategist`, `user-researcher`, `divergent-thinker`, `critic`, `prototyper`, `game-designer`). State lives at `discovery/<sprint-slug>/discovery-state.md`. The sprint may emit **0, 1, or N** chosen briefs — zero is a valid no-go outcome.

## Examples

> *"When you don't have a brief yet — blank page, multiple candidate ideas, no clear winner — run the Discovery Track first."* — `CLAUDE.md`

> *"Let's run a design sprint"* — natural-language entry point; the [`discovery-sprint`](../../.claude/skills/discovery-sprint/SKILL.md) skill picks up from there.

## Avoid

- *Stage 0* — implies it is part of the lifecycle; it is a separate, opt-in track that *precedes* the lifecycle.
- *Brainstorm* — only the Diverge phase is open brainstorming; the track as a whole is structured ideation with five distinct phases.
- *Sales Cycle* — a different opt-in pre-track for service providers (Qualify → Scope → Estimate → Propose → Order); it produces an `order.md`, not a `chosen-brief.md`.

## See also

- [`docs/discovery-track.md`](../discovery-track.md) — full track methodology and phase-by-phase guide.
- [ADR-0005](../adr/0005-add-discovery-track-before-stage-1.md) — the decision to add the track.
- [`.claude/skills/discovery-sprint/SKILL.md`](../../.claude/skills/discovery-sprint/SKILL.md) — conversational conductor skill.
- [spec](./spec.md), [artifact](./artifact.md) — the chosen-brief is an artifact that feeds the spec chain.
