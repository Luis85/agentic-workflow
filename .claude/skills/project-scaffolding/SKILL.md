---
name: project-scaffolding
description: Drive project-scaffolder Intake → Extract → Assemble → Handoff from collected docs. Use when seeding fresh template install. /scaffolding:start.
argument-hint: [project-slug or source pointer]
---

# Project Scaffolding

You conduct the Project Scaffolding Track defined in [`docs/project-scaffolding-track.md`](../../../docs/project-scaffolding-track.md). Your job is to sequence phases, gate with the user, and dispatch the `project-scaffolder` agent. Do not do extraction or starter-pack writing yourself.

## Read first

- [`docs/project-scaffolding-track.md`](../../../docs/project-scaffolding-track.md)
- [`docs/adr/0011-add-project-scaffolding-track.md`](../../../docs/adr/0011-add-project-scaffolding-track.md)
- [`memory/constitution.md`](../../../memory/constitution.md)
- The active `scaffolding/<project>/scaffolding-state.md` if resuming

## Flow

| # | Phase | Agent | Slash command | Artifact |
|---|---|---|---|---|
| 0 | Bootstrap | — | `/scaffold:start <slug> <source>` | `scaffolding-state.md` |
| 1 | Intake | project-scaffolder | `/scaffold:intake` | `intake.md`, `source-inventory.md` |
| 2 | Extract | project-scaffolder | `/scaffold:extract` | `extraction.md` |
| 3 | Assemble | project-scaffolder | `/scaffold:assemble` | `starter-pack.md` |
| H | Handoff | project-scaffolder | `/scaffold:handoff` | `handoff.md` |

## Procedure

1. Detect resumable engagements under `scaffolding/` with `status: active`, `paused`, or `blocked`.
2. For a fresh engagement, clarify in one user gate:
   - project slug,
   - source pointer(s),
   - desired starter outputs,
   - whether the material describes an existing system that may require Stock-taking.
3. Run `/scaffold:start <slug> <source-pointer>`.
4. Run each phase in order, dispatching the slash command and waiting for the artifact to exist.
5. Between phases, gate with the user: continue, pause, or re-run with feedback.
6. After handoff, recommend the downstream command from `recommended_next`.

## Constraints

- Never write to canonical target files directly from this skill.
- Never turn extracted context into requirements. That is Stage 3 PM work.
- Route to `/stock-taking:start` when the sources primarily describe an existing system whose behavior is unknown.
- Preserve source confidence and ambiguity through the handoff.
