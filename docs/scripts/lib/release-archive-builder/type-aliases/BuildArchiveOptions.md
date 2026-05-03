[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-archive-builder](../README.md) / BuildArchiveOptions

# Type Alias: BuildArchiveOptions

> **BuildArchiveOptions** = `object`

## Properties

### files

> **files**: readonly `string`[]

Repo-relative POSIX paths to stage. Typically the file list reported by
`npm pack --dry-run --json`.

***

### outDir

> **outDir**: `string`

Absolute path to the staging directory. Created if missing.

***

### repoRoot

> **repoRoot**: `string`

Absolute path to the source repo.
