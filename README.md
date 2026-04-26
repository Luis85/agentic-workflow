# Spec Kit — Quality-Driven, Agentic Development Workflow

A solution-agnostic, **spec-driven** workflow template for building software with humans and AI agents working together. Covers the full SDLC: Product → UX → UI → Engineering → Testing → Quality → Delivery → Operations.

> **Status:** v0.1 — Foundation. Intentionally generic and starting-point-y. Iterate on it.

## Why

LLM coding agents are powerful, but they fail predictably when given vague intent. This kit treats **specifications as the source of truth** and code as their artifact. Each SDLC stage has a defined input, output, owner, and quality gate, so work is traceable from idea to release and parallelisable across specialised agents.

## What's in here

| Path | Purpose |
|---|---|
| [`docs/spec-kit.md`](docs/spec-kit.md) | The full workflow definition (read this first) |
| [`docs/workflow-overview.md`](docs/workflow-overview.md) | One-page visual + cheat sheet |
| [`docs/quality-framework.md`](docs/quality-framework.md) | Quality dimensions, gates, Definition of Done |
| [`docs/traceability.md`](docs/traceability.md) | ID scheme: requirement → spec → task → code → test |
| [`docs/ears-notation.md`](docs/ears-notation.md) | Reference for writing testable requirements |
| [`docs/steering/`](docs/steering/) | Persistent, scoped context for agents (product, tech, ux, quality, ops) |
| [`docs/adr/`](docs/adr/) | Architecture Decision Records — start with [`0001`](docs/adr/0001-record-architecture-decisions.md) |
| [`memory/constitution.md`](memory/constitution.md) | Project principles loaded ahead of every workflow command |
| [`templates/`](templates/) | Blank artifacts for each stage (idea, prd, design, spec, tasks, …) |
| [`.claude/agents/`](.claude/agents/) | One subagent per SDLC role (PM, UX, architect, dev, QA, SRE, …) |
| [`.claude/commands/`](.claude/commands/) | Slash commands per workflow phase (`/spec:specify`, `/spec:tasks`, …) |
| [`.claude/skills/`](.claude/skills/) | Reusable how-tos any agent can invoke (verify, new-adr, review-fix) |
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
| [`examples/`](examples/) | Worked end-to-end examples (placeholder for v0.2) |

## Quickstart

1. **Clone or fork** this repo as a starting point for your project.
2. **Adapt the constitution** at `memory/constitution.md` to your project's principles and constraints.
3. **Fill the steering files** under `docs/steering/` with project-specific context.
4. **Start a feature** by creating `specs/<feature-slug>/` and walking the stages (`/spec:idea` → `/spec:research` → … → `/spec:retro`).
5. **Update `specs/<feature-slug>/workflow-state.md`** as you progress so any agent can pick up where the last one left off.

If you use Claude Code, the slash commands and subagents work out of the box. If you use Codex / Cursor / Aider, the artifact templates and `AGENTS.md` are tool-agnostic.

## Workflow at a glance

```
Idea → Research → Requirements → Design → Specification → Tasks
                                                            ↓
            Retrospective ← Release ← Review ← Testing ← Implementation
```

Each arrow is a quality gate. See [`docs/spec-kit.md`](docs/spec-kit.md) for the full definition and [`docs/workflow-overview.md`](docs/workflow-overview.md) for the cheat sheet.

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

- **Lifecycle agents** (`.claude/agents/`) — one per SDLC role, used while building one feature: analyst, pm, ux-designer, ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective, orchestrator.
- **Operational agents** (`agents/operational/`) — always-on routines that run on a schedule against the live repo: `review-bot`, `docs-review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`. Each is a `PROMPT.md` + `README.md` pair, conservative by default, idempotent, and silent on quiet days.

Adopt operational agents one at a time after the lifecycle workflow is in routine use.

## Versioning

- **v0.1** — Foundation: workflow definition, templates, agents, slash commands.
- **v0.2** (planned) — Worked examples, automated artifact validation, RTM generator.
- **v0.3** (planned) — CI quality gates, metrics, maturity model.

## License

[MIT](LICENSE)
