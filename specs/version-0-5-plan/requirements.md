---
id: PRD-V05-001
title: Version 0.5 release and distribution plan
stage: requirements
feature: version-0-5-plan
status: accepted
owner: pm
inputs:
  - IDEA-V05-001
  - RESEARCH-V05-001
created: 2026-04-28
updated: 2026-04-28
---

# PRD — Version 0.5 release and distribution plan

## Summary

Plan v0.5 as the release and distribution release: define the branching strategy, release workflow, package contract, and GitHub automation needed to publish Specorator through GitHub Releases and GitHub Packages without bypassing human authorization.

## Goals

- Make GitHub Releases the canonical public version record.
- Make GitHub Packages the installable package distribution channel once package identity is accepted.
- Define a branching and promotion strategy suitable for real releases.
- Add pre-publish validation so versions, tags, release notes, changelog, and package metadata stay aligned.
- Keep publish operations manually authorized and auditable.
- Consume v0.4 quality signals before any release or package publish operation.

## Non-goals

- No automatic publish from ordinary pushes or feature PRs.
- No publication to npmjs.com in v0.5.
- No package deletion or restore automation.
- No hidden release actions outside GitHub Actions or documented maintainer steps.
- No guarantee that `develop` is introduced unless the release strategy accepts Shape B.

## Functional requirements (EARS)

### REQ-V05-001 — Define release branching strategy

- **Pattern:** ubiquitous
- **Statement:** The repository shall define the branch model used for versioned releases, including integration branch, release branch, tag source, and promotion rules.
- **Acceptance:** Documentation states whether v0.5 keeps Shape A or adopts Shape B, and names the exact branches used for release preparation and publishing.
- **Priority:** must
- **Satisfies:** IDEA-V05-001

### REQ-V05-002 — Protect release authority

- **Pattern:** unwanted behavior
- **Statement:** When a workflow publishes a GitHub Release or GitHub Package, the repository shall require explicit human authorization before the publish step runs.
- **Acceptance:** Publish workflows use manual dispatch, documented authorization, and least-privilege permissions.
- **Priority:** must
- **Satisfies:** RESEARCH-V05-001

### REQ-V05-003 — Create GitHub Release workflow

- **Pattern:** event-driven
- **Statement:** When an authorized maintainer starts a release, the repository shall create or update a GitHub Release from the accepted release tag and release notes.
- **Acceptance:** The workflow supports draft or pre-release mode, generated release notes categories, release assets when available, and a stable mapping from lifecycle `release-notes.md` to GitHub release content.
- **Priority:** must
- **Satisfies:** RESEARCH-V05-001

### REQ-V05-004 — Configure generated release notes

- **Pattern:** ubiquitous
- **Statement:** The repository shall configure GitHub generated release notes so merged PRs are grouped into meaningful Specorator release categories.
- **Acceptance:** `.github/release.yml` maps labels or fallback categories to release-note sections and excludes non-user-facing maintenance when appropriate.
- **Priority:** should
- **Satisfies:** RESEARCH-V05-001

### REQ-V05-005 — Define package contract

- **Pattern:** ubiquitous
- **Statement:** The repository shall define the GitHub Package name, scope, registry type, visibility, contents, and support expectations before publishing.
- **Acceptance:** The package contract explains whether the first package is an npm package, a container package, or another supported GitHub Packages registry target.
- **Priority:** must
- **Satisfies:** IDEA-V05-001

### REQ-V05-006 — Publish GitHub Package from release authority only

- **Pattern:** event-driven
- **Statement:** When an authorized release publish succeeds and package metadata is valid, the repository shall publish the package version to GitHub Packages from the release workflow.
- **Acceptance:** The package workflow uses `GITHUB_TOKEN` where supported, grants only required permissions, and publishes only versioned release artifacts.
- **Priority:** must
- **Satisfies:** RESEARCH-V05-001

### REQ-V05-007 — Validate release readiness

- **Pattern:** ubiquitous
- **Statement:** The repository shall provide a deterministic pre-publish check for release readiness.
- **Acceptance:** The check validates version, tag, changelog, lifecycle release notes, package metadata, release workflow configuration, and package workflow permissions before publish.
- **Priority:** must
- **Satisfies:** RESEARCH-V05-001

### REQ-V05-008 — Document release operator workflow

- **Pattern:** ubiquitous
- **Statement:** The repository shall document the human release operator workflow from release branch preparation through GitHub Release and GitHub Package publication.
- **Acceptance:** Documentation includes dry run, authorization, publish, rollback, failed publish recovery, and post-release cleanup steps.
- **Priority:** must
- **Satisfies:** IDEA-V05-001

### REQ-V05-009 — Keep public positioning current

- **Pattern:** event-driven
- **Statement:** When v0.5 introduces release and package distribution, the release shall review public documentation and the product page for stale installation, versioning, or distribution language.
- **Acceptance:** README, `docs/specorator.md`, release docs, and `sites/index.html` are updated or explicitly marked unaffected.
- **Priority:** should
- **Satisfies:** IDEA-V05-001

### REQ-V05-010 — Consume v0.4 quality gates before publish

- **Pattern:** unwanted behavior
- **Statement:** When an authorized release workflow is asked to publish a GitHub Release or Package, the workflow shall require v0.4 release-quality signals to be green or explicitly waived by the human release operator.
- **Acceptance:** Publish documentation and readiness checks require CI status, validation status, open blockers, open clarifications, and maturity evidence before publishing.
- **Priority:** must
- **Satisfies:** RESEARCH-V05-001

### REQ-V05-011 — Support release candidate dry runs

- **Pattern:** event-driven
- **Statement:** When a maintainer prepares the first v0.5 release, the repository shall support a release-candidate dry run before stable publication.
- **Acceptance:** The operator workflow can create or validate a draft/pre-release candidate without publishing a stable package, and records the result in release artifacts.
- **Priority:** should
- **Satisfies:** RESEARCH-V05-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-V05-001 | safety | Publish actions must be manually authorized and least-privilege. | No automatic publish from push or PR events. |
| NFR-V05-002 | reproducibility | Release artifacts and package versions must be traceable to a tag and commit SHA. | GitHub Release, package version, changelog, and release notes point to the same version. |
| NFR-V05-003 | maintainability | Release checks and package logic must reuse existing script and workflow conventions. | TypeScript scripts under `scripts/`; tests under `tests/scripts/`; docs generated when script APIs change. |
| NFR-V05-004 | usability | Release docs must be runnable by a maintainer who has not authored the release. | Step-by-step operator guide with rollback and recovery sections. |
| NFR-V05-005 | recoverability | Failed release or package publication must have a non-destructive recovery path. | Recovery docs avoid force-pushing protected branches and explain rerun, draft edit, yanking, or superseding options. |

## Success metrics

- A maintainer can perform a dry-run release without publishing shared state.
- A publish run creates a GitHub Release and GitHub Package that reference the same version and commit.
- A failed publish has a documented recovery path that does not require force-pushing protected branches.
- Release publish readiness can be decided from v0.4 quality signals plus v0.5 release metadata checks.

## Quality gate

- [x] Functional requirements use EARS and stable IDs.
- [x] Acceptance criteria are testable.
- [x] Publishing and shared-state operations require explicit human authorization.
