---
feature: repo-adoption-track
area: ADOPT
current_stage: idea
status: active
last_updated: 2026-05-03
last_agent: orchestrator
artifacts:
  idea.md: pending
  research.md: pending
  requirements.md: pending
  design.md: pending
  spec.md: pending
  tasks.md: pending
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — repo-adoption-track

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | pending |
| 2. Research | `research.md` | pending |
| 3. Requirements | `requirements.md` | pending |
| 4. Design | `design.md` | pending |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`. Section semantics + status enums: see [`_shared/state-file-sections.md`](./_shared/state-file-sections.md).

## Skips

_(none)_

## Blocks

_(none)_

## Hand-off notes

```
2026-05-03 (orchestrator): Bootstrap complete. Feature folder seeded.
                            Stage 1 input available: docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md
                            (superpowers brainstorming output, treated as upstream research per #258 remediation).
                            Tracking issue: #257. Process bug: #258.
                            ADR planned: 0028 (renumbered from 0027 due to upstream collision with PR #256).
                            Next: /spec:idea — analyst ports superpowers spec content into idea.md.
```

## Open clarifications

- [ ] CLAR-ADOPT-001 — Spec §10.9 left ADR sequencing open (predecessor PR vs bundled). Predecessor was the chosen default for the abandoned superpowers plan; carry forward to Stage 4 design and confirm.
- [ ] CLAR-ADOPT-002 — Spec §10.7 left CI port-over open (does enrichment install `.github/workflows/verify.yml` ported from this repo?). Resolve in Stage 4 / Stage 5.
- [ ] CLAR-ADOPT-003 — Spec §10.2 left renderer language coverage open (one generic vs Node/Python specialised). Resolve in Stage 4.
