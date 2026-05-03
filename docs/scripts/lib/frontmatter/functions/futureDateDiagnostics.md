[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/frontmatter](../README.md) / futureDateDiagnostics

# Function: futureDateDiagnostics()

> **futureDateDiagnostics**(`filePath`, `raw`, `today?`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Validate repository-maintained frontmatter date fields against the current UTC day.

## Parameters

### filePath

`string`

Repository-relative Markdown file path.

### raw

`string`

Raw frontmatter without delimiter lines.

### today?

`Date` = `...`

Date used for UTC comparison.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Future-date diagnostics.
