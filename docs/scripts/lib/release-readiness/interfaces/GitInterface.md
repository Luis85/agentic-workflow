[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / GitInterface

# Interface: GitInterface

Minimal git facade for tag-readiness assertions.

`resolveRef` must return a **commit SHA** for the supplied ref,
dereferencing (peeling) annotated tags so an annotated `vX.Y.Z` and
`refs/heads/main` are comparable. Real callers wire this with
`git rev-parse <ref>^{commit}` so annotated and lightweight tags resolve
the same way (Codex round-3 P1 on PR #158). Tests inject a stub mapping
directly to commit SHAs.

`firstParentChain` returns `main`'s first-parent ancestry as a list of
commit SHAs starting at `main` HEAD and walking back through merge-commit
left parents. Tag readiness uses this to assert the release tag sits on
`main`'s first-parent history (ADR-0020 §Compliance), not strictly at
`main` HEAD. The strict-HEAD reading made the v0.5.0 / v0.5.1 publish
dispatches trip whenever an unrelated PR merged into `main` between the
tag cut and the dispatch (#233 prevention F). Returns `null` when the
chain cannot be resolved (ref missing, git error).

## Methods

### firstParentChain()

> **firstParentChain**(`ref`): readonly `string`[] \| `null`

#### Parameters

##### ref

`string`

#### Returns

readonly `string`[] \| `null`

***

### resolveRef()

> **resolveRef**(`ref`): `string` \| `null`

#### Parameters

##### ref

`string`

#### Returns

`string` \| `null`
