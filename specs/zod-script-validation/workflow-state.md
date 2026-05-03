---
feature: zod-script-validation
area: ZSV
current_stage: implementation
status: paused
last_updated: 2026-05-03
last_agent: planner
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: complete
  tasks.md: complete
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — zod-script-validation

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`.

## Skips

- **Stage 4 Part A (UX) and Part B (UI)** — script-layer feature, no user-visible surface. Only architect Part C is meaningful. Recorded by human 2026-05-02 before /spec:design dispatch.

## Blocks

- None.

## Defer note

**Explicit defer 2026-05-03** — Implementation (Stage 7) pending. Deferred to version issue #209 (v0.7.1 release scope). Spec, design, and tasks are complete and ready to resume. `self-check` blocker cleared by this explicit deferral; status set to `paused`.

## Hand-off notes

```
2026-05-02 (orchestrator): Feature scaffolded. Scope hypothesis — adopt zod for runtime
                           validation in scripts/lib parsers (release-readiness,
                           package-contract, traceability frontmatter). Next: /spec:idea
                           to capture brief; analyst should weigh narrow script-layer
                           adoption vs broader workflow-artifact validation.
2026-05-02 (human):        CLAR-001 + CLAR-002 resolved (see below). Worktree cut at
                           .worktrees/zod-script-validation on branch
                           feat/zod-script-validation. Proceeding to /spec:idea.
2026-05-02 (analyst):      idea.md written + quality gate green (IDEA-ZSV-001,
                           status: accepted). Six open questions form the Stage 2
                           research agenda. Next: /spec:research.
2026-05-02 (analyst):      research.md complete (RESEARCH-ZSV-001). All 6 Qs answered.
                           Recommends zod ^4.x (v4 stable May 2025; 57% smaller, 100x
                           fewer TS instantiations). Migration order revised:
                           release-package-contract → release-readiness → spec-state
                           → traceability. Error-format: wrapper for RELEASE_PKG_*
                           and RELEASE_READINESS_*; native ZodError elsewhere. Test
                           strategy: hybrid (per-target schema-conformance +
                           existing parser tests). Filename mismatch corrected in
                           idea.md (entry script: -contents.ts; lib: -contract.ts).
                           Open decisions for human before /spec:requirements:
                           (1) zod ^3.x vs ^4.x pin, (2) EARS clauses for
                           checkTagAtMain + quality-signal thresholds, (3) confirm
                           RELEASE_PKG_* is stable consumer surface.
2026-05-02 (human):        Three decisions locked: (1) zod ^4.x, (2) EARS clauses
                           required for semantic carve-outs, (3) RELEASE_PKG_* is
                           stable surface — wrapper pattern applies to both
                           code families.
2026-05-02 (pm):           requirements.md complete (PRD-ZSV-001, accepted).
                           13 functional reqs (all `must`), 5 NFRs, 0 open
                           questions. Recommends straight to /spec:design — no
                           /spec:clarify pass needed. Design stage scope: wrapper
                           module structure, ADR for dependencies landing,
                           superRefine-vs-imperative decisions in spec-state.ts.
2026-05-02 (arc42-baseline): questionnaire answered (ARC42-ZSV-001). ADRs filed:
                           ADR-0023 (proposed; flip to accepted at design gate).
                           Open clarifications: CLAR-003, CLAR-004, CLAR-005
                           (architect-call-level, not human decisions). Skips
                           Stage 4 Parts A (UX) + B (UI). Next: /spec:design Part C
                           via architect.
2026-05-02 (architect):    design.md complete (DESIGN-ZSV-001, accepted). Part C
                           only; Parts A + B placeholder per Skips. ADR-0023
                           flipped to accepted. CLAR-003/004/005 resolved
                           (shared zod-diagnostic; sibling-or-inline schemas;
                           inline fixtures). New design-time risk surfaced:
                           RISK-ZSV-007 — circular-import risk between sibling
                           schema/parser modules, mitigated by no parser-constant
                           imports into schemas. All 13 REQs + 5 NFRs mapped in
                           coverage table. Next: /spec:specify via architect.
2026-05-02 (architect):    spec.md complete (SPECDOC-ZSV-001, accepted). 8 SPEC
                           interfaces, ~10 typed shapes via z.infer, 14 edge cases,
                           24 tests (21 unit + 3 integration). Source-grounded:
                           checkChangelog has no shape schema (file-presence +
                           regex); checkTagAtMain takes GitInterface (REQ-ZSV-007
                           imperative end-to-end preserved). EC-012 split:
                           .strict() for template/arg-controlled schemas;
                           .passthrough() for document-reading schemas (real
                           authors add unrelated keys). Concrete pin: zod ^4.0.0.
                           Next: /spec:tasks via planner.
2026-05-02 (planner):      tasks.md complete (TASKS-ZSV-001, accepted). 14 tasks
                           tracer-bullet-shaped — 10 S, 4 M, no L. 4 per-target
                           slice pairs (test+impl atomic) + 3 foundation slices
                           (T-001 dep-landing, T-002 wrapper-test, T-003
                           wrapper-impl) + 3 closing slices (integration sweep,
                           docs, verify-baseline). Glossary terms flagged for
                           human: Diagnostic, ZodError, wrapper, schema-conformance
                           test (non-blocking; consider /glossary:new before
                           Stage 7). Next: /spec:implement starting T-ZSV-001.
2026-05-02 (human):        Roadmap-track decision: this feature targets v0.7.1
                           release. GitHub roadmap epic opened as #209
                           (parent #98 v0.7); v0.7.1 label created.
```

## Open clarifications

- [x] CLAR-001 — Scope: **scripts-only**. Targets: `scripts/lib/release-readiness.ts`,
  `scripts/check-release-package-contents.ts` + `scripts/lib/release-package-contract.ts`,
  `scripts/check-traceability.ts` (frontmatter parse), `scripts/check-spec-state.ts`
  (workflow-state parse). Markdown frontmatter validators deferred — different layer,
  no evidence of bugs there. Revisit if scripts-only adoption proves value.
- [x] CLAR-002 — Runtime dep policy: **`dependencies`, pinned `^4.x`** (locked at
  requirements stage; v4 stable since May 2025). `scripts/` ships to consumers via
  `package.json` `"files"`; devDeps don't install on `npm i @luis85/agentic-workflow`,
  so a runtime guard belongs in `dependencies`. Load-bearing for downstream →
  **ADR-0023 filed** (proposed; flip to accepted at design gate);
  `docs/specorator-product/tech.md` must be updated alongside.
- [x] CLAR-003 — Wrapper module location: **shared `scripts/lib/zod-diagnostic.ts`**
  (architect, DESIGN-ZSV-001 §Key decisions row 2). Single mapping policy and single
  test surface for RISK-ZSV-003; mirrors how diagnostic-code constants already live
  in one place.
- [x] CLAR-004 — Schema location: **sibling files** for `release-readiness.ts`
  (seven check-input schemas) and `spec-state.ts` (frontmatter + enum cross-refs);
  **inline** for `release-package-contract.ts` (only two small schemas) and
  `traceability.ts` (single 1-field `area` schema). Architect, DESIGN-ZSV-001
  §Key decisions row 3.
- [x] CLAR-005 — Test fixture organisation: **inline** in test files (architect,
  DESIGN-ZSV-001 §Key decisions row 4). REQ-ZSV-013 needs only 4×2 fixtures total;
  fixture-dir overhead unjustified at this scale.
