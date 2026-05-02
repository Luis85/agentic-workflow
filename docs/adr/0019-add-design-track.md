---
id: ADR-0019
title: Add a Design Track as an opt-in first-party workflow
status: accepted
date: 2026-05-01
deciders:
  - human
consulted:
  - ux-designer
  - ui-designer
  - product-page-designer
informed:
  - all stage agents
supersedes: []
superseded-by: []
tags: [design-system, brand, track, workflow, design]
---

# ADR-0019 — Add a Design Track as an opt-in first-party workflow

## Status

Accepted

## Context

ADR-0016 adopted the `specorator-design` skill as the canonical brand source. ADR-0018 wired `sites/styles.css` to consume its tokens. Phase 3 added the `brand-reviewer` gate. These three phases addressed the *enforcement* half of the design system story: any contributor editing `sites/` now has a canonical source to reference and a gate that checks them.

The *creation* half remains unaddressed. Two situations exist where an agent needs to produce a new user-visible surface from scratch:

1. **A second surface is in scope** (docs site, onboarding flow, dashboard, marketing page). There is currently no structured track that takes a design brief and produces a spec-ready, brand-compliant visual artifact.
2. **Stage 4 (Design) for a feature with significant UI** currently relies on `ux-designer` and `ui-designer` acting without a brand-aware orchestrator. Neither agent currently reads `specorator-design` before emitting component or token choices.

The integration plan deferred this track until a second surface existed. Phase 4 is now due. Rather than waiting for a specific surface, we ship the track in a *generic, surface-agnostic form* so it is ready the moment the second surface is identified. The track's first concrete invocation will serve as a live test.

## Decision

We add a **Design Track** as a first-party opt-in workflow, at the same level as the Discovery, Quality, and Roadmap tracks.

### Track identity

- **Entry command:** `/design:start <slug>`
- **Track directory:** `designs/<slug>/`
- **Phases:** Frame → Sketch → Mock → Handoff (four phases; no separate Spec phase — the handoff artifact feeds directly into `/spec:design` or the engineer)
- **Orchestrating agent:** `design-lead` (new) — reads `specorator-design`, sequences `ux-designer` and `ui-designer`, gates each phase, writes the handoff artifact
- **Consulted agents:** `ux-designer` (flows, IA, states), `ui-designer` (components, tokens, microcopy), `brand-reviewer` (optional inline check at Mock phase)

### Phase sequence

```
Frame → Sketch → Mock → Handoff
```

| Phase | Owner | Consulted | Artifact |
|---|---|---|---|
| Frame | design-lead | product-strategist, ux-designer | `design-brief.md` |
| Sketch | design-lead | ux-designer | `sketch.md` |
| Mock | design-lead | ui-designer, brand-reviewer (optional) | `mock.html` (optional) |
| Handoff | design-lead | ui-designer | `design-handoff.md` |

### Skill dependency

`design-lead` reads `.claude/skills/specorator-design/SKILL.md` and `colors_and_type.css` as mandatory inputs before any phase that produces visual output. No token, weight, radius, or shadow may be invented — every value must resolve to a named token in `colors_and_type.css` or be proposed as an addition via PR before use.

### Agent patches

- `ux-designer.md` — add: *"When working in the Design Track, read `.claude/skills/specorator-design/SKILL.md` before specifying any visual state. Flow descriptions must use token names, not hex codes."*
- `ui-designer.md` — add: *"When working in the Design Track, invoke `.claude/skills/specorator-design/SKILL.md` before Part B. All component and token choices must resolve to named tokens in `colors_and_type.css`."*

### Docs surface

- `docs/design-track.md` — full methodology (mirrors `docs/discovery-track.md` in structure)
- `docs/specorator.md` — add Design Track to the workflow diagram, slash command map, and "Tracks" section; increment the track count from "Eight" to "Nine"
- `docs/adr/README.md` — add ADR-0019 row

### Templates

- `templates/design-brief-template.md`
- `templates/design-sketch-template.md`
- `templates/design-handoff-template.md`
- `templates/design-state-template.md`

## Considered options

### Option A — Add the design track now, generically (chosen)

- Pros: Track is ready when the second surface arrives. Agents gain the brand dependency immediately. The track's first invocation serves as a live integration test.
- Cons: The track ships without a concrete surface to test against. The handoff artifact's value is unproven until a second surface exists.

### Option B — Defer until a second surface is identified

- Pros: The track is validated against a real target before it ships.
- Cons: Repeats the deferral pattern of Phase 4 indefinitely. Every surface designed in the interim does so without the track's structure.

### Option C — Extend Stage 4 (`/spec:design`) instead of adding a track

- Pros: No new track; the existing design stage absorbs the brand dependency.
- Cons: Stage 4 is a lifecycle stage for feature design, not surface creation. A new landing page, docs site, or marketing surface is not a feature in a spec — it is a design artifact. Conflating the two muddies the lifecycle model.

We choose Option A. Option B is rejected because it offers no stopping condition. Option C is rejected because the conceptual distinction between feature design and surface creation is architecturally significant.

## Consequences

### Positive

- A structured, brand-aware path exists for producing new user-visible surfaces.
- `ux-designer` and `ui-designer` gain an explicit specorator-design dependency — reducing the chance of off-brand component or token choices at Stage 4.
- The Design Track integrates with the brand-reviewer gate at Mock phase (optional inline check), making brand review a natural part of the creation flow, not just an enforcement gate at PR time.
- The track is generic and surface-agnostic: it works for a docs site, a dashboard, an onboarding flow, or a marketing page without modification.

### Negative

- A new `design-lead` agent adds a role to the agent roster. The roster is already long; this agent must stay narrow.
- Four new templates add maintenance surface. Templates are immutable once a design uses them; corrections require a new template version.
- The track ships without a live target. The first real invocation may reveal gaps in the phase structure that require a patch ADR.

### Neutral

- The track does not replace Stage 4 (`/spec:design`). For a feature with a UI component, Stage 4 still runs. The Design Track is for *surfaces*, not *features*.
- `mock.html` is optional. The handoff artifact (`design-handoff.md`) is the gate artifact; the mock is noted in the skill but not blocking. Teams without a design tool can produce a spec-quality handoff without an HTML prototype.
- The track follows the same directory convention as Discovery (`designs/<slug>/`) and the same state-machine pattern (`design-state.md`).

## Compliance

- `docs/design-track.md` exists and defines all four phases with quality gates.
- `.claude/agents/design-lead.md` exists and lists `specorator-design` as a mandatory read.
- `ux-designer.md` and `ui-designer.md` carry the Design Track brand-dependency note.
- `/design:start` is listed in `docs/specorator.md` slash command map.
- `docs/specorator.md` workflow section references the Design Track alongside Discovery, Quality, and Roadmap.
- `docs/adr/README.md` carries the ADR-0019 row.

## References

- [`ADR-0016`](0016-design-system-as-skill.md) — adopting the skill as canonical brand source.
- [`ADR-0018`](0018-sites-consumes-tokens.md) — sites consuming tokens.
- [`.claude/skills/specorator-design/SKILL.md`](../../.claude/skills/specorator-design/SKILL.md)
- [`docs/integration-plan-design-system.md`](../integration-plan-design-system.md) — Phase 4 sketch.
- [`docs/discovery-track.md`](../discovery-track.md) — structural model for this track.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
