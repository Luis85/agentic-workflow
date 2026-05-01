# Token Budget Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut Claude-Code token consumption across always-loaded context, skill catalog, agent/skill bodies, examples, worktrees, docs, templates, and operational bots — and lock the savings in with guardrails and a repeatable review skill.

**Architecture:** Eleven independent chunks, each one PR. Chunk 0 runs `/caveman:compress` against heaviest targets (cheap, mechanical, big win). Chunks 1–9 attack one area each from the audit (see audit summary below). Chunk 10 turns the audit itself into a reusable skill (`token-budget-review`).

**Tech Stack:** Markdown, the `caveman:compress` skill, bash/PowerShell scripts for measurement, plus optional `verify` gate hook (Node).

**Branch / Worktree:** All work lands on `chore/token-budget-cleanup` in `.worktrees/token-budget/`. Each chunk = its own topic branch cut from the integration branch (or stacked off `chore/token-budget-cleanup` only if explicitly noted), one PR per chunk per repo convention (`feedback_pr_hygiene.md`).

---

## Audit summary (baseline measurements, 2026-05-01)

| # | Area | Today | After |
|---|---|---|---|
| 1 | Always-loaded context (`CLAUDE.md` + `AGENTS.md` + `constitution.md` + `MEMORY.md`) | 28 KB / ~7k tok | ≤ 12 KB / ~3k tok |
| 2 | Skill catalog descriptions | ~30 skills × 200–300 chars | ≤ 120 chars each |
| 3 | Skill bodies (`orchestrate` 14.7 KB, conductors ~7–8 KB each) | 165 KB total | ≤ 110 KB |
| 4 | `examples/cli-todo` (`spec.md` 50 KB, `design.md` 48 KB) | 178 KB | ≤ 30 KB visible to agents |
| 5 | `.worktrees/` markdown surface | 9.4 MB across 10 worktrees | < 3 MB; Glob/Grep guidance documented |
| 6 | Docs sink (`README.md` 25 KB, `sink.md` 36 KB, big ADRs) | — | summary blocks added |
| 7 | Templates (68 files, 178 KB) | — | shared sections extracted |
| 8 | Operational bot prompts (5 × ~9 KB) | 45 KB | ≤ 25 KB |
| 9 | No regression guard | — | budget gate in `verify` |
| 10 | Audit not repeatable | — | `token-budget-review` skill |

---

## Chunk 0: Mechanical compression with `/caveman:compress`

**Goal:** Apply the existing compress skill to the natural-language fluff in always-loaded context and the heaviest skill bodies. This is the cheapest, most reversible change (originals saved as `*.original.md`) and gives Chunks 1–8 a smaller starting surface.

**Files:**
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`
- Modify: `.claude/memory/MEMORY.md`
- Modify: `.claude/skills/orchestrate/SKILL.md`
- Modify: `.claude/skills/orchestrate/PHASES.md`
- Modify: `.claude/skills/orchestrate/RESUME.md`
- Modify: `.claude/skills/discovery-sprint/SKILL.md`
- Modify: `.claude/skills/sales-cycle/SKILL.md`
- Modify: `.claude/skills/stock-taking/SKILL.md`
- Modify: `.claude/skills/arc42-baseline/SKILL.md`
- Modify: `.claude/skills/README.md`
- Backups created: `*.original.md` per file (skill behavior)

**Branch:** `chore/token-compress-pass`

- [ ] **Step 1: Measure baseline**

```bash
for f in CLAUDE.md AGENTS.md .claude/memory/MEMORY.md \
  .claude/skills/orchestrate/SKILL.md \
  .claude/skills/orchestrate/PHASES.md \
  .claude/skills/orchestrate/RESUME.md \
  .claude/skills/discovery-sprint/SKILL.md \
  .claude/skills/sales-cycle/SKILL.md \
  .claude/skills/stock-taking/SKILL.md \
  .claude/skills/arc42-baseline/SKILL.md \
  .claude/skills/README.md; do
  printf '%-55s %6d bytes\n' "$f" "$(wc -c < "$f")"
