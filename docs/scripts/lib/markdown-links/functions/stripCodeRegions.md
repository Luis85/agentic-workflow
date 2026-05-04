[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/markdown-links](../README.md) / stripCodeRegions

# Function: stripCodeRegions()

> **stripCodeRegions**(`text`): `string`

Replace fenced code blocks and inline code spans with whitespace so the link
scanner does not match path-like substrings inside code examples. Newlines
and total character offsets within a line are preserved, so diagnostic line
numbers continue to match the original source.

## Parameters

### text

`string`

## Returns

`string`
