[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / EXPECTED\_PACKAGE\_FILES

# Variable: EXPECTED\_PACKAGE\_FILES

> `const` **EXPECTED\_PACKAGE\_FILES**: readonly `string`[]

Default `package.json#files` include list derived from
`specs/version-0-5-plan/package-contract.md` §3.

Each entry must appear in `package.json#files` for readiness to pass. The
list is the conservative, contract-aligned shape; OQ-V05-002 may refine the
exact glob form as v0.5 settles. Callers (tests, alternative consumers) can
override via `expectedPackageFiles` in [ReleaseReadinessOptions](../interfaces/ReleaseReadinessOptions.md).
