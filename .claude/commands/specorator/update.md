---
description: Guide a general Specorator template improvement and choose whether it is a script, tooling, workflow, documentation, agent, skill, template, or mixed change.
argument-hint: "<improvement idea>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /specorator:update

Improve Specorator itself from a user idea.

## Inputs

- `$ARGUMENTS` — the improvement idea, e.g. `automate quality drift review while someone is actively improving the template`. Required.

## Procedure

Invoke the [`specorator-improvement`](../../skills/specorator-improvement/SKILL.md) skill with mode `update`.

The skill must:

1. Classify the idea as one or more of: script, tooling, workflow, documentation, agent, skill, template, state/schema, product page, or operational routine.
2. Recommend the narrower command when appropriate:
   - `/specorator:add-script` for repository scripts and checks.
   - `/specorator:add-tooling` for CI, generated tooling, dependencies, and operational automation.
   - `/specorator:add-workflow` for stages, tracks, commands, handoffs, and persistent artifacts.
3. Run the standard Specorator improvement loop: frame, trace, design, implement, verify, document, PR.
4. Preserve the normal topic-branch workflow for non-trivial changes.

## Don't

- Don't treat downstream product requirements as changes to this template unless the human explicitly says they are improving Specorator itself.
- Don't leave generated docs, command inventories, or workflow state stale.
- Don't stop after local edits when GitHub access is available; open the PR.
