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

When you don't have a brief yet — blank page, multiple candidate ideas, no clear winner — run the **Discovery Track first** (pre-Stage 1, opt-in):

- **Conversational:** say "let's run a design sprint", "let's brainstorm new product ideas", or "we have a blank page" and the [`discovery-sprint`](.claude/skills/discovery-sprint/SKILL.md) skill will guide you through Frame → Diverge → Converge → Prototype → Validate → Handoff. The handoff writes `chosen-brief.md` which feeds `/spec:idea`.
- **Manual:** `/discovery:start`, `/discovery:frame`, `/discovery:diverge`, `/discovery:converge`, `/discovery:prototype`, `/discovery:validate`, `/discovery:handoff`. See [`docs/discovery-track.md`](docs/discovery-track.md) and [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md).

When you are working in a **service-provider context** — delivering for clients, tracking scope/schedule/budget, sending status reports — run the **Project Manager Track** (opt-in, wraps one or more feature deliveries):

- **Conversational:** say "let's start a client project", "set up a service engagement", or "I have a client brief" and the [`project-run`](.claude/skills/project-run/SKILL.md) skill will guide you through Initiation → Execution → Closure. Based on [P3.Express](https://p3.express/).
- **Manual:** `/project:start`, `/project:initiate`, `/project:weekly`, `/project:change`, `/project:report`, `/project:close`, `/project:post`. See [`docs/project-track.md`](docs/project-track.md) and [ADR-0006](docs/adr/0006-add-project-manager-track.md).

In both modes:

1. State lives in `specs/<feature-slug>/workflow-state.md` — read it to learn where the feature is.
2. Each `/spec:*` command spawns its specialist subagent from `.claude/agents/`. Don't bypass — agent scoping is intentional.
3. When you finish a stage, the slash command updates `workflow-state.md`. Don't edit it by hand mid-workflow.

## Conventions specific to Claude Code

- Subagents are project-scoped (`.claude/agents/`). They have intentionally narrow tool lists — if a tool seems missing, that's a feature, not a bug. Three classes ship: **lifecycle** agents (one per Stage 1–11), **discovery** agents (one facilitator + six specialists for the pre-stage track), and one **project-manager** agent for service-provider engagements.
- Skills live in `.claude/skills/` — see [`.claude/skills/README.md`](.claude/skills/README.md). They auto-trigger from natural language and can be invoked explicitly via `/<skill-name>`. The catalog spans three workflow conductors (`orchestrate`, `discovery-sprint`, `project-run`), mattpocock-style practice skills (`grill`, `design-twice`, `tracer-bullet`, `tdd-cycle`), cross-cutting sink skills (`domain-context`, `ubiquitous-language`), and operational skills (`verify`, `new-adr`, `review-fix`).
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
