---
title: Repo map
folder: docs
description: Detailed file-by-file map of the Specorator template — what each path is, who owns it, and where to read more.
entry_point: false
---

# Repo map

Detailed file-by-file map of the template. The root `README.md` keeps a thin landing page; this file holds the long-form content. For *where artifacts get written* (sinks, ownership, mutability rules) see [`sink.md`](./sink.md).

## How it works (long form)

Specorator is built as a layered set of plain-Markdown artifacts and prompt-driven roles. There is no runtime to deploy and no service to host — everything lives in your repository.

### Building blocks

- **Constitution** ([`memory/constitution.md`](../memory/constitution.md)) — governing principles loaded ahead of every command.
- **Steering** ([`docs/steering/`](./steering/)) — scoped context (product, tech, ux, quality, ops) that agents read so they know your project.
- **Specs** (`specs/<feature-slug>/`) — one folder per feature; each stage drops one Markdown artifact here.
- **Agents** ([`.claude/agents/`](../.claude/agents/)) — one specialist per role, with deliberately narrow tool permissions.
- **Skills** ([`.claude/skills/`](../.claude/skills/)) — reusable how-tos that auto-trigger from natural language or run via `/<skill-name>`.
- **Slash commands** ([`.claude/commands/`](../.claude/commands/)) — explicit per-stage entry points (`/spec:idea`, `/spec:design`, …).
- **Templates** ([`templates/`](../templates/)) — blank starting points for every artifact you produce.
- **ADRs** ([`docs/adr/`](./adr/)) — immutable Architecture Decision Records for anything load-bearing.

### How you are meant to use it

1. **Adopt** — fork the repo (or click "Use this template"), then personalise [`memory/constitution.md`](../memory/constitution.md) and fill [`docs/steering/`](./steering/).
2. **Pick the right entry point** — Discovery (blank page), Stock-taking (legacy system), Sales Cycle (client work), or jump straight into the Lifecycle (you have a brief).
3. **Drive conversationally** — open Claude Code and say *"let's start a feature"* or *"drive this end-to-end"*. The `orchestrate` skill walks you stage-by-stage, gating with you between each one.
4. **Or drive manually** — run the slash commands yourself in stage order. State lives in `specs/<feature>/workflow-state.md`.
5. **Gate every stage** — review the artifact, push back on anything wrong, sign off, then move on. No stage is skipped; quality gates are non-negotiable.
6. **Implement against the spec** — the dev agent only writes code that matches `tasks.md`. The qa agent verifies every EARS requirement has a test. The reviewer audits traceability.
7. **Ship and learn** — `/spec:release` produces release notes; `/spec:retro` is mandatory and feeds improvements back into the template.

### Track diagrams

The full mermaid diagrams for each track live in [`workflow-overview.md`](./workflow-overview.md). At a glance:

- **Project Scaffolding Track** *(optional, source-led onboarding)* — Intake → Extract → Assemble → Handoff.
- **Discovery Track** *(optional, blank-page ideation)* — Frame → Diverge → Converge → Prototype → Validate → Handoff.
- **Lifecycle Track** *(11 stages, the core workflow)* — Idea → Research → Requirements → Design → Specification → Tasks → Implementation → Testing → Review → Release → Retrospective.

Each lifecycle stage has **one owner** (a specialist AI agent), **one output** (a Markdown file in `specs/<feature>/`), and **one quality gate** before the next stage can begin. No stage is skipped; quality gates are non-negotiable.

## What's in the repo

| Path | What it is |
|---|---|
| [`docs/specorator.md`](./specorator.md) | Full workflow definition — read this before any non-trivial work |
| [`docs/project-scaffolding-track.md`](./project-scaffolding-track.md) | Source-led onboarding detail for turning collected docs into starter artifacts |
| [`docs/discovery-track.md`](./discovery-track.md) | Discovery Track detail and phase-by-phase guide |
| [`docs/roadmap-management-track.md`](./roadmap-management-track.md) | Product/project roadmap management, stakeholder alignment, and team communication workflow |
| [`docs/quality-assurance-track.md`](./quality-assurance-track.md) | ISO 9001-aligned quality assurance review workflow |
| [`docs/release-readiness-guide.md`](./release-readiness-guide.md) | Stage 10 go/no-go guide for product perspectives and stakeholder requirements |
| [`docs/workflow-overview.md`](./workflow-overview.md) | One-page visual + cheat sheet + slash command list |
| [`docs/quality-framework.md`](./quality-framework.md) | Quality dimensions, gates, and Definition of Done per stage |
| [`docs/ears-notation.md`](./ears-notation.md) | How to write requirements in EARS format |
| [`docs/traceability.md`](./traceability.md) | ID scheme: requirement → spec → task → code → test |
| [`docs/sink.md`](./sink.md) | Catalog of every artifact: where it lives, who owns it |
| [`docs/steering/`](./steering/) | Scoped context for agents (product, tech, ux, quality, ops) |
| [`docs/adr/`](./adr/) | Architecture Decision Records — start with [ADR-0001](./adr/0001-record-architecture-decisions.md) |
| [`memory/constitution.md`](../memory/constitution.md) | Governing principles loaded before every command |
| [`templates/`](../templates/) | Blank artifact templates for each stage |
| [`.claude/agents/`](../.claude/agents/) | One subagent per SDLC role |
| [`.claude/skills/`](../.claude/skills/) | Reusable skill bundles (`orchestrate`, `grill`, `tdd-cycle`, `verify`, …) |
| [`agents/operational/`](../agents/operational/) | Scheduled bots: review-bot, dep-triage-bot, plan-recon-bot, and more |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | How to improve this template |
| [`sites/index.html`](../sites/index.html) | Public product page source, deployable through GitHub Pages |
| [`AGENTS.md`](../AGENTS.md) | Cross-tool root context (Codex, Cursor, Aider, Copilot all read this) |
| [`CLAUDE.md`](../CLAUDE.md) | Claude Code entry point — imports `AGENTS.md` |
| [`.codex/`](../.codex/) | Codex-specific instructions and workflow playbooks |
| [`examples/`](../examples/) | Demonstration artifacts — what a project using this template produces. Each `examples/<slug>/` mirrors `specs/<slug>/` shape. Not part of the template's own workflow; agents must not treat these as active features. Trimmed top-level files are one-page excerpts; the unabridged mirror lives in `examples/<slug>/full/` for human reference. |
