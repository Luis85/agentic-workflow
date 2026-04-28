---
description: Convert quality assurance findings into corrective actions and a continuous improvement plan.
argument-hint: "<quality-review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /quality:improve

Create the corrective action and improvement plan.

## Inputs

- `$1` — quality review slug. Required.

## Procedure

Invoke the [`quality-assurance`](../../skills/quality-assurance/SKILL.md) skill with phase `improve`.

The skill must:

1. Read `quality/<slug>/quality-review.md`.
2. Create `quality/<slug>/improvement-plan.md` from `templates/quality-improvement-plan-template.md`.
3. Convert nonconformities and risks into corrective actions with owners, due dates, verification method, and follow-up cadence.
4. Link actions to project issue registers, spec tasks, ADRs, or release notes when those artifacts exist.
5. Mark `quality-state.md` as `done` only when every critical action has an owner and follow-up path.

## Don't

- Don't close a finding just because an action exists; closure requires verified effectiveness.
