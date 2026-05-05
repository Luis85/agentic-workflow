[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / repoRoot

# Variable: repoRoot

> `const` **repoRoot**: `string`

Absolute filesystem path to the repository root.

Resolved from the `SPECORATOR_ROOT` environment variable when set (injected by
the `specorator` CLI dispatcher), or by walking up from `process.cwd()` to the
nearest directory containing `package.json` or `.git`.

Script helpers resolve all checked and generated paths from this directory so
commands behave the same regardless of the caller's current working directory.
