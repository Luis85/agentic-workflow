---
title: Issue-draft track
folder: docs
description: Opt-in track that opens an early draft PR after /spec:idea and evolves the issue body as a living PRD as each Specorator stage completes.
entry_point: false
---

# Issue-draft track

Opt-in track that runs *after* `/spec:idea`. Opens a draft PR seeded from `idea.md`, applies a PRD sentinel block to the parent issue body, and keeps both in sync via the `issue-pr-sync` shared skill as each subsequent stage completes.

Filed by ADR-0034 (`docs/adr/0034-add-issue-draft-track.md`).

## When to use

- A feature has reached `/spec:idea` (`idea.md` is `complete`).
- A GitHub issue exists for the feature.
- You want a draft PR as a discussion/feedback hub from the earliest point.
- You want the issue body to evolve into a living PRD as specs, requirements, and design are produced.

Not for:

- Features without a completed `idea.md` — run `/spec:idea` first.
- Issues with no GitHub presence — this track requires `gh` auth and an open issue.

## Inputs

- A GitHub issue number.
- A `specs/<slug>/` folder with `idea.md` status `complete`.

## Outputs

- One draft PR (`feat/<slug>-draft`) seeded from `idea.md`, with body maintained by `issue-pr-sync`.
- A PRD sentinel block (`<!-- BEGIN issue-draft:<slug> --> … <!-- END issue-draft:<slug> -->`) applied to the issue body and updated at each stage completion.
- Two new optional fields in `specs/<slug>/workflow-state.md`: `draft_pr` (PR number), `draft_pr_branch` (branch name), `issue_number`.

## Flow

```
/spec:idea completes → idea.md exists
    │
    ▼
/issue:draft <n>
    ├─ pre-flight: gh auth, issue open, idea.md complete
    ├─ create branch feat/<slug>-draft, push empty commit
    ├─ gh pr create --draft (seeded from idea.md)
    ├─ apply PRD sentinel block to issue body
    └─ write draft_pr, draft_pr_branch, issue_number to workflow-state.md
    │
    ▼
/spec:research → /spec:requirements → /spec:design → /spec:specify → /spec:tasks
    each (last step, non-fatal):
    issue-pr-sync skill:
        ├─ update draft PR body sentinel block
        └─ update issue PRD sentinel block
    │
    ▼
/issue:breakdown (additive final step after Step 10.5):
    issue-pr-sync: populate Tasks section of issue + draft PR body with slice PRs
    (human closes draft PR manually)
```

## Constraints

- `issue-pr-sync` is always the **last step** of each stage conductor — it never blocks stage completion.
- Sync failure is **non-fatal** — warn and skip; the stage still completes.
- Stage 1 (`/spec:idea`) is **not modified** — the draft PR is opened by `/issue:draft`.
- The draft branch carries **no source diff** — empty commit only.
- Sentinel blocks are last-write-wins. Humans annotate outside the block.
- The draft branch is created directly (not as a worktree) because it carries no source diff.

## References

- Design spec: `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md`.
- ADR: `docs/adr/0034-add-issue-draft-track.md`.
- Shared skill: `.claude/skills/issue-pr-sync/SKILL.md`.
- Companion track: `docs/issue-breakdown-track.md`.
- Sink: `docs/sink.md`.
