---
id: DESIGN-V05-001
title: Version 0.5 release and distribution plan — Design
stage: design
feature: version-0-5-plan
status: accepted
owner: architect
inputs:
  - PRD-V05-001
created: 2026-04-28
updated: 2026-04-28
---

# Design — Version 0.5 release and distribution plan

## Release shape

v0.5 has four connected tracks:

1. **Branching strategy:** decide Shape A continuation versus Shape B promotion with `develop` and `main`.
2. **GitHub Release workflow:** publish tags, release notes, source archives, and optional assets.
3. **GitHub Packages workflow:** publish an accepted package type from release authority only.
4. **Operator documentation:** give maintainers a dry-run, publish, rollback, and recovery playbook.

v0.5 consumes v0.4 quality signals before publishing anything. Release automation should validate release metadata itself, but it should not duplicate CI, metrics, or maturity evidence collection from v0.4.

## Recommended branch model

Start by documenting both paths, then choose one before implementation:

| Option | Use when | Release source |
|---|---|---|
| Shape A plus release branch | The project still has low release cadence and wants minimal overhead. | `release/vX.Y.Z` PR merges to `main`; tag is cut from `main`. |
| Shape B with `develop` | The project has regular releases and needs `main` to represent only promoted releases. | `develop` integrates work; release PR promotes to `main`; tag is cut from `main`. |

For v0.5 planning, Shape A plus an explicit `release/vX.Y.Z` branch is the lower-risk first step. Shape B should be adopted only if maintainers accept the overhead of changing default integration behavior.

## Release workflow model

1. Maintainer prepares `release/vX.Y.Z` from the accepted integration branch.
2. Release readiness check validates version, changelog, lifecycle release notes, package metadata, and workflow permissions.
3. PR review and verify pass.
4. Maintainer merges or promotes the release commit to the release source branch.
5. Release readiness check consumes v0.4 quality signals and v0.5 release metadata checks.
6. Maintainer manually starts a GitHub Actions release workflow with version, tag, draft/pre-release flag, package publish flag, and authorization input.
7. Workflow creates or updates the GitHub Release, attaches assets when present, and publishes package only if authorized.
8. Release notes and post-release cleanup record the result.

## Release candidate path

The first publish path should support a release candidate before stable publication:

- Dry run: validate inputs without creating shared-state artifacts.
- Draft/pre-release: create a GitHub Release candidate and optionally skip package publish.
- Stable release: publish only after the release candidate and v0.4 quality signals are accepted.
- Recovery: prefer editing drafts, rerunning failed jobs, or superseding bad candidates over force-pushing tags.

## Package contract model

The first GitHub Package should have an explicit contract before automation exists:

| Decision | Required before publish |
|---|---|
| Registry type | npm package, container package, or deferred registry target. |
| Package name | Scoped GitHub-compatible name. |
| Contents | Which scripts, templates, docs, and metadata are included. |
| Visibility | Public/private and repository linkage. |
| Version source | `package.json`, tag, changelog, or release manifest. |
| Consumer promise | What downstream users can rely on and what remains template-only. |
| Install path | The command or URL consumers use to install or fetch the package. |

Given the current Node tooling, the likely first package is an npm package published to GitHub Packages after `private: true`, `name`, `publishConfig`, and files list decisions are resolved.

## Release package contents (fresh-surface contract)

The released package — whether the GitHub Release source archive or a future GitHub Package — ships as a **fresh-surface starter**. The rule is template-wide and applies to every release, not only v0.5. Source of truth: [ADR-0021](../../docs/adr/0021-release-package-fresh-surface.md). Canonical, template-wide methodology: [`docs/release-package-contents.md`](../../docs/release-package-contents.md).

Three exclusion classes:

