---
description: Project-review workflow — Rank improvement proposals and choose the first draft PR candidate.
argument-hint: "<review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /project-review:propose

Create improvement proposals from Project-review findings.

## Inputs

- `$1` — review slug, kebab-case, required.

## Procedure

Invoke the [`project-review`](../../skills/project-review/SKILL.md) skill with phase `propose`.

The skill must:

1. Read `quality/$1/findings.md`.
2. Create `quality/$1/improvement-proposals.md` from `templates/project-review-proposals-template.md`.
3. Rank proposals by evidence, benefit, effort, risk, and reversibility.
4. Select one small first draft PR candidate.
5. Draft the GitHub issue body.
6. Update `project-review-state.md` and set next phase to `/project-review:handoff $1`.

## Don't

- Don't select a proposal that requires constitution changes, forced migration, or irreversible shared-state changes.
