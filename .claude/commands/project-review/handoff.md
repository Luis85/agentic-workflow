---
description: Project-review workflow — Open tracking issue, create proposal worktree, and open first draft PR.
argument-hint: "<review-slug>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /project-review:handoff

Hand off a Project-review workflow into an issue and first draft PR.

## Inputs

- `$1` — review slug, kebab-case, required.

## Procedure

Invoke the [`project-review`](../../skills/project-review/SKILL.md) skill with phase `handoff`.

The skill must:

1. Read `quality/$1/project-review-state.md` and `quality/$1/improvement-proposals.md`.
2. Open a GitHub issue when GitHub access is available.
3. Create a fresh worktree under `.worktrees/<proposal-slug>/` from the integration branch.
4. Implement or scaffold the selected first proposal in that worktree.
5. Run relevant verification.
6. Commit, push, and open a draft PR linked to the issue.
7. Update `project-review-state.md` with issue URL, PR URL, branch, commit SHA, verification, and remaining risks.

## Don't

- Don't merge the draft PR.
- Don't force-push or delete branches.
- Don't stop after opening only the issue unless GitHub or verification is blocked.
