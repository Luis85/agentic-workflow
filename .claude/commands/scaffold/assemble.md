---
description: Project Scaffolding Track — Phase 3 (Assemble). Invokes the project-scaffolder to create a reviewable starter-pack.md from extracted evidence.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /scaffold:assemble

Run Phase 3 (Assemble) of a Project Scaffolding engagement.

## Inputs

- `$1` — project slug (optional if only one scaffolding engagement is active).
- Completed `extraction.md`.

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: assemble`.
2. Confirm `extraction.md` is `complete`.
3. Invoke the `project-scaffolder` agent:

   > Run Phase 3 (Assemble) for `scaffolding/<slug>/`. Read `extraction.md` and create `starter-pack.md` from `templates/scaffolding-starter-pack-template.md`. Draft only source-supported starter sections for steering docs, feature idea seeds, discovery seeds, or project-manager initiation docs. Mark unsupported areas as missing evidence, run the quality gate, and update `scaffolding-state.md` to advance to `current_phase: handoff`.

4. Verify `starter-pack.md` exists and is marked `complete`.
5. Print a completion summary and the recommended next command: `/scaffold:handoff`.

## Don't

- Don't promote drafts into canonical files.
- Don't fill weak evidence gaps with confident prose.
