[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / completeArtifactsFor

# Function: completeArtifactsFor()

> **completeArtifactsFor**(`expectedArtifacts`, `artifacts`): `number`

Count expected artifacts marked complete or skipped.

## Parameters

### expectedArtifacts

`string`[]

Stage-aware artifact names.

### artifacts

[`WorkflowArtifacts`](../type-aliases/WorkflowArtifacts.md)

Workflow-state artifact status map.

## Returns

`number`

Count of expected artifacts marked `complete` or `skipped`.
