---
id: ADR-0002
title: Adopt spec-driven development as the workflow spine
status: accepted
date: 2026-04-26
deciders: [repo-owner]
tags: [process, methodology]
---

# ADR-0002 — Adopt spec-driven development as the workflow spine

## Status

Accepted

## Context

LLM coding agents are fast but fail predictably when given vague intent. They confabulate requirements, drift from design, and produce plausible-but-wrong code. Several mature patterns address this — GitHub Specorator, Amazon Kiro, BMAD-METHOD — and converge on the same insight: **treat specifications as the source of truth and code as their artifact**.

Alternatives considered:

- **Code-first with AI assist** (Cursor / Copilot default mode). Fast for trivial work; degrades sharply at the scale of a feature.
- **Heavy upfront BDUF** (waterfall PRDs). High process cost, brittle to change, no agent affordance.
- **Spec-driven with phased artifacts and quality gates**. Higher upfront cost than code-first, far lower defect cost downstream, plays to LLM strengths (reading structured specs, generating against schemas).

## Decision

The workflow spine is **eleven phased stages** (Idea → Research → Requirements → Design → Specification → Tasks → Implementation → Testing → Review → Release → Learning), each with:

- a defined input,
- a defined output (templated artifact in `templates/`),
- a defined owner (subagent in `.claude/agents/`),
- a defined quality gate (in `docs/quality-framework.md`),
- a defined slash command (`/spec:<stage>` in `.claude/commands/`).

Per-feature work product lives at `specs/<feature-slug>/`. State is tracked in `specs/<feature-slug>/workflow-state.md`. Two optional gates — `/spec:clarify` and `/spec:analyze` — can be inserted between any two stages.

## Considered options

### Option A — Three-artifact flow (requirements → design → tasks), Kiro-style

- Pros: minimal, easy to teach, proven by Kiro.
- Cons: collapses idea/research into requirements, loses traceability to upstream rationale; collapses review/release/retro, loses operational learning loop.

### Option B — BMAD-style 12-persona pipeline

- Pros: rich role separation, sharded artifacts.
- Cons: heavy for small teams, persona explosion duplicates concerns.

### Option C — GitHub Specorator flow (constitution → specify → plan → tasks → implement)

- Pros: production-grade tool support, slash-command UX.
- Cons: doesn't natively cover UX/UI, testing, release, retrospective.

### Option D — Eleven-stage hybrid (chosen)

- Pros: full SDLC coverage; explicit testing, review, release, retro stages; compatible with Specorator / Kiro / BMAD conventions; agent-friendly because each stage has narrow scope.
- Cons: more stages than strictly necessary for trivial work — mitigated by explicit "skip" support in `workflow-state.md`.

## Consequences

### Positive

- End-to-end SDLC coverage (Product → Operations).
- Agent specialisation: each stage owned by one role with narrow tools.
- Defects caught early; traceability is automatic when frontmatter discipline holds.

### Negative

- Process overhead for trivial work (mitigated by explicit skips).
- Adoption requires teams to internalise stage boundaries.

### Neutral

- Templates are the sharp edge of adoption; tune them aggressively to fit a team's reality.

## Compliance

- Each stage's quality gate is in `docs/quality-framework.md`.
- Each artifact has a YAML frontmatter contract.
- Retrospectives feed amendments to templates / agents / constitution.

## References

- [GitHub Specorator](https://github.com/github/specorator)
- [Amazon Kiro — Specs](https://kiro.dev/docs/specs/)
- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
