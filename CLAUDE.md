# CLAUDE.md

Entry point for Claude Code in this repository.

## Primary context

@AGENTS.md
@memory/constitution.md
@.claude/memory/MEMORY.md

## What this repo is

A template for **spec-driven, agentic software development**. The workflow itself is the deliverable. See `docs/spec-kit.md` for the full definition and `README.md` for the map of files.

## How to work here

You have two equivalent entry points for the **lifecycle workflow** (Stages 1–11):

- **Conversational (recommended):** say "let's start a feature" or "drive this end-to-end" and the [`orchestrate`](.claude/skills/orchestrate/SKILL.md) skill will guide you. It gates with `AskUserQuestion` and dispatches the right `/spec:*` command per stage.
- **Manual:** drive the slash commands yourself in stage order: `/spec:start`, `/spec:idea`, `/spec:research`, `/spec:requirements`, `/spec:design`, `/spec:specify`, `/spec:tasks`, `/spec:implement`, `/spec:test`, `/spec:review`, `/spec:release`, `/spec:retro`. Optional gates: `/spec:clarify`, `/spec:analyze`.

When you are **building on or replacing an existing system** and need to understand what's already there before planning anything — run the **Stock-taking Track first** (pre-Discovery and pre-Stage 1, opt-in for legacy/brownfield projects):

- **Conversational:** say "we're building on a legacy system", "let's inventory what we have", or "stock-taking" and the [`stock-taking`](.claude/skills/stock-taking/SKILL.md) skill will guide you through Scope → Audit → Synthesize → Handoff. The handoff writes `stock-taking-inventory.md` which feeds the Discovery Track or `/spec:idea`.
- **Manual:** `/stock:start`, `/stock:scope`, `/stock:audit`, `/stock:synthesize`, `/stock:handoff`. See [`docs/stock-taking-track.md`](docs/stock-taking-track.md) and [ADR-0007](docs/adr/0007-add-stock-taking-track-for-legacy-projects.md).

When you are a **service provider** who needs to win a project before building it — new lead, RFP response, SOW needed — run the **Sales Cycle Track first** (pre-Discovery, service-provider opt-in):

- **Conversational (recommended):** say "we have a new lead", "we need to write a proposal", "we got an RFP", or "let's run a sales cycle" and the [`sales-cycle`](.claude/skills/sales-cycle/SKILL.md) skill will guide you through Qualify → Scope → Estimate → Propose → Order. The order writes `order.md` (Project Kickoff Brief) which feeds the downstream delivery workflow.
- **Manual:** `/sales:start`, `/sales:qualify`, `/sales:scope`, `/sales:estimate`, `/sales:propose`, `/sales:order`. See [`docs/sales-cycle.md`](docs/sales-cycle.md) and [ADR-0006](docs/adr/0006-add-sales-cycle-track-before-discovery.md).
- **Skip when** you already have a signed mandate — go straight to the Discovery Track or `/spec:start`.
- Deal artifacts live under `sales/<deal-slug>/`. The `order.md` Project Kickoff Brief is the canonical handoff to the delivery workflow and is read as a mandatory input by the analyst (Stage 1) or the discovery facilitator (Frame phase).

When you don't have a brief yet — blank page, multiple candidate ideas, no clear winner — run the **Discovery Track first** (pre-Stage 1, opt-in):

- **Conversational:** say "let's run a design sprint", "let's brainstorm new product ideas", or "we have a blank page" and the [`discovery-sprint`](.claude/skills/discovery-sprint/SKILL.md) skill will guide you through Frame → Diverge → Converge → Prototype → Validate → Handoff. The handoff writes `chosen-brief.md` which feeds `/spec:idea`.
- **Manual:** `/discovery:start`, `/discovery:frame`, `/discovery:diverge`, `/discovery:converge`, `/discovery:prototype`, `/discovery:validate`, `/discovery:handoff`. See [`docs/discovery-track.md`](docs/discovery-track.md) and [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md).

When you are working in a **service-provider context** — delivering for clients, tracking scope/schedule/budget, sending status reports — run the **Project Manager Track** (opt-in, wraps one or more feature deliveries):

