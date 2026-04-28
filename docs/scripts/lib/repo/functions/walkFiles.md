[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / walkFiles

# Function: walkFiles()

> **walkFiles**(`startDir`, `predicate?`): `string`[]

Recursively list files below a repository directory while skipping generated
and dependency folders.

## Parameters

### startDir

`string`

Directory to walk, relative to [repoRoot](../variables/repoRoot.md).

### predicate?

(`filePath`) => `boolean`

Optional file filter.

## Returns

`string`[]

Absolute file paths sorted by repository-relative path.
