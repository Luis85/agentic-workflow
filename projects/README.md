# projects/

One folder per client engagement. Used by the **Project Manager Track** (opt-in, service-provider context).

## When to create a project folder

Create a folder here when you are delivering software for a client and need:
- Scope, schedule, and budget governance
- Stakeholder status reports
- Formal change control
- A project closure document with client sign-off

If you are delivering internal product work with no contract boundary, use `specs/` + `discovery/` directly — you do not need a project folder.

## How to start

```
/project:start <engagement-slug>
```

Then follow the `project-run` skill conversationally, or drive the commands manually:

```
/project:initiate    → charter, deliverables map, follow-up register
/project:weekly      → weekly management cycle (run every week)
/project:change      → log a change request
/project:report      → client-facing status report
/project:close       → project closure (at engagement end)
/project:post        → post-project benefit evaluation (months later)
```

## Folder structure

```
projects/
└── <engagement-slug>/
    ├── project-state.md          # state machine — current phase, linked features
    ├── project-description.md    # P3 Doc 1: scope, objectives, stakeholders, budget
    ├── deliverables-map.md       # P3 Doc 2: WBS, milestones, feature links
    ├── followup-register.md      # P3 Doc 3: risks + issues + changes + lessons
    ├── health-register.md        # P3 Doc 4: satisfaction scores, governance
    ├── weekly-log.md             # append-only weekly entries
    ├── status-report.md          # client-facing snapshot (replaced each run)
    └── project-closure.md        # final closure document
```

## Relationship to specs/ and discovery/

- Feature work still lives in `specs/<slug>/` — one feature per folder.
- Discovery sprints still live in `discovery/<slug>/`.
- The project folder **links to** feature and discovery folders but never rewrites their artifacts.
- The project-manager reads `workflow-state.md` from each linked spec to report progress.

## Methodology

Based on **P3.Express** (https://p3.express/), specifically the micro.P3.Express variant for teams of 1–7. See [`docs/project-track.md`](../docs/project-track.md) for the full methodology and [`docs/adr/0006-add-project-manager-track.md`](../docs/adr/0006-add-project-manager-track.md) for the design rationale.
