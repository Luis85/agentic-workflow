[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/obsidian](../README.md) / fixObsidianFrontmatter

# Function: fixObsidianFrontmatter()

> **fixObsidianFrontmatter**(`text`): [`ObsidianFixResult`](../type-aliases/ObsidianFixResult.md)

Apply safe, mechanical Obsidian frontmatter repairs to a Markdown document.

The fixer only rewrites documents with a valid frontmatter block. It quotes
scalar wikilinks such as `related: [[Some Note]]` while preserving inline YAML
comments. Structural problems, duplicate properties, tabs, and JSON-style
metadata remain check failures because they need human review.

## Parameters

### text

`string`

Complete Markdown document contents.

## Returns

[`ObsidianFixResult`](../type-aliases/ObsidianFixResult.md)

Fixed text and whether it changed.
