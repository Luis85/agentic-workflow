[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/frontmatter](../README.md) / requiredKeyDiagnostics

# Function: requiredKeyDiagnostics()

> **requiredKeyDiagnostics**(`filePath`, `data`, `keys`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Build diagnostics for required frontmatter keys.

## Parameters

### filePath

`string`

Repository-relative Markdown file path.

### data

`Record`\<`string`, `unknown`\>

Parsed frontmatter data.

### keys

`string`[]

Required frontmatter keys.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Missing-key diagnostics.
