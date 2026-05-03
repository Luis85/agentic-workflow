---
id: PRD-ZSV-001
title: Zod Runtime Validation for Script-Layer Parsers
stage: requirements
feature: zod-script-validation
status: accepted
owner: pm
inputs:
  - IDEA-ZSV-001
  - RESEARCH-ZSV-001
created: 2026-05-02
updated: 2026-05-02
---

# PRD — Zod Runtime Validation for Script-Layer Parsers

## Summary

The four script-layer parsers in `scripts/lib/` currently validate input shapes with hand-rolled `typeof` guards scattered across multiple files, producing inconsistent error messages and giving TypeScript no type inference from the validation logic itself. This feature replaces those ad-hoc guards with declarative zod schemas (version `^4.x`), making each parsed artifact's shape a single reviewable definition, giving TypeScript inferred return types throughout, and producing structured field-level errors on shape mismatch. The stable `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic-code surfaces are preserved unchanged through a thin wrapper pattern. Zod lands in `dependencies` so downstream consumers of `@luis85/agentic-workflow` receive the runtime guard automatically on `npm i`. The change ships in a single PR; all existing `npm run test:scripts` cases must stay green.

---

## Goals

- G1 — Replace hand-rolled `typeof` shape guards in the four target parsers with declarative zod schemas; one source of truth per artifact shape.
- G2 — Preserve the `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic-code surfaces unchanged for all downstream consumers.
- G3 — Ship `zod ^4.x` in `dependencies` so it installs automatically when a downstream consumer runs `npm i @luis85/agentic-workflow`.
- G4 — Keep `npm run verify` green and `npm run test:scripts` regressions at zero.

---

## Non-goals

- NG1 — Markdown-frontmatter validation across the broader workflow artifact set (every `specs/*/` file, every `docs/` file). Different layer, no current evidence of bugs; deferred.
- NG2 — Replacing or modifying `parseSimpleYaml` in `scripts/lib/repo.ts`. Zod validates what `parseSimpleYaml` returns; the parser itself is out of scope.
- NG3 — Renaming or reshaping any `RELEASE_READINESS_*` or `RELEASE_PKG_*` diagnostic-code identifier. Those identifiers are the stable consumer surface; this feature must not alter them.
- NG4 — Migrating CI workflows, GitHub Actions steps, or any layer outside `scripts/` to use zod.
- NG5 — Drive-by refactoring of logic not directly required to replace ad-hoc guards with zod schemas.
- NG6 — Bundling, tree-shaking optimisation, or `scripts/` packaging changes beyond the `dependencies` entry landing in `package.json`.

---

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| Specorator template maintainer | When a script-layer parse fails in CI, they need a structured error with field-level path so they can fix the offending input without reading source code | These are the people who edit `scripts/lib/*`, triage CI failures, and review schema diffs when artifact shapes change |
| Downstream consumer of `@luis85/agentic-workflow` | When they run `npm run verify` or `npm run check:*`, they need zod available at runtime without manual setup and the same structured error messages they already know | They install the package and run its shipped scripts; the `dependencies` entry is load-bearing for them |

---

## Jobs to be done

- When a script-layer parse fails, I want a structured zod error with field-level path, so I can identify and fix the offending input without reading source code.
- When I edit a parsed artifact's shape, I want a single schema diff to review, so I am not hunting scattered guard blocks across multiple files.
- When I install `@luis85/agentic-workflow` as a downstream consumer and run its shipped scripts, I want zod available at runtime without separate installation, so the package is self-contained.

---

## Functional requirements (EARS)

### REQ-ZSV-001 — release-package-contract: schema replaces hand-rolled shape checks

- **Pattern:** Event-driven
- **Statement:** WHEN the release-package-contract parser processes a release-package manifest, the parser shall use a zod schema to validate the manifest's shape and shall return a structured `ZodError` containing at least one issue with a non-empty `path` array on any shape mismatch, instead of the previous ad-hoc `typeof` guards.
- **Acceptance:**
  - Given a release-package manifest with one or more missing or wrongly-typed required fields
  - When the parser's `safeParse` call runs against that manifest
  - Then the result's `success` flag is `false`
  - And `result.error.issues` contains at least one entry whose `path` array identifies the specific offending field
  - And no `typeof` guard for that field exists in the parser source
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-002 — release-readiness: schema replaces hand-rolled shape checks for check-function inputs

- **Pattern:** Event-driven
- **Statement:** WHEN the release-readiness parser runs any of its seven check functions against a parsed YAML or argument object, the parser shall use a zod schema to validate that object's shape before executing check logic, and shall return a structured `ZodError` containing at least one issue with a non-empty `path` array on shape mismatch, instead of the previous ad-hoc `typeof` guards.
- **Acceptance:**
  - Given a check-function input with one or more missing or wrongly-typed required fields
  - When the check function's zod schema runs `safeParse` on that input
  - Then the result's `success` flag is `false`
  - And `result.error.issues` contains at least one entry whose `path` array identifies the offending field
  - And no inline `typeof` guard for that field exists in the check function source
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-003 — spec-state: frontmatter schema replaces hand-rolled shape checks

- **Pattern:** Event-driven
- **Statement:** WHEN the spec-state parser processes a `workflow-state.md` frontmatter block, the parser shall use a zod schema to validate the block's shape — including required fields, enum membership for `current_stage`, `status`, and artifact-status values, and required key presence in the `artifacts` map — before executing any cross-property consistency checks, and shall surface a structured zod parse failure on any shape violation.
- **Acceptance:**
  - Given a frontmatter block with a missing required field (e.g. `current_stage` absent) or an out-of-enum `status` value
  - When the spec-state parser's schema runs `safeParse` on the block produced by `parseSimpleYaml`
  - Then the result's `success` flag is `false`
  - And `result.error.issues` identifies the specific field and violation
  - And no hand-rolled `if (!field)` guard for those fields exists in the parser source
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-004 — traceability: frontmatter schema replaces hand-rolled shape checks

- **Pattern:** Event-driven
- **Statement:** WHEN the traceability parser processes a `workflow-state.md` frontmatter block to extract the `area` value, the parser shall use a zod schema to validate that the block is an object containing `area` as a non-empty string matching the pattern `^[A-Z][A-Z0-9]*$`, and shall surface a structured zod parse failure if that constraint is violated, instead of the previous ad-hoc cast and guard.
- **Acceptance:**
  - Given a frontmatter block where `area` is absent, is not a string, or does not match `^[A-Z][A-Z0-9]*$`
  - When the traceability parser's schema runs `safeParse` on the block
  - Then the result's `success` flag is `false`
  - And `result.error.issues` identifies the `area` field and the specific violation
  - And no inline `typeof area !== "string"` guard exists in the parser source for that field
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-005 — RELEASE_READINESS_* diagnostic codes preserved on shape mismatch

- **Pattern:** Unwanted behaviour
- **Statement:** IF a zod-validated parser in `release-readiness.ts` detects a shape mismatch on a check-function input, THEN the wrapper shall convert the `ZodError` to a `Diagnostic` whose `code` value is byte-identical to the `RELEASE_READINESS_*` constant that the previous hand-rolled guard emitted for that same input condition.
- **Acceptance:**
  - Given a check-function input that triggers a specific `RELEASE_READINESS_*` diagnostic code under the current implementation
  - When the same malformed input is passed through the zod schema + wrapper layer
  - Then the emitted `Diagnostic.code` is the same string constant as the pre-migration code for that condition
  - And the test suite exercising that diagnostic-code path passes without modification to its assertions
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-006 — RELEASE_PKG_* diagnostic codes preserved on shape mismatch

- **Pattern:** Unwanted behaviour
- **Statement:** IF a zod-validated parser in `release-package-contract.ts` detects a shape mismatch in `checkReleasePackageContents` or its sub-functions, THEN the wrapper shall convert the `ZodError` to a `Diagnostic` whose `code` value is byte-identical to the `RELEASE_PKG_*` constant that the previous hand-rolled guard emitted for that same input condition.
- **Acceptance:**
  - Given a release-package manifest entry that triggers a specific `RELEASE_PKG_*` diagnostic code under the current implementation
  - When the same malformed input is passed through the zod schema + wrapper layer
  - Then the emitted `Diagnostic.code` is the same string constant as the pre-migration code for that condition
  - And the test suite exercising that diagnostic-code path passes without modification to its assertions
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-007 — checkTagAtMain remains an imperative behavioural check

- **Pattern:** Ubiquitous
- **Statement:** The `checkTagAtMain` function in `release-readiness.ts` shall compare the resolved git tag SHA against the main-branch HEAD SHA using imperative logic and shall emit the existing `TAG_MISSING` or `TAG_NOT_AT_MAIN` diagnostic code when they diverge; a zod schema shall validate the shape of the function's input object only and shall not replace the SHA-comparison logic.
- **Acceptance:**
  - Given a valid-shape input where the tag SHA does not match the main HEAD SHA
  - When `checkTagAtMain` runs
  - Then the function emits `TAG_NOT_AT_MAIN` (unchanged code)
  - And no zod `.refine()` or `.superRefine()` call performs the SHA comparison
  - Given a valid-shape input where the tag is absent
  - When `checkTagAtMain` runs
  - Then the function emits `TAG_MISSING` (unchanged code)
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-008 — Quality-signal threshold checks remain imperative behavioural logic

- **Pattern:** Ubiquitous
- **Statement:** The `checkQualitySignals` function in `release-readiness.ts` shall compare the `maturityLevel` numeric value against the `MIN_QUALITY_MATURITY_LEVEL` constant and shall compare `openBlockers` against zero using imperative comparison logic, and shall emit the existing quality-signal diagnostic codes when thresholds are violated; a zod schema shall validate that `maturityLevel` and `openBlockers` are numbers only and shall not replace the threshold comparisons.
- **Acceptance:**
  - Given a valid-shape input where `maturityLevel` is below `MIN_QUALITY_MATURITY_LEVEL`
  - When `checkQualitySignals` runs
  - Then the function emits the existing low-maturity diagnostic code (unchanged)
  - And the zod schema accepted the input (shape is valid; only the threshold comparison failed)
  - Given a valid-shape input where `openBlockers` is greater than zero
  - When `checkQualitySignals` runs
  - Then the function emits the existing open-blockers diagnostic code (unchanged)
  - And no zod `.refine()` or `.superRefine()` call compares values against those thresholds
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-009 — spec-state cross-property consistency rules execute after schema validation

- **Pattern:** Event-driven
- **Statement:** WHEN the spec-state schema successfully parses a frontmatter block, the spec-state parser shall execute cross-property consistency rules — specifically: (a) that the `current_stage` value corresponds to a stage whose artifact is not `pending` when `status` is `done`, and (b) that no artifact in the `artifacts` map holds a status inconsistent with the declared `current_stage` progression — as a separate validation pass after schema parse success, not as zod `superRefine` constraints, and shall emit string diagnostics for each violated rule.
- **Acceptance:**
  - Given a frontmatter block that passes zod shape validation but has `status: done` while one or more artifacts remain `pending`
  - When the spec-state parser's post-schema consistency pass runs
  - Then the parser emits a non-empty string diagnostic identifying the inconsistent artifact
  - And the zod schema `parse` result for that block was `success: true`
  - Given a frontmatter block where `current_stage` names a stage whose preceding stages contain `pending` artifacts
  - When the consistency pass runs
  - Then the parser emits a diagnostic identifying the progression inconsistency
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-010 — zod added to runtime dependencies at ^4.x

- **Pattern:** Ubiquitous
- **Statement:** The `scripts/` package shall declare `zod` at version range `^4.x` in the `dependencies` field of `package.json`, and the `"files"` entry in `package.json` shall remain unchanged so that zod installs automatically when a downstream consumer runs `npm i @luis85/agentic-workflow`.
- **Acceptance:**
  - Given the published `@luis85/agentic-workflow` package
  - When a downstream consumer runs `npm i @luis85/agentic-workflow` in a project with no prior zod installation
  - Then `node_modules/zod` is present and resolves to a version satisfying `^4.x`
  - And `package.json` `dependencies` contains `"zod": "^4.x"` (or the concrete semver range chosen at implementation)
  - And `package.json` `devDependencies` does not contain a `zod` entry for the runtime import path
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-011 — docs/specorator-product/tech.md updated in the same PR

- **Pattern:** Event-driven
- **Statement:** WHEN the PR introducing the `zod` dependency is merged, `docs/specorator-product/tech.md` shall contain a note recording that `@luis85/agentic-workflow` gained its first runtime dependency (`zod ^4.x`), the rationale (consumer-facing runtime guard), and the ADR identifier that formalised the dependency policy.
- **Acceptance:**
  - Given the PR diff that adds `zod` to `package.json` `dependencies`
  - When a reviewer inspects the same PR
  - Then `docs/specorator-product/tech.md` is modified in the same commit range
  - And the file contains the text identifying `zod ^4.x` as the first runtime dependency and references the ADR by its identifier
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001

---

### REQ-ZSV-012 — schemas and wrappers located in dedicated modules under scripts/lib/

- **Pattern:** Ubiquitous
- **Statement:** The zod schema definitions and the `ZodError`-to-`Diagnostic` wrapper functions for all four target parsers shall reside in dedicated module files under `scripts/lib/` and shall not be inlined inside the entry scripts (`check-release-package-contents.ts`, `check-release-readiness.ts`, `check-traceability.ts`, `check-spec-state.ts`).
- **Acceptance:**
  - Given the merged PR
  - When a reviewer inspects the source tree
  - Then schema definitions are found exclusively in files under `scripts/lib/`
  - And no entry script under `scripts/check-*.ts` contains a `z.object(...)` or `z.string(...)` schema definition
- **Priority:** must
- **Satisfies:** IDEA-ZSV-001, RESEARCH-ZSV-001

---

### REQ-ZSV-013 — per-target schema-conformance tests added

- **Pattern:** Event-driven
- **Statement:** WHEN the test suite for a migrated target runs, the suite shall include at least one schema-conformance test per target that calls `schema.safeParse(validFixture)` and asserts `success: true`, and at least one that calls `schema.safeParse(invalidFixture)` and asserts `success: false` with an `issues` entry whose `path` identifies the expected field.
- **Acceptance:**
  - Given the `npm run test:scripts` suite after migration
  - When it runs for `release-package-contract` schema
  - Then a test exists that passes a valid fixture and asserts `result.success === true`
  - And a test exists that passes an invalid fixture and asserts `result.success === false` and `result.error.issues[0].path` is non-empty
  - And the same pattern holds for schemas in `release-readiness`, `spec-state`, and `traceability`
- **Priority:** must
- **Satisfies:** RESEARCH-ZSV-001

---

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-ZSV-001 | performance | `npm run verify` wall-clock runtime shall not increase by more than 5% relative to the pre-migration baseline measured on the same machine and Node.js version | ≤ 5% regression (soft target; introduced here because research found no significant cost but the first runtime dep warrants a guard) |
| NFR-ZSV-002 | reliability | Zero regressions in existing `npm run test:scripts` test cases; all previously passing cases must continue to pass after migration | 0 regressions |
| NFR-ZSV-003 | security | The `zod` package and its transitive dependency tree shall be scanned by the existing `dep-triage-bot` within one scheduled run of the bot after the PR merges | Scan within 1 scheduled bot cycle |
| NFR-ZSV-004 | compatibility | Zod schemas and wrappers shall compile and run under `tsconfig.scripts.json` strict-mode TypeScript in an `"type": "module"` ESM project executed via `tsx` without any CommonJS interop configuration | No CommonJS interop hacks; `tsc --project tsconfig.scripts.json` exits 0 |
| NFR-ZSV-005 | maintainability | Schema definitions and wrapper functions shall be located in dedicated files under `scripts/lib/` — not inlined in entry scripts — so that a shape change requires edits in at most one file per target | 1 file per target shape definition |

---

## Success metrics

- **North star:** Hand-rolled `typeof` shape guards in the four target parsers reduced to zero, fully replaced by zod schema definitions.
- **Supporting:** Zero regressions in `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic-code emission paths, verified by the existing parser test suite passing unchanged assertions.
- **Counter-metric:** `npm run verify` wall-clock runtime — must not increase by more than 5% compared to the pre-migration baseline (NFR-ZSV-001). If the soft target is exceeded, the implementation team must document the delta and either optimise or request a human waiver before merging.

---

## Release criteria

- [ ] All `must` REQ-ZSV-NNN requirements pass their acceptance criteria.
- [ ] All NFR-ZSV-NNN met; any waiver documented in an ADR and approved by the human maintainer.
- [ ] ADR filed at the design stage formalising the `zod ^4.x` entry in `dependencies` (CLAR-002 obligation); ADR merged in the same PR as the code change.
- [ ] `docs/specorator-product/tech.md` updated in the same PR as the dependency change (REQ-ZSV-011).
- [ ] No critical or high severity bugs open against this feature.
- [ ] `npm run verify` passes locally and in CI on the feature branch.
- [ ] `npm run test:scripts` passes locally and in CI with zero failing cases.
- [ ] Per-target schema-conformance tests (REQ-ZSV-013) present and green.

---

## Open questions / clarifications

None open. All clarifications resolved before this stage:

- CLAR-001 — Scope boundary confirmed: scripts-only, four named targets. (Resolved by human; recorded in `workflow-state.md`.)
- CLAR-002 — Dep policy confirmed: `dependencies`, ADR required at design stage. (Resolved by human; recorded in `workflow-state.md`.)
- Zod version pin `^3.x` vs `^4.x` — locked to `^4.x` per human instruction before requirements stage. v4 stable since May 2025; v4 is the current default `zod` root export.
- `RELEASE_PKG_*` stable-surface confirmation — confirmed as a stable consumer surface on par with `RELEASE_READINESS_*` per human instruction before requirements stage. Both are covered by REQ-ZSV-006.
- Cross-property consistency rules in `spec-state.ts` — REQ-ZSV-009 assigns all value-dependent cross-property rules (stage-progression and artifact-status consistency) to an imperative post-schema pass, not to zod `superRefine`. Enum and field-presence rules belong in the schema. This boundary is explicit; no ambiguity remains.

---

## Out of scope

What we explicitly will not do this cycle:

- Validate markdown frontmatter across the broader `specs/*/` or `docs/` artifact set.
- Replace or modify `parseSimpleYaml` in `scripts/lib/repo.ts`.
- Rename, reshape, or remove any `RELEASE_READINESS_*` or `RELEASE_PKG_*` diagnostic-code identifier.
- Migrate CI workflows, GitHub Actions steps, or any non-`scripts/` layer to use zod.
- Perform drive-by refactors of logic not directly displaced by zod schema adoption.
- Bundle or tree-shake `scripts/` output, or make any `package.json` `"files"` change beyond adding the `zod` dependency entry.

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has an ID.
- [x] Acceptance criteria testable (concrete triggers, observable outcomes, no vague verbs).
- [x] No hidden conjunctions (`and` clauses split into separate requirements).
- [x] No design language (no component names, no `z.object()` in requirement statements, no module paths).
- [x] Each requirement names the system explicitly.
- [x] NFRs listed with numeric or binary targets.
- [x] Success metrics defined including a counter-metric.
- [x] Release criteria stated.
- [x] `/spec:clarify` self-check: no open questions remain.
