[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / replaceGeneratedBlock

# Function: replaceGeneratedBlock()

> **replaceGeneratedBlock**(`text`, `name`, `content`): `string`

Replace a named generated Markdown block.

## Parameters

### text

`string`

Source document containing generated block markers.

### name

`string`

Marker name from `BEGIN GENERATED: <name>`.

### content

`string`

Generated content to place between markers.

## Returns

`string`

Updated document contents.

## Throws

When the named block markers are missing.
