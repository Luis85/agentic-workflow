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

Use the tiered gates when iterating on a narrower surface:

```bash
npm run check:fast
npm run check:content
npm run check:workflow
npm run verify:changed
```

`check:fast` runs script typechecking, script tests, automation registry validation, and agent artifact validation. `check:content` covers Markdown, generated docs, frontmatter, Obsidian metadata/assets, and product-page drift. `check:workflow` covers workflow docs, spec state, roadmaps, traceability, automation registry, and agent artifacts. `verify:changed` inspects committed, staged, unstaged, and untracked files relative to `origin/main`, then runs the smallest mapped read-only check set for those paths.

Agents and CI adapters can request a machine-readable aggregate report:

```bash
npm run verify:json
```

The JSON report includes the failing check, diagnostics, and rerun command for each task.

## Automation Registry

The canonical inventory of local scripts, checks, fixers, workflows, skills, and operational agents lives at `tools/automation-registry.yml`. Validate it with:

```bash
npm run check:automation-registry
```

Registry entries record the command or path, purpose, read-only status, local safety, JSON support, intended users, and rerun command. Add or update the registry in the same PR as any new package script, GitHub workflow, skill, or operational agent.

When a check reports a missing surface, scaffold candidate entries with:

```bash
npm run automation:registry:discover
```

Use JSON when an agent or tool needs to consume the candidates:

```bash
npm run automation:registry:discover -- --json
```

Discovery output is intentionally not commit-ready: generated `purpose` values contain `TODO` markers, and `check:automation-registry` rejects those placeholders until a human or responsible agent writes the actual annotation.

## Agent Artifacts

Validate lifecycle agents, reusable skills, and operational agent prompts as product artifacts:

```bash
npm run check:agents
```

The check verifies required frontmatter and prompt sections so automation surfaces remain discoverable and consistent for humans and agents.

## Quality Metrics

Report deterministic quality KPIs for workflow deliverables, documentation, traceability, and QA checklists:

```bash
npm run quality:metrics
```

Scope the report to one feature:

```bash
npm run quality:metrics -- --feature <feature-slug>
```

Use JSON when another tool needs to consume the metrics:

```bash
npm run quality:metrics -- --json
```

Persist and compare trend snapshots:

```bash
npm run quality:metrics -- --save
npm run quality:metrics -- --compare
```

Metric interpretation guidance lives in `docs/quality-metrics.md`. The stage score is stage-aware: future lifecycle evidence is not treated as a defect while a workflow is still in progress. The maturity assessment is evidence-backed adoption guidance, not certification.

## Roadmap Evidence

Summarize the linked `specs/`, `projects/`, `portfolio/`, `discovery/`, and `quality/` artifacts named in a roadmap strategy:

```bash
npm run roadmap:evidence -- <roadmap-slug>
```

Use JSON when another agent or tool needs to consume the evidence report:

```bash
npm run roadmap:evidence -- <roadmap-slug> --json
```

## GitHub Project Setup

Plan or create the baseline GitHub labels, milestones, and issues for a new product/project repository:

```bash
npm run project:setup:github -- --project-name "Specorator" --profile obsidian-plugin --dry-run
```

Execute against a repository after reviewing the dry run:

```bash
npm run project:setup:github -- --repo Luis85/specorator --project-name "Specorator" --profile obsidian-plugin --execute
```

Profiles are `generic-product` and `obsidian-plugin`. P3.express initiation issues are included by default; pass `--no-p3` for tiny experiments that do not need sponsor, kickoff, go/no-go, or follow-up-register work.

## Roadmap Digest

Generate an audience-specific draft roadmap update from the roadmap strategy, board, delivery plan, and stakeholder map:

```bash
npm run roadmap:digest -- <roadmap-slug> <audience>
```

Common audiences are `leadership`, `delivery-team`, `customers`, and `sales-support`. Use JSON when another agent or tool needs the digest report:

```bash
npm run roadmap:digest -- <roadmap-slug> leadership --json
```

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

JSON output includes the check name, pass/fail status, and normalized diagnostics with `path`, `line`, `code`, and `message` fields when available. Markdown link diagnostics use stable codes such as `LINK_URI`, `LINK_FILE`, and `LINK_ANCHOR`; frontmatter diagnostics use stable `FM_*` codes such as `FM_MISSING`, `FM_KEY`, and `FM_ARTIFACT_STATUS`; Obsidian compatibility diagnostics use stable `OBS_*` codes such as `OBS_PROPERTY_DUPLICATE` and `OBS_FRONTMATTER_JSON`.

In GitHub Actions, `verify` requests JSON diagnostics from supported check scripts and emits workflow annotations for each structured error. Local `npm run verify` output stays line-oriented.

## Checks

| Script | Purpose |
| --- | --- |
| `npm run check:fast` | Run the fast local iteration gate. |
| `npm run check:content` | Run content and generated documentation integrity checks. |
| `npm run check:workflow` | Run workflow state, traceability, roadmap, and agent contract checks. |
| `npm run project:setup:github` | Plan or create GitHub labels, milestones, and baseline issues for a new product/project repository. |
| `npm run automation:registry:discover` | Emit candidate registry entries for newly discovered automation surfaces. |
| `npm run check:automation-registry` | Validate `tools/automation-registry.yml` against package scripts, workflows, skills, and operational agents. |
| `npm run check:agents` | Validate lifecycle agents, skills, and operational agents as product artifacts. |
| `npm run check:links` | Validate local Markdown links and anchors. |
| `npm run check:adr-index` | Confirm `docs/adr/README.md` matches the ADR files. |
| `npm run check:commands` | Confirm generated slash-command inventories are current. |
| `npm run check:script-docs` | Confirm TypeDoc-generated script API docs are current. |
| `npm run check:product-page` | Validate the public product page, local assets, upkeep checkbox, and Pages workflow. |
| `npm run check:workflow-docs` | Confirm core workflow docs and package scripts keep the tool contract visible. |
| `npm run check:frontmatter` | Validate required frontmatter on README entry points, state files, ADRs, and review artifacts. |
| `npm run check:obsidian` | Validate Markdown frontmatter follows the Obsidian metadata policy in `docs/obsidian-metadata.md`. |
| `npm run check:obsidian-assets` | Validate committed Obsidian `.base`/`.canvas` assets and reject tracked vault-local state. |
| `npm run check:specs` | Validate lifecycle `workflow-state.md` files and their artifact maps. |
| `npm run check:roadmaps` | Validate roadmap state frontmatter, dates, document maps, and required sections. |
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
npm run fix:obsidian
npm run fix:adr-index
npm run fix:commands
npm run fix:script-docs
```

Review the diff after any fix command, then rerun `npm run verify`.

`fix:obsidian` handles only safe mechanical repairs: quoting internal links in scalar property values, inline lists, and block-list items. See `docs/obsidian-metadata.md` for the source-compatible versus Properties-UI-safe distinction.
