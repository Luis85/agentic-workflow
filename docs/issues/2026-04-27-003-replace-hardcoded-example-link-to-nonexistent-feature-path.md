# Issue: Replace hardcoded dead example link in project-track docs

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Resolved
- **Area:** Documentation examples

## Summary
`docs/project-track.md` contains a direct link to a non-existent feature path: `../../specs/auth-redesign/workflow-state.md`.

## Why it matters
Readers may interpret this as a real, expected file path and spend time debugging missing content. Dead example links also fail link-integrity checks.

## Proposed fix
- Replace the dead link with either:
  - an existing real example path in the repository, or
  - clearly marked placeholder text that is not rendered as a live markdown link.

## Acceptance criteria
- `docs/project-track.md` contains no links to missing local files.
- The example remains understandable for first-time users.

## Resolution
Resolved in branch `fix/doc-review-issues` by rendering the illustrative `specs/auth-redesign/workflow-state.md` path as a code span instead of a live link.
