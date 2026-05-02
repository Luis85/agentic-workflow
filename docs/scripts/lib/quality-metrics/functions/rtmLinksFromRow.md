[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / rtmLinksFromRow

# Function: rtmLinksFromRow()

> **rtmLinksFromRow**(`line`): \{ `reqId`: `string`; `specIds`: `string`[]; `taskIds`: `string`[]; `testIds`: `string`[]; \} \| `null`

Extract requirement, spec, task, and test links from one RTM table row.

## Parameters

### line

`string`

Raw Markdown table row from `traceability.md`.

## Returns

\{ `reqId`: `string`; `specIds`: `string`[]; `taskIds`: `string`[]; `testIds`: `string`[]; \} \| `null`

Parsed row links, or null for header/separator/non-RTM rows.
