---
feature: version-0-9-plan
area: V09
current_stage: implementation
status: active
last_updated: 2026-05-02
last_agent: codex
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: complete
  tasks.md: complete
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state - version-0-9-plan

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code/docs | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- None.

## Blocks

- None.

## Hand-off notes

- Tracker issue: https://github.com/Luis85/agentic-workflow/issues/125
- 2026-05-01 (codex): Planned v0.9 through Stage 6 from the request for a stakeholder sparring partner before v1.0. Recommended implementation order is define the `stakeholder-sparring.md` artifact contract, add the roadmap sparring command or skill, extend evidence collection, add named-stakeholder guardrails, update roadmap docs/agents/skills/command inventories, add validation and examples, then run full verification.
- 2026-05-02 (Decider): CLAR-V09-001, CLAR-V09-002, and CLAR-V09-003 resolved in the cross-plan clarification slate. v0.9 uses a single append-oriented `roadmaps/<slug>/stakeholder-sparring.md` artifact. The first implementation exposes both `/roadmap:spar` as the command surface and a reusable skill/manual flow for non-Claude tools. Default evidence sources are committed roadmap/spec/project artifacts, communication logs, decision logs, issue/PR comments, and human-approved summaries; raw transcripts or private past conversations are excluded unless explicitly supplied or approved for that session.

## Open clarifications

- [x] CLAR-V09-001 - Use a single append-oriented `roadmaps/<slug>/stakeholder-sparring.md` artifact for v0.9. Defer per-stakeholder files until volume proves the need.
- [x] CLAR-V09-002 - Expose both `/roadmap:spar` as the command surface and a reusable skill/manual flow for non-Claude tools. The command is the happy path; the skill preserves portability.
- [x] CLAR-V09-003 - Default allowed sources are committed roadmap/spec/project artifacts, communication logs, decision logs, issue/PR comments, and human-approved summaries. Raw transcripts or private past conversations are excluded unless explicitly supplied or approved for that session.
