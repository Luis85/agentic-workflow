---
term: Quality gate
slug: quality-gate
aliases: [stage gate, gate]
status: accepted
last-updated: 2026-04-28
related: [retrospective, spec, artifact]
tags: [workflow, governance, quality]
---

# Quality gate

## Definition

A short checklist a stage must pass before the next stage can begin.

## Why it matters

Article IV of [`memory/constitution.md`](../../memory/constitution.md) makes quality gates non-negotiable: every stage in the Specorator workflow has acceptance criteria in [`docs/quality-framework.md`](../quality-framework.md), and a stage is not "done" until its gate is green. Gates exist so that errors are caught at the **earliest** possible stage — a bug found in testing that traces to a missing requirement is a requirements defect, not a test defect.

Gates are two-layered:
- **Deterministic checks** first — linters, schemas, tests.
- **Critic-agent review** second — judgment-required checks.

## Examples

> *"Each stage has one owner, one output, and one quality gate before the next stage can begin. No stage is skipped; quality gates are non-negotiable."* — `README.md`

A gate at the boundary between Stage 3 (Requirements) and Stage 4 (Design) might require: every functional requirement is in EARS form, every requirement has a stable `REQ-<AREA>-NNN` ID, and the human stakeholder has signed off in `workflow-state.md`.

## Avoid

- *Approval* — narrower; a human approval is one input to a gate, but the gate itself is the full checklist.
- *Code review* — that's a check inside a single stage's gate, not the gate itself.

## See also

- [`docs/quality-framework.md`](../quality-framework.md) — quality dimensions and the per-stage gate definitions.
- [retrospective](./retrospective.md) — captures gate failures so the workflow improves over time.
- [artifact](./artifact.md) — each gate validates the stage's artifact.
