---
description: Design Track — Bootstrap. Scaffold a new design folder under designs/<slug>/ with design-state.md initialised.
argument-hint: <design-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: haiku
---

# /design:start

Bootstrap a new Design Track workspace. Read [`docs/design-track.md`](../../../docs/design-track.md) for the full methodology.

## Inputs

- `$1` — design slug (kebab-case, ≤ 6 words, required). Name the **surface**, not the solution. Good: `docs-site`, `onboarding-flow`, `dashboard-v1`. Bad: `pretty-redesign`, `new-thing`.

## Procedure

1. If `$1` is missing, ask the user. If they offer a solution-name, push back and propose a surface-name.
2. Confirm the user is creating a *new surface* or holistically redesigning one. If the work is feature-level UI inside an existing surface, recommend `/spec:design` (Stage 4) instead.
3. Create the directory `designs/$1/` (Bash, `mkdir -p`).
4. Copy [`templates/design-state-template.md`](../../../templates/design-state-template.md) to `designs/$1/design-state.md`. Fill `design: $1`.
5. Print a summary: directory created, recommended next command (`/design:frame`).

## Don't

- Don't create phase artifact files yet — they're created by their own commands.
- Don't push or commit — leave that to the user.
- Don't start a track for a feature-level UI change — recommend `/spec:design` instead.
