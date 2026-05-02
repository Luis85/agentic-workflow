[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/diagnostics](../README.md) / checkResult

# Function: checkResult()

> **checkResult**(`heading`, `errors`): [`CheckResult`](../type-aliases/CheckResult.md)

Build the serializable result for a repository check.

## Parameters

### heading

`string`

Check name.

### errors

[`DiagnosticInput`](../type-aliases/DiagnosticInput.md)[]

Accumulated diagnostics.

## Returns

[`CheckResult`](../type-aliases/CheckResult.md)

Result suitable for human or JSON rendering.
