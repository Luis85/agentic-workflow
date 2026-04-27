# Slash commands

One command per workflow phase. Subdirectories namespace commands (`spec/specify.md` → `/spec:specify`, `discovery/frame.md` → `/discovery:frame`).

## `/discovery:*` — pre-stage Discovery Track (opt-in)

Run this track when the team has no brief yet — a blank page rather than a defined feature. Output is `chosen-brief.md` which seeds `/spec:idea`. See [`docs/discovery-track.md`](../../docs/discovery-track.md) and [ADR-0005](../../docs/adr/0005-add-discovery-track-before-stage-1.md).

| Command | Phase | Spawns agent |
|---|---|---|
| `/discovery:start <sprint-slug>` | bootstrap | — (scaffolds files) |
| `/discovery:frame` | 1 — Frame | `facilitator` (consults `product-strategist`, `user-researcher`) |
| `/discovery:diverge` | 2 — Diverge | `facilitator` (consults `divergent-thinker`, `game-designer`) |
| `/discovery:converge` | 3 — Converge | `facilitator` (consults `critic`, `product-strategist`) |
| `/discovery:prototype` | 4 — Prototype | `facilitator` (consults `prototyper`, `game-designer`) |
| `/discovery:validate` | 5 — Validate | `facilitator` (consults `user-researcher`, `critic`) |
| `/discovery:handoff` | handoff | `facilitator` (consults `product-strategist`) |

Conversational entry: the [`discovery-sprint`](../skills/discovery-sprint/SKILL.md) skill.

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
| `/spec:analyze` | gate | — (in-command consistency checks; no subagent spawned) |

## `/adr:*` — decisions

| Command | Purpose |
|---|---|
| `/adr:new "<title>"` | File a new ADR |

## Usage

```
# Optional pre-stage when no brief exists yet:
/discovery:start q2-retention-discovery
/discovery:frame
/discovery:diverge
/discovery:converge
/discovery:prototype
/discovery:validate
/discovery:handoff       ← writes chosen-brief.md, recommends /spec:start

# Then the lifecycle workflow:
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
- The first positional, when relevant, is the **feature slug** — with one deliberate exception: `/spec:implement` takes the **task ID** as `$1` (the slug auto-resolves from the active `workflow-state.md`, and a user mid-implementation types task IDs far more often than slugs). Always check the command's `argument-hint` for the authoritative order.
- Commands read `specs/<slug>/workflow-state.md` first to confirm the stage is the right next move.
- Commands always **end** by updating `workflow-state.md`.
