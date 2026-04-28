---
title: "specs/ — per-feature work product"
folder: "specs"
description: "Entry point for per-feature workflow artifacts under specs/<feature-slug>."
entry_point: true
---
# `specs/` — per-feature work product

Each feature lives at `specs/<feature-slug>/` and contains the artifacts produced by the workflow.

## Starting a feature

```
/spec:start <feature-slug>
```

This scaffolds `specs/<slug>/workflow-state.md` from `templates/workflow-state-template.md`.

## Per-feature layout

```
specs/<feature-slug>/
├── workflow-state.md         ← always present; orchestrator's source of truth
├── idea.md                   ← stage 1
├── research.md               ← stage 2
├── requirements.md           ← stage 3 (PRD)
├── design.md                 ← stage 4 (UX + UI + Architecture)
├── spec.md                   ← stage 5
├── tasks.md                  ← stage 6
├── implementation-log.md     ← stage 7 (append-only)
├── test-plan.md              ← stage 8 (drafted earlier, finalised here)
├── test-report.md            ← stage 8
├── review.md                 ← stage 9
├── traceability.md           ← stage 9 (RTM)
├── release-notes.md          ← stage 10
└── retrospective.md          ← stage 11
```

Trivial features can skip stages — record skips in `workflow-state.md`. The retrospective is **never** skipped.

## Feature-scoped ADRs

If a decision is specific to one feature and unlikely to be reused, an ADR may live at `specs/<feature-slug>/adr/NNNN-…md`. Otherwise put it in `docs/adr/` (the default).

---

> This `README.md` is the only file checked in here by default; per-feature folders are added by `/spec:start`.
