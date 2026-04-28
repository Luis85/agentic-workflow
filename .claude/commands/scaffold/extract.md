---
description: Project Scaffolding Track — Phase 2 (Extract). Invokes the project-scaffolder to distil source-backed facts and ambiguities into extraction.md.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /scaffold:extract

Run Phase 2 (Extract) of a Project Scaffolding engagement.

## Inputs

- `$1` — project slug (optional if only one scaffolding engagement is active).
- Completed `intake.md` and `source-inventory.md`.

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: extract`.
2. Confirm `intake.md` and `source-inventory.md` are `complete`.
3. Invoke the `project-scaffolder` agent:

   > Run Phase 2 (Extract) for `scaffolding/<slug>/`. Read `intake.md`, `source-inventory.md`, and accessible source material. Create `extraction.md` from `templates/scaffolding-extraction-template.md`. Extract evidence-backed facts with source and confidence, preserve conflicts and ambiguities, avoid EARS requirements and design decisions, run the quality gate, and update `scaffolding-state.md` to advance to `current_phase: assemble`.

4. Verify `extraction.md` exists and is marked `complete`.
5. Print a completion summary and the recommended next command: `/scaffold:assemble`.

## Don't

- Don't invent facts from thin evidence.
- Don't write requirements or architecture decisions.
