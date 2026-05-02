[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/spec-state](../README.md) / parseStageProgressTable

# Function: parseStageProgressTable()

> **parseStageProgressTable**(`body`): `Map`\<`string`, `string`\>

Extract artifact-status pairs from the Stage progress Markdown table.

## Parameters

### body

`string`

Markdown body after the YAML frontmatter.

## Returns

`Map`\<`string`, `string`\>

Map keyed by artifact filename with the status string from column 3.
