---
id: RESEARCH-V05-001
title: Version 0.5 release and distribution plan — Research
stage: research
feature: version-0-5-plan
status: accepted
owner: analyst
inputs:
  - IDEA-V05-001
created: 2026-04-28
updated: 2026-04-28
---

# Research — Version 0.5 release and distribution plan

## Context

The repository already documents two branch shapes in `docs/branching.md`: Shape A uses `main` as integration plus release, while Shape B adds `develop` as integration and keeps `main` for tagged release commits. The current `package.json` is private and versioned `0.2.0`, so it is not yet ready to publish as a GitHub Package. Existing GitHub workflows cover Pages and verification, but there is no release workflow.

## GitHub platform notes

- GitHub Releases package software with release notes and links to binary files; releases are based on Git tags and include automatic zip and tarball source archives. See GitHub Docs: <https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases>.
- GitHub can automatically generate release notes with merged pull requests, contributors, and a changelog link, and `.github/release.yml` can customize categories and exclusions. See GitHub Docs: <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes>.
- GitHub Actions can publish packages to GitHub Packages as part of CI/CD when quality standards pass. Workflows should use `GITHUB_TOKEN` where supported, and repository-scoped registries need `contents: read` plus `packages: write`. See GitHub Docs: <https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions>.

## Alternatives

### Alternative A — Release workflow first, package publishing second

Define the release branch/tag/release process, release notes categories, and authorization rules first. Then add package publishing once package identity and contents are explicit.

**Pros:** Establishes governance before irreversible publishing and avoids publishing an ill-defined package.

**Cons:** Does not immediately exercise GitHub Packages unless the plan includes a dry-run package workflow.

### Alternative B — Publish npm package directly from tags

Convert `package.json` to a publishable scoped package and add a tag-triggered workflow that creates a GitHub Release and publishes to GitHub Packages.

**Pros:** Takes advantage of GitHub Releases and Packages quickly.

**Cons:** Higher risk because package contents, name, visibility, and support contract are not yet defined.

### Alternative C — Release assets only, defer GitHub Packages

Use GitHub Releases with generated notes and attached release artifacts, but do not publish any package.

**Pros:** Low risk and matches template distribution well.

**Cons:** Does not satisfy the goal of taking advantage of GitHub Packages.

## Recommendation

Choose Alternative A with a strict v0.5 implementation sequence: define the release workflow and branching strategy, define the package contract, add dry-run validation, then add human-authorized publish automation. The release should use GitHub Releases as the canonical version record and GitHub Packages as the installable distribution channel once the package contract is accepted.

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RISK-V05-001 | A workflow publishes a release or package without explicit human approval. | high | Require manual `workflow_dispatch`, protected environments, and documented authorization before publish jobs run. |
| RISK-V05-002 | The package name or contents create a support contract the project is not ready to honor. | high | Add package contract and package contents review before publish automation. |
| RISK-V05-003 | Introducing `develop` too early adds process overhead without release value. | medium | Gate Shape B adoption on an accepted release cadence and first release dry run. |
| RISK-V05-004 | Release notes duplicate or conflict with lifecycle `release-notes.md`. | medium | Map lifecycle release notes into GitHub release notes and configure `.github/release.yml` categories. |
| RISK-V05-005 | Tags, package versions, and changelog entries drift. | medium | Add deterministic checks for version, tag, changelog, release notes, and package metadata alignment. |

## Sources

- `docs/branching.md`
- `templates/release-notes-template.md`
- `package.json`
- GitHub Docs: About releases
- GitHub Docs: Automatically generated release notes
- GitHub Docs: Publishing and installing a package with GitHub Actions
