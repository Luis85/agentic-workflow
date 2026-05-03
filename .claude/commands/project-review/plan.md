---
description: Project-review workflow — Plan evidence sources, questions, exclusions, and first draft PR criteria.
argument-hint: "<review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: haiku
---

# /project-review:plan

Plan a Project-review workflow.

## Inputs

- `$1` — review slug, kebab-case, required.

## Procedure

Invoke the [`project-review`](../../skills/project-review/SKILL.md) skill with phase `plan`.

The skill must:

1. Read `quality/$1/project-review-state.md`.
2. Create `quality/$1/review-plan.md` from `templates/project-review-plan-template.md`.
3. Name artifact paths, git ranges, GitHub queries, CI evidence, review questions, exclusions, and first draft PR selection criteria.
4. Update `project-review-state.md` and set next phase to `/project-review:inspect $1`.

## Don't

- Don't inspect opportunistically before writing the review questions.
