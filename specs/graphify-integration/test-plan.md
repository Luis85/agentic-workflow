---
id: TESTPLAN-GRAPH-001
title: Graphify Knowledge Graph Integration — Test Plan
stage: testing
feature: graphify-integration
status: complete
owner: qa
created: 2026-05-03
updated: 2026-05-03
---

# Test Plan — Graphify Knowledge Graph Integration

## Scope

Validate issue #263 end to end:

- Wrapper argument parsing and graphify dispatch.
- Missing-binary handling.
- Windows command-shim handling.
- npm script wiring.
- Generated script docs and how-to docs.
- Committed graph artifacts.
- npm package exclusion for `graph/`.
- Full repository verify gate.

## Checks

| Check | Covers |
|---|---|
| `npm run typecheck:scripts` | `scripts/graphify-run.ts` type safety |
| `npm run test:scripts` | TEST-GRAPH-001..006, TEST-GRAPH-008, TEST-GRAPH-012 |
| `npm run graph` | Full wrapper dispatch and graph artifact generation |
| `npm run graph:update` | Incremental wrapper dispatch |
| `npm run check:links` | TEST-GRAPH-009 |
| `npm run check:frontmatter` | TEST-GRAPH-010 |
| `npm run check:script-docs` | Generated per-script docs |
| `npm pack .\.release-staging --dry-run --json` | Package excludes `graph/` |
| `npm run verify` | Full regression gate |
