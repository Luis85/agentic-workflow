---
id: IDEA-V03-001
title: Version 0.3 release plan
stage: idea
feature: version-0-3-plan
status: accepted
owner: analyst
created: 2026-04-28
updated: 2026-04-28
---

# Idea — Version 0.3 release plan

## Problem

Specorator v0.2 has the foundation, skills layer, operational bots, and contributor hygiene in place, but v0.3 is only named in the README roadmap. Contributors need a concrete release plan that explains what v0.3 should deliver, what stays out of scope, and which tasks can be implemented independently.

## Target users

- Template evaluators who want to see a complete example before adopting the workflow.
- Contributors who need clear tasks for artifact validation and example completion.
- Maintainers who need a scoped release boundary for v0.3.

## Desired outcome

v0.3 should make the workflow easier to trust by pairing a complete end-to-end example with deterministic artifact checks that catch common workflow drift before review.

## Constraints

- Keep v0.3 focused on adoption confidence, not a broad maturity-model or CI release.
- Preserve the existing 11-stage lifecycle and optional tracks.
- Use existing Node/TypeScript script patterns and repository verification commands.
- Keep examples separate from active `specs/` workflow state.

## Open questions

- Which example should be completed first: the existing `examples/cli-todo` path or a new product-oriented example?
- Which artifact validation checks should fail `npm run verify` in v0.3 versus remain advisory until v0.4?
- Should the v0.3 release update the product page once the example and validation commands are implemented?
