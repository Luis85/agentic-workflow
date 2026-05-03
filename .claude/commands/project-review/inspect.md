---
description: Project-review workflow — Inspect project artifacts, git history, issues, PRs, CI, and retrospectives.
argument-hint: "<review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /project-review:inspect

Inspect project evidence for a Project-review workflow.

## Inputs

- `$1` — review slug, kebab-case, required.

## Procedure

Invoke the [`project-review`](../../skills/project-review/SKILL.md) skill with phase `inspect`.

The skill must:

1. Read `quality/$1/project-review-state.md` and `quality/$1/review-plan.md`.
2. Create `quality/$1/history-review.md` from `templates/project-review-history-template.md`.
3. Summarize git history, PR/issue patterns, CI and verification signals, artifact drift, and repeated-change hotspots.
4. Cite paths, commits, issue/PR numbers, or summarized command outputs for every claim.
5. Update `project-review-state.md` and set next phase to `/project-review:synthesize $1`.

## Don't

- Don't paste raw logs into the artifact.
- Don't turn observations into proposals yet.
