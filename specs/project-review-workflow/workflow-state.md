---
feature: project-review-workflow
area: PRV
current_stage: implementation
status: active
last_updated: 2026-05-03
last_agent: codex
artifacts:
  idea.md: complete
  research.md: skipped
  requirements.md: complete
  design.md: skipped
  spec.md: skipped
  tasks.md: complete
  implementation-log.md: in-progress
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — project-review-workflow

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | skipped |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | skipped |
| 5. Specification | `spec.md` | skipped |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code | in-progress |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

## Skips

- `research.md` — first draft PR is scoped to template methodology and invocation surfaces; external research is not needed.
- `design.md` and `spec.md` — this is a workflow documentation increment; requirements and tasks are sufficient for the first draft.

## Blocks

- None.

## Hand-off notes

- 2026-05-03 (codex): Started template improvement for a Project-review workflow that captures project/git-history learnings, proposes improvements, opens a tracking issue, and creates a first draft PR from a dedicated worktree.
- 2026-05-03 (codex): Opened tracking issue https://github.com/Luis85/agentic-workflow/issues/266 for the workflow idea.

## Open clarifications

- None.
