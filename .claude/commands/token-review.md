---
description: Audit project token usage by area and emit an area-grouped cleanup plan. Wraps the token-budget-review skill.
argument-hint: [optional sub-tree slug]
allowed-tools: [Read, Bash, Glob, Grep, Write]
model: sonnet
---

# /token-review

Run a token-budget audit on the repository (or a scoped sub-tree) and emit a cleanup plan grouped by area.

## Inputs

- `$1` — optional sub-tree slug to scope the audit (e.g. `specs/version-0-3-plan`). Default: whole repo.

## Procedure

1. Invoke the [`token-budget-review`](../skills/token-budget-review/SKILL.md) skill.
2. The skill runs the measurement queries in [`MEASURE.md`](../skills/token-budget-review/MEASURE.md).
3. Output: `/tmp/token-audit-<date>.txt` (raw measurements) + `docs/superpowers/plans/<date>-token-budget-cleanup.md` (area-grouped plan).
4. Recommend running the plan with [`superpowers:subagent-driven-development`](../skills/).

## When to run

- Quarterly housekeeping.
- Before a release, to verify the prompt budget hasn't drifted.
- When an agent reports unexplained slowdowns or runaway costs.

## Don't

- Don't apply changes from this command. It plans; execution is delegated.
- Don't prune `.worktrees/<slug>/` automatically — destructive, requires human authorization.
