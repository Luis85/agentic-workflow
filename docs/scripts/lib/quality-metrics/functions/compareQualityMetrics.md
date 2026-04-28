[**agentic-workflow**](../../../README.md)

***

[agentic-workflow](../../../modules.md) / [lib/quality-metrics](../README.md) / compareQualityMetrics

# Function: compareQualityMetrics()

> **compareQualityMetrics**(`current`, `previous`, `baselinePath?`): [`QualityTrend`](../type-aliases/QualityTrend.md)

Compare the current quality metrics snapshot with an earlier snapshot.

## Parameters

### current

[`QualityMetrics`](../type-aliases/QualityMetrics.md)

Current metrics.

### previous

[`QualityMetrics`](../type-aliases/QualityMetrics.md)

Previous metrics for the same scope.

### baselinePath?

`string`

Optional path to the previous snapshot.

## Returns

[`QualityTrend`](../type-aliases/QualityTrend.md)

Trend deltas and human-readable summary.
