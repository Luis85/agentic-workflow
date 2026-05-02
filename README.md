# Specorator — Agentic Development Workflow

![Version](https://img.shields.io/badge/version-v0.5.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

[![Verify](https://github.com/Luis85/agentic-workflow/actions/workflows/verify.yml/badge.svg?branch=main)](https://github.com/Luis85/agentic-workflow/actions/workflows/verify.yml) [![gitleaks](https://github.com/Luis85/agentic-workflow/actions/workflows/gitleaks.yml/badge.svg?branch=main)](https://github.com/Luis85/agentic-workflow/actions/workflows/gitleaks.yml) [![typos](https://github.com/Luis85/agentic-workflow/actions/workflows/typos.yml/badge.svg?branch=main)](https://github.com/Luis85/agentic-workflow/actions/workflows/typos.yml) [![zizmor](https://github.com/Luis85/agentic-workflow/actions/workflows/zizmor.yml/badge.svg?branch=main)](https://github.com/Luis85/agentic-workflow/actions/workflows/zizmor.yml)

**Build software the right way with AI.** Specorator is a spec-driven workflow template: humans decide what to build, specialist agents handle how, and every requirement, decision, task, test, and release note stays traceable.

> **Status:** v0.5.0 — release infrastructure and fresh-surface packaging are in place. Claude Code is first-class; Codex, Cursor, Aider, Copilot, and Gemini have Markdown-based walkthroughs.

Product page: <https://luis85.github.io/agentic-workflow/>

## Get Started In 5 Minutes

```bash
git clone https://github.com/Luis85/agentic-workflow.git my-project
cd my-project
npm install
npm run verify
claude
```

Then say:

> let's start a feature: user login with email and password

Claude Code runs the conversational path, asks the stage-gate questions, and writes artifacts under `specs/<feature>/`.

## Pick Your Entry Point

| You are | Start here | Outcome |
|---|---|---|
| Product manager or designer | Say "let's start a feature" or "let's run a design sprint" in Claude Code. | `idea.md`, research notes, and `requirements.md` that engineering can review. |
| Developer | Read `specs/<feature>/workflow-state.md`, then say "continue this feature". | The next stage runs from the existing artifact state. |
| Team lead | Fork the repo, adapt `memory/constitution.md`, fill `docs/steering/`, and gate stages from `workflow-state.md`. | A project-local workflow with explicit quality gates. |
| Solo builder | Say "drive this end-to-end: <idea>" in Claude Code. | The orchestrator walks all 11 stages with you. |
| Non-Claude user | Open the guide for your tool under `docs/cross-tool/`. | Manual stage execution using the same Markdown artifacts. |

More persona detail: [`docs/onboarding/personas.md`](docs/onboarding/personas.md).

## Tool Guides

Claude Code gets the native commands, agents, and skills. Other tools use the same files and stage order:

- [Codex](docs/cross-tool/codex.md)
- [Cursor](docs/cross-tool/cursor.md)
- [Aider](docs/cross-tool/aider.md)
- [Copilot](docs/cross-tool/copilot.md)
- [Gemini](docs/cross-tool/gemini.md)

## What You Get

- An 11-stage lifecycle: Idea, Research, Requirements, Design, Specification, Tasks, Implementation, Testing, Review, Release, Retrospective.
- Optional tracks for Discovery, Stock-taking, Sales, Project Management, Roadmap, Portfolio, Quality Assurance, Project Scaffolding, and Issue Breakdown.
- Markdown artifacts in `specs/<feature>/`, stable IDs (`REQ-*`, `T-*`, `TEST-*`, `ADR-*`), and `npm run verify` as the local and CI gate.
- Claude Code agents, skills, and slash commands in `.claude/`, with shared root context in `AGENTS.md`.

## Reference

- Workflow definition: [`docs/specorator.md`](docs/specorator.md)
- Documentation hub: [`docs/README.md`](docs/README.md)
- Slash commands inventory: [`docs/slash-commands.md`](docs/slash-commands.md)
- Repository map: [`docs/repo-map.md`](docs/repo-map.md)
- Quality framework: [`docs/quality-framework.md`](docs/quality-framework.md)
- Contribution guide: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Roadmap

| Version | Status | Focus |
|---|---|---|
| v0.5 | Done | [Release workflow, branching strategy, GitHub Releases and Packages](https://github.com/Luis85/agentic-workflow/issues/90) |
| v0.5.1 | Active | [Issue-breakdown track patch release](https://github.com/Luis85/agentic-workflow/issues/183) |
| v0.6 | Active | [Cross-tool adapters, live proof, hooks, and security](https://github.com/Luis85/agentic-workflow/issues/91) |
| v1.0 | Planned | [Release readiness checklist](https://github.com/Luis85/agentic-workflow/issues/92) |

## License

[MIT](LICENSE)