done | tee /tmp/token-baseline.txt
```

- [ ] **Step 2: Run `/caveman:compress` against each file in turn**

For each path above, invoke the skill via `Skill` tool with `args: <path>`. The skill writes the compressed file in place and saves `<path>.original.md` next to it. **Do NOT compress code blocks, URLs, ID tables, or YAML frontmatter** (the compress skill already preserves these — verify by diff after each run).

- [ ] **Step 3: Diff sanity check after each file**

```bash
diff -u CLAUDE.md.original.md CLAUDE.md | head -100
```

Manually confirm: no broken links, no removed `@import` lines, no removed permission rules, no removed table cells, ID references intact.

- [ ] **Step 4: Re-measure**

```bash
for f in <same list>; do
  printf '%-55s %6d bytes\n' "$f" "$(wc -c < "$f")"
done | tee /tmp/token-after.txt
diff /tmp/token-baseline.txt /tmp/token-after.txt
```

Expected: every file smaller; no `*.md` removed; `*.original.md` exists for each.

- [ ] **Step 5: Add `.gitignore` rule for backups** (optional — keep originals only on the topic branch as evidence; do not ship to main)

```
# .gitignore (project root)
*.original.md
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md AGENTS.md .claude/memory/MEMORY.md .claude/skills/
git commit -m "chore(tokens): mechanical compress pass on hot files"
```

- [ ] **Step 7: Open PR**

```bash
git push -u origin chore/token-compress-pass
gh pr create --title "chore(tokens): mechanical compress pass on hot files" \
  --body "First pass of token-budget-cleanup. Applies caveman:compress to CLAUDE.md, AGENTS.md, MEMORY.md, orchestrate/discovery/sales/stock-taking/arc42 skills, and skills/README. See docs/superpowers/plans/2026-05-01-token-budget-cleanup.md (Chunk 0)."
```

---

## Chunk 1: Always-loaded context dedupe (Area 1)

**Goal:** `CLAUDE.md` and `AGENTS.md` overlap on five-track descriptions. Cut both to thin pointers. Trim `MEMORY.md` to true one-liners per its own contract.

**Files:**
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`
- Modify: `.claude/memory/MEMORY.md`

**Branch:** `chore/dedupe-always-loaded`

- [ ] **Step 1: Inventory duplication**

```bash
grep -E "Discovery Track|Stock-taking|Sales Cycle|Project Manager Track|Portfolio Track" CLAUDE.md AGENTS.md
```

Expected: 24 hits in CLAUDE.md, 8 in AGENTS.md — each track described twice.

- [ ] **Step 2: Rewrite `CLAUDE.md`**

Keep: project intro, `@imports`, "what this repo is" (1–2 sentences), conventions specific to Claude Code (subagent location, slash commands, permissions). Remove: track descriptions (now linked from AGENTS.md).

Target size: ≤ 3 KB.

- [ ] **Step 3: Rewrite `AGENTS.md`**

Keep: project intro, "Read these first", operating rules, repo conventions, agent classes table. Replace 5 prose track sections with one table:

```markdown
| Track | When | Conductor skill | Manual entry |
|---|---|---|---|
| Discovery | blank-page ideation | `discovery-sprint` | `/discovery:start` |
| Stock-taking | brownfield inventory | `stock-taking` | `/stock:start` |
| Sales | service-provider, pre-contract | `sales-cycle` | `/sales:start` |
| Project Manager | client engagement governance | `project-run` | `/project:start` |
| Portfolio | multi-feature/program | `portfolio-track` | `/portfolio:start` |
```

Target size: ≤ 5 KB.

- [ ] **Step 4: Rewrite `.claude/memory/MEMORY.md`**

Per its own contract, each entry is one line: a dash, then a markdown link with `Title` pointing at the corresponding `.md` file, then an em-dash, then a one-line hook. Remove inline 2–3-sentence summaries. Target size: ≤ 2 KB.

- [ ] **Step 5: Verify links resolve**

```bash
for f in CLAUDE.md AGENTS.md .claude/memory/MEMORY.md; do
  grep -oE '\]\([^)]+\.md[^)]*\)' "$f" | sed 's/[])(]//g' | while read link; do
    target="${link%%#*}"
    [ -f "$target" ] || echo "BROKEN in $f: $link"
  done
done
```

Expected: no output.

- [ ] **Step 6: Re-measure**

