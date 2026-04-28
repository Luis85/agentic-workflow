[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/roadmaps](../README.md) / validateRoadmapStateData

# Function: validateRoadmapStateData()

> **validateRoadmapStateData**(`rel`, `roadmapDir`, `data`, `dirPath`): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Validate parsed roadmap state frontmatter.

## Parameters

### rel

`string`

Repository-relative state file path.

### roadmapDir

`string`

Roadmap folder slug.

### data

`Record`\<`string`, `unknown`\>

Parsed frontmatter.

### dirPath

`string`

Absolute roadmap directory path.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Structured validation diagnostics.
