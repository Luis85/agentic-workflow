[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / GitInterface

# Interface: GitInterface

Minimal git facade for tag-readiness assertions.

Real callers wire this with `git rev-parse <ref>`. Tests inject a stub
mapping to avoid spawning git.

## Methods

### resolveRef()

> **resolveRef**(`ref`): `string` \| `null`

#### Parameters

##### ref

`string`

#### Returns

`string` \| `null`
