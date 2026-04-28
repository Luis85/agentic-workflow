# AGENTS.md

Cross-tool root context for AI coding agents (Claude Code, Codex, Cursor, Aider, Copilot, Gemini, etc.). Tool-specific files and folders (`CLAUDE.md`, `.codex/`, `.cursor/rules/`, `.aider.conf.yml`) should `@import` or reference this file rather than duplicate it.

> **One source of truth, many tools.** When you change project conventions, change them here.

## Project

This repository is a **template for spec-driven, agentic software development**. It does not build a product — it defines the workflow, artifacts, and roles used to build products. The workflow itself is the deliverable.

When working in a project that *uses* this template, replace this section with your product's overview.

## Read these first

Before doing any non-trivial work, read:

1. **`memory/constitution.md`** — governing principles. Override only with explicit human approval.
2. **`.claude/memory/MEMORY.md`** — operational memory: workflow rules + project state, indexed.
3. **`docs/specorator.md`** — the full workflow definition.
4. **`docs/steering/`** — scoped context (product, tech, ux, quality, operations). Load only what's relevant to your task.
5. **The current feature's `specs/<feature>/workflow-state.md`** — tells you which stage is active and what's already produced.

## Operating rules

- **Stay in scope.** Each agent role has a defined responsibility (see `.claude/agents/`). Don't write code in a research phase. Don't change requirements during implementation.
- **Specs are the source of truth.** If implementation reveals a missing requirement, escalate — don't silently invent one. Update the spec first, then the code.
- **Respect quality gates.** Every stage has acceptance criteria in `docs/quality-framework.md`. Don't mark a stage complete unless they pass.
- **Trace everything.** Every requirement, task, and test has an ID (see `docs/traceability.md`). Reference IDs in commits, PRs, and artifacts.
- **EARS for requirements.** Functional requirements use EARS notation (see `docs/ears-notation.md`) so they map 1:1 to tests.
- **ADRs for irreversible decisions.** Anything architecturally load-bearing gets an ADR in `docs/adr/`. Use the template in `templates/adr-template.md`.
- **Update workflow state.** When you finish or hand off a stage, update `specs/<feature>/workflow-state.md` so the next agent can resume.
- **Keep a product page alive.** Every new project or product should get a public product page with a directly accessible `sites/index.html`. Prefer GitHub Pages via GitHub Actions when available, and update the page in the same PR as user-visible product or positioning changes.
- **Escalate ambiguity.** Don't guess. Either ask the human or open a `clarifications` block in the active artifact.
- **Branch per concern; verify before push.** Topic branches live in `.worktrees/<slug>/`; one concern per PR; `verify` green locally before opening a PR. Never `--no-verify`. See `docs/branching.md`, `docs/worktrees.md`, `docs/verify-gate.md`.
- **Codex opens the PR.** For non-trivial repo changes, Codex creates its own worktree, commits, pushes, opens the pull request, reports the PR URL/status, and asks the human for the next step. See `.codex/README.md`.
- **Memory edits are docs‑only.** Updates to `.claude/memory/` ride in their own PR with no changeset and no version bump. See `.claude/memory/feedback_memory_edits.md`.

## Repo conventions

- Markdown for all artifacts. Keep them concise; prefer precision over completeness in early iterations.
- File names are kebab-case. Per-feature work lives under `specs/<feature-slug>/`.
- Each folder may have at most one `README.md`. When present below the repository root, it is the folder's entry point for GitHub-style Markdown browsing and must start with YAML frontmatter containing `title`, `folder`, `description`, and `entry_point: true`. The `folder` value is the repository-relative directory path. The root `README.md` is the public repository entry point and is exempt from this frontmatter rule.
- IDs are stable: `REQ-<AREA>-NNN`, `T-<AREA>-NNN`, `TEST-<AREA>-NNN`, `ADR-NNNN`.
- ADR bodies are immutable. To change a decision, supersede it; the predecessor's `status` and `superseded-by` pointers are the only fields that may be updated.
- Glossary terms live one-per-file under `docs/glossary/<slug>.md`. Define a term with `/glossary:new "<term>"`. The directory listing is the index — no `README.md` index to maintain. See [ADR-0010](docs/adr/0010-shard-glossary-into-one-file-per-term.md). The legacy `docs/UBIQUITOUS_LANGUAGE.md` single-file model is deprecated.
- Commit messages: imperative mood, reference IDs (`feat(auth): add T-AUTH-014 password reset`).

## When the harness gets in your way

