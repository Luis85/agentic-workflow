[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/release-readiness](../README.md) / QualitySignals

# Interface: QualitySignals

v0.4 quality signals consumed by the readiness check (SPEC-V05-008).

Three repo-derived signals (`openBlockers`, `openClarifications`,
`maturityLevel`) come from `lib/quality-metrics.ts`. The two operator-set
signals (`ciStatus`, `validationStatus`) come from the release operator via
CLI flags. Either every signal is green, or `waiver` records an explicit
operator override.

## Properties

### ciStatus?

> `optional` **ciStatus?**: `string`

***

### maturityLevel

> **maturityLevel**: `number`

***

### openBlockers

> **openBlockers**: `number`

***

### openClarifications

> **openClarifications**: `number`

***

### validationStatus?

> `optional` **validationStatus?**: `string`

***

### waiver?

> `optional` **waiver?**: `string`
