---
id: PRD-IST-001
title: Specorator improvement commands
stage: requirements
feature: improve-specorator-tooling
status: accepted
owner: pm
inputs:
  - IDEA-IST-001
  - RESEARCH-IST-001
created: 2026-04-28
updated: 2026-04-28
---

# PRD — Specorator improvement commands

## Summary

Add first-class guidance for improving the Specorator template itself, with specific paths for scripts, tooling, workflows, and general method updates.

## Functional requirements (EARS)

### REQ-IST-001 — Classify template improvements

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a `/specorator:update` command that classifies a template-improvement idea before routing it to a narrower path.
- **Acceptance:** The command names script, tooling, workflow, and mixed update paths.
- **Priority:** must
- **Satisfies:** IDEA-IST-001

### REQ-IST-002 — Guide script additions

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a `/specorator:add-script` command that guides repository script, check, fixer, documentation, and verify integration work.
- **Acceptance:** The command references TypeScript scripts, tests, package scripts, docs, generated references, and `npm run verify`.
- **Priority:** must
- **Satisfies:** IDEA-IST-001

### REQ-IST-003 — Guide tooling additions

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a `/specorator:add-tooling` command that guides CI, dependencies, generated tooling, operational automation, and local developer tooling.
- **Acceptance:** The command requires explicit trigger, authority, documentation, dependency, and verification decisions.
- **Priority:** must
- **Satisfies:** IDEA-IST-001

### REQ-IST-004 — Guide workflow additions

- **Pattern:** ubiquitous
- **Statement:** The template shall provide a `/specorator:add-workflow` command that guides workflow, track, command sequence, lifecycle branch, and handoff changes.
- **Acceptance:** The command requires owned docs, commands, skills, agents, templates, state rules, and generated inventories to stay consistent.
- **Priority:** must
- **Satisfies:** IDEA-IST-001

### REQ-IST-005 — Keep the method discoverable

- **Pattern:** ubiquitous
- **Statement:** The template shall document how to improve Specorator itself in the core workflow docs, command inventory, skill catalog, and sink rules.
- **Acceptance:** The new commands appear in generated command inventories and are described in `docs/specorator.md`.
- **Priority:** must
- **Satisfies:** RESEARCH-IST-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-IST-001 | maintainability | New guidance must reuse established command, skill, generated-doc, worktree, verify, and PR-delivery patterns. | No bespoke path outside existing repo conventions. |

## Quality gate

- [x] Functional requirements use EARS and have stable IDs.
- [x] Acceptance criteria are testable.
- [x] Non-goals and constraints are explicit in the command and skill docs.
