---
id: RETRO-CLI-001
title: CLI Todo App — Retrospective
stage: learning
feature: cli-todo
status: complete
owner: retrospective
inputs:
  - RELEASE-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Retrospective — CLI Todo App

## What worked

- The tiny CLI scope made every lifecycle artifact readable in one sitting.
- EARS requirements mapped cleanly to command behavior and test scenarios.
- ADR-CLI-0001 gave the atomic-write decision a clear review and test anchor.

## What did not work

- Completing the example after several upstream planning passes made the state file lag behind the actual artifact maturity.
- The example has illustrative code paths rather than runnable source, which must be called out clearly for readers.

## Actions

| Action | Owner | Due |
|---|---|---|
| Keep `examples/README.md` accurate whenever example state changes. | release-manager | next example update |
| Use the completed CLI example as the fixture for v0.3 validation-baseline work. | dev | T-V03-003 |
| Decide whether a future example should include runnable source alongside artifacts. | pm | before next worked example |

## Spec adherence

No intentional drift from PRD, design, or spec was found. The only caveat is that implementation evidence is illustrative because this repository stores workflow artifacts, not the runnable todo binary.

## Quality gate

- [x] What worked, what did not, and actions captured.
- [x] Spec adherence assessed.
- [x] Lessons fed back into the v0.3 validation baseline.
