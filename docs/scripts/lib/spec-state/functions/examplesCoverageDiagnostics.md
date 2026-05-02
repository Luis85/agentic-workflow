[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/spec-state](../README.md) / examplesCoverageDiagnostics

# Function: examplesCoverageDiagnostics()

> **examplesCoverageDiagnostics**(`missingSubdirs`): `string`[]

Emit a diagnostic for each example subdirectory missing a workflow-state.md file.

The function is pure: directory traversal is the caller's responsibility.
Pass the repository-relative POSIX paths of the offending subdirectories and
receive one diagnostic per path naming the missing artifact.

## Parameters

### missingSubdirs

`string`[]

Repository-relative paths of example subdirectories that lack workflow-state.md.

## Returns

`string`[]

Diagnostic messages, one per missing path.
