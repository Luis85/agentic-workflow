---
id: ADR-0030
title: Add Repo Adoption Track as v1.1 opt-in companion track
status: proposed
date: 2026-05-03
deciders:
  - human maintainer
consulted:
  - architect
  - pm
  - analyst
informed:
  - all agents
supersedes:
  - ADR-0026
superseded-by: []
tags: [workflow, tracks, v1.1, adoption]
---

# ADR-0030 — Add Repo Adoption Track as v1.1 opt-in companion track

## Status

Proposed

## Context

ADR-0026 froze the v1.0 workflow taxonomy at twelve first-party tracks and explicitly required a superseding ADR before any additional first-party track may enter the set. The freeze was a stabilisation move, not a permanent closure: it named supersession as the prescribed amendment path.

The Repo Adoption Track is a gap identified in IDEA-ADOPT-001 and validated in RESEARCH-ADOPT-001. Today, installing the Specorator scaffold into a foreign git repository is an entirely manual exercise: copy files, inspect conflicts, adapt CI, open a PR. There is no quality gate, no traceability, no standardised output, and no idempotency guard. Failed adoptions convert to abandonment.

The track is structurally distinct from the twelve v1.0 tracks. It is the only proposed track that:

- clones a foreign git repository,
- writes files into a foreign working tree,
- opens a pull request against a foreign git remote.

These properties make it a state-bearing first-party workflow with its own entry point (`/adopt:start <url>`), state home (`adoptions/<slug>/`), and methodology (Review → Parity → Enrich → Push, four phases, gated by `AskUserQuestion` between each). All three tests for "is this a new track" from ADR-0026 are met. It is therefore ineligible to ride as an extension of an existing track.

The design (`specs/repo-adoption-track/design.md`) is complete and does not require any change to the twelve existing tracks. The amendment is purely additive.

## Decision

We add the Repo Adoption Track as the thirteenth first-party track in the Specorator taxonomy, with type *Opt-in companion track*, target version v1.1, and entry point `/adopt:start <url>`.

The taxonomy now reads:

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
| 13 | **Repo Adoption** | **Opt-in companion (v1.1)** | **`/adopt:start <url>`** | **`adoptions/<slug>/`** | ADR-0030 (this document) |

This ADR supersedes ADR-0026 in the narrow sense that the count of first-party tracks moves from 12 to 13. ADR-0026's substantive content — the freeze rule, the classification of agentic security as an extension, the immutability of Stage 4 — remains in force. The amendment process described in ADR-0026 (file a superseding ADR) is the path being exercised here, exactly as anticipated.

The Repo Adoption Track ships in the v1.1 release window. The v1.0 release is unchanged by this ADR.

## Considered options

### Option A — Add as a thirteenth first-party track via supersession (chosen)

- Pros: Solves the documented adoption-friction gap. Uses the prescribed amendment path from ADR-0026. Track has its own state, entry point, methodology, and risk profile — clearly meets the "is this a new track" bar. Additive: no existing track is touched.
- Cons: Track count grows by one; documentation surfaces (`AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, `.claude/skills/README.md`, `sites/index.html`) must be updated.

### Option B — Implement as an extension of Project Scaffolding

- Pros: No taxonomy change; reuses an existing track shape.
- Cons: Project Scaffolding is source-led extraction into draft content for human promotion; it does not clone, install, or open PRs. Stretching it to cover adoption would either dilute the scaffolding methodology or hide adoption's risk profile (irreversible push, foreign-remote write). Adopters would not find the feature where they expect it. Methodology mismatch — research §Q10 already reached this conclusion.

### Option C — Defer indefinitely

- Pros: No taxonomy change; preserves the exact freeze surface.
- Cons: The gap is real and documented. Deferring has a continuing cost: every prospective adopter pays the manual installation tax. The freeze decision in ADR-0026 was about stabilisation for v1.0, not about closing the door on additions; using the prescribed amendment path is in the spirit of the original decision.

## Consequences

### Positive

- Adopters get a supported, gated path from a foreign repository URL to a reviewable PR.
- Track count is canonically 13; the v1.0 freeze is honoured by following its prescribed amendment process.
- The taxonomy demonstrates that supersession-driven amendment works in practice — useful precedent for any v1.2 additions.

### Negative

- Track-count claims in `AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, `.claude/skills/README.md`, and `sites/index.html` must be updated in the implementation PR.
- ADR-0026's body remains immutable; only its `status` and `superseded-by` pointer fields are updated to record this supersession, per the ADR template's immutability rule.

### Neutral

- The Repo Adoption Track is opt-in. Existing v1.0 lifecycle work is unaffected.
- The track ships with its own ADR-class decisions (architecture shape, manifest format) recorded inline in `specs/repo-adoption-track/design.md` rather than as separate ADRs, because those choices are not load-bearing on future template work in the way ADR-0030 itself is.

## Compliance

- **Pending implementation:** `AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, `.claude/skills/README.md`, `sites/index.html`, and `README.md` shall be updated in the implementation PR to reference Repo Adoption as the thirteenth track and link this ADR.
- ADR-0026's frontmatter records `status: superseded` and `superseded-by: [ADR-0030]`; ADR-0026's body is not modified.
- The implementation PR for the Repo Adoption Track references this ADR (REQ-ADOPT-031).
- Reviewers treat any further state-bearing first-party workflow proposal in v1.1 or v1.2 as requiring its own superseding ADR; the precedent set here is supersession, not implicit growth.

## References

- ADR-0026 — Freeze the v1.0 workflow track taxonomy.
- IDEA-ADOPT-001 — `specs/repo-adoption-track/idea.md`.
- RESEARCH-ADOPT-001 — `specs/repo-adoption-track/research.md`.
- PRD-ADOPT-001 — `specs/repo-adoption-track/requirements.md`.
- DESIGN-ADOPT-001 — `specs/repo-adoption-track/design.md` (Part C, especially C.6 and C.9).
- Tracking issue #257 — Repo adoption track tracking issue.
- Process bug issue #258 — Adoption track branch-state regression.
- ADR-0005, ADR-0007, ADR-0011, ADR-0019, ADR-0022 — sister-track precedents for opt-in track addition.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
