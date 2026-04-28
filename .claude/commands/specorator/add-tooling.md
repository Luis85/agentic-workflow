---
description: Guide a Specorator template improvement that adds developer tooling, CI, operational automation, dependencies, or generated checks.
argument-hint: "<tooling purpose>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /specorator:add-tooling

Add developer tooling, CI, operational automation, dependencies, or generated checks to Specorator.

## Inputs

- `$ARGUMENTS` — the tooling purpose, e.g. `nightly quality drift review`. Required.

## Procedure

Invoke the [`specorator-improvement`](../../skills/specorator-improvement/SKILL.md) skill with mode `tooling`.

The skill must:

1. Capture the user need and expected trigger: local command, CI check, scheduled workflow, operational agent, or human-run playbook.
2. Confirm whether the change needs an ADR by checking if it changes architecture, permissions, dependencies, CI trust boundaries, or operational authority.
3. Keep the tool contract visible in `README.md`, `docs/workflow-overview.md`, `scripts/README.md`, `docs/steering/operations.md`, or the relevant operational agent docs.
4. Prefer read-only diagnostics before mutating repairs.
5. Wire the tool into `npm run verify`, CI, or an operational routine only when the quality gate should fail on drift.
6. Run the targeted tool check and `npm run verify` before PR.

## Don't

- Don't add dependencies without a PR justification, lockfile update, and ADR when the dependency is architecturally significant.
- Don't grant bots write, merge, deploy, or destructive permissions without explicit human approval and documented rollback.
- Don't hide new operational behavior in implementation files only; update the user-facing workflow contract.