```bash
for f in CLAUDE.md AGENTS.md memory/constitution.md .claude/memory/MEMORY.md; do
  printf '%-30s %6d bytes\n' "$f" "$(wc -c < "$f")"
done
```

Expected total: ≤ 12 KB.

- [ ] **Step 7: Commit + PR**

```bash
git checkout -b chore/dedupe-always-loaded
git add CLAUDE.md AGENTS.md .claude/memory/MEMORY.md
git commit -m "chore(tokens): dedupe always-loaded context

CLAUDE.md and AGENTS.md no longer duplicate track descriptions.
MEMORY.md trimmed to one-line hooks per its own contract.

Combined size: 28 KB -> ~12 KB."
git push -u origin chore/dedupe-always-loaded
gh pr create --title "chore(tokens): dedupe always-loaded context" --body "Area 1 of token-budget-cleanup. See docs/superpowers/plans/2026-05-01-token-budget-cleanup.md (Chunk 1)."
```

---

## Chunk 2: Skill catalog descriptions (Area 2)

**Goal:** The system reminder lists every skill's `description` front-matter field on every session. ~30 skills × 200–300 chars = a measurable fraction of the system prompt. Compress to ≤ 120 chars each, preserving trigger fidelity.

**Files:**
- Modify: every `SKILL.md` under `.claude/skills/*/SKILL.md` (~30 files) — frontmatter `description:` only.
- Modify: any deprecated skill — set `deprecated: true` (or remove from registry if shipped that way).

**Branch:** `chore/skill-descriptions`

- [ ] **Step 1: List skills + current description lengths**

```bash
for f in .claude/skills/*/SKILL.md; do
  desc=$(awk '/^description: /{sub(/^description: /,""); print; exit}' "$f")
  printf '%4d %s\n' "${#desc}" "$f"
done | sort -rn | head -40
```

- [ ] **Step 2: Compress each description**

For each skill, rewrite `description:` keeping: (a) one-sentence purpose, (b) primary trigger phrase, (c) primary `/slash` command. Drop redundant trigger phrases and elaboration. Target ≤ 120 chars.

Example — `orchestrate`:
- Before: 305 chars.
- After: `Drive a feature end-to-end through Specorator (idea→retro). Triggers: "what's next?", "kick off", /orchestrate.`

- [ ] **Step 3: Mark deprecated skills**

```bash
grep -l "Deprecated" .claude/skills/*/SKILL.md
```

For each — add `deprecated: true` to frontmatter. (Verify this field is honored by the harness; if not, append `[DEPRECATED]` at start of `description` so it stops auto-triggering.)

- [ ] **Step 4: Verify no skill broke**

```bash
for f in .claude/skills/*/SKILL.md; do
  awk 'BEGIN{fm=0} /^---$/{fm++} fm==1 && /^name: /{found_name=1} fm==1 && /^description: /{found_desc=1} END{if (!found_name || !found_desc) print FILENAME " MISSING fields"}' "$f"
done
```

Expected: no output.

- [ ] **Step 5: Re-measure**

```bash
total=0
for f in .claude/skills/*/SKILL.md; do
  desc=$(awk '/^description: /{sub(/^description: /,""); print; exit}' "$f")
  total=$((total + ${#desc}))
done
echo "Total skill description chars: $total"
```

Expected: from ~7000 → ≤ 3500.

- [ ] **Step 6: Commit + PR**

```bash
git checkout -b chore/skill-descriptions
git add .claude/skills/
git commit -m "chore(tokens): compress skill catalog descriptions

Shrinks per-session system-prompt overhead. Each skill description
capped at ~120 chars, preserving primary trigger phrases."
git push -u origin chore/skill-descriptions
gh pr create --title "chore(tokens): compress skill catalog descriptions" --body "Area 2 of token-budget-cleanup. See plan Chunk 2."
```

---

## Chunk 3: Skill body factoring (Area 3)

**Goal:** `orchestrate/SKILL.md` is 14.7 KB; the conductor skills (`discovery-sprint`, `sales-cycle`, `stock-taking`, `project-run`, `portfolio-track`) repeat the same scaffolding. Extract a shared file and link.

