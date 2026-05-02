[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/repo](../README.md) / parseSimpleYaml

# Function: parseSimpleYaml()

> **parseSimpleYaml**(`raw`): [`SimpleYaml`](../type-aliases/SimpleYaml.md)

Parse the small YAML subset used by repository state files.

This parser intentionally supports only the structures needed by local
checks: scalar keys, one-level nested maps, inline arrays, quoted strings,
integers, and null markers.

## Parameters

### raw

`string`

Raw frontmatter without delimiter lines.

## Returns

[`SimpleYaml`](../type-aliases/SimpleYaml.md)

Parsed YAML data.
