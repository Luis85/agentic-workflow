# Token Budget Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (Claude Code) or superpowers:executing-plans (other harnesses) to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut Claude-Code token consumption across the heaviest categories the audit surfaced — and lock the savings in with a verify-gate guardrail.

**Architecture:** N independent chunks, each one PR. Chunk 0 runs `/caveman:compress` against the heaviest natural-language files (mechanical, low-risk, fastest win). Chunks 1..N-1 attack one area each. Final chunk wires the savings into the verify gate.

**Tech Stack:** Markdown, the `caveman:compress` skill, bash/PowerShell scripts for measurement.

**Branch / Worktree:** All work on `chore/token-budget-cleanup-<date>` in `.worktrees/token-budget-<date>/`. Each chunk = its own topic branch cut from the integration branch (stacking permitted when chunks share files; declare it in the chunk header).

---

## Audit summary (baseline measurements, <YYYY-MM-DD>)

| # | Area | Today | After |
|---|---|---|---|
| 1 | Always-loaded chain | _e.g. 28 KB / 7k tok_ | _e.g. ≤ 12 KB / 3k tok_ |
| 2 | Skill catalog descriptions | _e.g. 30 skills × 200-300 chars_ | _≤ 120 chars each_ |
| 3 | Skill bodies | _e.g. 165 KB total_ | _≤ 110 KB_ |
| 4 | Examples sub-tree | _e.g. 178 KB_ | _≤ 30 KB visible to agents_ |
| 5 | `.worktrees/` markdown surface | _e.g. 9.4 MB_ | _Glob/Grep guidance documented; prune dormant_ |
| 6 | Docs heavyweights | _e.g. README 25 KB, sink 36 KB_ | _summary blocks added; README split_ |
| 7 | Templates | _e.g. 68 files / 178 KB_ | _shared sections extracted_ |
| 8 | Ops bot prompts | _e.g. 5 × 9 KB_ | _≤ 5 KB each_ |
| 9 | No regression guard | — | _budget gate in `verify`_ |

---

## Chunk 0: Mechanical compression with `/caveman:compress`

**Goal:** Apply the existing compress skill to the heaviest natural-language files. Cheapest, most reversible (originals saved as `*.original.md`).

**Files:** _list the top 8-12 by size from MEASURE Phase 1-3._

**Branch:** `chore/token-compress-pass-<date>`

- [ ] Measure baseline.
- [ ] For each file, invoke `caveman:compress` skill.
- [ ] Diff sanity check — verify no broken links, no removed `@import` lines, no removed table cells, no removed IDs.
- [ ] Re-measure.
- [ ] Add `.gitignore` rule: `*.original.md`.
- [ ] Commit + open PR.

---

## Chunk 1: Always-loaded dedupe (Area 1)

**Goal:** `CLAUDE.md` and `AGENTS.md` typically overlap on track / agent descriptions. Cut both to thin pointers; trim `MEMORY.md` to one-liners per its own contract.

**Files:** `CLAUDE.md`, `AGENTS.md`, `.claude/memory/MEMORY.md`.

**Branch:** `chore/dedupe-always-loaded-<date>`

- [ ] Inventory duplication (`grep -E "<track names>" CLAUDE.md AGENTS.md`).
- [ ] Rewrite `CLAUDE.md` as thin entry-point (≤ 5 KB).
- [ ] Rewrite `AGENTS.md` consolidating prose to tables (≤ 8 KB).
- [ ] Rewrite `.claude/memory/MEMORY.md` to true one-liners (≤ 2 KB).
- [ ] Verify links resolve (`npm run check:links`).
- [ ] Commit + open PR.

---

## Chunk 2: Skill catalog descriptions (Area 2)

**Goal:** Every `SKILL.md` frontmatter `description:` is rendered into the system prompt on every session. Compress to ≤ 120 chars while preserving (a) one-sentence purpose, (b) primary trigger phrase, (c) primary slash command.

**Files:** every `.claude/skills/*/SKILL.md` (frontmatter only).

**Branch:** `chore/skill-descriptions-<date>`

- [ ] List skills + current description lengths (sorted desc).
- [ ] For each skill > 120 chars: rewrite description.
- [ ] Mark deprecated skills (`deprecated: true` if harness honours, otherwise prefix `[DEPRECATED]`).
- [ ] Verify each skill still parses (frontmatter intact, `name:` field present).
- [ ] Commit + open PR.

---

## Chunk 3: Skill body factoring (Area 3)

**Goal:** Long skills (e.g. `orchestrate/SKILL.md` at 14 KB) often duplicate scaffolding shared by sibling skills. Extract into `_shared/*.md` and link.

_(continue with one chunk per surfaced area; mirror the pattern above)_

---

## Final Chunk: Token-budget verify gate

**Goal:** Lock in the savings. CI / `verify` fails when the always-loaded chain or per-skill caps are exceeded.

**Files:** `scripts/check-token-budget.sh`, `docs/token-budget.md`, `package.json` (or equivalent verify hook).

**Branch:** `chore/token-budget-gate-<date>`

- [ ] Write policy doc (`docs/token-budget.md`).
- [ ] Write `scripts/check-token-budget.sh` enforcing per-area caps.
- [ ] Wire into `verify`.
- [ ] Run gate locally — should be green now that earlier chunks have merged.
- [ ] Commit + open PR. **Merge LAST.**

---

## PR sequencing + merge order

1. Chunk 0 — mechanical compress
2. Chunks 1..N-1 — area-by-area
3. Final guardrail chunk — last (otherwise the gate flips red on its own PR)

Each PR cuts fresh from `main` per `feedback_pr_hygiene.md`. PRs that touch the same files (e.g. Chunks 0, 1, 2 all touch `CLAUDE.md`) should be stacked off the prior chunk's branch.

## Acceptance

- Combined always-loaded chain ≤ target.
- Every skill description ≤ 120 chars.
- `bash scripts/check-token-budget.sh` exits 0 on `main` after all PRs merge.
- `/token-review` reproduces the audit on demand.
