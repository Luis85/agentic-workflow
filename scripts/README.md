---
title: "Repository Scripts"
folder: "scripts"
description: "Entry point for local and CI integrity check scripts."
entry_point: true
---
# Repository Scripts

The scripts in this directory provide the template repository's local and CI integrity checks.

## Doctor

Run a local environment and repository diagnostic:

```bash
npm run doctor
```

`doctor` checks Node/npm/git availability, branch and worktree state, installed dependencies, GitHub workflow readiness, generated-block drift, and the full verify gate. It is read-only and exits non-zero if required checks fail. Dependency hints prefer `npm ci` when `package-lock.json` is present so local setup matches CI.

## Verify

Run the full read-only gate:

```bash
npm run verify
```

`verify` runs script typechecking, script unit tests, and each `check:*` task in order. It stops at the first failure and prints the command to rerun while iterating.

## TypeScript and Tests

Repository scripts are TypeScript files executed with `tsx`.

Run the script type gate:

```bash
npm run typecheck:scripts
```

Run the script unit tests:

```bash
npm run test:scripts
```

The test runner discovers `tests/scripts/**/*.test.ts` automatically, so new script tests do not need a package script edit.

## Machine-readable diagnostics

Check scripts use the same human output by default. Pass `--json` to any check script for structured output:

```bash
npm run check:links -- --json
```

JSON output includes the check name, pass/fail status, and normalized diagnostics with `path`, `line`, `code`, and `message` fields when available. Markdown link diagnostics use stable codes such as `LINK_URI`, `LINK_FILE`, and `LINK_ANCHOR`; frontmatter diagnostics use stable `FM_*` codes such as `FM_MISSING`, `FM_KEY`, and `FM_ARTIFACT_STATUS`.

In GitHub Actions, `verify` requests JSON diagnostics from supported check scripts and emits workflow annotations for each structured error. Local `npm run verify` output stays line-oriented.

## Checks

| Script | Purpose |
| --- | --- |
| `npm run check:links` | Validate local Markdown links and anchors. |
| `npm run check:adr-index` | Confirm `docs/adr/README.md` matches the ADR files. |
| `npm run check:commands` | Confirm generated slash-command inventories are current. |
| `npm run check:script-docs` | Confirm TypeDoc-generated script API docs are current. |
| `npm run check:product-page` | Validate the public product page, local assets, upkeep checkbox, and Pages workflow. |
| `npm run check:workflow-docs` | Confirm core workflow docs and package scripts keep the tool contract visible. |
| `npm run check:frontmatter` | Validate required frontmatter on README entry points, state files, ADRs, and review artifacts. |
| `npm run check:specs` | Validate lifecycle `workflow-state.md` files and their artifact maps. |
| `npm run check:traceability` | Validate lifecycle artifact IDs and local traceability references. |

## Script Documentation

Scripts use TypeScript signatures plus short documentation comments as their source-level documentation. Public helpers exported from `scripts/lib/` should document their purpose, parameters, return values, and any meaningful thrown errors. Top-level CLI scripts should stay small and delegate reusable behavior to documented helpers when that behavior is worth preserving.

Generate Markdown script docs:

```bash
npm run docs:scripts
```

The generated files live in `docs/scripts/` and are checked in. Use the repair command when script comments or exported helpers change:

```bash
npm run fix:script-docs
```

## Generated Repairs

Run all deterministic generated-block repairs:

```bash
npm run fix
```

Use narrower repair commands when you only want one generated surface:

```bash
npm run fix:adr-index
npm run fix:commands
npm run fix:script-docs
```

Review the diff after any fix command, then rerun `npm run verify`.
