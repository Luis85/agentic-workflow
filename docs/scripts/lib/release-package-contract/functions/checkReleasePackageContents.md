[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/release-package-contract](../README.md) / checkReleasePackageContents

# Function: checkReleasePackageContents()

> **checkReleasePackageContents**(`archive`): [`ReleasePackageReport`](../type-aliases/ReleasePackageReport.md)

Validate a candidate published archive against the fresh-surface contract
(ADR-0021 / SPEC-V05-010 / `package-contract.md`).

Three deterministic assertions are evaluated in fixed order: numbered ADRs
must not ship, intake folders must be empty (or contain only `README.md`),
and every shipping `docs/` page must match the stub shape from
`templates/release-package-stub.md`.

## Parameters

### archive

`string`

Absolute path to the directory holding the candidate archive.

## Returns

[`ReleasePackageReport`](../type-aliases/ReleasePackageReport.md)

Report with the archive path and all violations found.
