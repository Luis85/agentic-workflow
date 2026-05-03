---
feature: repo-adoption-track
area: ADOPT
current_stage: research
status: active
last_updated: 2026-05-03
last_agent: analyst
artifacts:
  idea.md: complete
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
| 1. Idea | `idea.md` | complete |
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

## Skips

- None.

## Blocks

- None at this stage. ADR-0030 (amending ADR-0026 to admit the Repo Adoption Track as a 13th first-party track) must be accepted before Stage 3 (Requirements) can begin. See CLAR-ADOPT-001 and Q1 in `idea.md`.

## Hand-off notes

- 2026-05-03 (analyst): `idea.md` complete. Problem statement: solo builders and teams with existing repositories have no supported, gated path to install the Specorator scaffold into a foreign repo and open a reviewable PR against that remote. The idea frames a four-phase pipeline (review → parity → enrich → push) invoked via `/adopt:start <url>`. Key constraints: v1.1 scope only (no drift detection); GitHub-only remote; TypeScript scripts + `gh` / `git` CLI; push is a human-gated irreversible step (Constitution Article IX). ADR-0026 is frozen — ADR-0030 must supersede it before the track ships as a first-party workflow.

  Research agenda for Stage 2 (`/spec:research`):

  - **Q1 (CLAR-ADOPT-001)** — ADR sequencing: predecessor PR vs. bundled. Research precedent from ADR-0007, ADR-0011, ADR-0019.
  - **Q2 (CLAR-ADOPT-002)** — CI port-over: does Phase 3 enrichment install `verify.yml`? How to handle repos that already have CI?
  - **Q3 (CLAR-ADOPT-003)** — Language-specific renderer breadth: one generic preset vs. Node/Python specialised presets for v1.1.
  - **Q4** — Template-version pin strategy: how to record which template version was used at adoption time without blocking future drift detection.
  - **Q5** — License compatibility: should the agent warn when the adopted repo's license may be incompatible with the template's installed files?
  - **Q6** — Agent tool-list enforcement in a worktree context: is `.claude/settings.json` sufficient when the agent operates in a cloned foreign tree?
  - **Q7** — Phase-gate interface: does the four-phase gating map to `AskUserQuestion` callbacks, or does it need a stateful confirmation protocol?
  - **Q8** — Conflict resolution ownership in Phase 1: agent-driven, human-interactive, or merge-strategy file?
  - **Q9** — Non-GitHub remote failure mode: loud error vs. partial path with instructions.
  - **Q10** — Relation to Project Scaffolding Track: independent tracks or shared methodology for source inventory and conflict detection?

  Research should also identify at least two substantively different architectural alternatives for the pipeline (e.g., entirely CLI-scripted vs. agent-orchestrated with per-phase skill files), surface risks (especially around irreversible push and foreign-repo permissions), and recommend which alternative feeds into Requirements. The upstream superpowers spec (`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`) is valid prior-art input for the research pass; treat its Q1–Q10 locked decisions as hypotheses to validate, not as accepted architecture.

## Open clarifications

- [ ] CLAR-ADOPT-001 — ADR sequencing: should ADR-0030 be filed in a predecessor PR before implementation, or bundled with the implementation PR? *(open — research agenda item Q1)*
- [ ] CLAR-ADOPT-002 — CI port-over scope: does Phase 3 enrichment install `verify.yml` or equivalent into the adopted repository, and how are conflicts with existing CI handled? *(open — research agenda item Q2)*
- [ ] CLAR-ADOPT-003 — Language-specific renderer breadth: one generic enrichment preset vs. specialised Node/Python presets for v1.1? *(open — research agenda item Q3)*
