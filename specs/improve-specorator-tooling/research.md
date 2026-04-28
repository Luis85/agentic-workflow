---
id: RESEARCH-IST-001
title: Existing Specorator extension patterns
stage: research
feature: improve-specorator-tooling
status: accepted
owner: analyst
inputs:
  - IDEA-IST-001
created: 2026-04-28
updated: 2026-04-28
---

# Research — Existing Specorator extension patterns

## Findings

- Slash commands live under `.claude/commands/<namespace>/<name>.md` and are exposed through generated command inventories.
- Skills live under `.claude/skills/<name>/SKILL.md` and are cataloged in `.claude/skills/README.md`.
- Repository scripts use TypeScript, `package.json` npm entries, `scripts/README.md`, generated `docs/scripts/`, and `npm run verify`.
- Workflow changes are documented in `docs/specorator.md`, `docs/workflow-overview.md`, `docs/sink.md`, and state artifacts.

## Alternatives

- Add only documentation. Lower implementation cost, but no command entry points.
- Add commands without a shared skill. Easier to start, but duplicates safety rules.
- Add commands plus one shared skill. Chosen because it matches existing command-to-skill patterns.
