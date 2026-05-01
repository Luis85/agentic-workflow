---
id: IDEA-V06-001
title: Version 0.6 productization and trust plan
stage: idea
feature: version-0-6-plan
status: accepted
owner: analyst
created: 2026-05-01
updated: 2026-05-01
---

# Idea - Version 0.6 productization and trust plan

## Problem

Specorator has a strong workflow core, but adoption still depends on users reading a large repository, trusting unproven examples, and translating Claude-first artifacts into other agent surfaces by hand. The project also underplays its strongest market fit: verifiable, governed AI-assisted delivery in a period where teams are adding agentic coding tools faster than their verification, security, and process controls mature.

## Target users

- Maintainers who need a release after v0.5 that makes the template easier to install, prove, and explain.
- First-time adopters who need a short path from clone or package install to a working, verified feature.
- Teams using Codex, Copilot, Cursor, Aider, or other tools alongside Claude Code.
- Security-conscious teams that need agentic AI risk controls, not only conventional code checks.
- Product evaluators comparing Specorator with GitHub Spec Kit and lighter prompt libraries.

## Desired outcome

v0.6 should turn the released v0.5 distribution into an adoption-ready productization release: filled Specorator steering context, a live verified golden path, cross-tool adapter surfaces, deterministic hook packs, agentic security guidance, clearer adoption profiles, and public positioning that proves the workflow instead of only describing it.

## Constraints

- v0.6 builds on the v0.5 release/distribution mechanism; do not duplicate v0.5 publishing work.
- Do not add a mandatory lifecycle stage.
- Keep the core lifecycle small and make new surfaces opt-in.
- Preserve Markdown portability and the single source of truth in `AGENTS.md`.
- Treat security hooks and agent automation as guardrails that must be auditable and reversible.

## Open questions

- Which cross-tool adapters should be first-class in v0.6: Copilot, Codex, Cursor, Aider, or all of them?
- Should agentic security live as a standalone optional workflow, a QA track extension, or a checklist pack consumed by both?
- Should the golden-path demo execute in CI, or should CI only validate the canned artifacts and scripts?
- Should public positioning explicitly compare Specorator against GitHub Spec Kit in README and the product page?
- How much of the steering context should be filled for the template product itself versus left as blank downstream examples?
