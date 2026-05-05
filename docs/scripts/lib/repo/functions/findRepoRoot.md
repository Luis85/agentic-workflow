[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / findRepoRoot

# Function: findRepoRoot()

> **findRepoRoot**(`startDir?`): `string`

Walk up from `startDir` until a directory containing `package.json` or `.git`
is found. Returns the absolute path to that directory.

## Parameters

### startDir?

`string`

Starting directory (defaults to `process.cwd()`).

## Returns

`string`

Absolute path to the project root.

## Throws

When no sentinel is found before the filesystem root.
