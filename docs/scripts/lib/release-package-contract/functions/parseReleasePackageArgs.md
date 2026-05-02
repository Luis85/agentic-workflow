[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-package-contract](../README.md) / parseReleasePackageArgs

# Function: parseReleasePackageArgs()

> **parseReleasePackageArgs**(`argv`, `env?`): [`ParsedReleasePackageArgs`](../type-aliases/ParsedReleasePackageArgs.md)

Parse CLI arguments for the fresh-surface packaging check.

Recognises `--archive <value>` and `--archive=<value>`. Falls back to the
`RELEASE_PACKAGE_ARCHIVE` environment variable when no flag is present.

`argv-empty` is reported when the `--archive` flag is present without a
non-empty value (for example a shell variable that expanded to the empty
string, or a trailing `--archive` with no following token). The CLI must
treat that case as an argument error rather than falling through to the
skip path; otherwise release automation can silently bypass all three
fresh-surface assertions.

## Parameters

### argv

readonly `string`[]

Arguments after `process.argv.slice(2)`.

### env?

`ProcessEnv` = `process.env`

Optional environment object (defaults to `process.env`).

## Returns

[`ParsedReleasePackageArgs`](../type-aliases/ParsedReleasePackageArgs.md)
