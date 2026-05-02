[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/traceability](../README.md) / traceabilityDiagnosticsForFeature

# Function: traceabilityDiagnosticsForFeature()

> **traceabilityDiagnosticsForFeature**(`stateRel`, `stateText`, `artifactRecords`): `string`[]

Validate the traceability graph for one feature.

The function is pure: callers walk the filesystem, build [ArtifactRecord](../type-aliases/ArtifactRecord.md)s
for each existing artifact, and pass everything in. The validator parses the
workflow-state YAML, builds the ID registry from frontmatter / headings /
tables, and reports broken references and area mismatches.

## Parameters

### stateRel

`string`

Repository-relative POSIX path to the workflow-state file.

### stateText

`string`

Raw workflow-state contents including frontmatter.

### artifactRecords

[`ArtifactRecord`](../type-aliases/ArtifactRecord.md)[]

Records for each existing artifact in the feature.

## Returns

`string`[]

Diagnostic messages, one per failure.
