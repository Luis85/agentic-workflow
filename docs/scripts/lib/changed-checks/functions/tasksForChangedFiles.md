[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/changed-checks](../README.md) / tasksForChangedFiles

# Function: tasksForChangedFiles()

> **tasksForChangedFiles**(`files`): [`NodeTask`](../../runner/type-aliases/NodeTask.md)[]

Select the smallest safe local check set for changed repository paths.

## Parameters

### files

`string`[]

POSIX-style repository-relative paths.

## Returns

[`NodeTask`](../../runner/type-aliases/NodeTask.md)[]

Ordered tasks to run.
