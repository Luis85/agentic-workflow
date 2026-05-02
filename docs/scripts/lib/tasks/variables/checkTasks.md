[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/tasks](../README.md) / checkTasks

# Variable: checkTasks

> `const` **checkTasks**: (\{ `command`: `string`[]; `jsonDiagnostics?`: `undefined`; `label`: `string`; `name`: `string`; `script?`: `undefined`; \} \| \{ `command?`: `undefined`; `jsonDiagnostics`: `boolean`; `label`: `string`; `name`: `string`; `script`: `string`; \} \| \{ `command?`: `undefined`; `jsonDiagnostics?`: `undefined`; `label`: `string`; `name`: `string`; `script`: `string`; \})[]

Read-only checks executed by `npm run verify`.

Keep this list in the order checks should fail during local iteration: cheap
generated-output checks first, broader consistency checks last.
