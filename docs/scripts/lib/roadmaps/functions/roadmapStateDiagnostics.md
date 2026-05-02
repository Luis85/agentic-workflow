[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/roadmaps](../README.md) / roadmapStateDiagnostics

# Function: roadmapStateDiagnostics()

> **roadmapStateDiagnostics**(): [`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Validate every roadmap state file in the repository.

The check is intentionally read-only. It only validates roadmap state
contracts once a roadmap exists; repositories with no `roadmaps/` directory
pass so the track stays opt-in.

## Returns

[`Diagnostic`](../../diagnostics/type-aliases/Diagnostic.md)[]

Structured validation diagnostics.
