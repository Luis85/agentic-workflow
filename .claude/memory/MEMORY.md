# Project memory — index

One-line pointers into `.claude/memory/`. Read first. See [`README.md`](./README.md) for the contract.

## Project state

- *(Add `project_*.md` for releases, integrations, in-flight roadmaps as needed.)*

## Workflow rules

- **Discovery before idea** — no brief → run Discovery Track, get `chosen-brief.md`. See [`docs/discovery-track.md`](../../docs/discovery-track.md).
- **Project Manager Track** — opt-in for client engagements (P3.Express). See [`docs/project-track.md`](../../docs/project-track.md).
- **Portfolio Track** — opt-in for multi-feature/program work; never modifies `specs/`. See [`docs/portfolio-track.md`](../../docs/portfolio-track.md).
- **Branch per concern** — one PR, one concern; cut fresh from integration. See [`feedback_pr_hygiene.md`](./feedback_pr_hygiene.md).
- **No direct commits on `main` / `develop`** — every change via topic branch + merged PR. See [`feedback_no_main_commits.md`](./feedback_no_main_commits.md).
- **Verify before push** — gate green locally; never `--no-verify`. See [`feedback_verify_gate.md`](./feedback_verify_gate.md).
- **Worktrees for parallel work** — topic branches under `.worktrees/<slug>/`. See [`feedback_worktrees_required.md`](./feedback_worktrees_required.md).
- **Independent PRs + batch review** — open all independent PRs before draining feedback. See [`feedback_pr_workflow.md`](./feedback_pr_workflow.md).
- **PR Codex review loop** — bounded author↔Codex loop; re-request after every push. See [`feedback_pr_review_loop.md`](./feedback_pr_review_loop.md).
- **Docs ride with their PR** — user-visible change updates the doc in the same PR. See [`feedback_docs_with_pr.md`](./feedback_docs_with_pr.md).
- **Parallel PRs: merge not rebase** — preserves reviewer line anchors. See [`feedback_parallel_pr_conflicts.md`](./feedback_parallel_pr_conflicts.md).
- **Autonomous merge** — only after green review + green CI + clean mergeable. See [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md).
- **PR title CI** — title metadata must use the allowed Conventional Commit type before handoff. See [`feedback_pr_title_ci.md`](./feedback_pr_title_ci.md).
- **Memory edits are docs-only** — no changeset, no bundling with code. See [`feedback_memory_edits.md`](./feedback_memory_edits.md).
- **Token-budget review** — quarterly or pre-release: `/token-review` runs the audit + emits a per-area cleanup plan. See [`token-budget-review`](../skills/token-budget-review/SKILL.md).

## How this index is maintained

Add `feedback_*.md` or `project_*.md` → add one-line bullet here. Delete file → delete bullet. Index is the contract; rest is detail.
