# AGENTS.md

Cross-tool root context for AI coding agents (Claude Code, Codex, Cursor, Aider, Copilot, Gemini, etc.). Tool-specific files (`CLAUDE.md`, `.cursor/rules/`, `.aider.conf.yml`) should `@import` or reference this file rather than duplicate it.

> **One source of truth, many tools.** When you change project conventions, change them here.

## Project

This repository is a **template for spec-driven, agentic software development**. It does not build a product — it defines the workflow, artifacts, and roles used to build products. The workflow itself is the deliverable.

When working in a project that *uses* this template, replace this section with your product's overview.

## Read these first

Before doing any non-trivial work, read:

1. **`memory/constitution.md`** — governing principles. Override only with explicit human approval.
2. **`docs/spec-kit.md`** — the full workflow definition.
3. **`docs/steering/`** — scoped context (product, tech, ux, quality, operations). Load only what's relevant to your task.
4. **The current feature's `specs/<feature>/workflow-state.md`** — tells you which stage is active and what's already produced.

## Operating rules

- **Stay in scope.** Each agent role has a defined responsibility (see `.claude/agents/`). Don't write code in a research phase. Don't change requirements during implementation.
- **Specs are the source of truth.** If implementation reveals a missing requirement, escalate — don't silently invent one. Update the spec first, then the code.
- **Respect quality gates.** Every stage has acceptance criteria in `docs/quality-framework.md`. Don't mark a stage complete unless they pass.
- **Trace everything.** Every requirement, task, and test has an ID (see `docs/traceability.md`). Reference IDs in commits, PRs, and artifacts.
- **EARS for requirements.** Functional requirements use EARS notation (see `docs/ears-notation.md`) so they map 1:1 to tests.
- **ADRs for irreversible decisions.** Anything architecturally load-bearing gets an ADR in `docs/adr/`. Use the template in `templates/adr-template.md`.
- **Update workflow state.** When you finish or hand off a stage, update `specs/<feature>/workflow-state.md` so the next agent can resume.
- **Escalate ambiguity.** Don't guess. Either ask the human or open a `clarifications` block in the active artifact.

## Repo conventions

- Markdown for all artifacts. Keep them concise; prefer precision over completeness in early iterations.
- File names are kebab-case. Per-feature work lives under `specs/<feature-slug>/`.
- IDs are stable: `REQ-<AREA>-NNN`, `T-<AREA>-NNN`, `TEST-<AREA>-NNN`, `ADR-NNNN`.
- ADRs are immutable — supersede them, don't edit them.
- Commit messages: imperative mood, reference IDs (`feat(auth): add T-AUTH-014 password reset`).

## When the harness gets in your way

This repo is **process-light by design** for v0.1: no required CI, no PR checks, no enforced branch protection. If you find yourself fighting tooling, prefer fixing the process to working around it.

## Tool-specific notes

- **Claude Code.** Subagents at `.claude/agents/`, slash commands at `.claude/commands/`. `CLAUDE.md` imports this file.
- **Codex / Cursor / Aider.** This file is the primary context. Cursor users: `.cursor/rules/` may be added later if needed.
- **All tools.** Templates in `templates/` are framework-agnostic Markdown.
