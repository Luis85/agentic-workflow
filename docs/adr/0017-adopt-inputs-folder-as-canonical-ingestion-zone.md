---
id: ADR-0017
title: Adopt `inputs/` as the canonical ingestion folder for new work packages
status: accepted
date: 2026-05-01
deciders:
  - human
consulted:
  - orchestrate
  - discovery-sprint
  - stock-taking
  - sales-cycle
  - project-run
  - portfolio-track
  - project-scaffolding
  - roadmap-management
  - quality-assurance
  - specorator-improvement
informed:
  - all stage agents
  - all track conductor skills
supersedes: []
superseded-by: []
tags: [workflow, intake, ingestion, conventions, methodology]
---

# ADR-0017 — Adopt `inputs/` as the canonical ingestion folder for new work packages

## Status

Accepted

## Context

Work that lands in this repo arrives in many shapes — RFP PDFs, design system zips, brief documents from clients, reference architectures, exported research bundles, screenshots, OpenAPI specs, slide decks, ZIP archives of pre-staged content, and more. Today every track (Specorator lifecycle, Discovery, Stock-taking, Sales, Project Manager, Project Scaffolding, Roadmap, Portfolio, Quality, Specorator Improvement) handles intake differently:

- The **Project Scaffolding Track** has a formal Intake phase that asks for source pointers, but it covers only fresh template installs.
- Other tracks rely on whatever the user pastes into the prompt or remembers to attach.
- Materials sometimes get dropped into ad-hoc folders (`./docs/`, `./scratch/`, the user's Downloads folder, parent directories) that conductors do not look at, so they go unconsulted.
- When source material is large or binary (zips, PDFs, big folder trees) the user has no canonical, agent-readable location to put it before invoking a conductor.

This produces three concrete failure modes:

1. **Missed evidence.** A conductor scopes work without consulting source material the user already collected, then re-asks the user for context they thought they had already provided.
2. **Inconsistent placement.** Each track teaches a different folder convention, so the user has to remember which track wants what.
3. **No retention contract.** Even when material lands somewhere, there is no rule for what happens to it after the work package is consumed.

The recently-imported `inputs/Specorator Design System.zip` work package made the gap concrete: the user dropped a zip in the project root next to a new folder, asked the assistant to "use the input folder for next steps", and the assistant had to invent the convention on the spot.

## Decision

We adopt **`inputs/`** at the repository root as the canonical ingestion folder for new work packages — files, folders, or archives — that any track may need to read.

1. **Single canonical location.** All conductor skills consult `inputs/` at the start of their scope phase before asking the user for source material.
2. **Tracked, not gitignored.** `inputs/` is committed. Small artifacts (briefs, reference docs, zips up to a few MB) live alongside the workflow that consumes them. Sensitive material is excluded by per-file rules in `.gitignore`, not a blanket folder ignore.
3. **No automatic extraction.** Archives are never extracted, decoded, or transformed without an explicit human-approved step. The conductor reads the file listing, surfaces what it found, and asks the user which items are relevant for the active work.
4. **Every conductor asks.** The 10 conversational entry points (`orchestrate`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `portfolio-track`, `project-scaffolding`, `roadmap-management`, `quality-assurance`, `specorator-improvement`) consult `inputs/` even when the active track does not strictly require external material — the cost of asking is small, the cost of missing evidence is large.
5. **Retention is per-track.** Once a work package is consumed (its content captured into the track's canonical artifacts — `idea.md`, `chosen-brief.md`, `scope.md`, `stock-taking-inventory.md`, etc.), the user decides whether to delete the source from `inputs/` or keep it for traceability. The convention is captured in [`docs/inputs-ingestion.md`](../inputs-ingestion.md) and [`inputs/README.md`](../../inputs/README.md).

The methodology document [`docs/inputs-ingestion.md`](../inputs-ingestion.md) is the canonical reference; this ADR ratifies its existence and the cross-track obligation.

## Considered options

### Option A — `inputs/` as the canonical ingestion folder, every conductor asks (chosen)

- Pros: One folder to remember. Every track honours the same convention. Source material is committed and traceable. No magic — extraction always asks. Cheap to retrofit (one shared paragraph in `_shared/conductor-pattern.md` plus per-skill bullets).
- Cons: A new top-level folder. The user must clean up `inputs/` after a work package is consumed if they care about repo size.

### Option B — Per-track ingestion folders (`discovery/inputs/`, `sales/inputs/`, …)

- Pros: Material lives next to the track that consumes it.
- Cons: User has to know which track they are starting before placing the file. Cross-track work packages (e.g., a brief that drives Discovery → Specorator → Project Manager) have no clean home. Fragments the convention.

### Option C — Ad-hoc folders + per-skill prompts

- Pros: Zero convention to enforce.
- Cons: This is the status quo, and it produced the failure modes that motivate this ADR.

### Option D — Cloud bucket / external store with metadata pointer

- Pros: Solves the "large binary in git" worry.
- Cons: Massive overhead at this scale. Adds a vendor dependency the rest of the repo does not need. Defer until an `inputs/` payload is large enough to justify it.

We choose Option A. Option B fragments the convention. Option C is the status quo. Option D is overkill for the current scale and easy to migrate to later (the convention is a folder; replacing it with a pointer file is a one-ADR change).

## Consequences

### Positive

- One place to drop source material. Every conductor looks there.
- Source material is committed alongside the workflow that consumed it, so a future agent (human or AI) can reconstruct what was on the desk when the decision was made.
- New conductors inherit the convention by linking `_shared/conductor-pattern.md` (already linked by 5 of the 10 conductors).
- Removes a class of "did you check the zip in my downloads?" round-trips.

### Negative

- One more top-level folder. Discoverability is solved by the `README.md` in `inputs/` and the AGENTS.md operating rule.
- Committed binaries grow the repo over time. Mitigated by the per-track retention guidance in `docs/inputs-ingestion.md` (default: delete after consumption unless traceability demands keeping it).
- `inputs/` is not gitignored, so a careless commit could publish a sensitive PDF. Mitigated by per-file `.gitignore` rules and the operator note in `inputs/README.md`.

### Neutral

- Conductors that already have a formal Intake phase (`project-scaffolding`) gain a redundant-but-cheap pre-check; this is intentional, since `inputs/` is the cross-track contract.
- No new agent or skill ships with this ADR. The behaviour is encoded in the conductor pattern + per-skill bullets + the AGENTS.md rule.

## Compliance

- `inputs/README.md` is committed and documents folder purpose, retention policy, and what not to put in it.
- `docs/inputs-ingestion.md` is the methodology reference, linked from AGENTS.md, CLAUDE.md, and every conductor skill.
- `_shared/conductor-pattern.md` carries the canonical intake gate.
- Each of the 10 conductor skills references the intake gate in its scope phase.
- A `check:` script may later verify that every conductor SKILL.md mentions the intake gate; not shipped with this ADR.

## References

- [`docs/inputs-ingestion.md`](../inputs-ingestion.md) — methodology and cross-track contract
- [`inputs/README.md`](../../inputs/README.md) — folder purpose and retention rules
- [`.claude/skills/_shared/conductor-pattern.md`](../../.claude/skills/_shared/conductor-pattern.md) — shared intake gate
- Constitution Article VII (Human Oversight) — no automatic extraction without explicit approval
- Constitution Article IX (Reversibility) — extraction and consumption are explicit, scoped actions

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
