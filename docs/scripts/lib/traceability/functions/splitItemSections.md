[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/traceability](../README.md) / splitItemSections

# Function: splitItemSections()

> **splitItemSections**(`record`): [`ItemSection`](../type-aliases/ItemSection.md)[]

Split an artifact body into sections, one per traceability heading.

## Parameters

### record

[`ArtifactRecord`](../type-aliases/ArtifactRecord.md)

Artifact record whose `text` contains traceability headings.

## Returns

[`ItemSection`](../type-aliases/ItemSection.md)[]

Sections keyed by heading-defined ID.
