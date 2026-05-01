---
title: Token budget
folder: docs
description: Caps on how much of an AI agent's context window the template's always-loaded files and skill catalog are allowed to consume, plus the verify gate that enforces them.
entry_point: false
---

# Token budget

Caps on how much of an AI agent's context window the template is allowed to consume on every session and every skill auto-trigger. Enforced by `npm run check:token-budget` (wired into `npm run verify`).

## Why this exists

Specorator agents read a fixed always-loaded chain at session start (`CLAUDE.md` → `AGENTS.md` → `memory/constitution.md` → `.claude/memory/MEMORY.md`) and the harness lists every skill's `description` frontmatter on every invocation. If those documents drift bigger over time, every conversation pays the cost. Each skill body is loaded when its skill is invoked, so an oversized skill body is paid every time someone uses it.

The token-budget cleanup that produced this gate (`docs/superpowers/plans/2026-05-01-token-budget-cleanup.md`) cut the always-loaded chain from 28 KB to ~19 KB and the conductor skill bodies from ~53 KB to ~44 KB. The gate locks those numbers in.

## Caps

| Surface | Cap | Rationale |
|---|---|---|
| Always-loaded chain (combined) | **20 480 bytes** (≈ 20 KB) | Currently ~19 KB after dedupe; ~1.3 KB headroom for additive convention notes. Anything bigger is regression. |
| Per-skill `SKILL.md` body | **14 336 bytes** (≈ 14 KB) | Largest is `orchestrate/SKILL.md` at ~12 KB after Chunk 3 factor; ~2 KB headroom for stage / phase additions. |
| Skill description (frontmatter) | **700 chars** | Current max is ~650 chars (`arc42-baseline`). The original cap of 120 chars from PR #119 was rejected; 700 lets skills carry full trigger-phrase fidelity without further compression. |

## What the gate checks

`scripts/check-token-budget.ts` reads each cap and reports failures. Skills without YAML frontmatter (e.g., `verify`, `project-run`, `new-adr`, `review-fix`) are skipped — they pre-date the convention; the gate validates only what is enforceable.

## Adding a new always-loaded file

If a new file legitimately needs to ride in the always-loaded chain (e.g., a future scoped steering reference):

1. Add it to `ALWAYS_LOADED_FILES` in `scripts/check-token-budget.ts`.
2. Confirm the combined size still fits under `ALWAYS_LOADED_CAP`. If not, file an ADR proposing an increase with a token-cost rationale before raising the cap.

## Bumping a cap

Caps may be raised when:

- A new convention requires bytes the current cap can't fit, **and**
- The team agrees the trade-off is worth it, **and**
- An ADR records the rationale.

Caps are not silently bumped to make a failing CI run go green. If `check:token-budget` fails, the right move is to trim the file, not bump the cap.

## Reproducing the gate locally

```bash
npm run check:token-budget
# or as part of the full pre-PR gate:
npm run verify
```
