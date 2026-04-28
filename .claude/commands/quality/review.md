---
description: Summarize quality assurance results, readiness, nonconformities, and release or project-execution risks.
argument-hint: "<quality-review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /quality:review

Summarize quality assurance results.

## Inputs

- `$1` — quality review slug. Required.

## Procedure

Invoke the [`quality-assurance`](../../skills/quality-assurance/SKILL.md) skill with phase `review`.

The skill must:

1. Read the plan and completed checklist set.
2. Create `quality/<slug>/quality-review.md` from `templates/quality-review-template.md`.
3. State readiness: `ready`, `ready-with-conditions`, `not-ready`, or `blocked`.
4. List nonconformities, risks, corrective actions, and evidence gaps.
5. Escalate unresolved critical issues into the active project, spec, or release artifact when one exists.
6. Set the next phase to `/quality:improve`.

## Don't

- Don't approve delivery while critical product-quality or project-execution risks remain unowned.
- Don't replace the release manager, reviewer, or human acceptance decision.
