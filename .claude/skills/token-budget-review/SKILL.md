---
name: token-budget-review
description: Audit project token usage by area (always-loaded, skills, examples, docs, worktrees, templates, ops bots), surface offenders, emit area-grouped cleanup plan. Trigger /token-review.
---

# Token Budget Review

Audit how much of the prompt budget the repo burns on every Claude Code session, surface offenders by area, and emit a cleanup plan one PR per area.

Run **quarterly**, **before a release**, or **when an agent reports unexplained slowdowns**.

## When to invoke

- Slash: `/token-review` (or `/token-review <slug>` to scope to a sub-tree).
- Natural language: "review token usage", "audit token budget", "the prompt feels heavy", "where is our context going".
- Automated: as a scheduled `/loop` or `/schedule` agent, monthly.

## Outputs

- `/tmp/token-audit-<YYYY-MM-DD>.txt` — raw measurements (intermediate; not committed).
- `docs/superpowers/plans/<YYYY-MM-DD>-token-budget-cleanup.md` — area-grouped implementation plan with one chunk per area, plus a Chunk 0 mechanical compress and a final guardrail chunk.

## Phases

### Phase 1 — Measure

Run the queries in [`MEASURE.md`](MEASURE.md) end-to-end. Capture output to `/tmp/token-audit-<date>.txt`. Do not skip queries — each surfaces a different category of waste.

The measurement set covers:

1. **Always-loaded chain** — `CLAUDE.md` + `AGENTS.md` + `memory/constitution.md` + `.claude/memory/MEMORY.md` (loaded every session).
2. **Skill catalog** — frontmatter `description:` field of every `.claude/skills/*/SKILL.md` (rendered into the system prompt).
3. **Skill bodies** — full text of every `SKILL.md` (loaded on invocation).
4. **Agent prompts** — `.claude/agents/*.md` (loaded on subagent dispatch).
5. **Examples sub-tree** — `examples/**/*.md` (silent token bomb if agents read for "reference").
6. **Worktree pollution** — `.worktrees/**/*.md` (full repo copies; inflates Glob/Grep).
7. **Docs heavyweights** — `README.md`, `docs/sink.md`, top ADRs.
8. **Templates** — `templates/**/*.md`.
9. **Operational bot prompts** — `agents/operational/*/PROMPT.md`.

### Phase 2 — Surface offenders

For each area, identify:

- Top 3-5 files by size.
- Files exceeding the cap defined in `docs/token-budget.md` (when present).
- Duplication / cross-file overlap (e.g. CLAUDE.md ↔ AGENTS.md).
- Forward-deferred references that could be lazy-loaded.

Rank areas by **per-session impact** (how often the artifacts are loaded). The always-loaded chain and skill catalog dominate.

### Phase 3 — Emit plan

Use [`PLAN-TEMPLATE.md`](PLAN-TEMPLATE.md) to scaffold `docs/superpowers/plans/<date>-token-budget-cleanup.md`. The template includes:

- Header with goal, architecture, branch convention.
- Audit summary table (one row per area).
- One **chunk** per area, each one PR.
- **Chunk 0** = mechanical `/caveman:compress` pass on the heaviest natural-language files.
- **Final chunk** = `verify`-gate guardrail (so the savings can't regress).
- An optional **repeatable-skill chunk** that re-runs this very audit.

Each chunk lists: files, branch name, ordered checkbox steps, commit + PR commands.

### Phase 4 — Hand off

Recommend running the plan with [`superpowers:subagent-driven-development`](../../skills/) (Claude Code) or [`superpowers:executing-plans`](../../skills/) (other harnesses). Each chunk = one PR cut from the integration branch (or stacked off the umbrella per the plan). Order chunks by ROI (always-loaded first, guardrail last).

## What this skill does NOT do

- It does **not** apply changes itself. The skill measures and plans; execution is delegated.
- It does **not** prune `.worktrees/<slug>/` automatically — that's destructive (Article IX). Surface candidates; let the human decide.
- It does **not** modify ADRs in place — ADR bodies are immutable; suggest superseding instead.

## See also

- [`docs/superpowers/plans/`](../../../docs/superpowers/plans/) — past cleanup plans.
- `docs/token-budget.md` — the budget policy + verify-gate hook (added in a follow-up).
- [`MEASURE.md`](MEASURE.md) — measurement queries.
- [`PLAN-TEMPLATE.md`](PLAN-TEMPLATE.md) — output template.
