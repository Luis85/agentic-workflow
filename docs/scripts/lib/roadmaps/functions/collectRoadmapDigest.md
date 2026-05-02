[**@luis85/agentic-workflow**](../../../README.md)

***

[@luis85/agentic-workflow](../../../modules.md) / [lib/roadmaps](../README.md) / collectRoadmapDigest

# Function: collectRoadmapDigest()

> **collectRoadmapDigest**(`slug`, `audience`): [`RoadmapDigestReport`](../type-aliases/RoadmapDigestReport.md)

Generate an audience-specific roadmap communication digest.

The digest is read-only. It summarizes selected roadmap artifacts into a
draft update that a human can review before copying into `communication-log.md`.

## Parameters

### slug

`string`

Roadmap folder slug.

### audience

`string`

Intended audience, such as `leadership` or `delivery-team`.

## Returns

[`RoadmapDigestReport`](../type-aliases/RoadmapDigestReport.md)

Digest report for the roadmap and audience.
