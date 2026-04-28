[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/runner](../README.md) / runNodeTasks

# Function: runNodeTasks()

> **runNodeTasks**(`tasks`, `options?`): `void`

Run a list of Node-backed repository tasks in sequence.

Each task is executed with the current Node binary. The runner prints a
concise reproduce command when a task fails, which keeps `npm run verify`
output actionable.

## Parameters

### tasks

[`NodeTask`](../type-aliases/NodeTask.md)[]

Tasks to execute.

### options?

Runner behavior.

#### heading?

`string`

Prefix for progress messages.

#### stopOnFailure?

`boolean`

Exit immediately when a task fails.

## Returns

`void`
