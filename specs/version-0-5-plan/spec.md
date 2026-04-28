---
id: SPECDOC-V05-001
title: Version 0.5 release and distribution plan — Specification
stage: specification
feature: version-0-5-plan
status: accepted
owner: architect
inputs:
  - DESIGN-V05-001
created: 2026-04-28
updated: 2026-04-28
---

# Specification — Version 0.5 release and distribution plan

### SPEC-V05-001 — Release branching contract

- **Satisfies:** REQ-V05-001, NFR-V05-002
- **Behavior:** Documentation defines the release source branch, release branch naming, promotion path, tag source, and cleanup rules.
- **Acceptance:** A maintainer can identify where to branch from, where to merge, where to tag, and when to delete local and remote release branches.

### SPEC-V05-002 — Publish authorization contract

- **Satisfies:** REQ-V05-002, NFR-V05-001
- **Behavior:** Publish workflows require manual invocation, explicit release version input, explicit publish confirmation input, and least-privilege `permissions`.
- **Acceptance:** No workflow publishes a GitHub Release or Package on ordinary push or pull request events.

### SPEC-V05-003 — GitHub Release publication

- **Satisfies:** REQ-V05-003, REQ-V05-004, NFR-V05-002
- **Behavior:** Release automation creates or updates a GitHub Release from a version tag, supports draft/pre-release mode, uses generated release notes categories, and optionally attaches release assets.
- **Acceptance:** Release output links to the tag, commit SHA, changelog entry, and lifecycle release notes.

### SPEC-V05-004 — Package contract and publication

- **Satisfies:** REQ-V05-005, REQ-V05-006, NFR-V05-001, NFR-V05-002
- **Behavior:** Package publishing is disabled until a package contract defines registry type, name, scope, contents, visibility, version source, and support expectations.
- **Acceptance:** Once enabled, package publishing uses the authorized release workflow and publishes only versioned release artifacts to GitHub Packages.

### SPEC-V05-005 — Release readiness validation

- **Satisfies:** REQ-V05-007, NFR-V05-003
- **Behavior:** A deterministic check validates release version alignment, tag readiness, changelog entry, lifecycle release notes, package metadata, GitHub release configuration, and workflow permissions.
- **Acceptance:** The check fails before publish when release metadata is incomplete or inconsistent.

### SPEC-V05-006 — Release operator documentation

- **Satisfies:** REQ-V05-008, NFR-V05-004
- **Behavior:** Documentation gives maintainers a step-by-step release operator path covering dry run, authorization, publish, rollback, failed package publish recovery, and post-release cleanup.
- **Acceptance:** The guide names exact commands, GitHub workflow inputs, approval records, and cleanup actions.

### SPEC-V05-007 — Public distribution documentation

- **Satisfies:** REQ-V05-009
- **Behavior:** Public docs describe how users consume stable GitHub Releases and, when enabled, GitHub Packages.
- **Acceptance:** README, workflow docs, and product page language are accurate after v0.5 implementation.

## Test scenarios

| ID | Requirement | Scenario | Expected result |
|---|---|---|---|
| TEST-V05-001 | REQ-V05-001 | Review release branching docs for a v0.5 release. | Branch source, promotion path, tag source, and cleanup rules are explicit. |
| TEST-V05-002 | REQ-V05-002 | Inspect release workflow triggers and permissions. | Publish jobs require manual authorization and least-privilege permissions. |
| TEST-V05-003 | REQ-V05-003 | Run a dry-run release workflow. | Workflow validates release inputs without publishing shared state. |
| TEST-V05-004 | REQ-V05-004 | Generate release notes from labeled PRs. | PRs are grouped into configured Specorator categories. |
| TEST-V05-005 | REQ-V05-005 | Review package contract before package workflow is enabled. | Package registry, name, contents, visibility, and support promise are accepted. |
| TEST-V05-006 | REQ-V05-006 | Publish a package from an authorized release run. | Package version matches release tag and commit SHA. |
| TEST-V05-007 | REQ-V05-007 | Run release readiness with mismatched version metadata. | Check fails with stable diagnostics. |
| TEST-V05-008 | REQ-V05-008 | Follow the operator guide for a dry run. | Maintainer reaches a dry-run result without publishing. |
| TEST-V05-009 | REQ-V05-009 | Review public docs after implementation. | Release and package distribution language is current. |