- **Conversational:** say "let's start a client project", "set up a service engagement", or "I have a client brief" and the [`project-run`](.claude/skills/project-run/SKILL.md) skill will guide you through Initiation → Execution → Closure. Based on [P3.Express](https://p3.express/).
- **Manual:** `/project:start`, `/project:initiate`, `/project:weekly`, `/project:change`, `/project:report`, `/project:close`, `/project:post`. See [`docs/project-track.md`](docs/project-track.md) and [ADR-0008](docs/adr/0008-add-project-manager-track.md).

In both modes:

1. State lives in `specs/<feature-slug>/workflow-state.md` — read it to learn where the feature is.
2. Each `/spec:*` command spawns its specialist subagent from `.claude/agents/`. Don't bypass — agent scoping is intentional.
3. When you finish a stage, the slash command updates `workflow-state.md`. Don't edit it by hand mid-workflow.

When you're managing **multiple parallel features** or working as a **service provider** across client portfolios, run the **Portfolio Track** (opt-in, above the Spec Kit):

- **Conversational:** say "run portfolio review", "update the portfolio", or "check portfolio health" and the [`portfolio-track`](.claude/skills/portfolio-track/SKILL.md) skill will detect the active portfolio and dispatch the right cycle.
- **Manual:** `/portfolio:start <slug>` (bootstrap), then `/portfolio:x` (6-monthly strategy), `/portfolio:y` (monthly review), `/portfolio:z` (daily ops). See [`docs/portfolio-track.md`](docs/portfolio-track.md) and [ADR-0009](docs/adr/0009-add-portfolio-manager-role.md).
- Portfolio artifacts live under `portfolio/<portfolio-slug>/`. The track is read-only on the `specs/` side — it never modifies feature artifacts.

## Conventions specific to Claude Code

- Subagents are project-scoped (`.claude/agents/`). They have intentionally narrow tool lists — if a tool seems missing, that's a feature, not a bug. Six classes ship: **lifecycle** agents (one per Stage 1–11), **discovery** agents (one facilitator + six specialists for the Discovery Track), **stock-taking** agents (one `legacy-auditor` for brownfield inventory work), **sales** agents (four specialists for the pre-project commercial track: `sales-qualifier`, `scoping-facilitator`, `estimator`, `proposal-writer`), one **project-manager** agent for service-provider engagements, and the **portfolio-manager** agent (opt-in, for portfolio-level management).
- Skills live in `.claude/skills/` — see [`.claude/skills/README.md`](.claude/skills/README.md). They auto-trigger from natural language and can be invoked explicitly via `/<skill-name>`. The catalog spans six workflow conductors (`orchestrate`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `portfolio-track`), mattpocock-style practice skills (`grill`, `design-twice`, `tracer-bullet`, `tdd-cycle`), cross-cutting sink skills (`domain-context`, `ubiquitous-language`), and operational skills (`verify`, `new-adr`, `review-fix`).
- Operational bots live under `agents/operational/`. Each is a `PROMPT.md` + `README.md` pair; the prompt is the source of truth the scheduled run loads.
- Permission rules live in `.claude/settings.json`. Pushes to `main` / `develop` are denied by default; `--no-verify` is denied. See `docs/branching.md`.
- Topic branches live in worktrees under `.worktrees/<slug>/`. See `docs/worktrees.md`.
- Run the verify gate before opening a PR. See `docs/verify-gate.md`.
- For irreversible architectural decisions, use the [`record-decision`](.claude/skills/record-decision/SKILL.md) skill (which wraps `/adr:new`).
- Where every markdown artifact lands is documented in [`docs/sink.md`](docs/sink.md). Don't invent new sink locations.
- Don't add `.claudeignore` exclusions silently — note them in `docs/steering/tech.md`.

## What not to do

- Don't expand the workflow with new stages or roles without an ADR.
- Don't write code from a vague brief — always run the upstream stages first or explicitly mark them as skipped.
- Don't merge feature work directly into the workflow template files (`docs/`, `templates/`, `.claude/`) unless you're improving the *template itself*.
