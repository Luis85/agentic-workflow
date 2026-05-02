---
id: PKG-CONTRACT-V05-001
title: Version 0.5 package contract
stage: implementation
feature: version-0-5-plan
status: draft
owner: pm
inputs:
  - PRD-V05-001
  - SPECDOC-V05-001
  - ADR-0020
  - ADR-0021
created: 2026-05-02
updated: 2026-05-02
---

# Version 0.5 package contract

## 1. Purpose

This document is the T-V05-002 deliverable. It defines the GitHub Package identity, registry target, contents, visibility, version source, and consumer promise that must be accepted and recorded before the publish step in the manual release workflow is enabled.

No package is published until a human maintainer reviews this contract and the package workflow is explicitly enabled. This gate is required by REQ-V05-005 (define package contract) and REQ-V05-012 (released package = fresh-surface starter). The contract is the prerequisite described in SPEC-V05-004 ("package publishing is disabled until a package contract defines registry type, name, scope, contents, visibility, version source, and support expectations").

## 2. Registry and identity

| Decision | Value |
|---|---|
| Registry type | GitHub Packages — npm registry endpoint (`https://npm.pkg.github.com`). |
| Package name | `@luis85/agentic-workflow` |
| Scope | `@luis85` — matches the GitHub organization/user login `Luis85` (case-normalized to lowercase per npm scoped-package convention). |
| Repository linkage | `package.json#repository` must point to `https://github.com/Luis85/agentic-workflow`. |
| Visibility | Public. The template is MIT-licensed and open source; the package is public on GitHub Packages. If the repository visibility is changed to private before v0.5 ships, this field must be updated and the package workflow must be reviewed — flag as OQ-V05-001 below until confirmed. |
| Registry endpoint in `package.json` | `"publishConfig": { "registry": "https://npm.pkg.github.com" }` |

The scoped name `@luis85/agentic-workflow` is GitHub-Packages-compatible. GitHub Packages requires the scope to match the publishing user or organization; `@luis85` satisfies that requirement for the `Luis85` account.

## 3. Contents (include list)

The released package ships as a **fresh-surface starter** per ADR-0021 and REQ-V05-012. The include list below is the concrete result of that contract applied to this repository's layout.

