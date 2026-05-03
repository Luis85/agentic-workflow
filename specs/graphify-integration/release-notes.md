---
id: RELNOTES-GRAPH-001
title: Graphify Knowledge Graph Integration — Release Notes
stage: release
feature: graphify-integration
status: complete
owner: release-manager
created: 2026-05-03
updated: 2026-05-03
---

# Release Notes — Graphify Knowledge Graph Integration

## Summary

Adds a committed graphify knowledge graph under `graph/` and npm scripts to regenerate it locally.

## User-Visible Changes

- New `npm run graph` script.
- New `npm run graph:update` script.
- New `docs/how-to/use-graphify.md` guide.
- New committed graph artifacts:
  - `graph/graph.html`
  - `graph/graph.json`
  - `graph/GRAPH_REPORT.md`

## Operational Notes

Install graphify with:

```bash
python -m pip install --user --upgrade graphifyy
```

Then run:

```bash
npm run graph
```
