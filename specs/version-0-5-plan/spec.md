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

### SPEC-V05-008 — v0.4 quality gate consumption

- **Satisfies:** REQ-V05-010
- **Behavior:** Release readiness consumes v0.4 quality signals for required CI status, validation status, open blockers, open clarifications, and maturity evidence before publish.
- **Acceptance:** Publish cannot proceed unless quality signals are green or the human release operator records an explicit waiver.

### SPEC-V05-009 — Release candidate dry run

- **Satisfies:** REQ-V05-011, NFR-V05-005
- **Behavior:** The release workflow supports dry-run and draft/pre-release candidate paths before stable release and package publication.
- **Acceptance:** Maintainers can validate release inputs and candidate output without publishing a stable package.

### SPEC-V05-010 — Release package fresh-surface contract

- **Satisfies:** REQ-V05-005, REQ-V05-012 (REQ-V05-012 is added by `pm` in the same PR; reciprocal reference)
- **Surface:** the package-contract document (T-V05-002 deliverable), the release readiness check (T-V05-004 / SPEC-V05-005), and the manual release workflow (T-V05-006 / SPEC-V05-002). Source of truth: [ADR-0021](../../docs/adr/0021-release-package-fresh-surface.md).
- **Inputs:** the path lists enumerated in ADR-0021 — the 10 intake folders (`inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`) and the ADR file glob `docs/adr/[0-9][0-9][0-9][0-9]-*.md`.
- **Behavior:** the contract is three deterministic assertions evaluated against the candidate published archive before publish:
  1. **No ADR files ship.** No file matching `docs/adr/[0-9][0-9][0-9][0-9]-*.md` is present in the published archive. `docs/adr/README.md` **does** ship in the archive, rewritten as a stub per `templates/release-package-stub.md` (it explains to the consumer how to file their own ADRs starting at `ADR-0001`). `templates/adr-template.md` ships unchanged.
  2. **Intake folders ship empty.** Each of the 10 enumerated intake folders is either absent from the archive or contains only a top-level `README.md`. No per-feature subdirectory (e.g. `specs/<slug>/`), no per-deal file (e.g. `sales/<deal>/`), no per-engagement state file (e.g. `projects/<slug>/project-state.md`), and no per-cycle log file (e.g. `portfolio/<slug>/portfolio-log.md`) is present.
  3. **Docs ship as stubs.** Every `docs/` page that ships in the archive matches the stub shape defined in `templates/release-package-stub.md` — frontmatter present, top-level headings present, no built-up sections beyond the stub shape. The stub shape itself is owned by `pm` (T-V05-002 family); if `templates/release-package-stub.md` has not yet been written when this assertion is enforced, assertion 3 is gated on the stub template existing, and the readiness check fails closed.
- **Acceptance:** the release readiness check refuses to authorize publish when any of the three assertions fails. The manual release workflow refuses to publish until readiness passes. Successful publish requires all three assertions green or an explicit operator waiver recorded against the run.
- **Edge cases:**
  - A maintainer accidentally adds a feature folder under `specs/` (for example forgets to remove `specs/<active-feature>/` before cutting the archive). Caught by assertion 2; readiness check fails before publish.
  - A new intake folder is added to the template (a new track, a new state-bearing folder). The enumeration in ADR-0021 and `docs/release-package-contents.md` must be updated in the same PR that adds the folder; this is a maintenance rule. Until the enumeration is updated, the new folder will leak into the released archive — readiness will not catch what it does not enumerate. The maintenance rule is the mitigation; the readiness check is the backstop only for the enumerated set.
  - A `docs/` page is added to the codebase but a stub form is not authored. The packaging step has no stub to ship; assertion 3 fails closed.
  - An ADR file lands under `docs/adr/` between readiness and publish (race / late merge). Assertion 1 re-runs against the final archive; the publish workflow does not re-use an earlier readiness result.

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
| TEST-V05-010 | REQ-V05-010 | Run publish readiness with failed v0.4 quality signals. | Publish is blocked or requires an explicit operator waiver. |
| TEST-V05-011 | REQ-V05-011 | Run release candidate mode before stable publish. | Candidate can be validated without publishing a stable package. |
| TEST-V05-012 | REQ-V05-005, REQ-V05-012 | Build a candidate archive that contains a leftover `specs/<feature>/` folder, an `ADR-NNNN-*.md`, and a `docs/` page in built-up form. | Release readiness check fails with stable diagnostics naming each violated fresh-surface assertion (per SPEC-V05-010). |
