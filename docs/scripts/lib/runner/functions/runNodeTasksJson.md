[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/runner](../README.md) / runNodeTasksJson

# Function: runNodeTasksJson()

> **runNodeTasksJson**(`tasks`, `options?`): `void`

Run repository tasks and emit one machine-readable aggregate result.

JSON-capable script tasks are invoked with `--json`; other tasks are reported
with a stable rerun command when they fail. This command is intended for
agents and CI adapters, while `npm run verify` remains the human default.

## Parameters

### tasks

[`NodeTask`](../type-aliases/NodeTask.md)[]

Tasks to execute.

### options?

Runner behavior.

#### heading?

`string`

## Returns

`void`
