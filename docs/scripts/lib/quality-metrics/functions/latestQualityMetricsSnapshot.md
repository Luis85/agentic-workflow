[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / latestQualityMetricsSnapshot

# Function: latestQualityMetricsSnapshot()

> **latestQualityMetricsSnapshot**(`metrics`): \{ `metrics`: [`QualityMetrics`](../type-aliases/QualityMetrics.md); `path`: `string`; \} \| `null`

Load the latest saved quality metrics snapshot for the current scope.

## Parameters

### metrics

[`QualityMetrics`](../type-aliases/QualityMetrics.md)

Current metrics whose scope selects the snapshot directory.

## Returns

\{ `metrics`: [`QualityMetrics`](../type-aliases/QualityMetrics.md); `path`: `string`; \} \| `null`

Previous metrics plus path, or null when no baseline exists.
