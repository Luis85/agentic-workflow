[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / parseReleaseReadinessArgs

# Function: parseReleaseReadinessArgs()

> **parseReleaseReadinessArgs**(`argv`, `env?`): [`ParsedReleaseReadinessArgs`](../type-aliases/ParsedReleaseReadinessArgs.md)

Parse CLI arguments for the release readiness check.

Recognises `--version <X.Y.Z>` / `--version=<X.Y.Z>` and
`--archive <dir>` / `--archive=<dir>`. Falls back to the environment
variables `RELEASE_VERSION` and `RELEASE_PACKAGE_ARCHIVE` when no flag is
present. Empty flag values short-circuit with `argv-empty` so release
automation cannot silently bypass the check by passing a shell-expanded
empty string (Codex P1 regression carried from T-V05-012).

## Parameters

### argv

readonly `string`[]

Arguments after `process.argv.slice(2)`.

### env?

`ProcessEnv` = `process.env`

Optional environment object (defaults to `process.env`).

## Returns

[`ParsedReleaseReadinessArgs`](../type-aliases/ParsedReleaseReadinessArgs.md)
