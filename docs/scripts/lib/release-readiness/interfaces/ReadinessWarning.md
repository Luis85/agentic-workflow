[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / ReadinessWarning

# Interface: ReadinessWarning

A non-blocking informational signal about release readiness.
Distinct from [Diagnostic](../../diagnostics/type-aliases/Diagnostic.md) to preserve the existing contract that
any entry in `report.diagnostics` is a hard failure.

## Properties

### code

> **code**: `string`

***

### message

> **message**: `string`
