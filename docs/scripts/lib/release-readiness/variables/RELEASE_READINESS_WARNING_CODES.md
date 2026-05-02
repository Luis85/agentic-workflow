[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / RELEASE\_READINESS\_WARNING\_CODES

# Variable: RELEASE\_READINESS\_WARNING\_CODES

> `const` **RELEASE\_READINESS\_WARNING\_CODES**: `object`

Diagnostic codes emitted as **warnings** (informational, do not fail
closed). Kept separate from [RELEASE\_READINESS\_DIAGNOSTIC\_CODES](RELEASE_READINESS_DIAGNOSTIC_CODES.md)
because the existing JSON output contract guarantees that any entry in
`diagnostics` is a hard failure — operators (and the dispatch workflow)
rely on that for the "fail closed" gate. Warnings surface through the
CLI as `::notice::` annotations and do not block dispatch.

## Type Declaration

### ImmutableProbeDenied

> `readonly` **ImmutableProbeDenied**: `"RELEASE_READINESS_IMMUTABLE_PROBE_DENIED"` = `"RELEASE_READINESS_IMMUTABLE_PROBE_DENIED"`

### ImmutableRepo

> `readonly` **ImmutableRepo**: `"RELEASE_READINESS_IMMUTABLE_REPO"` = `"RELEASE_READINESS_IMMUTABLE_REPO"`
