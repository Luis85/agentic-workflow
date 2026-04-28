---
description: Create the quality assurance plan and ISO 9001-aligned checklist set for a quality review.
argument-hint: "<quality-review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /quality:plan

Create the quality assurance plan and checklist set.

## Inputs

- `$1` — quality review slug. Required.

## Procedure

Invoke the [`quality-assurance`](../../skills/quality-assurance/SKILL.md) skill with phase `plan`.

The skill must:

1. Read `quality/<slug>/quality-state.md`.
2. Create `quality/<slug>/quality-plan.md` from `templates/quality-plan-template.md`.
3. Create `quality/<slug>/checklists/project-execution.md` from `templates/quality-checklist-template.md`.
4. Tailor checklist questions to the scoped project and the repo's steering, spec, project, verification, and release artifacts.
5. Define evidence, owner, status, severity, and due-date fields for every check.
6. Set the next phase to `/quality:check`.

## Don't

- Don't use a generic checklist when scoped artifacts contain concrete commitments.
- Don't mark a checklist item satisfied without evidence.
