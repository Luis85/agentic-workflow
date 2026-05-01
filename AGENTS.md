# AGENTS.md

Cross-tool root context for AI coding agents (Claude Code, Codex, Cursor, Aider, Copilot, Gemini, etc.). Tool-specific files and folders (`CLAUDE.md`, `.codex/`, `.cursor/rules/`, `.aider.conf.yml`) should `@import` or reference this file, not duplicate.

> **One source of truth, many tools.** Change project conventions here.

## Project

Repo = **template for spec-driven, agentic software development**. No product build — defines workflow, artifacts, roles for building products. Workflow itself = deliverable.

In project *using* template, replace this section with product overview.

## Read these first

Before non-trivial work, read:

1. **`memory/constitution.md`** — governing principles. Override only with explicit human approval.
2. **`.claude/memory/MEMORY.md`** — operational memory: workflow rules + project state, indexed.
3. **`docs/specorator.md`** — full workflow definition.
4. **`docs/steering/`** — scoped context (product, tech, ux, quality, operations). Load only relevant to task.
5. **Current feature's `specs/<feature>/workflow-state.md`** — shows active stage + what produced.

## Operating rules

- **Stay in scope.** Each agent role has defined responsibility (see `.claude/agents/`). No code in research phase. No requirement changes during implementation.
- **Specs = source of truth.** Implementation reveals missing requirement → escalate, no silent invent. Update spec first, then code.
- **Respect quality gates.** Every stage has acceptance criteria in `docs/quality-framework.md`. No stage complete unless pass.
- **Trace everything.** Every requirement, task, test has ID (see `docs/traceability.md`). Reference IDs in commits, PRs, artifacts.
- **EARS for requirements.** Functional requirements use EARS notation (see `docs/ears-notation.md`) — map 1:1 to tests.
- **ADRs for irreversible decisions.** Architecturally load-bearing → ADR in `docs/adr/`. Use template `templates/adr-template.md`.
- **Update workflow state.** Finish or hand off stage → update `specs/<feature>/workflow-state.md` so next agent resume.
- **Keep product page alive.** Every new project/product gets public product page with directly accessible `sites/index.html`. Prefer GitHub Pages via GitHub Actions when available. Update page in same PR as user-visible product or positioning changes.
- **Escalate ambiguity.** No guess. Ask human or open `clarifications` block in active artifact.
- **No direct commits on `main` / `develop`.** Every change — code, docs, ADRs, glossary, memory, brainstorm output, plans, generated docs — lands via topic branch + merged PR. Push deny = backstop, not gate; commits never reach integration branch locally either. See `.claude/memory/feedback_no_main_commits.md`.
- **Branch per concern; verify before push.** Topic branches live in `.worktrees/<slug>/`; one concern per PR; `verify` green locally before opening PR. Never `--no-verify`. See `docs/branching.md`, `docs/worktrees.md`, `docs/verify-gate.md`.
- **Codex opens PR.** For non-trivial repo changes, Codex creates own worktree, commits, pushes, opens pull request, reports PR URL/status, asks human for next step. See `.codex/README.md`.
- **Memory edits = docs‑only.** Updates to `.claude/memory/` ride own PR with no changeset, no version bump. See `.claude/memory/feedback_memory_edits.md`.

## Repo conventions

- Markdown for all artifacts. Keep concise; precision over completeness in early iterations.
- File names = kebab-case. Per-feature work under `specs/<feature-slug>/`.
- Each folder may have at most one `README.md`. Below repo root → folder entry point for GitHub-style Markdown browsing. Must start with YAML frontmatter: `title`, `folder`, `description`, `entry_point: true`. `folder` value = repo-relative directory path. Root `README.md` = public repo entry point, exempt from frontmatter rule.
- IDs stable: `REQ-<AREA>-NNN`, `T-<AREA>-NNN`, `TEST-<AREA>-NNN`, `ADR-NNNN`.
- ADR bodies immutable. Change decision → supersede; predecessor's `status` and `superseded-by` pointers = only fields updateable.
- Glossary terms live one-per-file under `docs/glossary/<slug>.md`. Define term with `/glossary:new "<term>"`. Directory listing = index — no `README.md` index to maintain. See [ADR-0010](docs/adr/0010-shard-glossary-into-one-file-per-term.md). Legacy `docs/UBIQUITOUS_LANGUAGE.md` single-file model deprecated.
- Commit messages: imperative mood, reference IDs (`feat(auth): add T-AUTH-014 password reset`).

## When the harness gets in your way

Repo **process-light by design**, but now has local + CI quality signals: `npm run verify`, PR-title checks, spell check, Pages deployment, workflow/security scans, dependency bump automation. Branch protection may still be intentionally light for early template adoption; if fighting tooling, fix process over working around it.

