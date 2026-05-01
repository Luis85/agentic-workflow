# Project memory — index

Short, opinionated table of contents for `.claude/memory/`. Read this first.
See [`README.md`](./README.md) for what belongs here and how to update it.

## Project state

> What the project currently *is* — facts that change over time.

- *(Add a `project_*.md` here when the repo has releases, integrations, or in‑flight roadmaps to point at. Examples: `project_release_status.md`, `project_integrations.md`, `project_active_plan.md`.)*

## Workflow rules

> How we work — conventions every contributor (human or agent) follows.

- **Discovery before idea** — when no brief exists, run the Discovery Track first (`/discovery:start` → … → `/discovery:handoff`). The track produces `chosen-brief.md` which seeds `/spec:idea`. Skipping discovery on a blank page violates Article II (Separation of Concerns). See [`docs/discovery-track.md`](../../docs/discovery-track.md) and [ADR-0005](../../docs/adr/0005-add-discovery-track-before-stage-1.md).
- **Project Manager Track for service-provider work** — when delivering for a client with a contract, scope, and stakeholders, run the Project Manager Track alongside feature work (`/project:start` → `/project:initiate` → `/project:weekly` (recurring) → `/project:close`). Based on P3.Express. State lives in `projects/<slug>/project-state.md`. The track is **opt-in**; skip it for internal product work with no contract boundary. See [`docs/project-track.md`](../../docs/project-track.md) and [ADR-0008](../../docs/adr/0008-add-project-manager-track.md).
- **Portfolio track for multi-project work** — when managing multiple parallel features or acting as a service provider, use the opt-in Portfolio Track (`/portfolio:start` → cycles `/portfolio:y` monthly, `/portfolio:x` 6-monthly, `/portfolio:z` daily). The `portfolio-manager` agent reads `specs/*/workflow-state.md` for health signals but **never modifies spec artifacts**. Portfolio Sponsor (always human) owns all strategic decisions (stop/start/pivot). See [`docs/portfolio-track.md`](../../docs/portfolio-track.md) and [ADR-0009](../../docs/adr/0009-add-portfolio-manager-role.md).
- **Branch per concern** — one PR, one concern. Cut every topic branch fresh from the integration branch; never stack. See [`feedback_pr_hygiene.md`](./feedback_pr_hygiene.md).
- **No direct commits on main / develop** — every change (code, docs, memory, planning artifact) lands via a topic branch and a merged PR. The push deny on `main` / `develop` is a backstop, not the gate; commits should never reach the integration branch locally either. See [`feedback_no_main_commits.md`](./feedback_no_main_commits.md).
- **Verify before push** — the project's verify gate (formatter + linter + types + tests + build) must be green locally before opening a PR. Never `--no-verify`. See [`feedback_verify_gate.md`](./feedback_verify_gate.md) and [`docs/verify-gate.md`](../../docs/verify-gate.md).
- **Worktrees for parallel work** — every topic branch lives under `.worktrees/<slug>/` so multiple agents can run in parallel without trashing each other's caches. See [`feedback_worktrees_required.md`](./feedback_worktrees_required.md) and [`docs/worktrees.md`](../../docs/worktrees.md).
- **Independent‑PRs + batch + multi‑pass review** — open every independent PR before draining review feedback. One implementation pass + one sweep pass beats N serial round‑trips. See [`feedback_pr_workflow.md`](./feedback_pr_workflow.md).
- **PR Codex review loop** — every PR runs a bounded author↔Codex loop. Trigger: `ready_for_review`. Author re-requests a fresh Codex review **after every push**; CI failures and merge conflicts are in-loop work; soft cap at 3 rounds. Approval must come from the latest round. See [`feedback_pr_review_loop.md`](./feedback_pr_review_loop.md) and [ADR-0015](../../docs/adr/0015-codify-codex-pr-review-loop.md).
- **Docs and plan updates ride with their PR** — every user‑visible change updates the relevant doc, plan row, or steering file in the *same* PR. No "I'll update the docs after." See [`feedback_docs_with_pr.md`](./feedback_docs_with_pr.md).
- **Parallel PRs use merge, not rebase** — when two PRs both update the same plan/RTM table, resolve via `git merge origin/<integration-branch>`. Rebase breaks reviewer line anchors. See [`feedback_parallel_pr_conflicts.md`](./feedback_parallel_pr_conflicts.md).
- **Autonomous merge after green review + clean state** — in agent‑driven runs, self‑merge is allowed *only* after the reviewer signal is green AND CI is green AND the PR is in a clean mergeable state. See [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md).
- **Memory edits are docs‑only** — changes to this directory don't need a changeset/version bump and should never be bundled with code changes. See [`feedback_memory_edits.md`](./feedback_memory_edits.md).

## How this index is maintained

When you add a `feedback_*.md` or `project_*.md`, add a one‑line bullet here pointing at it. When you delete one, delete the bullet. The index is the contract; everything else is detail.
