[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/roadmaps](../README.md) / collectRoadmapEvidence

# Function: collectRoadmapEvidence()

> **collectRoadmapEvidence**(`slug`): [`RoadmapEvidenceReport`](../type-aliases/RoadmapEvidenceReport.md)

Collect linked artifact evidence for a roadmap.

The collector reads `roadmaps/<slug>/roadmap-strategy.md`, extracts
repository-local artifact links from backticked paths, and summarizes each
linked file without modifying it.

## Parameters

### slug

`string`

Roadmap folder slug.

## Returns

[`RoadmapEvidenceReport`](../type-aliases/RoadmapEvidenceReport.md)

Evidence report for the roadmap.
