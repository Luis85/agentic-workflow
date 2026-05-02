[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-staging-safety](../README.md) / AssertSafeOutDirOptions

# Type Alias: AssertSafeOutDirOptions

> **AssertSafeOutDirOptions** = `object`

## Properties

### destructive?

> `optional` **destructive?**: `boolean`

`true` when the caller will recursively delete the contents of `outDir`
before writing (the default for `build:release-archive` — the
`cleanFirst` path). When `false` (the `--no-clean` path), only the
absolute-path guards run: rejecting the filesystem root, repo root,
repo parent, user home, and any ancestor of the repo root remains
useful even without a destructive clean, because the staging build is
still about to write into the directory. The `.git`-entry and
non-empty-without-marker checks are skipped because preserving an
existing tree is exactly what `--no-clean` advertises.

Default: `true`.