**Files:**
- Create: `.claude/skills/_shared/conductor-pattern.md` (state-file format, gate pattern, AskUserQuestion template, dispatch rules)
- Modify: `.claude/skills/orchestrate/SKILL.md` (move stage reference table to `docs/specorator.md` link)
- Modify: `.claude/skills/discovery-sprint/SKILL.md`
- Modify: `.claude/skills/sales-cycle/SKILL.md`
- Modify: `.claude/skills/stock-taking/SKILL.md`
- Modify: `.claude/skills/project-run/SKILL.md`
- Modify: `.claude/skills/portfolio-track/SKILL.md`
- Modify: `.claude/skills/arc42-baseline/SKILL.md` (link to `templates/arc42-questionnaire-template.md` instead of inlining)

**Branch:** `chore/skill-body-factor`

- [ ] **Step 1: Identify common sections across conductor skills**

```bash
grep -l "AskUserQuestion" .claude/skills/*/SKILL.md
```

For each, list section headings that appear in 3+ files. These are extraction candidates.

- [ ] **Step 2: Draft `_shared/conductor-pattern.md`**

Sections: state file shape, phase gating, `AskUserQuestion` rules (only main thread), dispatch ordering, "read first" boilerplate.

- [ ] **Step 3: Replace duplicated sections in each conductor skill with a one-line link**

In each conductor skill `SKILL.md`, replace the inlined scaffolding section with a single blockquote pointing at `../_shared/conductor-pattern.md` (relative path from the skill folder). Use a backticked path inside a markdown link.

- [ ] **Step 4: Trim `orchestrate/SKILL.md`**

The 11-stage table at top of `orchestrate/SKILL.md` duplicates `docs/specorator.md`. Link instead.

- [ ] **Step 5: Verify each skill still self-contained for its trigger logic**

Read each modified `SKILL.md` end-to-end. Trigger phrases, slash command, decision tree must remain inline (those are the parts the harness needs without a follow-up read).

- [ ] **Step 6: Re-measure**

```bash
for f in .claude/skills/orchestrate/SKILL.md .claude/skills/discovery-sprint/SKILL.md \
  .claude/skills/sales-cycle/SKILL.md .claude/skills/stock-taking/SKILL.md \
  .claude/skills/project-run/SKILL.md .claude/skills/portfolio-track/SKILL.md \
  .claude/skills/arc42-baseline/SKILL.md; do
  printf '%-55s %6d\n' "$f" "$(wc -c < "$f")"
done
```

Expected combined: from ~58 KB → ≤ 35 KB.

- [ ] **Step 7: Commit + PR**

```bash
git checkout -b chore/skill-body-factor
git add .claude/skills/
git commit -m "chore(tokens): factor shared conductor pattern from skills"
git push -u origin chore/skill-body-factor
gh pr create --title "chore(tokens): factor shared conductor pattern from skills" --body "Area 3 of token-budget-cleanup. See plan Chunk 3."
```

---

## Chunk 4: Examples trim (Area 4)

**Goal:** `examples/cli-todo/spec.md` is 50 KB and `design.md` 48 KB. Any agent that opens them as a "reference pattern" burns tens of thousands of tokens. Keep a minimal demo at original path; move full versions out of agent default search scope.

**Files:**
- Move: `examples/cli-todo/{spec,design,research,requirements,workflow-state}.md` → `examples/cli-todo-full/`
- Create: trimmed replacements in `examples/cli-todo/` (each ≤ 5 KB, illustrative only)
- Modify: `examples/README.md` (if missing, create) with explicit warning + pointer
- Modify: `docs/sink.md` (note Examples sub-tree split)

**Branch:** `chore/examples-trim`

- [ ] **Step 1: Move full versions**

```bash
mkdir -p examples/cli-todo-full
git mv examples/cli-todo/spec.md examples/cli-todo-full/
git mv examples/cli-todo/design.md examples/cli-todo-full/
git mv examples/cli-todo/research.md examples/cli-todo-full/
git mv examples/cli-todo/requirements.md examples/cli-todo-full/
git mv examples/cli-todo/workflow-state.md examples/cli-todo-full/
```

- [ ] **Step 2: Write trimmed stand-ins**

