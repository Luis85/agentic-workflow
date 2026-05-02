# AGENTS.md

Cross-tool root context for AI coding agents (Claude Code, Codex, Cursor, Aider, Copilot, Gemini, etc.). Tool-specific files (`CLAUDE.md`, `.codex/`, `.cursor/rules/`, `.aider.conf.yml`) `@import` this file rather than duplicate.

> **One source of truth, many tools.** Change project conventions here.

## Project

Repo = **template for spec-driven, agentic software development**. Defines workflow, artifacts, roles for building products. Workflow itself = the deliverable. Replace this section with a product overview when a project *uses* the template.

## Read these first

1. **`memory/constitution.md`** — governing principles. Override only with explicit human approval.
2. **`.claude/memory/MEMORY.md`** — operational memory: workflow rules + project state, indexed.
3. **`docs/specorator.md`** — full workflow definition.
4. **`docs/steering/`** — scoped context (product, tech, ux, quality, ops). Load only what's relevant.
5. **Current feature's `specs/<feature>/workflow-state.md`** — active stage + what's already produced.

## Operating rules

- **Stay in scope.** Each agent role has a defined responsibility (see `.claude/agents/`). No code in research; no requirement changes during implementation.
- **Specs = source of truth.** Implementation reveals a missing requirement → escalate, no silent invent. Update spec first, then code.
- **Respect quality gates.** Acceptance criteria in `docs/quality-framework.md` are non-negotiable.
- **Trace everything.** `REQ-<AREA>-NNN`, `T-<AREA>-NNN`, `TEST-<AREA>-NNN`, `ADR-NNNN`. Reference IDs in commits, PRs, artifacts. See [`docs/traceability.md`](docs/traceability.md).
- **EARS for requirements.** Functional requirements use EARS notation — map 1:1 to tests. See [`docs/ears-notation.md`](docs/ears-notation.md).
- **ADRs for irreversible decisions.** Architecturally load-bearing → ADR in `docs/adr/`. Use `templates/adr-template.md`. ADR bodies are immutable; supersede to change.
- **Update workflow state.** Hand off a stage → update `specs/<feature>/workflow-state.md`.
- **Keep a product page alive.** Public page at `sites/index.html`; prefer GitHub Pages. Update in the same PR as user-visible changes.
- **Consult `inputs/` at intake.** Every conductor's scope phase lists `inputs/` and asks the user which items are relevant. Never auto-extract zips or archives — extraction is always a confirmed step. See [`docs/inputs-ingestion.md`](docs/inputs-ingestion.md) and [ADR-0017](docs/adr/0017-adopt-inputs-folder-as-canonical-ingestion-zone.md).
- **Escalate ambiguity.** No guessing. Ask the human or open a `clarifications` block.
- **No direct commits on `main` / `develop`.** Every change lands via topic branch + merged PR. Push deny is the backstop, not the gate. See [`.claude/memory/feedback_no_main_commits.md`](.claude/memory/feedback_no_main_commits.md).
- **Branch per concern; verify before push.** One concern per PR; `verify` green locally; never `--no-verify`. See [`docs/branching.md`](docs/branching.md), [`docs/worktrees.md`](docs/worktrees.md), [`docs/verify-gate.md`](docs/verify-gate.md).
- **Codex opens its PR.** Non-trivial changes via Codex own worktree → commit → push → open PR → report URL. See [`.codex/README.md`](.codex/README.md).
- **Memory edits are docs-only.** Updates to `.claude/memory/` ride own PR with no changeset. See [`.claude/memory/feedback_memory_edits.md`](.claude/memory/feedback_memory_edits.md).

## Repo conventions

- Markdown for all artifacts. Concise; precision over completeness in early iterations.
- File names = kebab-case. Per-feature work under `specs/<feature-slug>/`.
- One `README.md` per folder max. Folders below the repo root start with frontmatter (`title`, `folder`, `description`, `entry_point: true`); root `README.md` is exempt.
- Glossary terms one-per-file under `docs/glossary/<slug>.md` via `/glossary:new "<term>"`. Legacy single-file `docs/UBIQUITOUS_LANGUAGE.md` deprecated by [ADR-0010](docs/adr/0010-shard-glossary-into-one-file-per-term.md).
- Commit messages: imperative, reference IDs (`feat(auth): add T-AUTH-014 password reset`).

## Agent classes

