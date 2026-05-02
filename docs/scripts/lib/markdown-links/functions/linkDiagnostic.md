[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/markdown-links](../README.md) / linkDiagnostic

# Function: linkDiagnostic()

> **linkDiagnostic**(`code`, `filePath`, `line`, `target`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)

Build a structured Markdown link diagnostic.

## Parameters

### code

[`LinkDiagnosticCode`](../type-aliases/LinkDiagnosticCode.md)

Stable diagnostic code for the link failure.

### filePath

`string`

Repository-relative Markdown file path.

### line

`number`

One-based line number.

### target

`string`

Link target that failed validation.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)

Structured diagnostic for check output.
