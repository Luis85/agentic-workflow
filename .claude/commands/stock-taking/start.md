---
description: Stock-taking Track — Bootstrap. Scaffold a new project folder under stock-taking/<slug>/ with stock-taking-state.md initialised.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /stock:start

Bootstrap a new Stock-taking Engagement. Read [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) for the full methodology.

## Inputs

- `$1` — project slug (kebab-case, ≤ 6 words, required). Name the **system or system cluster** being inventoried, not the feature to be built. Good: `crm-legacy-audit`, `billing-platform-baseline`. Bad: `new-invoice-feature`.

## Procedure

1. If `$1` is missing, ask the user. If they offer a feature name, push back and propose a system-cluster name.
2. Confirm the user has an **existing system** to inventory. If they don't — if this is a greenfield project — recommend `/discovery:start` (blank page) or `/spec:start` + `/spec:idea` (clear brief) instead.
3. Create the directory `stock-taking/$1/` (Bash, `mkdir -p`).
4. Copy [`templates/stock-taking-state-template.md`](../../../templates/stock-taking-state-template.md) to `stock-taking/$1/stock-taking-state.md`. Fill `project: $1`.
5. Print a summary: directory created, recommended next command (`/stock:scope`).

## Don't

- Don't create phase artifact files yet — they are created by their own commands.
- Don't push or commit — leave that to the user.
- Don't start an engagement when the user confirms there is no existing system to inventory.
