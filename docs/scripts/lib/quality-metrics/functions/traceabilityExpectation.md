[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / traceabilityExpectation

# Function: traceabilityExpectation()

> **traceabilityExpectation**(`currentStage`, `workflowStatus`): [`TraceabilityExpectation`](../type-aliases/TraceabilityExpectation.md)

Decide which traceability links are expected at the current stage.

## Parameters

### currentStage

`string`

Workflow state's current stage.

### workflowStatus

`string`

Workflow state's status.

## Returns

[`TraceabilityExpectation`](../type-aliases/TraceabilityExpectation.md)

Expected downstream traceability surfaces.