## Four classes of agent

- **Lifecycle agents** (`.claude/agents/`) — build one feature across Stages 1–11. `orchestrator` routes between them. Three sub-classes:
  - **Stage 1–11 specialists** — analyst, pm, ux-designer, ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective.
  - **Discovery specialists** *(pre-stage 1, opt-in — see [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md))* — facilitator + product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper. For ideation / design-sprint / concept-validation work producing `chosen-brief.md` before `/spec:idea`. Discovery-track methodology at [`docs/discovery-track.md`](docs/discovery-track.md).
  - **Stock-taking specialist** *(pre-Discovery or pre-Stage 1, opt-in for legacy/brownfield projects — see [ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md))* — `legacy-auditor`. Inventories existing systems (processes, use-cases, integrations, data, technical debt) before ideation or feature work. Produces `stock-taking-inventory.md` feeding Discovery Track or `/spec:idea`. Stock-taking methodology at [`docs/stock-taking-track.md`](docs/stock-taking-track.md).
- **Project manager** (`.claude/agents/project-manager.md`) *(opt-in, service-provider context — see [ADR-0008](docs/adr/0008-add-project-manager-track.md))* — owns all project-level governance for client engagements: scope, stakeholders, risk/issue/change tracking, weekly cadence, status reports, project closure. Based on P3.Express. State lives `projects/<slug>/`. Links to but never edits `specs/` or `discovery/` artifacts. Project-manager methodology at [`docs/project-track.md`](docs/project-track.md).
- **Roadmap manager** (`.claude/agents/roadmap-manager.md`) *(opt-in, product + project planning context — see [ADR-0012](docs/adr/0012-add-roadmap-management-track.md))* — owns outcome roadmaps, delivery-plan signals, stakeholder maps, communication logs, roadmap decisions under `roadmaps/<slug>/`. Reads linked `specs/`, `projects/`, `portfolio/` artifacts but never edits. Methodology at [`docs/roadmap-management-track.md`](docs/roadmap-management-track.md).
- **Portfolio agent** (`.claude/agents/portfolio-manager.md`) *(opt-in, above Stage 1–11 — see [ADR-0009](docs/adr/0009-add-portfolio-manager-role.md))* — manages portfolios of programs and projects using P5 Express methodology (X/Y/Z cycles). Invoked by `/portfolio:x`, `/portfolio:y`, `/portfolio:z`. Reads `specs/*/workflow-state.md` for health signals; never modifies spec artifacts. Portfolio artifacts live under `portfolio/<slug>/`. Methodology at [`docs/portfolio-track.md`](docs/portfolio-track.md).
- **Project scaffolder** (`.claude/agents/project-scaffolder.md`) *(opt-in, source-led adoption — see [ADR-0011](docs/adr/0011-add-project-scaffolding-track.md))* — inventories folders or Markdown files collected before template adoption, extracts evidence-backed project context, assembles reviewable starter drafts, hands off to Discovery, Specorator, Project Manager Track, or Stock-taking. State lives `scaffolding/<slug>/`. Methodology at [`docs/project-scaffolding-track.md`](docs/project-scaffolding-track.md).
- **Quality assurance workflow** (`.claude/skills/quality-assurance/SKILL.md`) *(opt-in, ISO 9001-aligned readiness review)* — creates evidence-backed QA plans, checklists, readiness reviews, corrective actions for projects, portfolios, releases, suppliers, active features. State lives `quality/<slug>/`. Methodology at [`docs/quality-assurance-track.md`](docs/quality-assurance-track.md).
- **Operational agents** (`agents/operational/`) — always-on, scheduled routines acting against live repo (review-bot, docs-review-bot, plan-recon-bot, dep-triage-bot, actions-bump-bot). Each = `PROMPT.md` + `README.md`.

Skills (`.claude/skills/`) = reusable how-tos any agent invokes (`verify`, `new-adr`, `review-fix`). Ten workflow-conductor skills (`orchestrate`, `project-scaffolding`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `roadmap-management`, `portfolio-track`, `quality-assurance`, `specorator-improvement`) = conversational entry points.

## Tool-specific notes

- **Claude Code.** Subagents at `.claude/agents/`, slash commands at `.claude/commands/`, skills at `.claude/skills/`, operational memory at `.claude/memory/`, permission baseline at `.claude/settings.json`. `CLAUDE.md` imports this file plus constitution and memory index.
- **Codex.** This file = primary context. Codex-specific instructions and workflows live in [`.codex/`](.codex/README.md): create worktree, verify, push, open PR, ask for next steps.
- **Cursor / Aider.** This file = primary context. Cursor users: `.cursor/rules/` may be added later if needed.
- **All tools.** Templates in `templates/` = framework-agnostic Markdown.