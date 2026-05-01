# CLAUDE.md

Entry point for Claude Code in repo.

## Primary context

@AGENTS.md
@memory/constitution.md
@.claude/memory/MEMORY.md

## What this repo is

Template for **spec-driven, agentic software development**. Workflow itself = deliverable. See `docs/specorator.md` for full definition, `README.md` for file map.

## How to work here

Two equivalent entry points for **lifecycle workflow** (Stages 1–11):

- **Conversational (recommended):** say "let's start a feature" or "drive this end-to-end" and [`orchestrate`](.claude/skills/orchestrate/SKILL.md) skill guide you. Gates with `AskUserQuestion`, dispatches right `/spec:*` command per stage.
- **Manual:** drive slash commands yourself in stage order: `/spec:start`, `/spec:idea`, `/spec:research`, `/spec:requirements`, `/spec:design`, `/spec:specify`, `/spec:tasks`, `/spec:implement`, `/spec:test`, `/spec:review`, `/spec:release`, `/spec:retro`. Optional gates: `/spec:clarify`, `/spec:analyze`.

When **building on or replacing existing system** + need understand what's there before planning — run **Stock-taking Track first** (pre-Discovery, pre-Stage 1, opt-in for legacy/brownfield):

- **Conversational:** say "we're building on legacy system", "let's inventory what we have", or "stock-taking" and [`stock-taking`](.claude/skills/stock-taking/SKILL.md) skill guide through Scope → Audit → Synthesize → Handoff. Handoff writes `stock-taking-inventory.md` which feeds Discovery Track or `/spec:idea`.
- **Manual:** `/stock:start`, `/stock:scope`, `/stock:audit`, `/stock:synthesize`, `/stock:handoff`. See [`docs/stock-taking-track.md`](docs/stock-taking-track.md) and [ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md).

When **service provider** needs win project before build — new lead, RFP response, SOW needed — run **Sales Cycle Track first** (pre-Discovery, service-provider opt-in):

- **Conversational (recommended):** say "we have new lead", "we need write proposal", "we got RFP", or "let's run sales cycle" and [`sales-cycle`](.claude/skills/sales-cycle/SKILL.md) skill guide through Qualify → Scope → Estimate → Propose → Order. Order writes `order.md` (Project Kickoff Brief) which feeds downstream delivery workflow.
- **Manual:** `/sales:start`, `/sales:qualify`, `/sales:scope`, `/sales:estimate`, `/sales:propose`, `/sales:order`. See [`docs/sales-cycle.md`](docs/sales-cycle.md) and [ADR-0006](docs/adr/0006-add-sales-cycle-track-before-discovery.md).
- **Skip when** signed mandate already — go straight to Discovery Track or `/spec:start`.
- Deal artifacts live under `sales/<deal-slug>/`. `order.md` Project Kickoff Brief = canonical handoff to delivery workflow, read as mandatory input by analyst (Stage 1) or discovery facilitator (Frame phase).

When no brief yet — blank page, multiple candidate ideas, no clear winner — run **Discovery Track first** (pre-Stage 1, opt-in):

- **Conversational:** say "let's run design sprint", "let's brainstorm new product ideas", or "we have blank page" and [`discovery-sprint`](.claude/skills/discovery-sprint/SKILL.md) skill guide through Frame → Diverge → Converge → Prototype → Validate → Handoff. Handoff writes `chosen-brief.md` which feeds `/spec:idea`.
- **Manual:** `/discovery:start`, `/discovery:frame`, `/discovery:diverge`, `/discovery:converge`, `/discovery:prototype`, `/discovery:validate`, `/discovery:handoff`. See [`docs/discovery-track.md`](docs/discovery-track.md) and [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md).

When working **service-provider context** — delivering for clients, tracking scope/schedule/budget, sending status reports — run **Project Manager Track** (opt-in, wraps one+ feature deliveries):