| Class | Location | Purpose | Methodology |
|---|---|---|---|
| **Lifecycle (Stage 1–11 specialists)** | `.claude/agents/` | Build one feature: analyst, pm, ux/ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective. | [`docs/specorator.md`](docs/specorator.md) |
| **Discovery specialists** *(opt-in)* | `.claude/agents/` | Pre-Stage 1 ideation: facilitator + product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper. Produces `chosen-brief.md`. | [`docs/discovery-track.md`](docs/discovery-track.md) ([ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md)) |
| **Stock-taking** *(opt-in, brownfield)* | `.claude/agents/legacy-auditor.md` | Inventory existing systems before new work. Produces `stock-taking-inventory.md`. | [`docs/stock-taking-track.md`](docs/stock-taking-track.md) ([ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md)) |
| **Sales** *(opt-in, service provider)* | `.claude/agents/` | Pre-contract: `sales-qualifier`, `scoping-facilitator`, `estimator`, `proposal-writer`. Produces `order.md`. | [`docs/sales-cycle.md`](docs/sales-cycle.md) ([ADR-0006](docs/adr/0006-add-sales-cycle-track-before-discovery.md)) |
| **Project manager** *(opt-in)* | `.claude/agents/project-manager.md` | Client-engagement governance based on P3.Express. State lives `projects/<slug>/`. Never edits `specs/`. | [`docs/project-track.md`](docs/project-track.md) ([ADR-0008](docs/adr/0008-add-project-manager-track.md)) |
| **Roadmap manager** *(opt-in)* | `.claude/agents/roadmap-manager.md` | Outcome roadmaps, stakeholder maps, comms log under `roadmaps/<slug>/`. Read-only on `specs/`. | [`docs/roadmap-management-track.md`](docs/roadmap-management-track.md) ([ADR-0012](docs/adr/0012-add-roadmap-management-track.md)) |
| **Portfolio** *(opt-in)* | `.claude/agents/portfolio-manager.md` | P5 Express X/Y/Z cycles. Reads `specs/*/workflow-state.md`; never modifies spec artifacts. | [`docs/portfolio-track.md`](docs/portfolio-track.md) ([ADR-0009](docs/adr/0009-add-portfolio-manager-role.md)) |
| **Project scaffolder** *(opt-in)* | `.claude/agents/project-scaffolder.md` | Source-led onboarding from collected docs/folders. State lives `scaffolding/<slug>/`. | [`docs/project-scaffolding-track.md`](docs/project-scaffolding-track.md) ([ADR-0011](docs/adr/0011-add-project-scaffolding-track.md)) |
| **Quality assurance** *(opt-in)* | `.claude/skills/quality-assurance/SKILL.md` | ISO 9001-aligned readiness review. State lives `quality/<slug>/`. | [`docs/quality-assurance-track.md`](docs/quality-assurance-track.md) |
| **Issue-breakdown** *(opt-in)* | `.claude/agents/issue-breakdown.md` | Post-/spec:tasks. Issue → draft PRs from `tasks.md`. Writes own log + hand-off line. | [`docs/issue-breakdown-track.md`](docs/issue-breakdown-track.md) ([ADR-0022](docs/adr/0022-add-issue-breakdown-track.md)) |
| **Operational bots** | `agents/operational/` | Scheduled routines (review-bot, docs-review-bot, plan-recon-bot, dep-triage-bot, actions-bump-bot). `PROMPT.md` + `README.md` per bot. | — |

Skills (`.claude/skills/`) = reusable how-tos any agent invokes (`verify`, `new-adr`, `review-fix`). Eleven workflow-conductor skills are the conversational entry points — see [`.claude/skills/README.md`](.claude/skills/README.md).

## Tool-specific notes

- **Claude Code.** Subagents at `.claude/agents/`, slash commands at `.claude/commands/`, skills at `.claude/skills/`, memory at `.claude/memory/`, permissions at `.claude/settings.json`. `CLAUDE.md` imports this file plus constitution + memory index.
- **Codex.** Primary context = this file. Codex specifics in [`.codex/`](.codex/README.md).
- **Cursor / Aider.** Primary context = this file. `.cursor/rules/` optional.
- **All tools.** Templates in `templates/` are framework-agnostic Markdown.

## When the harness gets in your way

Process-light by design, but with local + CI quality signals (`npm run verify`, PR-title checks, spell check, Pages deployment, security scans, dep automation). Branch protection is intentionally light for early template adoption. Fighting tooling? Fix the process, don't work around it.
