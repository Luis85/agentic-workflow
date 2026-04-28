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
5. Maintainer manually starts a GitHub Actions release workflow with version, tag, draft/pre-release flag, and package publish flag.
6. Workflow creates or updates the GitHub Release, attaches assets when present, and publishes package only if authorized.
7. Release notes and post-release cleanup record the result.

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

Given the current Node tooling, the likely first package is an npm package published to GitHub Packages after `private: true`, `name`, `publishConfig`, and files list decisions are resolved.

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
