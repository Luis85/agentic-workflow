---
description: Project-review workflow — Start. Create review state under quality/<slug>/ and record scope.
argument-hint: "<review-slug> <scope>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: haiku
---

# /project-review:start

Start a Project-review workflow. Read [`docs/project-review-workflow.md`](../../../docs/project-review-workflow.md) first.

## Inputs

- `$1` — review slug, kebab-case, required.
- `$2...` — scope statement, required.

## Procedure

Invoke the [`project-review`](../../skills/project-review/SKILL.md) skill with phase `start`.

The skill must:

1. List `inputs/` non-recursively and surface relevant items before scoping.
2. Create `quality/$1/project-review-state.md` from `templates/project-review-state-template.md`.
3. Fill review slug, scope, repository, integration branch, and initial evidence sources.
4. Set next phase to `/project-review:plan $1`.

## Don't

- Don't create findings or proposals during start.
- Don't create a worktree yet; worktree creation belongs to handoff.
