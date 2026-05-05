---
id: IDEA-CLI-001
title: Extract scripts into a dedicated specorator-cli package
stage: idea
feature: extract-scripts-cli
area: CLI
status: accepted
owner: analyst
created: 2026-05-05
updated: 2026-05-05
---

# Idea — Extract scripts into a dedicated specorator-cli package

## Problem

The `scripts/` directory has grown to 45+ TypeScript files with 37 `npm run` targets covering verification gates, content checks, fixers, reporting, and operational tooling. These scripts are currently bundled directly inside the `@luis85/agentic-workflow` template package with no `bin` entries — consumers can only invoke them via `npm run <target>` after cloning or installing the full template.

This coupling creates two friction points:

1. **Adopters can't use the tooling independently.** A team that wants to run `specorator verify` or `specorator check:fast` in their own CI must pull the entire template package — 170+ files — just to get the scripts.
2. **Template growth couples to CLI growth.** Every script addition or change forces a template version bump, even when the workflow methodology itself hasn't changed.

## Target users

- **Template adopters** who want to install Specorator's verify gate and check suite as a devDependency in their own project.
- **CI pipelines** that need a stable, versioned `specorator` binary without cloning the template.
- **Template maintainers** who want to evolve tooling independently from workflow methodology changes.

## Desired outcome

A `specorator-cli` package (or equivalent) that:

- Exposes a `specorator` binary (e.g. `specorator verify`, `specorator check:fast`, `specorator fix`).
- Can be installed standalone (`npm install -D @luis85/specorator-cli`) without pulling workflow docs, agent definitions, or template files.
- Preserves the current `npm run *` interface in the template repo so no adopter migration is required at distribution cut.
- Is versioned independently or in lockstep with the template — to be decided in the ADR.

## Constraints

- The current `npm run verify` gate must continue to work locally and in CI for the template repo itself.
- No breaking change to adopters on the `@luis85/agentic-workflow` npm package until a migration path is documented.
- The distribution model (same package + bin vs. separate package vs. monorepo workspace) requires an ADR before implementation.
- Scripts must remain deterministic and read-only unless named `fix:*` — moving them must not change their contract.
- New runtime dependencies in the CLI package require individual PR justification per `docs/specorator-product/tech.md`.

## Open questions

1. **Distribution model:** single package with `bin` entries vs. separate `@luis85/specorator-cli` package vs. npm workspace monorepo?
2. **Versioning contract:** does the CLI version track the template version or move independently?
3. **Template coupling:** does the template repo continue to vendor scripts, or does it install the CLI as a devDependency of itself?
4. **Scope of the first cut:** all 45 scripts, or a curated subset (verify gate + check suite + fix suite only)?
5. **Config discovery:** how does the CLI locate the repo root and template-specific config when run outside the template?

## Classification

- **Tooling** — distribution model, bin entries, package structure, CI pipeline changes.
- **Script** — lib organisation, entry-point consolidation.
- **ADR-required** — distribution model is architecturally load-bearing; affects the release pipeline and the adopter contract.
