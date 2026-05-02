[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-staging-safety](../README.md) / assertSafeOutDir

# Function: assertSafeOutDir()

> **assertSafeOutDir**(`outDir`, `repoRoot`): `void`

Refuse to use `outDir` as a destructive `--out` target unless the path is
obviously disposable.

Rejects (in order):
- the filesystem root, the user home, the repo root, or the repo parent;
- any directory that is an ancestor of the repo root (would delete the
  repo itself on clean);
- an existing path that is not a directory;
- an existing directory that contains a `.git` entry (almost certainly a
  real repository, never a disposable stage);
- an existing non-empty directory that lacks the staging marker (could be
  any maintainer's working dir; refuse to recursively delete it).

Empty directories, non-existent paths, and previously-staged dirs (marker
present) all pass.

## Parameters

### outDir

`string`

### repoRoot

`string`

## Returns

`void`
