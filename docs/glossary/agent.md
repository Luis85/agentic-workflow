---
term: Agent
slug: agent
aliases: [subagent, AI agent]
status: accepted
last-updated: 2026-04-28
related: [artifact, spec, quality-gate]
tags: [role, workflow]
---

# Agent

## Definition

An AI assistant specialised for one role in the workflow — analyst, PM, designer, developer, QA, reviewer, and so on.

## Why it matters

Article VI of [`memory/constitution.md`](../../memory/constitution.md) — agent specialisation. Each agent operates only within its defined scope (`.claude/agents/<role>.md`); agents may **escalate** but may not **invent** missing inputs. Tool restrictions on agents are deliberate. This separation is what keeps a research-phase agent from writing code, and a developer-phase agent from changing requirements.

Six classes of agent ship in this repo:
- **Lifecycle agents** (one per Stage 1–11): analyst, pm, ux-designer, ui-designer, architect, planner, dev, qa, reviewer, release-manager, sre, retrospective.
- **Discovery specialists** (Discovery Track): facilitator, product-strategist, user-researcher, game-designer, divergent-thinker, critic, prototyper.
- **Stock-taking specialist**: legacy-auditor.
- **Sales specialists**: sales-qualifier, scoping-facilitator, estimator, proposal-writer.
- **Project manager** (service-provider opt-in).
- **Portfolio manager** (multi-project opt-in).

## Examples

> *"Each agent has a defined responsibility. Don't write code in a research phase. Don't change requirements during implementation."* — `AGENTS.md`

In a typical Stage 3 → Stage 4 transition, the `pm` agent finishes `requirements.md` and the `ux-designer`, `ui-designer`, and `architect` agents take over to produce `design.md`. The pm agent has no ability to edit Stage 4 artifacts.

## Avoid

- *Bot* — operational bots (`agents/operational/`) run on a schedule and are a different shape; they're not lifecycle agents.
- *Skill* — a skill (`.claude/skills/`) is a reusable how-to that an agent invokes; the agent has the role, the skill is just a tool.
- *Orchestrator* — one specific agent (the lifecycle orchestrator). Saying "agent" without context is the parent concept.

## See also

- [`AGENTS.md`](../../AGENTS.md) — cross-tool root context with the canonical agent classification.
- [`.claude/agents/`](../../.claude/agents/) — definitions of each lifecycle agent.
- [artifact](./artifact.md) — what each agent produces.
- [quality-gate](./quality-gate.md) — what each agent must satisfy before handing off.