For each moved file, write a 50–150-line replacement at the original path with: (a) frontmatter, (b) a representative excerpt, (c) link to the full version.

- [ ] **Step 3: Add / update `examples/README.md`**

```markdown
---
title: Examples
folder: examples
description: Demonstration artifacts. Not active workflow state.
entry_point: true
---

# Examples

`cli-todo/` holds **trimmed** demonstration artifacts (≤ 5 KB each). Full versions live under `cli-todo-full/` for human reference only — agents should not load these by default.
```

- [ ] **Step 4: Update `docs/sink.md` Examples sub-tree section**

Add a sentence: "Within `examples/<example>/`, agents should prefer the trimmed top-level files; `*-full/` siblings are human-only reference."

- [ ] **Step 5: Verify**

```bash
find examples/cli-todo -maxdepth 1 -type f -name '*.md' -size +5k
```

Expected: no output.

- [ ] **Step 6: Commit + PR**

```bash
git checkout -b chore/examples-trim
git add examples/ docs/sink.md
git commit -m "chore(tokens): trim cli-todo example, archive full version"
git push -u origin chore/examples-trim
gh pr create --title "chore(tokens): trim cli-todo example" --body "Area 4 of token-budget-cleanup. See plan Chunk 4."
```

---

## Chunk 5: Worktree pollution (Area 5)

**Goal:** 10 active `.worktrees/` total ~9.4 MB of `.md`. Most agent searches don't need them. Document explicit Glob/Grep guidance; prune dormant worktrees with user confirmation.

**Files:**
- Modify: `AGENTS.md` (add Glob/Grep guidance section)
- Modify: `docs/worktrees.md` (cross-link the guidance)
- Optional: `.worktrees/<dormant>/` removal (prompt user)

**Branch:** `chore/worktree-pollution`

- [ ] **Step 1: List worktrees**

```bash
git worktree list
```

- [ ] **Step 2: Identify merged / dormant ones**

```bash
git worktree list --porcelain | awk '/branch/{print $2}' | while read ref; do
  branch="${ref#refs/heads/}"
  merged=$(git branch --merged main | grep -c "^[* ] $branch$")
  echo "$branch merged_into_main=$merged"
done
```

Surface to the user; do not auto-remove.

- [ ] **Step 3: Add Glob/Grep guidance to AGENTS.md**

Add a short subsection under "Repo conventions":

