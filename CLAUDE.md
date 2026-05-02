# CLAUDE.md

Entry point for Claude Code in this repository.

## Primary context

@AGENTS.md
@memory/constitution.md
@.claude/memory/MEMORY.md
@docs/specorator-product/README.md

## What this repo is

Template for **spec-driven, agentic software development**. The workflow itself is the deliverable. See [`docs/specorator.md`](docs/specorator.md) for the full definition and [`README.md`](README.md) for the file map.

## How to work here

The **lifecycle workflow** (Stages 1–11) has two equivalent entry points:

- **Conversational (recommended):** say "let's start a feature" or "drive this end-to-end" — the [`orchestrate`](.claude/skills/orchestrate/SKILL.md) skill gates with `AskUserQuestion` and dispatches the right `/spec:*` command per stage.
- **Manual:** drive the slash commands in stage order — `/spec:start`, `/spec:idea`, `/spec:research`, `/spec:requirements`, `/spec:design`, `/spec:specify`, `/spec:tasks`, `/spec:implement`, `/spec:test`, `/spec:review`, `/spec:release`, `/spec:retro`. Optional gates: `/spec:clarify`, `/spec:analyze`.

State lives in `specs/<feature-slug>/workflow-state.md`. Each `/spec:*` command spawns its specialist subagent from `.claude/agents/` — don't bypass; agent scoping is intentional. Slash commands update `workflow-state.md` on stage completion — don't edit by hand mid-workflow.

### Other tracks (opt-in)

| Track | When to use | Conductor skill | Manual entry | Reference |
|---|---|---|---|---|
| **Discovery** | blank-page ideation, no brief | [`discovery-sprint`](.claude/skills/discovery-sprint/SKILL.md) | `/discovery:start` | [`docs/discovery-track.md`](docs/discovery-track.md) ([ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md)) |
| **Stock-taking** | brownfield, inventory existing system | [`stock-taking`](.claude/skills/stock-taking/SKILL.md) | `/stock:start` | [`docs/stock-taking-track.md`](docs/stock-taking-track.md) ([ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md)) |
| **Sales** | service provider, pre-contract (RFP / SOW) | [`sales-cycle`](.claude/skills/sales-cycle/SKILL.md) | `/sales:start` | [`docs/sales-cycle.md`](docs/sales-cycle.md) ([ADR-0006](docs/adr/0006-add-sales-cycle-track-before-discovery.md)) |
| **Project Manager** | client engagement governance (P3.Express) | [`project-run`](.claude/skills/project-run/SKILL.md) | `/project:start` | [`docs/project-track.md`](docs/project-track.md) ([ADR-0008](docs/adr/0008-add-project-manager-track.md)) |
| **Portfolio** | multi-feature / multi-program (P5 Express) | [`portfolio-track`](.claude/skills/portfolio-track/SKILL.md) | `/portfolio:start` | [`docs/portfolio-track.md`](docs/portfolio-track.md) ([ADR-0009](docs/adr/0009-add-portfolio-manager-role.md)) |

Each track produces a handoff artifact that feeds the next: `chosen-brief.md`, `stock-taking-inventory.md`, `order.md`. See the per-track methodology doc for details.

## Conventions specific to Claude Code

- Subagents are project-scoped (`.claude/agents/`) with intentionally narrow tool lists. Missing tool = feature, not bug. Agent-class table lives in [`AGENTS.md`](AGENTS.md).
- Skills live in `.claude/skills/` — see [`.claude/skills/README.md`](.claude/skills/README.md). Auto-trigger from natural language; explicit invoke via `/<skill-name>`.
- Operational bots live under `agents/operational/`. Each = `PROMPT.md` + `README.md`; the prompt is the source of truth the scheduled run loads.
- Permission rules live in `.claude/settings.json`. Pushes to `main` / `develop` are denied; `--no-verify` is denied. See [`docs/branching.md`](docs/branching.md).
- Topic branches live in worktrees under `.worktrees/<slug>/`. See [`docs/worktrees.md`](docs/worktrees.md).
- Run the verify gate before opening a PR. See [`docs/verify-gate.md`](docs/verify-gate.md).
- For irreversible architectural decisions, use [`record-decision`](.claude/skills/record-decision/SKILL.md) (wraps `/adr:new`).
- For glossary terms, use [`/glossary:new "<term>"`](.claude/commands/glossary/new.md) (wraps [`new-glossary-entry`](.claude/skills/new-glossary-entry/SKILL.md)). Entries live one-per-file under [`docs/glossary/`](docs/glossary/).
- Where every markdown artifact lands is documented in [`docs/sink.md`](docs/sink.md). Don't invent new sink locations.
- New work packages (briefs, RFPs, zips, reference material) land in [`inputs/`](inputs/). Every conductor consults `inputs/` at the start of its scope phase. No auto-extract — see [`docs/inputs-ingestion.md`](docs/inputs-ingestion.md).
- Don't add `.claudeignore` exclusions silently — note them in `docs/steering/tech.md`.

## What not to do

- Don't expand the workflow with new stages or roles without an ADR.
- Don't write code from a vague brief — run the upstream stages first or explicitly mark them skipped.
- Don't merge feature work directly into workflow template files (`docs/`, `templates/`, `.claude/`) unless you're improving the *template itself*.
