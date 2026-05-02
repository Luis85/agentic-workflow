[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / GitInterface

# Interface: GitInterface

Minimal git facade for tag-readiness assertions.

Implementations must return a **commit SHA** for the supplied ref,
dereferencing (peeling) annotated tags so an annotated `vX.Y.Z` and
`refs/heads/main` are comparable. Real callers wire this with
`git rev-parse <ref>^{commit}` so annotated and lightweight tags resolve
the same way (Codex round-3 P1 on PR #158). Tests inject a stub mapping
directly to commit SHAs.

## Methods

### resolveRef()

> **resolveRef**(`ref`): `string` \| `null`

#### Parameters

##### ref

`string`

#### Returns

`string` \| `null`
