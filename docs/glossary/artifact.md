---
term: Artifact
slug: artifact
aliases: [deliverable, document]
status: accepted
last-updated: 2026-04-28
related: [spec, agent, quality-gate, traceability]
tags: [artifact, workflow]
---

# Artifact

## Definition

A markdown file produced at a stage of the workflow — `idea.md`, `requirements.md`, `design.md`, `spec.md`, `tasks.md`, `implementation-log.md`, `test-plan.md`, `test-report.md`, `review.md`, `release-notes.md`, `retrospective.md`, and so on.

## Why it matters

Artifacts are the only durable communication channel between stages. The workflow has **one owner, one output, one gate** per stage; the "one output" is always an artifact. Where each artifact lives, who owns it, and how it evolves is documented in [`docs/sink.md`](../sink.md) — the master registry.

Artifacts are markdown for three reasons: human-readable first, agent-readable second; framework-agnostic so they survive tooling changes; and diffable in version control.

## Examples

> *"Markdown for all artifacts. Keep them concise; prefer precision over completeness in early iterations."* — `AGENTS.md`

A feature folder under `specs/<slug>/` holds one artifact per stage:

```
specs/<slug>/
├── workflow-state.md       # state machine
├── idea.md                 # stage 1 (analyst)
├── research.md             # stage 2 (analyst)
├── requirements.md         # stage 3 (pm)
├── design.md               # stage 4 (ux + ui + architect)
├── spec.md                 # stage 5 (architect)
├── tasks.md                # stage 6 (planner)
├── implementation-log.md   # stage 7 (dev)
├── test-plan.md            # stage 8 (qa)
├── test-report.md          # stage 8 (qa)
├── review.md               # stage 9 (reviewer)
├── traceability.md         # stage 9 (reviewer)
├── release-notes.md        # stage 10 (release-manager)
└── retrospective.md        # stage 11 (retrospective)
```

## Avoid

- *Source code* — code lives in the actual codebase, not in `specs/` or `docs/`.
- *Log dump* — raw command output is not an artifact; summaries are.
- *Scratch file* — agent-internal notes are not artifacts; they don't survive past the agent's turn.

## See also

- [`docs/sink.md`](../sink.md) — the master registry of every artifact location and its owner.
- [spec](./spec.md) — every spec is an artifact (but not every artifact is a spec).
- [agent](./agent.md) — who produces each artifact.
- [traceability](./traceability.md) — how artifacts link to each other.
