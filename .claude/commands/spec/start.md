---
description: Scaffold a new feature folder under specs/<slug>/ with workflow-state.md initialised.
argument-hint: <feature-slug> [AREA]
allowed-tools: [Read, Write, Bash]
model: sonnet
---

# /spec:start

Bootstrap a new feature.

## Inputs

- `$1` — feature slug (kebab-case, required). e.g. `payments-redesign`.
- `$2` — area code for IDs (uppercase, optional; defaults to a sensible derivation from the slug, e.g. `payments-redesign` → `PAY`).

## Procedure

1. If `$1` is missing, ask for it.
2. Confirm the area code (`$2`) — propose one if not given.
3. Create the directory `specs/$1/` (Bash, `mkdir -p`).
4. Copy `templates/workflow-state-template.md` to `specs/$1/workflow-state.md`. Fill `feature: $1` and `area: $2`.
5. Print a summary: directory created, area code used, next recommended command (`/spec:idea`).

## Don't

- Don't create artifact files for stages yet — they're created by their own commands.
- Don't push or commit — leave that to the user.
