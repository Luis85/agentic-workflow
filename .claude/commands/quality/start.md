---
description: Start an ISO 9001-aligned quality assurance review for a project, portfolio, or active feature.
argument-hint: "<quality-review-slug> [scope]"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: haiku
---

# /quality:start

Start a quality assurance review.

## Inputs

- `$1` — quality review slug, kebab-case. Required.
- `$2...` — optional scope, such as a project, portfolio, feature folder, release, or client engagement.

## Procedure

Invoke the [`quality-assurance`](../../skills/quality-assurance/SKILL.md) skill with phase `start`.

The skill must:

1. Create `quality/<slug>/quality-state.md` from `templates/quality-state-template.md`.
2. Record the review scope, interested parties, quality objectives, evidence sources, and ISO 9001 baseline.
3. Link to active `projects/`, `portfolio/`, `specs/`, `discovery/`, or `sales/` artifacts when they are in scope.
4. Set the next phase to `/quality:plan`.

## Don't

- Don't claim certification, audit approval, or legal compliance. This workflow supports ISO 9001-aligned evidence gathering and readiness review.
- Don't copy ISO standard text into repo artifacts. Use short clause labels and the team's own check questions.
