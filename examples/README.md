---
title: "Examples"
folder: "examples"
description: "Entry point for worked examples of features built with the workflow kit."
entry_point: true
---
# Examples

Worked end-to-end examples of features developed with this kit.

> **Status:** v0.3 baseline in progress. Examples live here as `examples/<feature-slug>/` with the full set of artifacts (`idea.md`, `research.md`, `requirements.md`, `design.md`, `spec.md`, `tasks.md`, `implementation-log.md`, `test-plan.md`, `test-report.md`, `review.md`, `release-notes.md`, `retrospective.md`, `traceability.md`, `workflow-state.md`).

Status:

- [`examples/cli-todo/`](./cli-todo/) — a tiny CLI todo app, walked through every stage. Demonstrates the workflow on something small enough to read in one sitting. **Complete** — stages 1–11 are represented from idea through retrospective. Start with `cli-todo/workflow-state.md`, then read artifacts in stage order.

Reading order for a complete example:

1. `idea.md`
2. `research.md`
3. `requirements.md`
4. `design.md`
5. `spec.md`
6. `tasks.md`
7. `implementation-log.md`
8. `test-plan.md` and `test-report.md`
9. `review.md` and `traceability.md`
10. `release-notes.md`
11. `retrospective.md`

Planned:

- `examples/auth-service/` — a backend feature with non-trivial NFRs (latency, security, observability) showing how the kit handles them.
- `examples/landing-page/` — a UX/UI-heavy feature showing how `ux-designer` and `ui-designer` collaborate.

If you build a feature with this kit and would be willing to share it as an example, open an issue.