1. **Documentation ships as stubs.** Every `docs/` page that ships in the released package keeps its title, frontmatter, top-level headings, and a one-paragraph statement of intent. Built-up content — accumulated examples, version-specific commentary, references to template-internal history — is replaced with `<!-- TODO: <what consumer fills in> -->` markers. Reference shape: [`templates/release-package-stub.md`](../../templates/release-package-stub.md).
2. **ADRs are excluded.** No `docs/adr/[0-9][0-9][0-9][0-9]-*.md` file ships. ADR numbering is project-local — the consumer's first ADR is `ADR-0001`, not a continuation of ours. `docs/adr/README.md` ships as a stub that explains how the consumer files their own ADRs; `templates/adr-template.md` ships unchanged.
3. **Intake folders ship empty.** Each of the 10 intake folders ships either absent or containing only a top-level `README.md`: `inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`. No per-feature subdirectories, no per-deal files, no per-engagement state, no per-cycle logs ship. `examples/` is **not** an intake folder and is unaffected.

The fresh-surface contract relates to the package-contract model (`Package contract model` above) as follows: the package contract names *what* ships under each registry / archive target; the fresh-surface contract names *what shape* the shipping content takes. The package-contract document (T-V05-002 deliverable, owned by `pm`) is the place where these rules become concrete include / exclude lists for the published archive.

The contract is enforced before publish. The release readiness check (T-V05-004 / SPEC-V05-005) asserts the three exclusion classes against the candidate archive; the manual release workflow (T-V05-006 / SPEC-V05-002) refuses publish until readiness passes. When a new intake folder is added to the template, the enumeration in [ADR-0021](../../docs/adr/0021-release-package-fresh-surface.md) and [`docs/release-package-contents.md`](../../docs/release-package-contents.md) must be updated in the same PR.

### Build-time transform pattern (T-V05-013)

The codebase form keeps every `docs/**/*.md` page in built-up shape — the maintainer surface. The released form ships every shipping `docs/**/*.md` page in stub shape — the consumer surface. Per [`docs/release-package-contents.md`](../../docs/release-package-contents.md) line 40, the codebase form remains as authored; the packaging step is responsible for producing the stub form on demand.

The build-time transform is a pure function: `(repo-root, file-list) → staged-tree`. The release workflow runs the transform before `npm pack` so the tarball reflects the released form. Layer 2 fresh-surface readiness (`scripts/check-release-package-contents.ts` from T-V05-012) validates the staged tree before the irreversible publish steps.

Pipeline shape:

1. Workflow step computes the file allowlist from `package.json#files` (via `npm pack --dry-run --json`) so the transform stays in lockstep with the canonical npm allowlist — no second source of truth for "what ships".
2. Builder classifies every file:
   - Numbered ADR (`docs/adr/[0-9][0-9][0-9][0-9]-*.md`) → omit (assertion 1).
   - Markdown under `docs/` except `docs/adr/templates/release-package-stub.md` itself → stubify (assertion 3).
   - Otherwise → copy as-is.
