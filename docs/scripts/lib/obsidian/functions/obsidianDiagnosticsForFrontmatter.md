[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/obsidian](../README.md) / obsidianDiagnosticsForFrontmatter

# Function: obsidianDiagnosticsForFrontmatter()

> **obsidianDiagnosticsForFrontmatter**(`filePath`, `raw`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Validate a raw frontmatter block against Obsidian compatibility rules.

## Parameters

### filePath

`string`

Repository-relative Markdown file path for diagnostics.

### raw

`string`

Raw frontmatter without delimiter lines.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Obsidian compatibility diagnostics for the block.
