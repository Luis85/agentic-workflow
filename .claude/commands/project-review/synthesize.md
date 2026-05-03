---
description: Project-review workflow — Synthesize evidence into strengths, friction, risks, and root-cause hypotheses.
argument-hint: "<review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /project-review:synthesize

Synthesize Project-review findings.

## Inputs

- `$1` — review slug, kebab-case, required.

## Procedure

Invoke the [`project-review`](../../skills/project-review/SKILL.md) skill with phase `synthesize`.

The skill must:

1. Read `quality/$1/history-review.md`.
2. Create `quality/$1/findings.md` from `templates/project-review-findings-template.md`.
3. Separate strengths, friction, risks, root-cause hypotheses, and open questions.
4. Mark confidence for hypotheses and keep evidence separate from inference.
5. Update `project-review-state.md` and set next phase to `/project-review:propose $1`.

## Don't

- Don't prescribe solutions in findings.