```markdown
- **Searching:** When using Glob or Grep across the repo, exclude `.worktrees/**` unless you explicitly need it. Each worktree is a full repo copy — searching them inflates results and burns tokens.
```

- [ ] **Step 4: Cross-link from docs/worktrees.md**

Add a "Search hygiene" section pointing to the AGENTS.md rule.

- [ ] **Step 5: Prompt user to prune candidates**

For each dormant worktree the user approves: `git worktree remove .worktrees/<name>`. Do **not** force-remove without permission.

- [ ] **Step 6: Commit + PR**

```bash
git checkout -b chore/worktree-pollution
git add AGENTS.md docs/worktrees.md
git commit -m "chore(tokens): document Glob/Grep worktree exclusion"
git push -u origin chore/worktree-pollution
gh pr create --title "chore(tokens): document Glob/Grep worktree exclusion" --body "Area 5 of token-budget-cleanup. See plan Chunk 5."
```

---

## Chunk 6: Docs sink (Area 6)

**Goal:** Trim three heavyweights: `README.md` (25 KB), `docs/sink.md` (36 KB), and the largest ADRs (0005/0006/0007, ~14 KB each).

**Files:**
- Modify: `README.md` (split into ≤ 5 KB landing + new `docs/repo-map.md`)
- Modify: `docs/sink.md` (no scope change — but verify it's not transitively `@import`-ed by always-loaded files)
- Modify: `docs/adr/0005-*.md`, `0006-*.md`, `0007-*.md` (add `## Summary` block at top, ≤ 200 words)

**Branch:** `chore/docs-trim`

- [ ] **Step 1: Confirm README isn't `@import`-ed**

```bash
grep -r "@README" CLAUDE.md AGENTS.md memory/ .claude/memory/ 2>/dev/null
```

Expected: no output.

- [ ] **Step 2: Split README**

Move the long "map of files" / "what each tool does" content into `docs/repo-map.md`. Leave a thin landing page (project intro, install/quickstart, links to `AGENTS.md`, `docs/specorator.md`, `docs/repo-map.md`).

- [ ] **Step 3: Add `## Summary` to large ADRs**

For each of ADR 0005, 0006, 0007: prepend a `## Summary` section under the existing frontmatter / context, ≤ 200 words. Existing body is immutable per repo convention — only add, do not edit.

- [ ] **Step 4: Re-measure**

```bash
for f in README.md docs/sink.md docs/adr/0005-*.md docs/adr/0006-*.md docs/adr/0007-*.md; do
  printf '%-55s %6d\n' "$f" "$(wc -c < "$f")"
done
```

- [ ] **Step 5: Commit + PR**

```bash
git checkout -b chore/docs-trim
git add README.md docs/repo-map.md docs/adr/
git commit -m "chore(tokens): trim README, summarize heavyweight ADRs"
git push -u origin chore/docs-trim
gh pr create --title "chore(tokens): trim README + ADR summaries" --body "Area 6 of token-budget-cleanup. See plan Chunk 6."
```

---

## Chunk 7: Templates dedupe (Area 7)

**Goal:** 68 templates total 178 KB. Many duplicate frontmatter/gate-criteria sections. Extract shared snippets.

**Files:**
- Create: `templates/_shared/frontmatter.md`, `templates/_shared/gate-criteria.md` (or similar — exact files driven by audit)
- Modify: each template that previously inlined those sections — replace with `<!-- include: ../_shared/frontmatter.md -->` style pointer (Markdown has no include, so use a literal `> See: ../_shared/frontmatter.md` link; agents will fetch on demand)

**Branch:** `chore/templates-dedupe`

- [ ] **Step 1: Audit duplication**

```bash
for f in templates/*.md templates/**/*.md; do
  awk '/^## /{print FILENAME ":" $0}' "$f"
done | sort -k2 | uniq -c -f1 | sort -rn | head -40
```

Identify the 3–5 most-repeated section headings.

- [ ] **Step 2: Draft shared snippets**

Pull representative content; write `templates/_shared/<name>.md`.

- [ ] **Step 3: Replace inlined sections with pointer**

For each template, swap inlined section for a one-line link.

- [ ] **Step 4: Re-measure**

```bash
total=$(find templates -type f -name '*.md' -printf '%s\n' | awk '{s+=$1} END {print s}')
echo "Templates total: $total bytes"
```

Expected: ≤ 130 KB.

- [ ] **Step 5: Commit + PR**

```bash
git checkout -b chore/templates-dedupe
git add templates/
git commit -m "chore(tokens): extract shared template snippets"
git push -u origin chore/templates-dedupe
gh pr create --title "chore(tokens): extract shared template snippets" --body "Area 7 of token-budget-cleanup. See plan Chunk 7."
```

---

## Chunk 8: Operational bots compress (Area 8)

**Goal:** Each `agents/operational/*/PROMPT.md` is 9–10 KB. Scheduled — token cost compounds. Apply `caveman:compress`.

**Files:**
- Modify: `agents/operational/dep-triage-bot/PROMPT.md`
- Modify: `agents/operational/plan-recon-bot/PROMPT.md`
- Modify: `agents/operational/actions-bump-bot/PROMPT.md`
- Modify: `agents/operational/review-bot/PROMPT.md` (if present)
- Modify: `agents/operational/docs-review-bot/PROMPT.md` (if present)

**Branch:** `chore/ops-bots-compress`

- [ ] **Step 1: Identify all operational bots**

```bash
ls agents/operational/*/PROMPT.md
```

- [ ] **Step 2: Apply `/caveman:compress` to each**

Same procedure as Chunk 0 — preserve code blocks, URLs, exact error strings, tool names.

- [ ] **Step 3: Spot-check the bot still parses**

If any bot has a deterministic schema in its prompt (e.g., a JSON template or a section the harness greps for), confirm those tokens survive compression.

- [ ] **Step 4: Re-measure**

```bash
for f in agents/operational/*/PROMPT.md; do
  printf '%-55s %6d\n' "$f" "$(wc -c < "$f")"
done
```

Expected total: ≤ 25 KB.

- [ ] **Step 5: Commit + PR**

```bash
git checkout -b chore/ops-bots-compress
git add agents/operational/
git commit -m "chore(tokens): compress operational bot prompts"
git push -u origin chore/ops-bots-compress
gh pr create --title "chore(tokens): compress operational bot prompts" --body "Area 8 of token-budget-cleanup. See plan Chunk 8."
```

---

## Chunk 9: Token-budget guardrails (Area 9)

**Goal:** Lock in savings. CI / `verify` fails if always-loaded context exceeds budget; new ADRs/docs flagged for review when adding > 5 KB.

**Files:**
- Create: `scripts/check-token-budget.sh`
- Create: `docs/token-budget.md` (the policy doc)
- Modify: `package.json` or `Makefile` (wire `check-token-budget` into `verify`)
- Modify: `.github/workflows/<verify>.yml` (if CI runs verify, this picks up automatically — confirm)

**Branch:** `chore/token-budget-gate`

- [ ] **Step 1: Write policy doc**

```markdown
# Token Budget

Always-loaded context cap: 12 KB combined (CLAUDE.md + AGENTS.md + memory/constitution.md + .claude/memory/MEMORY.md).
Per-skill SKILL.md cap: 8 KB.
Skill description (frontmatter): 120 chars.
```

Document escape hatch (`# token-budget-allow next-line` style) for unavoidable cases, requiring an ADR.

- [ ] **Step 2: Write `scripts/check-token-budget.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

fail=0

check() {
  local file="$1" max="$2"
  local size
  size=$(wc -c < "$file")
  if [ "$size" -gt "$max" ]; then
    echo "TOKEN BUDGET: $file = $size bytes (max $max)"
    fail=1
  fi
}

# Always-loaded context (combined)
combined=0
for f in CLAUDE.md AGENTS.md memory/constitution.md .claude/memory/MEMORY.md; do
  combined=$((combined + $(wc -c < "$f")))
done
if [ "$combined" -gt 12288 ]; then
  echo "TOKEN BUDGET: always-loaded = $combined bytes (max 12288)"
  fail=1
fi

# Per-skill body
for f in .claude/skills/*/SKILL.md; do
  check "$f" 8192
