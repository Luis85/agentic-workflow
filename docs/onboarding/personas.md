---
title: "Persona onboarding"
folder: "docs/onboarding"
description: "Role-based first steps for adopting Specorator."
---
# Persona Onboarding

## Product Manager Or Designer

Start by saying "let's start a feature" or "let's run a design sprint" in Claude Code. Review `specs/<feature>/idea.md`, `research.md`, and `requirements.md`; you own intent and acceptance.

## Developer

Start with `specs/<feature>/workflow-state.md`. Continue from the current stage, implement only from accepted specs, and run `npm run verify` before PR handoff.

## Team Lead

Fork the template, adapt `memory/constitution.md`, fill `docs/steering/`, and decide who approves each stage gate. Use `docs/quality-framework.md` as the acceptance baseline.

## Solo Builder

Use the orchestrated path: say "drive this end-to-end: <idea>". Keep the retrospective even for small work so your local process improves.

## Non-Claude User

Read `AGENTS.md`, choose your tool guide under `docs/cross-tool/`, and run stages manually. The artifacts and quality gates are portable even when slash commands are not.
