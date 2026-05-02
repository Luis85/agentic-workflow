[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-staging-safety](../README.md) / assertSafeOutDir

# Function: assertSafeOutDir()

> **assertSafeOutDir**(`outDir`, `repoRoot`, `__namedParameters?`): `void`

Refuse to use `outDir` as a build target unless the path is obviously safe.

Always rejects:
- the filesystem root, the user home, the repo root, or the repo parent;
- any directory that is an ancestor of the repo root (would erase the
  repo itself on a clean);
- an existing path that is not a directory.

Additionally, when `destructive` is true (default — the `cleanFirst`
path), rejects:
- an existing directory that contains a `.git` entry (almost certainly a
  real repository, never a disposable stage);
- an existing non-empty directory that lacks the staging marker (could
  be any maintainer's working dir; refuse to recursively delete it).

Empty directories, non-existent paths, and previously-staged dirs (marker
present) all pass. When `destructive` is false (the `--no-clean` path),
any existing directory layout that survives the absolute-path guards
passes — the build will write into it without erasing existing files,
which is exactly what `--no-clean` promises (Codex P2 round-4 on PR #202).

## Parameters

### outDir

`string`

### repoRoot

`string`

### \_\_namedParameters?

[`AssertSafeOutDirOptions`](../type-aliases/AssertSafeOutDirOptions.md) = `{}`

## Returns

`void`
