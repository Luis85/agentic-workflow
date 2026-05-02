[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/obsidian](../README.md) / obsidianDiagnosticsForFile

# Function: obsidianDiagnosticsForFile()

> **obsidianDiagnosticsForFile**(`filePath`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Validate Markdown frontmatter against this repository's Obsidian compatibility rules.

The check is intentionally conservative: files without frontmatter are valid,
but frontmatter that exists must be top-of-file YAML, use unique readable
property names, avoid JSON-only syntax, and quote Obsidian wikilinks in scalar
values so the Properties UI can round-trip them predictably.

## Parameters

### filePath

`string`

Absolute Markdown file path to validate.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Obsidian compatibility diagnostics for the file.
