[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/spec-state](../README.md) / specStateDiagnosticsForText

# Function: specStateDiagnosticsForText()

> **specStateDiagnosticsForText**(`rel`, `featureDir`, `text`, `options?`): `string`[]

Validate one workflow-state.md document and return diagnostic strings.

The function is pure: filesystem reads happen via the optional
`artifactExists` callback so callers (and tests) can inject behaviour without
touching disk. Diagnostic strings are prefixed with the supplied `rel` path
so that the shared diagnostic normaliser can split them into path-and-message
pairs in the existing CLI renderer.

## Parameters

### rel

`string`

Repository-relative POSIX path of the workflow-state file.

### featureDir

`string`

Containing folder name; must equal the `feature` field.

### text

`string`

Raw file contents including YAML frontmatter.

### options?

[`SpecStateOptions`](../type-aliases/SpecStateOptions.md) = `{}`

Override the artifact-existence probe used by tests.

## Returns

`string`[]

Diagnostic messages, one per failure.
