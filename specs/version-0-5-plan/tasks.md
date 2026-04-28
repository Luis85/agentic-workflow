---
id: TASKS-V05-001
title: Version 0.5 release and distribution plan — Tasks
stage: tasks
feature: version-0-5-plan
status: complete
owner: planner
inputs:
  - PRD-V05-001
  - SPECDOC-V05-001
created: 2026-04-28
updated: 2026-04-28
---

# Tasks — Version 0.5 release and distribution plan

### T-V05-001 — Decide release branch strategy

- **Description:** Choose Shape A plus `release/vX.Y.Z` branches or Shape B with `develop`; update branching docs and add an ADR if branch roles change.
- **Satisfies:** REQ-V05-001, NFR-V05-002, SPEC-V05-001
- **Owner:** architect
- **Estimate:** M

### T-V05-002 — Define package contract

- **Description:** Document package registry type, package name, scope, contents, visibility, version source, and support expectations before enabling publish.
- **Satisfies:** REQ-V05-005, NFR-V05-002, SPEC-V05-004
- **Owner:** pm
- **Estimate:** M

### T-V05-003 — Add release notes configuration

- **Description:** Add `.github/release.yml` categories and exclusions for GitHub generated release notes.
- **Satisfies:** REQ-V05-003, REQ-V05-004, SPEC-V05-003
- **Depends on:** T-V05-001
- **Owner:** dev
- **Estimate:** S

### T-V05-004 — Add release readiness check

- **Description:** Implement a deterministic release readiness check for version, tag, changelog, lifecycle release notes, package metadata, release config, and workflow permissions.
- **Satisfies:** REQ-V05-007, NFR-V05-003, SPEC-V05-005
- **Depends on:** T-V05-001, T-V05-002
- **Owner:** dev
- **Estimate:** M

### T-V05-005 — Test release readiness behavior

- **Description:** Add focused tests for valid releases, missing changelog entries, missing lifecycle release notes, package metadata drift, and unsafe workflow permissions.
- **Satisfies:** REQ-V05-007, NFR-V05-003, SPEC-V05-005
- **Depends on:** T-V05-004
- **Owner:** qa
- **Estimate:** M

### T-V05-006 — Add manual GitHub Release workflow

- **Description:** Add a `workflow_dispatch` release workflow that supports dry run, draft/pre-release mode, release notes generation, and release asset attachment without package publishing by default.
- **Satisfies:** REQ-V05-002, REQ-V05-003, REQ-V05-004, NFR-V05-001, NFR-V05-002, SPEC-V05-002, SPEC-V05-003
- **Depends on:** T-V05-003, T-V05-004
- **Owner:** dev
- **Estimate:** M

### T-V05-007 — Add package publish path

- **Description:** After package contract approval, update package metadata and extend the manual release workflow to publish the accepted package type to GitHub Packages with least-privilege permissions.
- **Satisfies:** REQ-V05-005, REQ-V05-006, NFR-V05-001, NFR-V05-002, SPEC-V05-004
- **Depends on:** T-V05-002, T-V05-006
- **Owner:** dev
- **Estimate:** L

### T-V05-008 — Add release operator guide

- **Description:** Document dry run, authorization, publish, rollback, failed publish recovery, and post-release cleanup for maintainers.
- **Satisfies:** REQ-V05-008, NFR-V05-004, SPEC-V05-006
- **Depends on:** T-V05-006, T-V05-007
- **Owner:** release-manager
- **Estimate:** M

### T-V05-009 — Update public distribution docs

- **Description:** Update README, `docs/specorator.md`, release docs, package docs, and product page language for GitHub Releases and GitHub Packages.
- **Satisfies:** REQ-V05-009, SPEC-V05-007
- **Depends on:** T-V05-006, T-V05-007, T-V05-008
- **Owner:** release-manager
- **Estimate:** M

### T-V05-010 — Run release dry run

- **Description:** Execute the release workflow in dry-run mode and record outputs in implementation and test artifacts without publishing a release or package.
- **Satisfies:** REQ-V05-002, REQ-V05-003, REQ-V05-007, REQ-V05-008, SPEC-V05-002, SPEC-V05-003, SPEC-V05-005, SPEC-V05-006
- **Depends on:** T-V05-006, T-V05-008
- **Owner:** qa
- **Estimate:** S

### T-V05-011 — Verify v0.5 release readiness

- **Description:** Run release readiness checks, targeted tests, link checks, package dry-run checks, and `npm run verify`; document skipped publish checks and remaining authorization needs.
- **Satisfies:** REQ-V05-001, REQ-V05-002, REQ-V05-006, REQ-V05-007, REQ-V05-008, REQ-V05-009, SPEC-V05-001, SPEC-V05-002, SPEC-V05-004, SPEC-V05-005, SPEC-V05-006, SPEC-V05-007
- **Depends on:** T-V05-005, T-V05-009, T-V05-010
- **Owner:** qa
- **Estimate:** S
