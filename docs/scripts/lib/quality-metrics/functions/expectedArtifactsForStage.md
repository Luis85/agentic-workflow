[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / expectedArtifactsForStage

# Function: expectedArtifactsForStage()

> **expectedArtifactsForStage**(`currentStage`, `workflowStatus`): `string`[]

Return canonical artifacts expected by the current workflow stage.

## Parameters

### currentStage

`string`

Workflow state's current stage.

### workflowStatus

`string`

Workflow state's status.

## Returns

`string`[]

Canonical artifacts expected at or before the current stage.
