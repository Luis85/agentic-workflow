# Token-budget measurement queries

Run all queries; pipe each block's output into `/tmp/token-audit-<date>.txt`. Bash assumed; PowerShell users see the bottom of this file.

> Convention: `1 KB ≈ 256 tokens` (Claude tokenizer for English-heavy prose). Multiply byte counts by ~0.25 to estimate tokens.

## 1. Always-loaded chain

```bash
total=0
for f in CLAUDE.md AGENTS.md memory/constitution.md .claude/memory/MEMORY.md; do
  s=$(wc -c < "$f"); total=$((total+s))
  printf '%-30s %5d bytes\n' "$f" "$s"
done
printf '%-30s %5d bytes (≈ %d tokens)\n' "TOTAL" "$total" "$((total/4))"
```

**Target:** ≤ 12 KB combined (≈ 3k tokens). Cap is a budget, not a hard limit — over-budget warrants a justification in the next plan.

## 2. Skill catalog descriptions

```bash
total=0
for f in .claude/skills/*/SKILL.md; do
  desc=$(awk '/^description: /{sub(/^description: /,""); print; exit}' "$f")
  total=$((total + ${#desc}))
done
echo "Total skill description chars: $total"

# Top offenders
for f in .claude/skills/*/SKILL.md; do
  desc=$(awk '/^description: /{sub(/^description: /,""); print; exit}' "$f")
  printf '%4d  %s\n' "${#desc}" "$f"
done | sort -rn | head -20
```

**Target:** ≤ 120 chars per description. Skill descriptions are listed in the system prompt on every session — small numbers compound.

## 3. Skill bodies

```bash
for f in .claude/skills/*/SKILL.md; do
  printf '%-55s %5d\n' "$f" "$(wc -c < "$f")"
done | sort -k2 -rn | head -15
```

**Target:** ≤ 8 KB per `SKILL.md`. Long skills should factor shared scaffolding into sibling files (`PHASES.md`, `RESUME.md`, `_shared/*.md`).

## 4. Agent prompts

```bash
for f in .claude/agents/*.md; do
  printf '%-55s %5d\n' "$f" "$(wc -c < "$f")"
done | sort -k2 -rn | head -15
```

## 5. Examples sub-tree

```bash
find examples -type f -name '*.md' -printf '%s %p\n' | sort -rn | head -10
```

**Watch for:** any `examples/<x>/*.md` over 5 KB. Trim or move to `examples/<x>-full/` (human-only reference) per Chunk 4 of the canonical plan.

## 6. Worktree pollution

```bash
find .worktrees -type f -name '*.md' -printf '%s\n' 2>/dev/null \
  | awk '{s+=$1} END {printf "%.1f MB total .md inside .worktrees\n", s/1048576}'

git worktree list
```

**Watch for:** more than 5 active worktrees, or > 5 MB of `.md` total. Prune dormant ones (with user confirmation — destructive).

## 7. Docs heavyweights

```bash
for f in README.md $(find docs -type f -name '*.md'); do
  printf '%6d %s\n' "$(wc -c < "$f")" "$f"
done | sort -rn | head -15
```

## 8. Templates

```bash
total=$(find templates -type f -name '*.md' -printf '%s\n' | awk '{s+=$1} END {print s}')
count=$(find templates -type f -name '*.md' | wc -l)
echo "Templates: $count files, $total bytes"

# Top offenders
find templates -type f -name '*.md' -printf '%s %p\n' | sort -rn | head -10
```

## 9. Operational bot prompts

```bash
for f in agents/operational/*/PROMPT.md; do
  printf '%-55s %5d\n' "$f" "$(wc -c < "$f")"
done
```

**Target:** ≤ 5 KB per `PROMPT.md`. These run on a schedule — every byte recurs.

---

## PowerShell equivalents

```powershell
# always-loaded
$files = 'CLAUDE.md','AGENTS.md','memory/constitution.md','.claude/memory/MEMORY.md'
$total = 0
foreach ($f in $files) { $s = (Get-Item $f).Length; $total += $s; "{0,-30} {1,5}" -f $f,$s }
"{0,-30} {1,5} bytes" -f 'TOTAL',$total

# largest .md by size
Get-ChildItem -Recurse -File -Include *.md `
  | Where-Object { $_.FullName -notmatch '\.worktrees|node_modules|\.git\\' } `
  | Sort-Object Length -Descending `
  | Select-Object -First 30 FullName, Length
```
