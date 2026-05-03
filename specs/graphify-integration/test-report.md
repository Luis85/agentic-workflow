---
id: TESTREPORT-GRAPH-001
title: Graphify Knowledge Graph Integration — Test Report
stage: testing
feature: graphify-integration
status: complete
owner: qa
created: 2026-05-03
updated: 2026-05-03
---

# Test Report — Graphify Knowledge Graph Integration

## Result

PASS.

## Evidence

| Command | Result |
|---|---|
| `npm ci` | PASS |
| `npm run typecheck:scripts` | PASS |
| `npm run test:scripts` | PASS — 280 tests |
| `npm run graph` | PASS — generated `graph/graph.html`, `graph/graph.json`, `graph/GRAPH_REPORT.md` |
| `npm run graph:update` | PASS |
| `npm run check:automation-registry` | PASS |
| `npm run check:links` | PASS |
| `npm run check:frontmatter` | PASS |
| `npm run check:script-docs` | PASS |
| `npm run build:release-archive -- --out .release-staging` | PASS |
| `npm pack .\.release-staging --dry-run --json` | PASS — zero `graph/` entries |
| `npm run verify` | PASS |

## Artifact Checks

- `graph/graph.html` exists.
- `graph/graph.json` exists.
- `graph/GRAPH_REPORT.md` exists.
- `graph/cache/` is ignored.
- `graph/.graphify_root` is ignored.
- `graphify-out/manifest.json` is ignored when graphify writes legacy local state.
- Combined `graph.html` + `graph.json` size: 1,030,154 bytes.