done

# Skill descriptions
for f in .claude/skills/*/SKILL.md; do
  desc=$(awk '/^description: /{sub(/^description: /,""); print; exit}' "$f")
  if [ "${#desc}" -gt 120 ]; then
    echo "TOKEN BUDGET: $f description = ${#desc} chars (max 120)"
    fail=1
  fi
done

exit $fail
```

- [ ] **Step 3: Make executable + wire to verify**

```bash
chmod +x scripts/check-token-budget.sh
# Inspect package.json; if it has a "verify" script, append:
#   "verify": "... && bash scripts/check-token-budget.sh"
```

- [ ] **Step 4: Run the gate locally**

```bash
bash scripts/check-token-budget.sh
```

If it fails — earlier chunks haven't merged yet. Add `--warn-only` flag for the first PR to avoid red CI before predecessors merge.

- [ ] **Step 5: Commit + PR**

```bash
git checkout -b chore/token-budget-gate
git add scripts/check-token-budget.sh docs/token-budget.md package.json
git commit -m "chore(tokens): add token-budget verify gate"
git push -u origin chore/token-budget-gate
gh pr create --title "chore(tokens): add token-budget verify gate" --body "Area 9 of token-budget-cleanup. See plan Chunk 9. Merge LAST in this series."
```

---

## Chunk 10: Repeatable token-review skill

**Goal:** Make this audit reproducible. New skill — `token-budget-review` — automates measurement, flags top offenders, and emits the same area-grouped plan for any future contributor.

**Files:**
- Create: `.claude/skills/token-budget-review/SKILL.md`
- Create: `.claude/skills/token-budget-review/MEASURE.md` (the measurement queries)
- Create: `.claude/skills/token-budget-review/PLAN-TEMPLATE.md` (the area-grouped output template)
- Create: `.claude/commands/token-review.md` (the slash entry — wraps the skill)
- Modify: `.claude/skills/README.md` (catalog entry)
- Modify: `MEMORY.md` workflow rules (add a one-liner)

**Branch:** `chore/token-review-skill`

- [ ] **Step 1: Skill scaffolding**

```markdown
---
name: token-budget-review
description: Audit project token usage by area (always-loaded, skills, examples, docs, worktrees, templates, ops bots) and emit an area-grouped cleanup plan. Trigger /token-review.
---

# Token Budget Review

Run when token consumption is suspected high, before a release, or quarterly.

## Phase 1 — Measure
Read MEASURE.md, run each query, save output to /tmp/token-audit-<date>.txt.

## Phase 2 — Surface offenders
Group findings by area (1–9). For each, capture: file, current size, suggested target.

## Phase 3 — Emit plan
Use PLAN-TEMPLATE.md to scaffold docs/superpowers/plans/<date>-token-budget-cleanup.md. One chunk per area; include /caveman:compress as Chunk 0.

## Phase 4 — Hand off
Recommend executing with superpowers:subagent-driven-development.
```

- [ ] **Step 2: Write `MEASURE.md`**

Capture the bash queries used in this audit (always-loaded sizes, top 30 by size, per-dir aggregation, skill description chars, worktree md surface, examples size, ops bot size).

- [ ] **Step 3: Write `PLAN-TEMPLATE.md`**

Skeleton mirroring this very plan: header, audit summary table, one chunk-per-area, guardrail chunk last.

- [ ] **Step 4: Write `.claude/commands/token-review.md`**

Standard slash-command file that invokes the skill.

- [ ] **Step 5: Add to skill catalog**

Append a one-liner to `.claude/skills/README.md` and to `.claude/memory/MEMORY.md` "Workflow rules". Bullet content: a bold "Token-budget review" tag, a brief description ("run /token-review quarterly or before a release; produces an area-grouped cleanup plan"), and a markdown link pointing at `.claude/skills/token-budget-review/SKILL.md`.

- [ ] **Step 6: Smoke test**

In the worktree, invoke the skill end-to-end. It should produce a fresh `/tmp/token-audit-<date>.txt` and a draft plan file under `docs/superpowers/plans/`. Diff against this plan as a sanity check (numbers will differ; structure should match).

- [ ] **Step 7: Commit + PR**

```bash
git checkout -b chore/token-review-skill
git add .claude/skills/token-budget-review/ .claude/commands/token-review.md .claude/skills/README.md .claude/memory/MEMORY.md
git commit -m "feat(skills): add repeatable token-budget-review skill"
git push -u origin chore/token-review-skill
gh pr create --title "feat(skills): add token-budget-review skill" --body "Chunk 10 of token-budget-cleanup. Makes the audit reproducible. See plan Chunk 10."
```

---

## PR sequencing + merge order

Open PRs in this order; merge in same order so later chunks' baselines stay valid:

1. Chunk 0 — `chore/token-compress-pass` (mechanical, lowest risk)
2. Chunk 1 — `chore/dedupe-always-loaded`
3. Chunk 2 — `chore/skill-descriptions`
4. Chunk 3 — `chore/skill-body-factor`
5. Chunk 4 — `chore/examples-trim`
6. Chunk 5 — `chore/worktree-pollution`
7. Chunk 6 — `chore/docs-trim`
8. Chunk 7 — `chore/templates-dedupe`
9. Chunk 8 — `chore/ops-bots-compress`
10. Chunk 10 — `chore/token-review-skill` (independent, can merge any time)
11. Chunk 9 — `chore/token-budget-gate` (**merge last**, otherwise the gate flips red on its own PR)

Each PR cuts fresh from `main` per `feedback_pr_hygiene.md`. Memory edits (Chunk 1 touches MEMORY.md, Chunk 10 touches MEMORY.md) ride in their own PR per `feedback_memory_edits.md`.

## Acceptance

- Combined always-loaded context ≤ 12 KB.
- Skill descriptions average ≤ 120 chars.
- `examples/cli-todo/*.md` (top-level) ≤ 5 KB each.
- `agents/operational/*/PROMPT.md` ≤ 5 KB each.
- `bash scripts/check-token-budget.sh` exits 0 on `main` after all PRs merge.
- `/token-review` produces a fresh plan reproducibly.
