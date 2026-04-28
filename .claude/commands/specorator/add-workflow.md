---
description: Guide a Specorator template improvement that adds or changes a workflow, track, command sequence, lifecycle branch, or agent handoff.
argument-hint: "<workflow purpose>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /specorator:add-workflow

Add or change a workflow, track, command sequence, lifecycle branch, or agent handoff in Specorator.

## Inputs

- `$ARGUMENTS` — the workflow purpose, e.g. `quality drift review after active template improvements`. Required.

## Procedure

Invoke the [`specorator-improvement`](../../skills/specorator-improvement/SKILL.md) skill with mode `workflow`.

The skill must:

1. Identify the workflow class: lifecycle stage, optional gate, pre-stage track, operational routine, project/portfolio track, or contributor workflow.
2. Update every owned surface together: `docs/specorator.md`, `docs/workflow-overview.md`, slash commands, skills, agents, templates, state files, sink docs, and ADRs as applicable.
3. Preserve separation of concerns: requirements, design, implementation, testing, review, release, and learning remain distinct unless an ADR explicitly changes the model.
4. Add state and artifact rules when the workflow introduces new persistent files.
5. Update command inventories with `npm run fix:commands` when slash commands are added or renamed.
6. Run `npm run verify` before PR.

## Don't

- Don't add a workflow path that skips mandatory quality gates without documenting the skip rule and downstream consequences.
- Don't change stage ownership silently.
- Don't add persistent artifact locations without updating the sink and relevant templates.
