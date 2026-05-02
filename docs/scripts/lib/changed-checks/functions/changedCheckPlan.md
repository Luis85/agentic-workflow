[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/changed-checks](../README.md) / changedCheckPlan

# Function: changedCheckPlan()

> **changedCheckPlan**(`baseRef?`): [`ChangedCheckPlan`](../type-aliases/ChangedCheckPlan.md)

Build the changed-file verification plan for the current git checkout.

## Parameters

### baseRef?

`string` = `"origin/main"`

Base ref for committed branch changes.

## Returns

[`ChangedCheckPlan`](../type-aliases/ChangedCheckPlan.md)

Changed files and selected tasks.
