# Token Budget Cleanup — Continuation Prompt

> Drop this whole file (or just the **"Prompt to paste"** section below) into a new Claude Code session to resume the work.

## Context: where we are

The full plan is at `docs/superpowers/plans/2026-05-01-token-budget-cleanup.md`. Eleven chunks were defined. State as of 2026-05-01:

| Chunk | Title | PR | Status |
|---|---|---|---|
| — (umbrella) | Plan + `*.original.md` gitignore | [#116](https://github.com/Luis85/agentic-workflow/pull/116) | ✅ MERGED |
| 0 | Mechanical `caveman:compress` pass on 11 hot files | [#117](https://github.com/Luis85/agentic-workflow/pull/117) | ✅ MERGED |
| 1 | Always-loaded dedupe (CLAUDE/AGENTS/MEMORY) | [#118](https://github.com/Luis85/agentic-workflow/pull/118) | ✅ MERGED |
| 2 | Skill catalog descriptions compressed | [#119](https://github.com/Luis85/agentic-workflow/pull/119) | ❌ CLOSED (not merged) |
| 5 | Glob/Grep worktree-exclusion docs | [#120](https://github.com/Luis85/agentic-workflow/pull/120) | ✅ MERGED |
| 8 | Operational bot prompts compressed | — | ⚠️ DROPPED — `caveman:compress` was a no-op (0% reduction) on these already-concise files |
| 10 | Repeatable `token-budget-review` skill + `/token-review` command | [#123](https://github.com/Luis85/agentic-workflow/pull/123) | 🟡 OPEN |
| 3 | Skill body factoring (`_shared/conductor-pattern.md`) | — | ⏳ TODO |
| 4 | Examples sub-tree trim (`cli-todo/` 50 KB → ≤ 5 KB; full version moved) | — | ⏳ TODO |
| 6 | Docs heavyweights (`README.md` split, ADR `## Summary` blocks) | — | ⏳ TODO |
| 7 | Templates sweep (68 files / 178 KB) | — | ⏳ TODO |
| 9 | Token-budget verify gate (must merge **last**) | — | ⏳ TODO |

### Net savings already merged (always-loaded chain)

- `CLAUDE.md`: 8.8 KB → 4.7 KB (-47%)
- `AGENTS.md`: 10.6 KB → 7.8 KB (-26%)
- `.claude/memory/MEMORY.md`: 5.1 KB → 2.3 KB (-55%)
- **Combined chain: 28 KB → 18.8 KB (-33%) on every session.**
- Plus skill body / orchestrate / conductor compression from Chunk 0 (~6 KB more).

## Worktree state

- **Worktree:** `D:\Projects\agentic-workflow\.worktrees\token-budget\`
- **Current branch in that worktree:** `chore/add-token-review-skill` (== open PR #123)
- **Still under `.worktrees/token-budget` but uncommitted:** none — clean now.
- The umbrella branch `chore/token-budget-cleanup` and per-chunk branches (`chore/token-compress-pass`, `chore/dedupe-always-loaded`, `chore/worktree-pollution`, `chore/skill-descriptions`, `chore/ops-bots-compress`) all merged or were rejected; safe to delete locally.

## Caveats discovered (worth carrying forward)

1. **CRLF on Windows + Python `Path.write_text`.** Any script that rewrites markdown via Python on Windows will accidentally convert LF → CRLF, producing a noisy "every line changed" diff. Fix: open in `'rb'`, write in `'wb'`, preserving original line endings. This is what killed PR #119 (skill-descriptions) — the user closed it without comment, likely due to the CRLF churn.
2. **`caveman:compress` is a no-op on already-concise files.** Operational bot prompts (`agents/operational/*/PROMPT.md`) are written in the project's already-tight style — the skill ran "successfully" but produced 0% reduction. Don't budget structural savings from it on those files.
3. **Adding a new skill / command requires three side-effects:**
   - Add an entry to `tools/automation-registry.yml` (otherwise `npm run verify` fails on `check:automation-registry`).
   - Run `npx tsx scripts/fix-command-docs.ts` to regenerate `README.md`, `docs/workflow-overview.md`, `.claude/commands/README.md`.
   - Optionally add a `MEMORY.md` workflow-rule line and a `.claude/skills/README.md` catalog row.
4. **Forward references in plan docs trip `check:links`.** When the plan describes files Chunks N+1..N+M will create, write them as plain backticked paths, not as markdown links — the link checker is naive about fenced code blocks.
5. **Bash session `pwd` can drift.** The compress skill ends with "Shell cwd was reset to D:\Projects\agentic-workflow" — after that, subsequent bash calls run in the main checkout, not the worktree. Always re-`cd` to the worktree at the start of each chunk.
6. **Branch denials in `.claude/settings.json`:** `git checkout main` is denied (use `git switch` instead). Force-push and `--no-verify` are denied. Push to `chore/*` is allowed.
7. **Stacked-vs-fresh PRs.** Chunks 1, 2, 5 stacked on prior PRs; this worked but caused some confusion when the user merged #117/#118/#120 and #119 was closed mid-stack. Cleanest pattern going forward: branch each chunk **fresh from `origin/main`**; only stack when the chunk literally cannot work without the prior one.

## Plan changes vs the original doc

- **Skip retry of Chunk 2.** The user closed #119 silently. Don't reopen unless the user asks; their judgment is the gate.
- **Drop Chunk 8.** `caveman:compress` doesn't help on the ops bot prompts. If real savings are wanted there, the work is structural (extract shared "scope this run" / "format" / "watch list" sections).
- **Re-target Chunk 9 (verify gate)** budget caps to realistic numbers based on what shipped:
  - Always-loaded chain: ≤ 20 KB (constitution alone is 4 KB; combined post-cleanup is ~19 KB).
  - Per-`SKILL.md` body: ≤ 8 KB (still aspirational; orchestrate is 14 KB pre-Chunk-3).
  - Skill description (frontmatter): ≤ 150 chars (some unicode arrows pushed past 120 — bumped from the original 120).

---

## Prompt to paste into the new session

```
Continue the token-budget cleanup. Read these first:

  - docs/superpowers/plans/2026-05-01-token-budget-cleanup.md  (the plan)
  - docs/superpowers/plans/2026-05-01-token-budget-cleanup-CONTINUATION.md  (state, caveats, this prompt)

State summary (skip if you've already loaded the continuation doc):

  - Merged: PR #116 (umbrella plan), #117 (Chunk 0 compress), #118 (Chunk 1 dedupe), #120 (Chunk 5 worktree docs).
  - Closed unmerged: PR #119 (Chunk 2 skill descriptions) — do NOT retry without explicit approval.
  - Open: PR #123 (Chunk 10 token-budget-review skill) — wait for merge before relying on it.
  - Dropped: Chunk 8 (caveman:compress is a no-op on the ops bot prompts).
  - Remaining: Chunks 3, 4, 6, 7, 9.

Work in the existing worktree at D:\Projects\agentic-workflow\.worktrees\token-budget\.
Each chunk = its own topic branch, cut FRESH from origin/main (do NOT stack on prior chunks
unless a chunk genuinely cannot stand alone). Each chunk = its own PR.

Run /caveman:compress only on files that are still verbose natural-language; skip files
that have already been compressed or that are already concise (verify with a wc -c check before).

Before pushing, ALWAYS:
  - cd into the worktree (the bash pwd may have drifted to the main checkout — re-cd at start)
  - npm run verify  (the gate must be green; never --no-verify)
  - When you add a new skill or slash command, also: update tools/automation-registry.yml AND
    run `npx tsx scripts/fix-command-docs.ts` to regen README/workflow-overview/commands inventories.

Sequence: Chunk 3 → 4 → 6 → 7 → 9 (gate, MUST be last). Skip 2 and 8 unless the user
explicitly opens them. Pause before Chunk 9 to confirm the budget caps with the user.

Pull origin/main into your branch BEFORE every push (the user merges fast). If you hit a
conflict in CLAUDE.md/AGENTS.md/MEMORY.md, resolve by accepting the merged version + re-applying
your chunk's structural change on top.
```

---

## Quick references for the new session

- **Plan doc:** `docs/superpowers/plans/2026-05-01-token-budget-cleanup.md`
- **Skill (now merging):** `.claude/skills/token-budget-review/`
- **Slash command:** `/token-review` (defined in `.claude/commands/token-review.md`)
- **Audit re-run command (when skill is merged):** `/token-review` — produces a fresh measurement set + plan in `docs/superpowers/plans/<date>-token-budget-cleanup.md`.
- **Settings to check before any push:** `.claude/settings.json` (branch + verify denies).
