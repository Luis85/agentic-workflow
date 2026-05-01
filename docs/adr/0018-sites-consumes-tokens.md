---
id: ADR-0018
title: Flip sites/styles.css to consume design-system tokens
status: proposed
date: 2026-05-01
deciders:
  - human
consulted:
  - product-page-designer
  - reviewer
informed:
  - all stage agents
supersedes: []
superseded-by: []
tags: [design-system, brand, sites, tokens, refactor]
---

# ADR-0018 — Flip `sites/styles.css` to consume design-system tokens

## Status

Proposed

## Context

ADR-0016 adopted the `specorator-design` skill as the canonical brand source and shipped `colors_and_type.css` as the canonical token file. After Phase 1, two facts hold simultaneously:

1. The skill defines tokens (`--ink`, `--paper`, `--accent`, `--highlighter`, …) that match the values in `sites/styles.css` exactly.
2. `sites/styles.css` continues to carry those values as raw literals (`#17201b`, `#fbfcf8`, …) inside `:root` and inline throughout the file.

The relationship is currently **read-only-by-mirror**: the skill mirrors the page; the page does not consume the skill. Any future change that touches a brand value has to be made in two places, and the contract that "the skill is the source of truth" is informal — there's no compile-time pressure stopping a contributor from editing a literal in `sites/styles.css` and forgetting to update the skill.

This decision flips the relationship.

## Decision

We change `sites/styles.css` from a self-contained stylesheet to a **consumer of the token file**:

1. Prepend `sites/styles.css` with `@import url("../.claude/skills/specorator-design/colors_and_type.css");`.
2. Replace every literal value in `sites/styles.css` body with `var(--token)`. This includes color hex codes, compound shadow values, the `rgba(216, 222, 211, 0.72)` line-soft alpha, and the Inter / `ui-monospace` font stacks.
3. Promote three small groups of values to named tokens in `colors_and_type.css`:
   - lane-text colors (`--lane-define-text`, `--lane-build-text`, `--lane-ship-text`) — readable text on lane-soft pill backgrounds.
   - `--diff-add-text` — the annotation orange in the artifact source viewer.
   - macOS traffic-light dot colors (`--macos-red`, `--macos-yellow`, `--macos-green`) — terminal chrome.

   These existed as raw literals in `sites/styles.css` and would otherwise leak the rule "no hex outside `:root`" we want to enforce in Phase 3.
4. **Leave the existing `:root { … }` block at the top of `sites/styles.css` intact for now.** Its declarations are now no-ops (the imported file defines the same names with the same values), but removing them is a separate cleanup commit. Keeping them in this PR makes the diff trivial to read: every change is a literal replaced with a `var()`, no declaration order shifts.

The visual output of the page is byte-identical. This ADR is a refactor, not a redesign.

## Considered options

### Option A — Flip the relationship now (chosen)

- Pros: Removes the duplication this ADR exists to solve. Future brand changes are one-place changes. Sets up Phase 3 (brand-review gate) to enforce "no literal hex outside `:root`" with `grep`. Visual diff is zero.
- Cons: Introduces a relative `@import` from `sites/styles.css` to `.claude/skills/...`. The path resolves locally and on GitHub Pages because both folders are served from the same static root, but it's an unconventional location for an imported stylesheet. Accepted because the alternative — copying the token file into `sites/` — recreates the duplication this ADR is removing.

### Option B — Defer until a second user-visible surface exists

- Pros: Avoids any change to `sites/` until there's a concrete second consumer to justify it.
- Cons: Leaves the skill / page out of sync indefinitely. Every brand change for the foreseeable future is a two-place edit. The duplication tax compounds; the cost of removing it grows.

### Option C — Generate `sites/styles.css` from `colors_and_type.css` at build time

- Pros: No runtime `@import`; the published file is self-contained.
- Cons: Adds a build step the project doesn't currently have. `sites/index.html` is meant to be directly openable without a build. The `@import` approach preserves that property; a build pipeline doesn't.

We choose Option A. Option B is rejected because it permanently defers the value of ADR-0016. Option C is rejected because it violates the "directly openable" property that the product-page agent's prompt currently guarantees.

## Consequences

### Positive

- One source of truth, enforced by the actual stylesheet relationship — not just by convention.
- A grep-able invariant: `grep -E "#[0-9a-f]{6}" sites/styles.css | grep -v "^\\s*--"` returns zero matches. This becomes a Phase-3 gate.
- New surfaces (decks, docs, dashboards) consume the same tokens; brand changes propagate for free.
- Three sets of values that were quietly hard-coded in `sites/styles.css` (lane-text, diff orange, traffic-light dots) are now named, documented, and reusable.

### Negative

- The `@import` path crosses folder boundaries (`sites/` → `.claude/skills/`). It works, but it's unconventional and requires reviewers to understand why. Mitigated by the comment block at the top of `sites/styles.css`.
- The redundant `:root` block at the top of `sites/styles.css` remains in this PR. Anyone reading the file will see the same names defined twice (once in the import, once locally) until the cleanup commit lands. Mitigated by keeping that cleanup in a separate, easily-reverted commit.

### Neutral

- Visual output is unchanged — the test for "did this PR work" is "is the rendered page byte-identical to `main`."
- No new CI surface ships with this ADR. Phase 3 introduces the gate that enforces the invariant.
- The Pages deploy continues to serve `sites/` as a static folder; no build step is added.

## Compliance

- `sites/styles.css` imports `colors_and_type.css` and references every value as `var(--token)` outside the `:root` block.
- `colors_and_type.css` is extended with the lane-text, diff-add, and macOS traffic-light token groups.
- `docs/integration-plan-design-system.md` Phase 2 is satisfied by this PR.
- A follow-up cleanup commit (separate PR) deletes the redundant `:root` block in `sites/styles.css`.
- Phase 3 (`brand-reviewer` agent + checklist) lands separately and adds the mechanical gate that enforces the invariants this ADR establishes.

## References

- [`ADR-0016`](0016-design-system-as-skill.md) — adopting the skill as the canonical brand source.
- [`.claude/skills/specorator-design/colors_and_type.css`](../../.claude/skills/specorator-design/colors_and_type.css)
- [`sites/styles.css`](../../sites/styles.css)
- [`docs/integration-plan-design-system.md`](../integration-plan-design-system.md)
- Constitution Article IV (Quality Gates), Article IX (Reversibility).

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
