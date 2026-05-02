[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / latestQualityMetricsSnapshot

# Function: latestQualityMetricsSnapshot()

> **latestQualityMetricsSnapshot**(`metrics`): [`QualityMetricsSnapshot`](../type-aliases/QualityMetricsSnapshot.md) \| `null`

Load the latest saved quality metrics snapshot for the current scope.

## Parameters

### metrics

[`QualityMetrics`](../type-aliases/QualityMetrics.md)

Current metrics whose scope selects the snapshot directory.

## Returns

[`QualityMetricsSnapshot`](../type-aliases/QualityMetricsSnapshot.md) \| `null`

Previous metrics plus path, or null when no baseline exists.
