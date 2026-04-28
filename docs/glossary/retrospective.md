---
term: Retrospective
slug: retrospective
aliases: [retro, post-feature review]
status: accepted
last-updated: 2026-04-28
related: [quality-gate, artifact, agent]
tags: [workflow, process]
---

# Retrospective

## Definition

A short look-back after every feature: what worked, what didn't, what to change next time.

## Why it matters

Article X of [`memory/constitution.md`](../../memory/constitution.md) makes the retrospective at `/spec:retro` (Stage 11) **mandatory, not optional** — even when the feature shipped cleanly. The workflow is a feedback loop; without retros, the loop never closes and the kit never improves.

Each retrospective produces `specs/<slug>/retrospective.md` with three sections — what worked, what didn't, owner-tagged actions — and may propose amendments to templates, agents, or the constitution itself.

A retrospective is distinct from a [post-mortem](../postmortems/) (incident-driven) and from a [post-project review](../project-track.md) (Project Manager Track Group G).

## Examples

> *"Tip: even alone, don't skip the Retrospective at the end. It's where the process improves."* — `README.md`

A typical retrospective row:

> *Action: tighten the PRD template's success-metrics section so the analyst doesn't leave it blank — owned by template maintainer, due before next feature.*

## Avoid

- *Post-mortem* — incident-driven, not feature-driven; lives under [`docs/postmortems/`](../postmortems/).
- *Project closure* — Project Manager Track Group F, scoped to a client engagement, not a single feature.
- *Sprint review* — Scrum-style; the Specorator is not a sprinted process.

## See also

- [`.claude/agents/retrospective.md`](../../.claude/agents/retrospective.md) — the retrospective agent.
- [`templates/retrospective-template.md`](../../templates/retrospective-template.md) — canonical shape.
- [quality-gate](./quality-gate.md) — retros surface gate failures so future gates improve.
- [artifact](./artifact.md) — `retrospective.md` is the Stage 11 artifact.
