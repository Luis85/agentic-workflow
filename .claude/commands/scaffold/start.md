---
description: Project Scaffolding Track — Bootstrap. Scaffold a source-led onboarding folder under scaffolding/<slug>/ with scaffolding-state.md initialised.
argument-hint: <project-slug> <source-pointer>
allowed-tools: [Read, Edit, Write, Bash]
model: haiku
---

# /scaffold:start

Bootstrap a Project Scaffolding engagement. Read [`docs/project-scaffolding-track.md`](../../../docs/project-scaffolding-track.md) for the full methodology.

## Inputs

- `$1` — project slug (kebab-case, ≤ 6 words, required).
- `$2...` — source pointer(s), such as a folder path or Markdown file path.

## Procedure

1. If `$1` is missing, ask for a project slug.
2. If no source pointer is provided, ask for at least one folder or Markdown file path. If the user has no source material, recommend `/discovery:start` instead.
3. Create `scaffolding/$1/`.
4. Copy `templates/scaffolding-state-template.md` to `scaffolding/$1/scaffolding-state.md`. Fill `project: $1`, set today's `last_updated`, and add the provided source pointer(s) to `## Source pointers`.
5. Print a summary: directory created, source pointers recorded, recommended next command (`/scaffold:intake $1`).

## Don't

- Don't create phase artifacts yet.
- Don't push or commit.
- Don't overwrite canonical project files.
