[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/tasks](../README.md) / checkTasks

# Variable: checkTasks

> `const` **checkTasks**: [`NodeTask`](../interfaces/NodeTask.md)[]

Read-only checks executed by `npm run verify`.

Keep this list in the order checks should fail during local iteration: cheap
generated-output checks first, broader consistency checks last.
