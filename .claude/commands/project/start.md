---
description: Project Manager Track — Bootstrap. Scaffold a new project folder under projects/<slug>/ with project-state.md initialised.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /project:start

Bootstrap a new client engagement. Read [`docs/project-track.md`](../../../docs/project-track.md) for the full methodology.

## Inputs

- `$1` — project slug (kebab-case, ≤6 words, required). Name the **client or engagement**, not the solution. Good: `acme-portal-2026`, `coastal-insurance-migration`. Bad: `new-website`, `redesign`.

## Procedure

1. If `$1` is missing, ask the user.
2. If the slug looks like a solution name (e.g., `new-checkout`, `api-rewrite`), push back and propose an engagement-level name.
3. Confirm the user has a **client brief or statement of work** to anchor the project. If not, suggest they draft a brief first — or run `/discovery:start` if ideation is needed.
4. Create the directory `projects/$1/` (Bash, `mkdir -p`).
5. Copy [`templates/project-state-template.md`](../../../templates/project-state-template.md) to `projects/$1/project-state.md`. Fill `project: $1`, `phase: scaffolded`, `last_updated: <today>`.
6. Print a summary: directory created, what's in it, recommended next command (`/project:initiate`).

## Don't

- Don't create the four management documents yet — those are created by `/project:initiate`.
- Don't push or commit — leave that to the user.
- Don't start a project when the user already has a spec in flight with no client — recommend staying in the Specorator instead.
