---
id: IDEA-V05-001
title: Version 0.5 release and distribution plan
stage: idea
feature: version-0-5-plan
status: accepted
owner: analyst
created: 2026-04-28
updated: 2026-04-28
---

# Idea — Version 0.5 release and distribution plan

## Problem

Specorator has plans for examples, validation, CI gates, metrics, and maturity signals, but it still lacks a proper release and distribution workflow. The repository currently behaves like a template project with a `main` integration branch and a private npm package, while GitHub provides first-class Releases and Packages features that could make versions easier to discover, install, audit, and promote.

## Target users

- Maintainers who need a repeatable release process with tags, notes, assets, and rollback rules.
- Contributors who need clear branch promotion rules before release work begins.
- Adopters who want stable versioned artifacts, not only the latest `main` branch.
- Automation agents that need an explicit authority boundary for publishing releases and packages.

## Desired outcome

v0.5 should define and prepare a release workflow that uses GitHub Releases for canonical version publication and GitHub Packages for installable package distribution, with a branching strategy that separates integration, release preparation, and published versions.

## Constraints

- Publishing a release, tag, or package is shared-state work and requires explicit human authorization.
- Do not publish from ordinary feature branches.
- Preserve local-first verification and PR review before release promotion.
- Avoid changing the current branch model until the release workflow is documented and accepted.
- Package naming, scope, visibility, and registry target must be explicit before implementation.

## Open questions

- Should v0.5 introduce a permanent `develop` branch now, or define the release workflow while staying on Shape A until the first published release?
- Should the GitHub Package be an npm package for tooling/templates, a container package for automation, or both over time?
- What package name and scope should be used: `@luis85/agentic-workflow`, `@luis85/specorator`, or another scoped name?
- Should v0.5 publish a draft/pre-release first, then a stable release after a dry run?
