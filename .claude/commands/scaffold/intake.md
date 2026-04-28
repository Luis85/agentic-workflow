---
description: Project Scaffolding Track — Phase 1 (Intake). Invokes the project-scaffolder to record source pointers, adoption context, desired starter outputs, and source inventory.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /scaffold:intake

Run Phase 1 (Intake) of a Project Scaffolding engagement.

## Inputs

- `$1` — project slug (optional if only one scaffolding engagement is active).
- Active `scaffolding/<slug>/scaffolding-state.md` with `current_phase: intake`.

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: intake`.
2. Invoke the `project-scaffolder` agent:

   > Run Phase 1 (Intake) for `scaffolding/<slug>/`. Read `scaffolding-state.md`, then create `intake.md` from `templates/scaffolding-intake-template.md` and `source-inventory.md` from `templates/scaffolding-source-inventory-template.md`. Inventory the provided source pointers, rate reliability, capture adoption context and intended starter outputs, record unknowns, run the quality gates, and update `scaffolding-state.md` to advance to `current_phase: extract`.

3. Verify `intake.md` and `source-inventory.md` exist and are marked `complete`.
4. Print a completion summary and the recommended next command: `/scaffold:extract`.

## Don't

- Don't do the scaffolder's extraction work yourself.
- Don't advance if no source pointer is accessible.
