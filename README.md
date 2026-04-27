# Spec Kit — Quality-Driven, Agentic Development Workflow

A solution-agnostic, **spec-driven** workflow template for building software with humans and AI agents working together. Covers the full SDLC: Product → UX → UI → Engineering → Testing → Quality → Delivery → Operations.

> **Status:** v0.1 — Foundation. Intentionally generic and starting-point-y. Iterate on it.

## Why

LLM coding agents are powerful, but they fail predictably when given vague intent. This kit treats **specifications as the source of truth** and code as their artifact. Each SDLC stage has a defined input, output, owner, and quality gate, so work is traceable from idea to release and parallelisable across specialised agents.

## What's in here

| Path | Purpose |
|---|---|
| [`docs/spec-kit.md`](docs/spec-kit.md) | The full workflow definition (read this first) |
| [`docs/discovery-track.md`](docs/discovery-track.md) | Pre-stage Discovery Track — ideation, design sprint, concept validation (opt-in, see [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md)) |
| [`docs/workflow-overview.md`](docs/workflow-overview.md) | One-page visual + cheat sheet |
| [`docs/quality-framework.md`](docs/quality-framework.md) | Quality dimensions, gates, Definition of Done |
| [`docs/traceability.md`](docs/traceability.md) | ID scheme: requirement → spec → task → code → test |
| [`docs/ears-notation.md`](docs/ears-notation.md) | Reference for writing testable requirements |
| [`docs/sink.md`](docs/sink.md) | Catalog of every markdown artifact: where it lives, who owns it, how it evolves |
| [`docs/steering/`](docs/steering/) | Persistent, scoped context for agents (product, tech, ux, quality, ops) |
| [`docs/adr/`](docs/adr/) | Architecture Decision Records — start with [`0001`](docs/adr/0001-record-architecture-decisions.md) |
| [`memory/constitution.md`](memory/constitution.md) | Project principles loaded ahead of every workflow command |
| [`templates/`](templates/) | Blank artifacts for each stage (idea, prd, design, spec, tasks, …) |
| [`.claude/agents/`](.claude/agents/) | One subagent per SDLC role (PM, UX, architect, dev, QA, SRE, …) |
| [`.claude/commands/`](.claude/commands/) | Slash commands per workflow phase (`/spec:specify`, `/spec:tasks`, …) |
| [`.claude/skills/`](.claude/skills/) | Auto-discoverable skill bundles — `orchestrate` (lifecycle entry), `discovery-sprint` (pre-stage entry), `grill`, `design-twice`, `tracer-bullet`, `tdd-cycle`, `record-decision`, `domain-context`, `ubiquitous-language`, `verify`, `new-adr`, `review-fix` |
| [`.claude/memory/`](.claude/memory/) | Operational memory: workflow rules + project state, indexed in [`MEMORY.md`](.claude/memory/MEMORY.md) |
| [`.claude/settings.json`](.claude/settings.json) | Permission baseline (allow/deny) + SessionStart hook |
| [`agents/operational/`](agents/operational/) | Always-on, scheduled agents (review-bot, docs-review-bot, plan-recon-bot, dep-triage-bot, actions-bump-bot) |
| [`docs/branching.md`](docs/branching.md) | Branching model + topic-branch prefixes |
| [`docs/worktrees.md`](docs/worktrees.md) | `.worktrees/<slug>/` pattern for parallel agents |
| [`docs/verify-gate.md`](docs/verify-gate.md) | The single-command pre-PR quality gate |
| [`docs/plans/`](docs/plans/) | Cross-cutting working plans (`YYYY-MM-DD-<slug>.md`) |
| [`docs/archive/`](docs/archive/) | Read-only archive of completed plans / superseded specs |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute to this template (uses its own workflow) |
| [`AGENTS.md`](AGENTS.md) | Cross-tool root context (Codex, Cursor, Aider, Copilot all read this) |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code entry point — imports `AGENTS.md` |
| [`examples/`](examples/) | Demonstration artifacts — what a project using this template produces. Each `examples/<slug>/` mirrors `specs/<slug>/` shape. Not part of the template's own workflow; agents must not treat these as active features. (`cli-todo`: stages 1–3 complete, stage 4 in-progress) |

## Quickstart