- **Conversational:** say "let's start client project", "set up service engagement", or "I have client brief" and [`project-run`](.claude/skills/project-run/SKILL.md) skill guide through Initiation → Execution → Closure. Based on [P3.Express](https://p3.express/).
- **Manual:** `/project:start`, `/project:initiate`, `/project:weekly`, `/project:change`, `/project:report`, `/project:close`, `/project:post`. See [`docs/project-track.md`](docs/project-track.md) and [ADR-0008](docs/adr/0008-add-project-manager-track.md).

Both modes:

1. State lives in `specs/<feature-slug>/workflow-state.md` — read to learn where feature is.
2. Each `/spec:*` command spawns specialist subagent from `.claude/agents/`. Don't bypass — agent scoping intentional.
3. Finish stage → slash command updates `workflow-state.md`. Don't edit by hand mid-workflow.

When managing **multiple parallel features** or **service provider** across client portfolios, run **Portfolio Track** (opt-in, above Specorator):

- **Conversational:** say "run portfolio review", "update portfolio", or "check portfolio health" and [`portfolio-track`](.claude/skills/portfolio-track/SKILL.md) skill detect active portfolio + dispatch right cycle.
- **Manual:** `/portfolio:start <slug>` (bootstrap), then `/portfolio:x` (6-monthly strategy), `/portfolio:y` (monthly review), `/portfolio:z` (daily ops). See [`docs/portfolio-track.md`](docs/portfolio-track.md) and [ADR-0009](docs/adr/0009-add-portfolio-manager-role.md).
- Portfolio artifacts live under `portfolio/<portfolio-slug>/`. Track read-only on `specs/` side — never modifies feature artifacts.

## Conventions specific to Claude Code

- Subagents project-scoped (`.claude/agents/`). Tool lists intentionally narrow — missing tool = feature, not bug. Six classes ship: **lifecycle** agents (one per Stage 1–11), **discovery** agents (one facilitator + six specialists for Discovery Track), **stock-taking** agents (one `legacy-auditor` for brownfield inventory), **sales** agents (four specialists for pre-project commercial track: `sales-qualifier`, `scoping-facilitator`, `estimator`, `proposal-writer`), one **project-manager** agent for service-provider engagements, and **portfolio-manager** agent (opt-in, portfolio-level management).
- Skills live in `.claude/skills/` — see [`.claude/skills/README.md`](.claude/skills/README.md). Auto-trigger from natural language, invoke explicit via `/<skill-name>`. Catalog spans six workflow conductors (`orchestrate`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `portfolio-track`), mattpocock-style practice skills (`grill`, `design-twice`, `tracer-bullet`, `tdd-cycle`), cross-cutting sink skills (`domain-context`, `new-glossary-entry`; `ubiquitous-language` deprecated by [ADR-0010](docs/adr/0010-shard-glossary-into-one-file-per-term.md)), operational skills (`verify`, `new-adr`, `review-fix`).
- Operational bots live under `agents/operational/`. Each = `PROMPT.md` + `README.md` pair; prompt = source of truth scheduled run loads.
- Permission rules live in `.claude/settings.json`. Pushes to `main` / `develop` denied by default; `--no-verify` denied. See `docs/branching.md`.
- Topic branches live in worktrees under `.worktrees/<slug>/`. See `docs/worktrees.md`.
- Run verify gate before opening PR. See `docs/verify-gate.md`.
- For irreversible architectural decisions, use [`record-decision`](.claude/skills/record-decision/SKILL.md) skill (wraps `/adr:new`).
- For glossary terms, use [`/glossary:new "<term>"`](.claude/commands/glossary/new.md) (wraps [`new-glossary-entry`](.claude/skills/new-glossary-entry/SKILL.md) skill). Entries live one-per-file under [`docs/glossary/`](docs/glossary/). Legacy `ubiquitous-language` skill targeting `docs/UBIQUITOUS_LANGUAGE.md` deprecated — see [ADR-0010](docs/adr/0010-shard-glossary-into-one-file-per-term.md).
- Where every markdown artifact lands documented in [`docs/sink.md`](docs/sink.md). Don't invent new sink locations.
- Don't add `.claudeignore` exclusions silently — note in `docs/steering/tech.md`.

## What not to do

- Don't expand workflow with new stages or roles without ADR.
- Don't write code from vague brief — always run upstream stages first or explicit mark skipped.
- Don't merge feature work directly into workflow template files (`docs/`, `templates/`, `.claude/`) unless improving *template itself*.