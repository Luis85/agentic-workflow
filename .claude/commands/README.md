# Slash commands

One command per workflow phase. Subdirectories namespace commands (`spec/specify.md` → `/spec:specify`, `discovery/frame.md` → `/discovery:frame`).

## Command inventory

<!-- BEGIN GENERATED: command-inventory -->
# Decisions:
/adr:new

# Discovery Track:
/discovery:converge   /discovery:diverge    /discovery:frame
/discovery:handoff    /discovery:prototype  /discovery:start
/discovery:validate

# Portfolio Track:
/portfolio:start  /portfolio:x      /portfolio:y
/portfolio:z

# Product:
/product:page

# Project Manager Track:
/project:change    /project:close     /project:initiate
/project:post      /project:report    /project:start
/project:weekly

# Sales Cycle Track:
/sales:estimate  /sales:order     /sales:propose
/sales:qualify   /sales:scope     /sales:start

# Lifecycle:
/spec:analyze       /spec:clarify       /spec:design
/spec:idea          /spec:implement     /spec:release
/spec:requirements  /spec:research      /spec:retro
/spec:review        /spec:specify       /spec:start
/spec:tasks         /spec:test

# Stock-taking Track:
/stock-taking:audit       /stock-taking:handoff     /stock-taking:scope
/stock-taking:start       /stock-taking:synthesize
<!-- END GENERATED: command-inventory -->

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
