---
id: ADR-0029
title: Make the multi-framework adapter pipeline additive-only over canonical sources
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
tags: [adapters, multi-framework, safety, generation]
---

# ADR-0029 — Make the multi-framework adapter pipeline additive-only over canonical sources

## Status

Accepted

## Context

The Multi-Framework Adapters feature (PRD-ADAPT-001) introduces a Node.js generation script that converts canonical Claude-baseline files into Cursor and Codex adapter outputs. Two boundary properties of this pipeline are architecturally load-bearing:

1. The script must never modify any canonical source file (`.claude/`, `AGENTS.md`, `CLAUDE.md`, `memory/constitution.md`). Captured in PRD non-goal NG5.
2. The script must never modify any hand-authored Codex file (`.codex/README.md`, `.codex/instructions.md`, `.codex/workflows/*.md`). Captured in PRD non-goal NG4 and REQ-ADAPT-026.
3. The script must never modify `AGENTS.md` to add the `INDEX.md` pointer; that step remains a manual one-time human action. Captured in PRD non-goal NG10 and REQ-ADAPT-008.

These constraints were explicitly negotiated during requirements clarification (CLAR-016, blocker) and reflect a safety boundary: an additive-only pipeline cannot silently corrupt authored content even under a logic bug, and recovery from a bad sync is always a delete + regenerate, never a restore-from-backup.

Two boundary models were considered: additive-only (write only to designated output paths, never read-modify-write canonical or hand-authored files); or full read-modify-write (script can edit any file in service of consistency).

## Decision

We will keep the multi-framework adapter pipeline strictly additive-only with respect to canonical and hand-authored files.

- The script writes to exactly these output locations and nowhere else:
  - `.cursor/rules/<name>.mdc`
  - `.cursor/rules/.adapter-manifest.json`
  - `.codex/agents/<slug>.md`
  - `.codex/agents/INDEX.md`
  - `.codex/skills/<slug>.md`
- The script reads canonical sources but never writes to `.claude/`, `AGENTS.md`, `CLAUDE.md`, or `memory/constitution.md`.
- The script does not write to any file under `.codex/` that lacks the generated-file header (`<!-- GENERATED` line 1 for `.md` files, `x-generated: true` in frontmatter for `.mdc` files).
- The `AGENTS.md` pointer to `.codex/agents/INDEX.md` is a documented manual one-time setup step, not automated.

## Considered options

### Option A — Additive-only pipeline (chosen)

- Pros: Zero risk of corrupting canonical or hand-authored content; simple recovery model (delete generated outputs + re-run); satisfies CLAR-016 blocker resolution; clear ownership boundary between human-authored and generated content.
- Cons: First-time setup includes a manual step (adding the `AGENTS.md` pointer); maintainers must understand that some integration touchpoints are not automated.

### Option B — Read-modify-write pipeline with sentinel guards

- Pros: Could automate the `AGENTS.md` pointer setup; one-shot install with no manual follow-up.
- Cons: Requires the script to edit `AGENTS.md`, violating NG5 and NG10; sentinel-based edits to canonical files are fragile (a maintainer reformatting `AGENTS.md` could break the sentinel match); silent overwrite of canonical content under bugs is high-impact and hard to diagnose; CLAR-016 explicitly rejected this path.

## Consequences

### Positive

- The blast radius of any bug in `generate.mjs` is bounded to the additive output paths; canonical sources are guaranteed intact.
- Recovery from a malformed generation is mechanical: delete the contents of `.cursor/rules/`, `.codex/agents/<generated>`, `.codex/skills/`, then re-run `adapters:sync`.
- Future contributors reading the script can verify the additive-only property by inspecting its `fs.writeFile` call sites against a small allowlist.
- The hand-authored / generated boundary in `.codex/` is enforced by header presence, not by file path lists, making the boundary self-documenting.

### Negative

- First-time setup requires a one-time manual step (adding the `AGENTS.md` pointer to `.codex/agents/INDEX.md`); the first-run reminder message mitigates but does not eliminate this friction.
- Future requests to "just have the script update `AGENTS.md`" must be rejected without superseding this ADR.

### Neutral

- The decision does not constrain how outputs are formatted internally — only which paths may be written.
- The decision is irreversible in practice: any PR loosening it would need to demonstrate that the safety properties above can be preserved by other means.

## Compliance

- `adapters:check` validates that every output path listed in the manifest's `outputs` array is one of the additive output paths above. A path outside the allowlist is treated as a header-integrity failure.
- The script's write call sites are reviewed against the additive allowlist during code review for any change to `scripts/adapters/generate.mjs`.
- Test coverage includes a "canonical files unchanged" assertion: capture SHA-256 of `.claude/`, `AGENTS.md`, `CLAUDE.md`, `memory/constitution.md` before and after a sync run; bytes must match.

## References

- PRD-ADAPT-001 non-goals NG4, NG5, NG9, NG10 (`specs/multi-framework-adapters/requirements.md`)
- REQ-ADAPT-026 — Codex hand-authored file protection
- REQ-ADAPT-008 — Codex agent file discovery index (PM decision note on `AGENTS.md`)
- CLAR-016 (resolved blocker) in `specs/multi-framework-adapters/workflow-state.md`
- DESIGN-ADAPT-001 — Part C (`specs/multi-framework-adapters/design.md`)
- ADR-0028 — Treat the Claude baseline as the canonical source for multi-framework adapters

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
