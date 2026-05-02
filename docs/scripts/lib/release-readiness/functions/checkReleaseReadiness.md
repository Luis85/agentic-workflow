[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / checkReleaseReadiness

# Function: checkReleaseReadiness()

> **checkReleaseReadiness**(`opts`): [`ReleaseReadinessReport`](../interfaces/ReleaseReadinessReport.md)

Validate a release candidate against the v0.5 readiness contract.

Runs Layer 1 (release metadata correctness) in fixed order:

1. Version alignment — `package.json#version` matches the release version.
2. Tag readiness — release tag points at `main` HEAD per ADR-0020.
3. CHANGELOG entry — `CHANGELOG.md` has a `## [vX.Y.Z]` heading.
4. Lifecycle release notes — `.github/release.yml` shape per T-V05-003.
5. Package metadata — name, registry, repository, files per package contract.
6. Workflow permissions — manual release workflow is least-privilege.
7. v0.4 quality signals — green or explicit operator waiver (SPEC-V05-008).

Then runs Layer 2 (fresh-surface composition from T-V05-012) when
`archive` is provided. Layer 2 diagnostics are surfaced unchanged so the
`RELEASE_PKG_*` codes downstream consumers rely on stay stable.

Layer 2 is skipped only when no archive is provided — Layer 1 still runs
because the manual release workflow (T-V05-006) sometimes invokes readiness
before the candidate archive is materialised.

## Parameters

### opts

[`ReleaseReadinessOptions`](../interfaces/ReleaseReadinessOptions.md)

## Returns

[`ReleaseReadinessReport`](../interfaces/ReleaseReadinessReport.md)
