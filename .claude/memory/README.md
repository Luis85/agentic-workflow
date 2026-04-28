---
title: ".claude/memory/"
folder: ".claude/memory"
description: "Entry point for shared operational memory used by agents and contributors."
entry_point: true
---
# `.claude/memory/`

Shared, version-controlled **operational memory** for AI agents and humans working in this repo.

> Constitution (`memory/constitution.md`) is the **immutable‑ish** law.
> Operational memory here is the **rolling** record of what we've learned about *how to work in this repo* — and what state that work is currently in.

## What goes here

Two file shapes, both named with a stable prefix so the index is easy to scan:

- **`feedback_*.md`** — workflow conventions the team has converged on, captured with reasoning + how to apply them. Examples: how PRs are organised, how parallel agents avoid colliding, what counts as "done" before a push.
- **`project_*.md`** — current state outside the source tree: release status, external touchpoints, in‑flight roadmaps, pinned references the team consults often.

Every other file in this directory is an index or this README.

## What does **NOT** go here

- **Per‑machine paths, individual contributor preferences, local tooling quirks** — those belong in `~/.claude/` or shell rc files.
- **Durable principles** — those belong in `memory/constitution.md` and require an ADR to change.
- **Decisions** — those belong in `docs/adr/`.
- **Per‑feature plans/specs** — those belong in `specs/<slug>/` and `docs/plans/`.
- **Debugging notes** for one PR — keep them in the PR description, not here.
- **Secrets or anything sensitive** — this directory is checked in.

## How to update it

1. Memory edits ride in a normal PR on a topic branch. No changeset, no version bump.
2. Prefer **deleting** a stale entry over leaving it alongside its replacement. Two files saying contradictory things is the worst outcome.
3. When you add a new file, also add a one‑line bullet to [`MEMORY.md`](./MEMORY.md) under the appropriate section so the index stays current.
4. If a `feedback_*.md` rule starts being broken regularly, the rule is wrong, not the team. Edit it.

## How agents should use it

- **Read [`MEMORY.md`](./MEMORY.md) at session start.** It is short by design and links to whichever individual file is relevant.
- **Treat `feedback_*.md` as binding** unless the constitution overrides it.
- **Treat `project_*.md` as freshness‑of‑last‑edit.** If it looks stale (e.g. references a release that already shipped), flag it and propose an update — don't silently work around it.

See [`docs/specorator.md`](../../docs/specorator.md) for where memory fits in the wider workflow, and [`AGENTS.md`](../../AGENTS.md) for the operating rules that govern every agent.
