---
id: RESEARCH-V03-001
title: Version 0.3 release plan — Research
stage: research
feature: version-0-3-plan
status: accepted
owner: analyst
inputs:
  - IDEA-V03-001
created: 2026-04-28
updated: 2026-04-28
---

# Research — Version 0.3 release plan

## Context

The README roadmap currently defines v0.3 as "Worked end-to-end examples, artifact validation." The repository already includes:

- `examples/cli-todo/` with stages 1-5 partially present and `workflow-state.md`.
- Repository checks for workflow state, traceability, frontmatter, links, product page, commands, scripts, ADR index, and workflow docs.
- v0.2 contributor infrastructure: worktrees, verify gate, operational bots, and Specorator improvement commands.

## Alternatives

### Alternative A — Finish the existing CLI todo example and strengthen artifact checks

Complete `examples/cli-todo` through release and retrospective, then add validation that checks example completeness, required artifact frontmatter, stage-state consistency, and traceability coverage.

**Pros:** Builds on existing material, keeps scope small, demonstrates the full lifecycle, and directly supports the current README roadmap.

**Cons:** CLI todo is intentionally small, so it may not showcase richer UX, architecture, or operations decisions.

### Alternative B — Add a new richer example and defer validation hardening

Create a larger worked example that better demonstrates product, UX, and architecture work, while leaving validation mostly as-is.

**Pros:** More compelling adoption story for evaluators.

**Cons:** Higher writing burden, more review surface, and does not address drift risks already visible in artifact-heavy workflows.

### Alternative C — Focus v0.3 only on validation automation

Add stricter artifact validators, generated reports, and `npm run verify` coverage, deferring examples to a later release.

**Pros:** Improves contributor confidence and quality gates quickly.

**Cons:** Makes the template more enforceable but not more teachable; weakens the adoption story named in the roadmap.

## Recommendation

Choose Alternative A. v0.3 should complete the existing `cli-todo` example and add a pragmatic validation pass for artifact completeness and traceability. This keeps the release narrow, demonstrable, and aligned with the roadmap.

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RISK-V03-001 | Validation becomes too strict and blocks legitimate incremental work. | medium | Start with active-state-aware checks and document when advisory checks become required. |
| RISK-V03-002 | The example becomes verbose and harder to learn from. | medium | Keep each artifact concise and add an example README map for readers. |
| RISK-V03-003 | v0.3 scope expands into CI gates, metrics, or maturity scoring. | medium | Keep those items explicit non-goals for v0.3 and defer them to v0.4. |
| RISK-V03-004 | Product page and README drift from the new example and checks. | low | Add release tasks for docs and product page review. |

## Sources

- `README.md` roadmap row for v0.3.
- `docs/specorator.md` future extensions and improvement workflow.
- `docs/quality-framework.md` quality gate definitions.
- Existing repository validators under `scripts/`.
- Existing worked example under `examples/cli-todo/`.
