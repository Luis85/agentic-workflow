# Project memory — index

Opinionated TOC for `.claude/memory/`. Read first.
See [`README.md`](./README.md) for what belongs + how update.

## Project state

> What project currently *is* — facts that change over time.

- *(Add `project_*.md` when repo has releases, integrations, in-flight roadmaps. Examples: `project_release_status.md`, `project_integrations.md`, `project_active_plan.md`.)*

## Workflow rules

> How we work — conventions every contributor (human/agent) follows.

- **Discovery before idea** — no brief, run Discovery Track first (`/discovery:start` → … → `/discovery:handoff`). Track produces `chosen-brief.md` seeding `/spec:idea`. Skip discovery on blank page violates Article II (Separation of Concerns). See [`docs/discovery-track.md`](../../docs/discovery-track.md) + [ADR-0005](../../docs/adr/0005-add-discovery-track-before-stage-1.md).
- **Project Manager Track for service-provider work** — delivering for client with contract, scope, stakeholders → run Project Manager Track alongside feature work (`/project:start` → `/project:initiate` → `/project:weekly` (recurring) → `/project:close`). Based on P3.Express. State lives in `projects/<slug>/project-state.md`. **Opt-in**; skip for internal product work with no contract boundary. See [`docs/project-track.md`](../../docs/project-track.md) + [ADR-0008](../../docs/adr/0008-add-project-manager-track.md).
- **Portfolio track for multi-project work** — managing multiple parallel features or service provider → use opt-in Portfolio Track (`/portfolio:start` → cycles `/portfolio:y` monthly, `/portfolio:x` 6-monthly, `/portfolio:z` daily). `portfolio-manager` agent reads `specs/*/workflow-state.md` for health signals but **never modifies spec artifacts**. Portfolio Sponsor (always human) owns all strategic decisions (stop/start/pivot). See [`docs/portfolio-track.md`](../../docs/portfolio-track.md) + [ADR-0009](../../docs/adr/0009-add-portfolio-manager-role.md).
- **Branch per concern** — one PR, one concern. Cut every topic branch fresh from integration branch; never stack. See [`feedback_pr_hygiene.md`](./feedback_pr_hygiene.md).
- **No direct commits on main / develop** — every change (code, docs, memory, planning artifact) lands via topic branch + merged PR. Push deny on `main` / `develop` is backstop, not gate; commits should never reach integration branch locally either. See [`feedback_no_main_commits.md`](./feedback_no_main_commits.md).
- **Verify before push** — project verify gate (formatter + linter + types + tests + build) must be green locally before opening PR. Never `--no-verify`. See [`feedback_verify_gate.md`](./feedback_verify_gate.md) + [`docs/verify-gate.md`](../../docs/verify-gate.md).
- **Worktrees for parallel work** — every topic branch lives under `.worktrees/<slug>/` so multiple agents run parallel without trashing each other's caches. See [`feedback_worktrees_required.md`](./feedback_worktrees_required.md) + [`docs/worktrees.md`](../../docs/worktrees.md).
- **Independent‑PRs + batch + multi‑pass review** — open every independent PR before draining review feedback. One implementation pass + one sweep pass beats N serial round‑trips. See [`feedback_pr_workflow.md`](./feedback_pr_workflow.md).
- **PR Codex review loop** — every PR runs bounded author↔Codex loop. Trigger: `ready_for_review`. Author re-requests fresh Codex review **after every push**; CI failures + merge conflicts in-loop work; soft cap 3 rounds. Approval must come from latest round. See [`feedback_pr_review_loop.md`](./feedback_pr_review_loop.md) + [ADR-0015](../../docs/adr/0015-codify-codex-pr-review-loop.md).
- **Docs and plan updates ride with their PR** — every user‑visible change updates relevant doc, plan row, steering file in *same* PR. No "I'll update docs after." See [`feedback_docs_with_pr.md`](./feedback_docs_with_pr.md).
- **Parallel PRs use merge, not rebase** — two PRs both update same plan/RTM table → resolve via `git merge origin/<integration-branch>`. Rebase breaks reviewer line anchors. See [`feedback_parallel_pr_conflicts.md`](./feedback_parallel_pr_conflicts.md).
- **Autonomous merge after green review + clean state** — agent‑driven runs, self‑merge allowed *only* after reviewer signal green AND CI green AND PR clean mergeable. See [`feedback_autonomous_merge.md`](./feedback_autonomous_merge.md).
- **Memory edits are docs‑only** — changes to this directory don't need changeset/version bump; never bundle with code changes. See [`feedback_memory_edits.md`](./feedback_memory_edits.md).

## How this index is maintained

Add `feedback_*.md` or `project_*.md` → add one‑line bullet here pointing at it. Delete one → delete bullet. Index is contract; rest is detail.