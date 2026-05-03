---
description: Scaffold a new feature folder under specs/<slug>/ with workflow-state.md initialised.
argument-hint: <feature-slug> [AREA]
allowed-tools: [Read, Edit, Write, Bash]
model: haiku
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
5. Create the issue file:
   a. Copy `templates/issue-template.md` to `issues/0-$1.md`.
   b. Fill in `feature_slug: $1`, `title: "<human-readable title derived from slug>"`, `created_at: <today>`, `updated_at: <today>`.
   c. If `gh` is available, ask: "Push this issue to GitHub now? (y/n)". If yes:
      - Run `gh issue create --title "<title>" --body "Spec: specs/$1/workflow-state.md"` and capture the returned URL + number.
      - Update `issues/0-$1.md`: rename to `issues/<number>-$1.md`, fill `issue_number` and `github_url`.
   d. If `gh` is not available or user declines, leave `issues/0-$1.md` as-is (placeholder).
6. Print a summary: spec directory, area code, issue file created, GitHub URL (if pushed), and the next recommended command (`/spec:idea`).

## Don't

- Don't create artifact files for stages yet — they're created by their own commands.
- Don't push or commit — leave that to the user.
- Don't fail if `gh` is unavailable — the issue file is created locally regardless.