| Path | Shape in released package |
|---|---|
| `.claude/` | Ships as authored — agent definitions, skills, memory index, settings, commands. |
| `.codex/` | Ships as authored — Codex context and instructions. |
| `.github/` | Ships as authored — CI workflows, release config, Dependabot, PR template. |
| `agents/` | Ships as authored — operational bot `PROMPT.md` and `README.md` files. |
| `docs/` | Ships with every page in **stub form** (see §4 Exclusions for ADR files). Each page keeps title, frontmatter, top-level headings, and a one-paragraph intent statement. Built-up content replaced by `<!-- TODO: ... -->` markers. Reference shape: `templates/release-package-stub.md`. |
| `docs/adr/README.md` | Ships as stub — explains to the consumer how to file their own ADRs starting at `ADR-0001`. |
| `docs/glossary/` | Ships with each term file in stub form. |
| `examples/` | Ships as authored — demonstration zone, not an intake folder (see ADR-0021 §3). |
| `memory/` | Ships as authored — `constitution.md` and any project-agnostic governance files. |
| `sites/` | Ships as authored — `index.html` product page. |
| `templates/` | Ships as authored — all template files including `adr-template.md`, `release-package-stub.md`, `prd-template.md`, etc. Templates are what consumers fill in for their own artifacts. |
| `CHANGELOG.md` | Ships as authored — consumers start with a visible changelog structure they can continue. |
| `CLAUDE.md` | Ships as authored. |
| `AGENTS.md` | Ships as authored. |
| `LICENSE` | Ships as authored. |
| `README.md` | Ships as authored. |
| `package.json` | Ships with v0.5 identity fields (`name`, `version`, `publishConfig`, `repository`, `files`). |
| `package-lock.json` | Codebase form retained for day-to-day development; **not** shipped under this name (`npm pack` strips `package-lock.json` even when listed in `files`, and the runner's npm version does not auto-include it). The publication-canonical lockfile is `npm-shrinkwrap.json` — see the next row. |
| `npm-shrinkwrap.json` | Ships in the published archive. The release workflow stages it from `package-lock.json` (`cp package-lock.json npm-shrinkwrap.json`) on the runner before `npm pack` runs, and `package.json#files` lists it so the allowlist permits it. The shrinkwrap is byte-equal to `package-lock.json` at publish time, so consumers running `npm ci` get the same deterministic dependency tree the maintainers used. The runner is ephemeral so no codebase cleanup is needed. |
| `tsconfig.json`, `tsconfig.scripts.json` | Ship as authored. |
| `scripts/` | Ships as authored — TypeScript release readiness and validation scripts. |
| `tests/` | Ships as authored — test files for release readiness scripts. |

**Intake folders (empty-surface shape):**

| Folder | What ships |
|---|---|
| `inputs/` | `inputs/README.md` only (stub). No ingested work packages. |
| `specs/` | `specs/README.md` only (stub or absent). No `specs/<slug>/`. |
| `discovery/` | `discovery/README.md` only (or absent). |
| `projects/` | `projects/README.md` only (or absent). |
| `portfolio/` | `portfolio/README.md` only (or absent). |
| `roadmaps/` | `roadmaps/README.md` only (or absent). |
| `quality/` | `quality/README.md` only (or absent). |
| `scaffolding/` | `scaffolding/README.md` only (or absent). |
| `stock-taking/` | `stock-taking/README.md` only (or absent). |
| `sales/` | `sales/README.md` only (or absent). |

Full enumeration and rationale: `docs/release-package-contents.md`.

## 4. Exclusions (do-not-ship list)

| Path / glob | Reason excluded |
|---|---|
| `docs/adr/[0-9][0-9][0-9][0-9]-*.md` (all numbered ADR files) | ADR numbering is project-local. The consumer's first ADR must be their own `ADR-0001`, not a continuation of the template's history. |
| `specs/<slug>/` (all per-feature subdirectories) | Intake folder state. The consumer's first feature must be their `specs/<their-feature>/`. |
| `discovery/<sprint>/`, `projects/<slug>/`, `portfolio/<slug>/`, `roadmaps/<slug>/`, `quality/<review>/`, `scaffolding/<slug>/`, `stock-taking/<slug>/`, `sales/<deal>/` | Per-engagement state for every intake track. Same rationale: project-local state must not ship. |
| `inputs/<any files except README.md>` | Ingested work packages are project-specific; the orientation `README.md` is the only orientation artifact that helps a fresh consumer. |
| `.worktrees/` | Local developer worktrees; not meaningful to consumers. |
| Any file not covered by the `files` field in `package.json` | `package.json#files` is the authoritative include list for npm publish; anything not listed is excluded by npm automatically. |

Source of truth for all exclusion rules: [ADR-0021](../../docs/adr/0021-release-package-fresh-surface.md).

## 5. Version source

The published package version is sourced from `package.json#version`. The mapping rule:

- `package.json#version` (e.g. `0.5.0`) must equal the git tag without a leading `v` (i.e. git tag `v0.5.0` corresponds to `package.json#version` `0.5.0`).
- This equality is enforced by the release readiness check (T-V05-004 / SPEC-V05-005) before publish is authorized.
- The git tag is cut from `main` after the release branch is merged (per ADR-0020 — release tag is cut from `main`).
- The CHANGELOG entry must reference the same version string.

No other version source is consulted for the npm package. The `version` field in `package.json` is the single source of truth; the tag mirrors it.

## 6. Consumer promise and support expectations

### What consumers can rely on

- **Workflow stages (Stages 1–11).** The slash-command surface (`/spec:start` through `/spec:retro`), the stage inputs/outputs contract documented in `docs/specorator.md`, and the agent role boundaries in `.claude/agents/` are the primary deliverable. Consumers can build on this surface.
- **Agent contracts.** Each agent's `PROMPT.md` defines its scope, tool list, and output artifacts. These are stable within a major release.
- **Skill entry points.** Skills in `.claude/skills/` are how-tos that agents and users invoke. The skill trigger words and entry-point files are stable within a major release.
- **Template files.** Everything under `templates/` ships unchanged and is designed for consumer customization. The stub shape (`templates/release-package-stub.md`) and ADR template (`templates/adr-template.md`) in particular are designed for long-term consumer use.
- **Governance files.** `memory/constitution.md`, `AGENTS.md`, `CLAUDE.md`, and the steering docs under `docs/steering/` ship as the intended starting-point governance for the consumer's own project.

### What is template-only (not a consumer-facing stability promise)

- **`specs/version-0-5-plan/` and all other historic spec folders.** These do not ship (intake folders excluded per §4). Historic spec work is for the template maintainers, not for consumers.
- **Operational bot schedules and config.** `agents/operational/` ships as authored, but the scheduled cadences (cron expressions) are calibrated for the template's own maintenance rhythm. Consumers should adapt them.
- **This repository's CI workflows (`.github/workflows/`).** They ship so consumers have a working starting point, but the exact job names, environment variables, and permissions are calibrated for the `Luis85/agentic-workflow` repository. Consumers will need to adapt them.
- **`sites/index.html`.** Ships as authored; consumers should replace it with their own product page.

**No long-term API stability guarantee** is made at this stage for the `specs/` folder layout, the `workflow-state.md` schema, or the agent `PROMPT.md` format. Consumers who fork and adapt should expect churn in these surfaces across major releases.

## 7. Install path

For v0.5, the install path is **manual install + manual file copy**. There is no scaffolder CLI yet.

The package is published to **GitHub Packages** (registry endpoint `https://npm.pkg.github.com`), not to the public npm registry, so the default `npm install` command alone cannot resolve it. Consumers must configure scope-to-registry mapping and authentication first.

### Prerequisites

1. **Generate a GitHub Personal Access Token (Classic) with the `read:packages` scope.** A fine-grained token with the equivalent `Packages: read` repository permission also works. Even when the package and repository are public, GitHub Packages requires authenticated reads.
2. **Make the token available to npm.** Either set `NODE_AUTH_TOKEN` in the consumer's environment (in CI) or add a line to `~/.npmrc` (locally):

   ```ini
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   ```

3. **Map the `@luis85` scope to GitHub Packages** by adding the following line to the consumer project's `.npmrc` (committed at the project root):

   ```ini
   @luis85:registry=https://npm.pkg.github.com
   ```

### Install

With the prerequisites in place:

```bash
npm install --save-dev @luis85/agentic-workflow
```

After install, the consumer copies the relevant template files from `node_modules/@luis85/agentic-workflow/` into their repository. A scaffolder (`npm create @luis85/agentic-workflow`) is a post-v0.5 goal and is **not** promised in this contract. Consumers must not depend on a scaffolder entry point until a future package contract version explicitly adds one.

**Note:** This contract does not over-promise. Manual copy is the supported path for v0.5. The GitHub Packages auth requirement applies even for public packages — consumers without `read:packages` token configuration will see `401 Unauthorized` from `npm install`.

## 8. Authorization

Publishing is gated by explicit human authorization in the workflow dispatch inputs, as required by REQ-V05-002 and SPEC-V05-002. No automatic publish occurs from push or pull request events. The publish step in the release workflow is enabled only after this contract is accepted by a human maintainer.

## 9. Open questions

| ID | Question | Blocks | Must close before |
|---|---|---|---|
| OQ-V05-001 | Repository visibility. The contract assumes `Luis85/agentic-workflow` is public. If the repository is set to private before v0.5 ships, the package visibility in §2 must be revisited and the package workflow reviewed for token scope. | §2 visibility field, package workflow config | First publish run |
| OQ-V05-002 | `package.json#files` field. The exact glob list for npm's `files` include list must be confirmed once all v0.5 files are in place. The include list in §3 is the intended surface; the `files` field in `package.json` must match it precisely before publish. | §4 exclusions (npm auto-excludes non-listed files) | T-V05-004 release readiness check implementation |
| OQ-V05-003 | Stub-form automation. §3 documents that `docs/` ships in stub form, but the packaging step that produces stubs from codebase form is not yet automated. Until it is, the release-manager strips manually using `docs/release-package-contents.md` as the checklist. This must be flagged in the operator guide (T-V05-006). **Closed 2026-05-02 by T-V05-013** — `scripts/build-release-archive.ts` produces the staged tree under `.release-staging/` from the canonical `package.json#files` allowlist; numbered ADRs filtered, every shipping `docs/**/*.md` page stubified via `scripts/lib/release-stubify.ts`. The release workflow's step 5 calls the builder before `npm pack`; step 10 publishes the byte-identical staged tarball. Maintainers no longer strip manually. | Manual release operator guide | First stable publish |

## 10. Change log

| Date | Change | Author |
|---|---|---|
| 2026-05-02 | Initial draft — T-V05-002 deliverable. Package identity, contents, exclusions, version source, consumer promise, install path, and open questions established. | pm |
| 2026-05-04 | Clarified §3 lockfile shipping: the publication-canonical lockfile is `npm-shrinkwrap.json` (staged from `package-lock.json` by the release workflow), not `package-lock.json` directly. `npm pack` strips `package-lock.json` even when listed in `files`. T-V05-007 implementation surfaced the gap; resolves Codex round-3 P2 on PR #160 (lockfile actually ships under the canonical publication name, byte-equal to the codebase `package-lock.json`). | orchestrator |
| 2026-05-02 | OQ-V05-003 closed by T-V05-013 — strip-and-stubify packaging step is now automated via `scripts/build-release-archive.ts` (with `scripts/lib/release-archive-builder.ts` and `scripts/lib/release-stubify.ts`). `.github/workflows/release.yml` step 5 calls the builder before `npm pack`; step 10 publishes the byte-identical staged tarball so the published archive equals the GitHub Release asset and reflects the build-time transform. Maintainers no longer strip manually. | dev |
