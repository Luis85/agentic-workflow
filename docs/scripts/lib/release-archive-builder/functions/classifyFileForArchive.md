[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-archive-builder](../README.md) / classifyFileForArchive

# Function: classifyFileForArchive()

> **classifyFileForArchive**(`relPath`): [`ArchiveFileAction`](../type-aliases/ArchiveFileAction.md)

Decide how a single repo-relative POSIX path should be staged into the
released archive.

The returned action drives `buildReleaseArchive`:
- `stubify` — apply `stubifyDoc` to the file's contents (built-up `docs/`
  markdown).
- `copy` — mirror the file byte-for-byte (everything outside `docs/`, plus
  `templates/release-package-stub.md` itself).
- `skip` — the file must not ship (numbered ADRs).

## Parameters

### relPath

`string`

## Returns

[`ArchiveFileAction`](../type-aliases/ArchiveFileAction.md)
