[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/obsidian-assets](../README.md) / obsidianAssetDiagnostics

# Function: obsidianAssetDiagnostics()

> **obsidianAssetDiagnostics**(`options?`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Validate committed Obsidian vault assets.

This check is separate from `check:obsidian`: that check validates Markdown
frontmatter compatibility, while this one validates committed `.base` and
`.canvas` assets and rejects tracked vault-local state.

## Parameters

### options?

[`ObsidianAssetDiagnosticOptions`](../type-aliases/ObsidianAssetDiagnosticOptions.md) = `{}`

Optional file lists for tests.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Obsidian asset diagnostics.
