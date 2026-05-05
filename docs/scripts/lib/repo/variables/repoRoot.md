[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / repoRoot

# Variable: repoRoot

> `const` **repoRoot**: `string`

Absolute filesystem path to the repository root.

Resolved in priority order: (1) `SPECORATOR_ROOT` environment variable (injected by
the `specorator` CLI dispatcher); (2) walk up from `process.cwd()`; (3) walk up from
this file's own directory as a fallback when invoked from an unrelated working directory.

Script helpers resolve all checked and generated paths from this directory so
commands behave the same regardless of the caller's current working directory.
