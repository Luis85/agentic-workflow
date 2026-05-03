---
id: ADR-0028
title: Treat the Claude baseline as the canonical source for multi-framework adapters
status: accepted
date: 2026-05-03
deciders:
  - architect
consulted:
  - pm
  - analyst
informed:
  - dev
  - qa
supersedes: []
superseded-by: []
tags: [adapters, multi-framework, generation, traceability]
---

# ADR-0028 — Treat the Claude baseline as the canonical source for multi-framework adapters

## Status

Accepted

## Context

Specorator is built and maintained through Claude Code. Its agent definitions, skill definitions, and operating conventions live under `.claude/agents/`, `.claude/skills/`, and `AGENTS.md`. Teams adopting the template through Cursor or Codex currently hand-translate those files, which drifts silently and introduces semantic divergence between frameworks.

The Multi-Framework Adapters feature (PRD-ADAPT-001) introduces a one-directional generation flow: canonical Claude-baseline files are read, transformed, and written into framework-specific adapter outputs. The choice of which framework holds the source-of-truth role is architecturally load-bearing because it determines:

- where contributors edit content,
- which files trigger regeneration,
- which files are protected from automated overwrite,
- how traceability flows from requirement to generated artifact.

Three candidates were considered: keep Claude baseline as canonical (status quo); promote a framework-neutral intermediate format; or treat each framework as peer with bi-directional sync.

## Decision

We will treat the Claude baseline (`.claude/agents/*.md`, `.claude/skills/*.md`, and root `AGENTS.md`) as the single canonical source for all multi-framework adapter generation.

- The adapter generation script (`scripts/adapters/generate.mjs`) reads only these canonical files plus its own script source for the manifest hash.
- Cursor (`.cursor/rules/*.mdc`) and Codex (`.codex/agents/*.md`, `.codex/skills/*.md`, `.codex/agents/INDEX.md`) outputs are derived artifacts.
- No transformation flows in the reverse direction: edits to adapter outputs are not propagated back to the Claude baseline.
- Every adapter output carries a generated-file header pointing to its canonical source path, satisfying the trace-everything constitution principle.

## Considered options

### Option A — Claude baseline as canonical source (chosen)

- Pros: Aligns with how Specorator is already built and maintained; no migration burden; preserves existing tooling (`.claude/` layout, agent scoping, skill conventions); single edit point per concept; trace chain is one hop.
- Cons: Cursor and Codex adopters cannot contribute upstream by editing their framework-native files; they must edit `.claude/` source.

### Option B — Framework-neutral intermediate format

- Pros: No framework gets privileged status; all adapters (Claude, Cursor, Codex) generated from the same intermediate; theoretically simplifies adding more frameworks.
- Cons: Requires designing and maintaining a new schema; doubles the surface area (intermediate plus generators); breaks every existing `.claude/` convention; high migration cost; intermediate format becomes its own dialect to learn.

### Option C — Peer framework files with bi-directional sync

- Pros: Each framework is editable in its native form; no canonical/derived hierarchy.
- Cons: Bi-directional sync requires conflict resolution semantics that no current tooling provides; silent merge bugs likely; violates non-goal NG2 of PRD-ADAPT-001 (no two-way sync); doubles the failure surface.

## Consequences

### Positive

- Trace chain is unambiguous: REQ → spec → `.claude/<x>.md` → generated adapter file. Every adapter file's `x-source` or `Source:` header points back to the one authoritative path.
- The generation script's read scope is small and statically bounded: `.claude/agents/`, `.claude/skills/`, `AGENTS.md`, and the script itself.
- Drift detection (REQ-ADAPT-010) is well-defined because canonical source paths are enumerable.
- Adding a new framework adapter (e.g., Aider via separate ADR) becomes a write-side concern only — the read side does not change.

### Negative

- Cursor- and Codex-only contributors cannot edit framework-native files and have those edits flow upstream; they must learn the `.claude/` source layout.
- The Claude baseline becomes a single point of failure for adapter accuracy; a regression in `.claude/` source propagates to every framework on next sync.

### Neutral

- The decision does not constrain how individual generators are implemented (template literals vs template engine, etc.).
- The decision is reversible only at high cost: if a future ADR promotes a different framework or an intermediate format to canonical, every existing adapter file's `x-source` reference and the manifest schema must be updated.

## Compliance

- `adapters:check` enforces the canonical-source contract by verifying that every manifest `sources[].path` resolves to a file under `.claude/` or to root `AGENTS.md`.
- `adapters:sync` will refuse to generate from any source path outside the canonical set; new source roots require an ADR amendment.
- Code review: any PR adding a new generator that reads from outside the canonical set must cite a superseding ADR.

## References

- PRD-ADAPT-001 — Multi-Framework Adapters for Cursor and Codex (`specs/multi-framework-adapters/requirements.md`)
- RESEARCH-ADAPT-001 — Q1, Q2, Q5 verdicts (`specs/multi-framework-adapters/research.md`)
- DESIGN-ADAPT-001 — Part C (`specs/multi-framework-adapters/design.md`)
- ADR-0029 — Make the multi-framework adapter pipeline additive-only over canonical sources

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
