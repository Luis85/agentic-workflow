---
description: Guide a Specorator template improvement that adds or changes a repository script while preserving docs, tests, generated references, and verify-gate integration.
argument-hint: "<script purpose>"
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /specorator:add-script

Add or change a repository script as a Specorator template improvement.

## Inputs

- `$ARGUMENTS` — the script purpose, e.g. `automation of quality drift review`. Required.

## Procedure

Invoke the [`specorator-improvement`](../../skills/specorator-improvement/SKILL.md) skill with mode `script`.

The skill must:

1. Treat the change as an improvement to Specorator itself, not as a product feature in a downstream adopting project.
2. Confirm the improvement has a tracked lifecycle artifact or create/update one under `specs/<feature>/`.
3. Follow the repository script pattern: TypeScript CLI in `scripts/`, reusable helpers in `scripts/lib/`, tests under `tests/scripts/`, npm script entry in `package.json` when user-facing, and generated docs under `docs/scripts/`.
4. Add the script to the relevant verify path when it is a quality gate.
5. Update `scripts/README.md`, generated script docs, and any workflow docs that expose the new contract.
6. Run `npm run fix:script-docs` if public script comments changed, then run `npm run verify`.

## Don't

- Don't add an npm command without documenting when humans or CI should run it.
- Don't bypass `npm run verify` or use `--no-verify`.
- Don't create a script that mutates files unless it has a read-only check pair or a clearly named `fix:*` command.
