[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / extractFrontmatter

# Function: extractFrontmatter()

> **extractFrontmatter**(`text`): [`FrontmatterBlock`](../type-aliases/FrontmatterBlock.md) \| `null`

Extract YAML frontmatter from a Markdown document.

## Parameters

### text

`string`

Markdown document contents.

## Returns

[`FrontmatterBlock`](../type-aliases/FrontmatterBlock.md) \| `null`

Frontmatter and body, or null when no frontmatter block exists.
