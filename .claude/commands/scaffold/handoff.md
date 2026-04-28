---
description: Project Scaffolding Track — Handoff. Invokes the project-scaffolder to produce handoff.md with promotion checklist and recommended next track.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /scaffold:handoff

Run Handoff for a Project Scaffolding engagement.

## Inputs

- `$1` — project slug (optional if only one scaffolding engagement is active).
- Completed `starter-pack.md`.

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: handoff`.
2. Confirm `starter-pack.md` is `complete`.
3. Invoke the `project-scaffolder` agent:

   > Run Handoff for `scaffolding/<slug>/`. Read all scaffolding artifacts and create `handoff.md` from `templates/scaffolding-handoff-template.md`. List promotion actions, human review status, recommended next track, and remaining risks. Set `recommended_next` in `scaffolding-state.md` to `discovery`, `spec`, `project`, `stock-taking`, or `none`; set engagement `status` to `complete` or `incomplete`.

4. Verify `handoff.md` exists and `scaffolding-state.md` is `complete` or `incomplete`.
5. Print a summary with recommended downstream command(s).

## Don't

- Don't claim human approval unless it happened.
- Don't resolve ambiguities by choosing one unsupported interpretation.
