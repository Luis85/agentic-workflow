# Slash commands

One command per workflow phase. Subdirectories namespace commands (`spec/specify.md` → `/spec:specify`).

## `/spec:*` — workflow phases

| Command | Stage | Spawns agent |
|---|---|---|
| `/spec:start <slug>` | bootstrap | — (scaffolds files) |
| `/spec:idea` | 1 | `analyst` |
| `/spec:research` | 2 | `analyst` |
| `/spec:requirements` | 3 | `pm` |
| `/spec:design` | 4 | `ux-designer`, `ui-designer`, `architect` (sequenced) |
| `/spec:specify` | 5 | `architect` |
| `/spec:tasks` | 6 | `planner` |
| `/spec:implement [task-id]` | 7 | `dev` |
| `/spec:test` | 8 | `qa` |
| `/spec:review` | 9 | `reviewer` |
| `/spec:release` | 10 | `release-manager` |
| `/spec:retro` | 11 | `retrospective` |
| `/spec:clarify` | gate | active stage's agent |
| `/spec:analyze` | gate | `reviewer` (in lightweight mode) |

## `/adr:*` — decisions

| Command | Purpose |
|---|---|
| `/adr:new "<title>"` | File a new ADR |

## Usage

```
/spec:start payments-redesign
/spec:idea
/spec:research
/spec:clarify              ← optional gate
/spec:requirements
/spec:design
/spec:specify
/spec:analyze              ← optional gate
/spec:tasks
/spec:implement T-PAY-014
/spec:test
/spec:review
/spec:release
/spec:retro
```

The user can run them in order; the orchestrator will recommend the next one based on `workflow-state.md`.

## Conventions

- Commands accept `$ARGUMENTS` (full string) and `$1`, `$2`, … (positional, shell-quoted).
- The first positional, when relevant, is the **feature slug**.
- Commands read `specs/<slug>/workflow-state.md` first to confirm the stage is the right next move.
- Commands always **end** by updating `workflow-state.md`.