1. **Clone or fork** this repo as a starting point for your project.
2. **Adapt the constitution** at `memory/constitution.md` to your project's principles and constraints.
3. **Fill the steering files** under `docs/steering/` with project-specific context.
4. **Pick an entry point.** If you have a brief, jump to step 5. If you have a *blank page* (a problem area, an outcome, multiple candidate ideas), run the **Discovery Track** first:
   - **Conversational:** say "let's run a design sprint" / "let's brainstorm new product ideas" → the [`discovery-sprint`](.claude/skills/discovery-sprint/SKILL.md) skill walks Frame → Diverge → Converge → Prototype → Validate → Handoff.
   - **Manual:** `/discovery:start <sprint-slug>` … `/discovery:handoff`. See [`docs/discovery-track.md`](docs/discovery-track.md). Output is a `chosen-brief.md` which becomes the input to step 5.
5. **Start a feature** in one of two ways:
   - **Conversational (recommended in Claude Code):** say "let's start a feature" or run `/orchestrate <one-line goal>`. The [`orchestrate`](.claude/skills/orchestrate/SKILL.md) skill gates with you and dispatches the right stage per turn.
   - **Manual:** create `specs/<feature-slug>/` via `/spec:start <slug>` and walk the stages (`/spec:idea` → `/spec:research` → … → `/spec:retro`).
6. **State lives in `specs/<feature-slug>/workflow-state.md`** — any agent (or you, in a fresh session) can pick up from there. Discovery sprints have their own state at `discovery/<sprint-slug>/discovery-state.md`.

If you use Claude Code, the slash commands, subagents, and skills work out of the box. If you use Codex / Cursor / Aider, the artifact templates and `AGENTS.md` are tool-agnostic; the slash commands and skills are Claude-specific but the conventions they enforce (workflow stages, EARS, ADR pattern) carry over.

## Workflow at a glance

```
[Discovery Track] -.brief.-> Idea → Research → Requirements → Design → Specification → Tasks
   (opt-in)                                                                              ↓
                              Retrospective ← Release ← Review ← Testing ← Implementation
```

The Discovery Track is opt-in and runs only when no brief exists yet (Frame → Diverge → Converge → Prototype → Validate → Handoff). Each arrow in the lifecycle is a quality gate. See [`docs/spec-kit.md`](docs/spec-kit.md) for the full definition, [`docs/discovery-track.md`](docs/discovery-track.md) for the pre-stage track, and [`docs/workflow-overview.md`](docs/workflow-overview.md) for the cheat sheet.

## Principles

1. **Spec-driven** — code derives from specs, not the other way around.
2. **Separation of concerns** — idea ≠ research ≠ requirements ≠ design ≠ implementation.
3. **Incremental** — small, verifiable steps; each builds on validated outputs.
4. **Quality gates** — no stage completes without passing its criteria.
5. **Traceability** — every artifact links back to a requirement and a decision.
6. **Agent specialisation** — each role has a clear scope; agents don't overreach.
7. **Human oversight** — humans own intent, priorities, and acceptance.

Full version in [`memory/constitution.md`](memory/constitution.md).

## Two classes of agent

The template ships **two** agent flavours:

- **Lifecycle agents** (`.claude/agents/`) — used while building one feature.
  - *Stages 1–11:* analyst, pm, ux-designer, ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective, orchestrator.
  - *Discovery Track* (pre-stage 1, opt-in): facilitator + product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper. See [ADR-0005](docs/adr/0005-add-discovery-track-before-stage-1.md).
- **Operational agents** (`agents/operational/`) — always-on routines that run on a schedule against the live repo: `review-bot`, `docs-review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`. Each is a `PROMPT.md` + `README.md` pair, conservative by default, idempotent, and silent on quiet days.

Adopt operational agents one at a time after the lifecycle workflow is in routine use.

## Versioning

- **v0.1** — Foundation: workflow definition, templates, agents, slash commands.
- **v0.2** — Skills layer: `orchestrate` skill (conversational entry), practice skills (`grill`, `design-twice`, `tracer-bullet`, `tdd-cycle`, `record-decision`), cross-cutting sink skills (`domain-context`, `ubiquitous-language`), operational learnings (memory, ops bots, branching/verify/worktrees guides), and `docs/sink.md` cataloging the full markdown sink.
- **v0.3** (planned) — Worked examples, automated artifact validation, RTM generator.
- **v0.4** (planned) — CI quality gates, metrics, maturity model.

## License

[MIT](LICENSE)
