[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/frontmatter](../README.md) / frontmatterDiagnostic

# Function: frontmatterDiagnostic()

> **frontmatterDiagnostic**(`code`, `filePath`, `message`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)

Build a structured frontmatter diagnostic.

## Parameters

### code

[`FrontmatterDiagnosticCode`](../type-aliases/FrontmatterDiagnosticCode.md)

Stable diagnostic code for the frontmatter failure.

### filePath

`string`

Repository-relative Markdown file path, or a directory for duplicate README failures.

### message

`string`

Human-readable failure message.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)

Structured diagnostic for check output.