3. Stubify transform writes a fresh frontmatter block (`title` derived from the existing top-level heading or filename, `folder` derived from the file's parent path, `description` synthesised from the codebase frontmatter or the first paragraph, `entry_point: false`), preserves the `# ` heading, replaces the body with a single `<!-- TODO: ... -->` paragraph, preserves any `## ` section headings each followed by a `<!-- TODO: -->` marker, and appends the trailer from `templates/release-package-stub.md`.
4. Builder writes the staged tree under a build directory (defaults to `.release-staging/` under the repo root, configurable via `--out`).
5. Workflow step runs `npm pack ./.release-staging` so the resulting tarball reflects the staged tree.
6. Layer 2 readiness asserts assertions 1, 2, 3 against the extracted tree.

Defence-in-depth: `scripts/release-prepack-guard.mjs` is wired as the npm `prepack` lifecycle script. It refuses `npm pack` of `@luis85/agentic-workflow` from any cwd that lacks the `.release-staging-marker` file (written by `build:release-archive` at the root of the staged tree), so a maintainer who bypasses the build script and runs bare `npm pack` from the repo root fails closed before any tarball is produced. The guard is a no-op for any other package name, so a downstream fork that copies the template into a renamed package does not inherit the upstream-only constraint. `.npmignore` is no longer the primary defence for filtering ADRs — npm's `package.json#files` allowlist takes precedence over a top-level `.npmignore`, so paths inside `files`-listed directories cannot be excluded that way (Codex P2 on PR #202). The file is retained only for paths that are not in `files` (`.worktrees/`, `.release-staging/`).

Rationale for the staged-tree shape rather than a `prepack` lifecycle hook: `prepack` mutates the working tree before `npm pack` and would either need a paired `postpack` revert (race-prone) or commit the stub form into the codebase (loses maintainer surface). The staged-tree shape keeps the codebase untouched and makes the transform inspectable on the runner before the publish step.

## Affected surfaces

| Surface | Change type |
|---|---|
| `docs/branching.md` | Add release branch and promotion rules. |
| `docs/release-workflow.md` or equivalent | Add operator workflow and authorization model. |
| `.github/release.yml` | Configure generated release notes categories. |
| `.github/workflows/release.yml` | Add manual release and optional package publish workflow. |
| `package.json` | Define package identity, visibility, publish config, files, and version rules if npm package is accepted. |
| `scripts/check-release-readiness.ts` | Add deterministic pre-publish validation. |
| `tests/scripts/` | Add release readiness tests. |
| `CHANGELOG.md` | Align release entries with tags and GitHub Releases. |
| `README.md`, `docs/specorator.md`, `sites/index.html` | Update public release and package positioning when implemented. |
| `specs/version-0-4-plan/` | Consume quality-signal handoff from CI/metrics/maturity work. |
| `docs/release-package-contents.md` (new) | Canonical, template-wide fresh-surface contract for released artifacts (per ADR-0021). |
| `scripts/check-release-package-contents.ts` (new, future T-V05-004 surface) | Validate the published archive against ADR-0021 exclusion classes. |
| `templates/release-package-stub.md` (new) | Reference stub shape for docs that ship in the released package. |
| `scripts/build-release-archive.ts` + `scripts/lib/release-archive-builder.ts` + `scripts/lib/release-stubify.ts` (new, T-V05-013 surface) | Build-time transform that produces the released form on a runner-local staging dir. |
| `.npmignore` (new) | Belt-and-braces exclusion for paths NOT in `package.json#files` (`.worktrees/`, `.release-staging/`). Top-level `.npmignore` cannot filter `files`-listed paths (Codex P2 on PR #202). |
| `scripts/release-prepack-guard.mjs` (new, T-V05-013 round-2 surface) | Prepack lifecycle guard — refuses `npm pack` of `@luis85/agentic-workflow` from any cwd that lacks the `.release-staging-marker`, so bare `npm pack` from the repo root fails closed. Plain ESM so it runs under `node` without `tsx` (the staged tree has no `node_modules`). |
| `scripts/lib/release-staging-safety.ts` (new, T-V05-013 round-2 surface) | Reusable helpers — `STAGING_MARKER_FILE`, `assertSafeOutDir`, `writeStagingMarker`, `hasStagingMarker`. The `assertSafeOutDir` guard refuses to clean a `--out` target that resolves to the filesystem root, repo root, repo parent, user home, an ancestor of the repo root, or any non-empty existing dir without the marker (Codex P1 on PR #202). |

## Authorization boundary

Release and package publication are irreversible shared-state operations. Automation may prepare, validate, draft, or dry-run without special approval, but publishing must require human authorization in the workflow inputs and release notes.

## ADR impact

An ADR is likely required if implementation adopts Shape B with `develop`, changes the canonical release branch, or commits the project to a public package contract. If v0.5 only documents Shape A release branches and adds manual publish automation, an ADR may be optional.

## Risks and mitigations

- RISK-V05-001: Use manual workflow dispatch and least-privilege workflow permissions.
- RISK-V05-002: Require a package contract before editing publish settings.
- RISK-V05-003: Do not introduce `develop` unless release cadence and maintainer capacity justify it.
- RISK-V05-004: Treat lifecycle `release-notes.md` as curated input to GitHub Release notes.
- RISK-V05-005: Add pre-publish release readiness checks before enabling publish.
- RISK-V05-006: Use release candidates and draft releases to avoid making the first stable package publish the first end-to-end exercise.