This repo is **process-light by design** for v0.1: no required CI, no PR checks, no enforced branch protection. If you find yourself fighting tooling, prefer fixing the process to working around it.

## Four classes of agent

- **Lifecycle agents** (`.claude/agents/`) — used to build one feature across Stages 1–11. The `orchestrator` routes between them. Three sub-classes:
  - **Stage 1–11 specialists** — analyst, pm, ux-designer, ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective.
  - **Discovery specialists** *(pre-stage 1, opt-in — see [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md))* — facilitator + product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper. Used for ideation / design-sprint / concept-validation work that produces a `chosen-brief.md` before `/spec:idea`. The discovery-track methodology lives at [`docs/discovery-track.md`](docs/discovery-track.md).
  - **Stock-taking specialist** *(pre-Discovery or pre-Stage 1, opt-in for legacy/brownfield projects — see [ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md))* — `legacy-auditor`. Used to inventory existing systems (processes, use-cases, integrations, data, technical debt) before ideation or feature work begins. Produces `stock-taking-inventory.md` which feeds the Discovery Track or `/spec:idea`. The stock-taking methodology lives at [`docs/stock-taking-track.md`](docs/stock-taking-track.md).
- **Project manager** (`.claude/agents/project-manager.md`) *(opt-in, service-provider context — see [ADR-0008](docs/adr/0008-add-project-manager-track.md))* — owns all project-level governance for client engagements: scope, stakeholders, risk/issue/change tracking, weekly cadence, status reports, and project closure. Based on P3.Express. State lives in `projects/<slug>/`. Links to but never edits `specs/` or `discovery/` artifacts. The project-manager methodology lives at [`docs/project-track.md`](docs/project-track.md).
- **Portfolio agent** (`.claude/agents/portfolio-manager.md`) *(opt-in, above Stage 1–11 — see [ADR-0009](docs/adr/0009-add-portfolio-manager-role.md))* — manages portfolios of programs and projects using the P5 Express methodology (X/Y/Z cycles). Invoked by `/portfolio:x`, `/portfolio:y`, `/portfolio:z`. Reads `specs/*/workflow-state.md` for health signals; never modifies spec artifacts. Portfolio artifacts live under `portfolio/<slug>/`. Methodology at [`docs/portfolio-track.md`](docs/portfolio-track.md).
- **Project scaffolder** (`.claude/agents/project-scaffolder.md`) *(opt-in, source-led adoption — see [ADR-0011](docs/adr/0011-add-project-scaffolding-track.md))* — inventories folders or Markdown files collected before template adoption, extracts evidence-backed project context, assembles reviewable starter drafts, and hands off to Discovery, Specorator, Project Manager Track, or Stock-taking. State lives in `scaffolding/<slug>/`. Methodology at [`docs/project-scaffolding-track.md`](docs/project-scaffolding-track.md).
- **Quality assurance workflow** (`.claude/skills/quality-assurance/SKILL.md`) *(opt-in, ISO 9001-aligned readiness review)* — creates evidence-backed QA plans, checklists, readiness reviews, and corrective actions for projects, portfolios, releases, suppliers, or active features. State lives in `quality/<slug>/`. Methodology at [`docs/quality-assurance-track.md`](docs/quality-assurance-track.md).
- **Operational agents** (`agents/operational/`) — always-on, scheduled routines that act against the live repo (review-bot, docs-review-bot, plan-recon-bot, dep-triage-bot, actions-bump-bot). Each is a `PROMPT.md` + `README.md`.

Skills (`.claude/skills/`) are reusable how-tos any agent can invoke (`verify`, `new-adr`, `review-fix`). Nine workflow-conductor skills (`orchestrate`, `project-scaffolding`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `portfolio-track`, `quality-assurance`, `specorator-improvement`) provide the conversational entry points.

## Tool-specific notes

- **Claude Code.** Subagents at `.claude/agents/`, slash commands at `.claude/commands/`, skills at `.claude/skills/`, operational memory at `.claude/memory/`, permission baseline at `.claude/settings.json`. `CLAUDE.md` imports this file plus the constitution and the memory index.
- **Codex.** This file is the primary context. Codex-specific instructions and workflows live in [`.codex/`](.codex/README.md): create a worktree, verify, push, open the PR, then ask for next steps.
- **Cursor / Aider.** This file is the primary context. Cursor users: `.cursor/rules/` may be added later if needed.
- **All tools.** Templates in `templates/` are framework-agnostic Markdown.
