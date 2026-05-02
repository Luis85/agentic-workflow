---
description: Discovery Track — Bootstrap. Scaffold a new sprint folder under discovery/<slug>/ with discovery-state.md initialised.
argument-hint: <sprint-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: haiku
---

# /discovery:start

Bootstrap a new Discovery Sprint. Read [`docs/discovery-track.md`](../../../docs/discovery-track.md) for the full methodology.

## Inputs

- `$1` — sprint slug (kebab-case, ≤ 6 words, required). Name the **outcome explored**, not the solution. Good: `q2-retention-discovery`, `onboarding-friction-sprint`. Bad: `loyalty-program`, `new-payment-feature`.

## Procedure

1. If `$1` is missing, ask the user. If they offer a solution-name, push back and propose an outcome-name.
2. Confirm the user has a **strategic outcome** to anchor the sprint. If not, recommend that they articulate it before starting — discovery without an outcome to anchor against drifts.
3. Create the directory `discovery/$1/` (Bash, `mkdir -p`).
4. Copy [`templates/discovery-state-template.md`](../../../templates/discovery-state-template.md) to `discovery/$1/discovery-state.md`. Fill `sprint: $1`.
5. Print a summary: directory created, recommended next command (`/discovery:frame`).

## Don't

- Don't create phase artifact files yet — they're created by their own commands.
- Don't push or commit — leave that to the user.
- Don't start a sprint when the user already has a brief — recommend `/spec:start` + `/spec:idea` instead.
