---
id: ADR-0034
title: Expose specorator scripts as a CLI binary via bin entry in the existing package
status: accepted
date: 2026-05-05
area: CLI
deciders: [luis85]
supersedes: ~
superseded-by: ~
---

# ADR-0034 — Expose specorator scripts as a CLI binary via bin entry in the existing package

## Context

The `scripts/` directory has grown to 45+ TypeScript files with 37 `npm run` targets. There are no `bin` entries in `package.json` — all scripts are invoked exclusively via `npm run <target>`. Adopters who want to use the verify gate or check suite in their own CI must clone or install the full template package.

Three distribution models were evaluated (see `specs/extract-scripts-cli/research.md`):

- **Option A — bin in existing `@luis85/agentic-workflow`:** add a `bin` field and a thin dispatcher entry point; no package restructuring.
- **Option B — separate `@luis85/specorator-cli` package:** independent npm package containing scripts only; separate publish pipeline and version coordination.
- **Option C — npm workspaces monorepo:** move scripts to `packages/cli/`, template to `packages/template/`; full workspace restructuring.

The critical pre-extraction technical risk (regardless of option) is that `scripts/lib/repo.ts` derives `repoRoot` from `import.meta.url`, which breaks when scripts run from inside `node_modules/`.

## Decision

Adopt **Option A**: add a `bin` entry pointing at a new `scripts/cli.ts` dispatcher, fix `repoRoot` discovery in `scripts/lib/repo.ts` to walk up from `process.cwd()`, and move `tsx` from `devDependencies` to `dependencies`. No package restructuring.

## Rationale

1. **No restructuring cost.** All 45 scripts remain in `scripts/`; all `npm run` aliases remain unchanged; the single publish pipeline remains unchanged. The only new file is `scripts/cli.ts`.
2. **Root discovery fix is required regardless.** The `import.meta.url`-based `repoRoot` will break in any installation context. Option A forces this fix early with minimal blast radius.
3. **The "install CLI without template" use case has not materialised.** The concrete user need that would justify Options B or C — a team that wants the tooling but not the workflow docs — is speculative at v0.5. Option A delivers the binary immediately; Options B/C can be revisited once the bin interface stabilises and adoption data exists.
4. **Single-package precedent (Prettier, Biome).** Tools with a cohesive surface area sustain the single-package model without user confusion. Specorator's scripts and template are always co-installed today.
5. **Lockstep versioning is the simplest correct default.** With one package, there is no version-compatibility matrix to maintain.

## Alternatives considered

**Option B — separate `@luis85/specorator-cli`**
- Pros: lean install for CLI-only consumers; independent release cadence.
- Cons: second publish job; peer-dep version coordination; path assumption fixes required in both packages; no demonstrated user need yet.
- Decision: deferred. File a new ADR to supersede this one when the CLI-only install case is confirmed.

**Option C — npm workspaces monorepo**
- Pros: maximum flexibility; independent versioning with Changesets.
- Cons: significant repo restructuring; workspace-aware CI; all `../..` relative imports in `scripts/lib/` must be audited and updated; highest setup cost.
- Decision: deferred. Warranted only if the repo grows to two or more independently consumable packages with diverging release cadences.

## Consequences

### Positive
- `specorator verify`, `specorator check:fast`, etc. become available as bin commands after `npm install`.
- `npm run verify` and all existing `npm run *` aliases continue to work unchanged.
- The `repoRoot` walk-up fix is a correctness improvement for any future installed context.
- No CI, release pipeline, or package restructuring required.

### Negative / trade-offs
- `tsx` moves from `devDependencies` to `dependencies`, adding it to the installed package's dependency footprint. This is necessary for the bin shebang to work without a build step.
- Adopters installing `@luis85/agentic-workflow` for CLI use still download the full template corpus (docs, agents, skills, templates). This is the deferred cost of Option A vs. B/C.
- `scripts/lib/repo.ts` is a shared module; the `repoRoot` change must be tested against all 45 scripts to confirm no regressions.

### Deferred
- Separate `@luis85/specorator-cli` package (supersedes this ADR when adopted).
- Monorepo workspace restructuring.
- Pre-compiling scripts to plain JS (removes `tsx` from runtime dependencies).
- Global install support (`npm install -g specorator`).
