[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-archive-builder](../README.md) / buildReleaseArchive

# Function: buildReleaseArchive()

> **buildReleaseArchive**(`opts`): [`BuildArchiveReport`](../type-aliases/BuildArchiveReport.md)

Stage a transformed copy of the source repository into a runner-local
directory ready for `npm pack`.

The transform satisfies the fresh-surface contract from ADR-0021 /
SPEC-V05-010: numbered ADRs are filtered, every shipping `docs/**/*.md`
page is replaced with the stub form from `release-stubify.ts`, and every
other file mirrors the codebase form.

The function is pure with respect to `repoRoot` (read-only) and idempotent
with respect to `outDir` (last write wins).

## Parameters

### opts

[`BuildArchiveOptions`](../type-aliases/BuildArchiveOptions.md)

## Returns

[`BuildArchiveReport`](../type-aliases/BuildArchiveReport.md)
