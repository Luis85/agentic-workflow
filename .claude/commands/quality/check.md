---
description: Execute quality assurance checklists and record evidence, gaps, risks, and readiness.
argument-hint: "<quality-review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /quality:check

Execute the quality assurance checklist set.

## Inputs

- `$1` — quality review slug. Required.

## Procedure

Invoke the [`quality-assurance`](../../skills/quality-assurance/SKILL.md) skill with phase `check`.

The skill must:

1. Read `quality/<slug>/quality-plan.md` and every checklist under `quality/<slug>/checklists/`.
2. Inspect the scoped evidence sources named in the plan.
3. Update checklist items with status, evidence links, gaps, severity, owner, and due date.
4. Run relevant local checks, such as `npm run verify`, when the plan requires them and the command has tool access.
5. Preserve unsatisfied items instead of deleting or hiding them.
6. Set the next phase to `/quality:review`.

## Don't

- Don't downgrade a gap because it is inconvenient.
- Don't invent evidence. Use explicit file paths, command outputs, or named human confirmations.
