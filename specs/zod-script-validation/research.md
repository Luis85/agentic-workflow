---
id: RESEARCH-ZSV-001
title: Zod Runtime Validation for Script-Layer Parsers — Research
stage: research
feature: zod-script-validation
status: complete
owner: analyst
inputs:
  - IDEA-ZSV-001
created: 2026-05-02
updated: 2026-05-02
---

# Research — Zod Runtime Validation for Script-Layer Parsers

## Research questions

| ID | Question | Status |
|---|---|---|
| Q1 | Install-time cost of `zod` as first `dependencies` entry | answered |
| Q2 | Alternatives: `valibot`, `arktype`, `@badrap/valita`, `superstruct` vs `zod` for this use case | answered |
| Q3 | Semantic vs shape bugs in the four target parsers | answered |
| Q4 | Migration order for the four targets | answered |
| Q5 | Error-format strategy: ZodError native vs wrapper for `RELEASE_READINESS_*` codes | answered |
| Q6 | Test strategy: new schema-validation tests vs existing parser tests vs hybrid | answered |

---

## Market / ecosystem

### Library comparison

| Solution | Approach | Bundle size (min+gz) | ESM support | Type inference | Error format | Maturity / adoption | Source |
|---|---|---|---|---|---|---|---|
| **zod v3** (working assumption) | Method-chain, class-based schemas | ~13–17 kB min+gz (unbundled install ~61 kB); 20 kB gzipped in typical SDK | First-class ESM; ships both ESM and CJS | Inferred `z.infer<typeof schema>` | `ZodError` with `.issues[]`; path + message per issue | ~137 M downloads/wk; de-facto standard | [bundlephobia](https://bundlephobia.com/package/zod); [npm](https://www.npmjs.com/package/zod) |
| **zod v4** (stable as of May 2025) | Same method-chain API; restructured core | Core 57% smaller than v3 (~8–9 kB min+gz est.); `zod/v4` import path | First-class ESM; `zod` root now points to v4 | Same pattern; 100x fewer TS instantiations | Unified `error` param; `ZodError` shape compatible | Same package, same downloads; v4 is default `zod` root since Jul 2025 | [zod.dev/v4](https://zod.dev/v4) |
| **valibot** | Functional/modular; tree-shaken per import | ~1.4 kB for simple schema; scales linearly | Full ESM; exports `type: module` | `InferOutput<typeof schema>` | `ValiError` with `.issues[]`; similar path structure | Growing; ~5–6 M downloads/wk; smaller ecosystem | [valibot.dev](https://valibot.dev/guides/comparison/) |
| **arktype** | TS-syntax string literals; JIT compiler | Medium node_modules; JIT adds startup cost | ESM available | Best-in-class type narrowing | Runtime errors with path; less familiar format | ~2–3 M downloads/wk; niche, high-capability | [medium.com/@ruverd](https://medium.com/@ruverd/why-use-arktype-instead-of-zod-08c401fd4f6f) |
| **@badrap/valita** | Small, functional | ~3–4 kB (unverified; to be confirmed during requirements) | ESM available | Good but narrower ecosystem docs | Standard errors | Very small ecosystem; low adoption | — (no primary source found at research time) |
| **superstruct** | Functional composition | ~1.8 kB for real-world use case | ESM available | Good inference | Standard coercion errors | Moderate; predates zod; slower update cadence | [betterstack.com](https://betterstack.com/community/guides/scaling-nodejs/superstruct-explained/) |
| **Internal helper** (`assertShape<T>`) | Hand-rolled `typeof` guards + custom throws | 0 kB (no new dep) | N/A | TypeScript does not infer from runtime guards | Bespoke, inconsistent messages today | Existing prior art in `scripts/lib/` — see Q3 | Codebase |

### Internal prior art

`scripts/lib/repo.ts` — `parseSimpleYaml` and `extractFrontmatter` are hand-rolled YAML/frontmatter parsers that return `Record<string, unknown>`. All downstream consumers of parsed data cast manually (e.g., `data.artifacts as Record<string, unknown>` in `spec-state.ts` line 134; `root as Record<string, unknown> | null` in `release-readiness.ts` line 417). There is no shared helper that couples a parse call to a shape assertion — callers write `if (!field || typeof field !== "object")` guards ad hoc.

---

## User needs

Primary users are **Specorator template maintainers** — the people who edit `scripts/lib/*` and triage CI failures.

**Finding 1** — Shape assumptions are scattered and inconsistent. In `scripts/lib/release-readiness.ts`, `checkReleaseNotesConfig` at lines 417–418 casts the parsed YAML to `Record<string, unknown> | null` and then manually guards `!changelog || typeof changelog !== "object"`. In `spec-state.ts` at line 134, the same pattern recurs for `data.artifacts`. These are pure shape guards duplicated across files with no shared schema definition. *(Source: direct code inspection)*

**Finding 2** — TypeScript cannot narrow return types from `parseSimpleYaml`. Because `parseSimpleYaml` returns `Record<string, unknown>`, all downstream destructuring happens at `unknown` and must be manually narrowed. Zod schemas would give back a fully-inferred type, removing the need for every cast. *(Source: direct code inspection — `scripts/lib/spec-state.ts`, `scripts/lib/traceability.ts`, `scripts/lib/release-readiness.ts`)*

**Finding 3** — Diagnostic messages are generated inline inside guard blocks rather than from a schema definition. When a shape changes (e.g., a new required frontmatter field is added to `workflow-state.md`), the maintainer must find and update every guard that touches that field. A zod schema centralises the shape definition and generates field-level error messages automatically. *(Source: direct code inspection)*

**Assumption A** — Downstream consumers of `@luis85/agentic-workflow` who run `npm run verify` will benefit from clearer field-level errors on shape mismatch. This assumption cannot be validated without downstream usage data; it is treated as accepted intent per `idea.md`.

**Assumption B** — The install-time overhead of `zod` as the first `dependencies` entry is acceptable for downstream consumers. This must be validated in release notes.

---

## Q1 — Install-time cost

**zod v3** unpacked install size: approximately 430–470 kB on disk (all files including type declarations and CJS/ESM dual output). The runtime bundle contribution when imported in an ESM script is approximately 52–68 kB minified (unzipped), or roughly 13–17 kB gzipped. In a script-only context running under `tsx` (no bundler, direct ESM imports), the consumer pays the full unpacked size on disk, not a bundled size.

**zod v4** (stable since May 2025): the core ESM bundle is ~57% smaller than v3, so disk footprint is materially reduced. The `zod` package root now exports v4 as of July 2025. This matters for the pinning decision: `^3.x` will not resolve to v4; `^4.x` would resolve to v4.

**For downstream consumers** installing `@luis85/agentic-workflow`: the package installs `zod` automatically as a `dependency`. For a consumer who already has `zod` in their project, npm deduplication typically means no additional disk cost. For a consumer with no prior zod dependency, the added disk cost is approximately 430–470 kB (v3) or estimated ~250–300 kB (v4). Neither figure is remarkable for a Node.js toolchain package. **This is worth one sentence in release notes**, not a blocking concern.

**Unverified number**: exact v4 install footprint at time of writing (May 2026). The numbers above are based on v4 release data from mid-2025 and should be confirmed at implementation time via `npm pack --dry-run` on the zod package.

---

## Q2 — Alternatives evaluation (answered in ecosystem table above; summarised here)

For **this** use case — script-layer parsers, ESM under strict TS, `tsx` runtime, no browser bundling, no tree-shaking — the bundle-size advantage of `valibot` and `superstruct` does not apply. The package ships under `tsx`; every import is a direct Node.js ESM import, not a bundled web artifact. The 1.4 kB vs 17 kB difference is irrelevant in this context.

**valibot** is the strongest contender on bundle size and has good ESM/TS support. However: (a) its functional API is less familiar to most TypeScript developers than zod's method-chain API; (b) error-message format is `ValiError` rather than `ZodError` — adopting it would not reuse any existing team familiarity with zod; (c) ecosystem size is ~25x smaller than zod, meaning fewer examples, integrations, and Stack Overflow answers.

**arktype** is the strongest contender on type inference quality and runtime speed. It is genuinely different from zod (not just a flavour of the same thing). However: (a) the string-literal schema DSL has a steeper learning curve; (b) the JIT compiler adds startup cost that matters more in short-lived scripts than in long-running servers; (c) its community is smaller still.

**@badrap/valita** — no primary source found during research. The library exists but has a very small ecosystem and limited recent documentation. Not a viable recommendation without more investigation.

**superstruct** — functional composition API, ~1.8 kB. Valid option but slower update cadence and smaller community than zod v4. Error format diverges from zod.

**Conclusion for Q2**: zod is the correct choice for this use case. The justification is not merely popularity — it is that (a) tree-shaking advantage is irrelevant in the `tsx` runtime, (b) zod v4's 57% smaller core means the install-time cost argument weakens further, and (c) the `RELEASE_READINESS_*` wrapper pattern is well-documented in the zod community.

---

## Q3 — Semantic vs shape bugs in the four target scripts

### `scripts/lib/release-readiness.ts` (+ `check-release-readiness.ts` entry point)

Shape guards: `checkPackageMetadata` (lines 472–527), `checkReleaseNotesConfig` (lines 393–463), `checkWorkflowPermissions` (lines 529–582), `checkVersionAlignment` (lines 300–334). All of these are **pure shape checks** with one exception.

Semantic logic (not pure shape): `checkTagAtMain` (lines 336–365) — this function compares two SHA strings. It does not validate the shape of a git ref; it validates a semantic property (tag points at main HEAD). Zod cannot replace this logic. It must remain as imperative code. **Flag for requirements**: the TAG_MISSING and TAG_NOT_AT_MAIN diagnostic paths are semantic, not schema-replaceable.

Semantic logic: `checkQualitySignals` (lines 656–698) — validates that numeric fields satisfy threshold conditions (`signals.maturityLevel < MIN_QUALITY_MATURITY_LEVEL`, `signals.openBlockers > 0`). Zod can validate that `maturityLevel` is a `number` (shape), but the threshold comparison is semantic business logic. The schema should capture the shape; the threshold check remains as a refinement or a separate validation step. **Flag for requirements**: semantic clauses are needed for the quality-signals threshold logic.

All other checks in this file are shape checks that zod can replace directly.

### `scripts/lib/release-package-contract.ts` (+ `check-release-package-contents.ts` entry point)

`checkNoNumberedAdrs` — shape: checks that file names match `ADR_NUMBERED_PATTERN`. This is a regex-on-string check; zod `.regex()` can represent it in a schema.

`checkIntakeFoldersEmpty` — mixed: checks that a directory entry is a file named `README.md`. The filesystem iteration is procedural; the shape check per entry (`entry.name === "README.md"`) is trivially representable as a zod literal.

`checkDocsAreStubs` — uses `extractFrontmatter` and `parseSimpleYaml` (both hand-rolled). The key shape check is: presence of required frontmatter keys from `DOC_STUB_REQUIRED_FRONTMATTER_KEYS` and presence of specific body markers (`<!-- TODO:`). The frontmatter-key check is a pure shape check; the body marker check is closer to semantic content validation.

`parseReleasePackageArgs` — pure shape / argument parsing. Entirely replaceable with a zod discriminated union.

**No semantic bugs found** in these files — behaviour on valid input appears correct. The existing logic is shape validation expressed procedurally.

### `scripts/check-traceability.ts` (delegates to `scripts/lib/traceability.ts`)

`traceabilityDiagnosticsForFeature` at lines 41–77 — parses frontmatter with `extractFrontmatter` + `parseSimpleYaml` and then reads `state.area`. This is a shape check on the workflow-state frontmatter.

The bulk of the traceability logic — registry building, cross-reference validation, test-coverage checks (`validateTestCoverage`, `validateTraceFields`) — is **semantic graph traversal**, not schema validation. Zod cannot replace the cross-reference logic. What zod can validate: the shape of a parsed frontmatter block (e.g., `area` is a string matching `^[A-Z][A-Z0-9]*$`).

**Flag for requirements**: traceability is a light target. Only the frontmatter-shape extraction benefits from zod; the rest is business logic that must stay imperative.

### `scripts/check-spec-state.ts` (delegates to `scripts/lib/spec-state.ts`)

`specStateDiagnosticsForText` at lines 32–55 — calls `parseSimpleYaml` on frontmatter, then passes the result to `validateRequiredFields`, `validateFeatureIdentity`, `validateArtifactMap`, `validateStageProgress`. All of `validateRequiredFields` and `validateArtifactMap` are shape checks: required key presence, enum membership (`workflowStages`, `workflowStatuses`, `artifactStatuses`), type checks.

`validateCurrentStageArtifact` and `validateDoneState` — mixed: enum checks (shape) plus cross-property consistency rules (semantic — e.g., "status is `done` but artifact X is `pending`"). The cross-property rules are semantic; they depend on relationships between parsed values. Zod `.superRefine()` can express these, but they should be treated as requiring behavioural requirements, not just schema definitions.

**Semantic bugs scan**: No behavioural bugs on valid input were found. All existing logic appears correct. The issue is the inconsistency of error messages and the absence of type inference, not wrong output.

### Summary table

| Target | Pure shape checks | Semantic / behavioural checks | Notes |
|---|---|---|---|
| `release-readiness.ts` | 5 of 7 check functions | `checkTagAtMain`, quality-signal thresholds | Tag SHA comparison + threshold logic must stay imperative |
| `release-package-contract.ts` | 3 of 3 core checks | None (filesystem iteration is procedural but not semantic) | Cleanest zod target |
| `check-traceability.ts` / `lib/traceability.ts` | Frontmatter shape only | All graph traversal + cross-ref logic | Zod scope narrow: frontmatter schema only |
| `check-spec-state.ts` / `lib/spec-state.ts` | Frontmatter shape + enum membership | Cross-property consistency rules | `superRefine` can cover consistency; or keep imperative |

---

## Q4 — Migration order

**Recommended order:**

1. **`scripts/lib/release-package-contract.ts`** — cleanest first target. `parseReleasePackageArgs` is a discriminated-union argument parse; `checkReleasePackageContents` delegates to three sub-functions all doing shape checks on file-system entries and parsed frontmatter. No semantic logic to preserve. No stable diagnostic codes that require a wrapper (the `RELEASE_PKG_*` codes are not documented as a stable consumer surface with the same weight as `RELEASE_READINESS_*`).

2. **`scripts/lib/release-readiness.ts`** — second, because it has the most complete set of shape checks and the well-known `RELEASE_READINESS_*` diagnostic-code constraint. The `parseReleaseReadinessArgs` function is a clean argument parser; the seven check functions are mostly shape-driven. The two semantic carve-outs (tag SHA comparison, quality-signal thresholds) must be preserved as imperative logic. The `RELEASE_READINESS_*` wrapper pattern is required here (see Q5).

3. **`scripts/lib/spec-state.ts`** (via `check-spec-state.ts`) — third, because the frontmatter shape is well-defined (seven required fields, enum constraints) but the cross-property consistency rules add complexity. A zod schema covers the shape; `.superRefine()` or keep-imperative decisions for consistency rules should be clarified in requirements.

4. **`scripts/lib/traceability.ts`** (via `check-traceability.ts`) — last, because the zod surface is narrow (frontmatter schema only) while the semantic graph-traversal logic is large. The value added by zod is modest relative to the other three targets; migrating it last ensures it doesn't block progress on the higher-value parsers.

**Revision of working hypothesis**: the idea.md hypothesis was that `release-readiness.ts` is the cleanest first target. Code inspection shows `release-package-contract.ts` is cleaner — it has no semantic carve-outs and no wrapper requirement. Recommend revising the hypothesis to sequence `release-package-contract.ts` first.

---

## Q5 — Error-format strategy

**Hard constraint recap**: `RELEASE_READINESS_DIAGNOSTIC_CODES.*` identifiers must remain stable. They are exported constants referenced by downstream consumers and by tests.

**Pattern A (wrapper)**: Zod schema parses the shape; on `ZodError`, a thin translation function maps each `issue` to a `Diagnostic` with the appropriate `RELEASE_READINESS_*` code. The `ZodError` itself is never surfaced to consumers; only the existing `Diagnostic` shape escapes. This is the only viable pattern for `release-readiness.ts`.

**Pattern B (native ZodError)**: Zod schema parses the shape; `ZodError` propagates directly to the consumer. Viable only for parsers that do not currently emit stable diagnostic codes, or for argument-parsing functions that throw on invalid input and do not emit structured diagnostics.

**Per-target recommendation:**

| Target | Pattern | Rationale |
|---|---|---|
| `release-package-contract.ts` — `parseReleasePackageArgs` | Pattern B (native / throw) | Argument-parsing function; currently throws on invalid input; no stable diagnostic code contract |
| `release-package-contract.ts` — `checkReleasePackageContents` | Pattern A (thin wrapper) | Emits `RELEASE_PKG_*` codes; these are consumed by `check-release-package-contents.ts` and `release-readiness.ts`; should remain stable |
| `release-readiness.ts` — `parseReleaseReadinessArgs` | Pattern B (native / throw) | Same as above; argument parser |
| `release-readiness.ts` — `checkReleaseReadiness` + sub-functions | Pattern A (thin wrapper) | `RELEASE_READINESS_*` codes are the stable consumer surface; zod validates shape internally; a per-check mapping function emits the correct code |
| `spec-state.ts` — frontmatter schema | Pattern B (native ZodError → string diagnostic) | Error strings are not currently a stable code-keyed surface; existing callers collect `string[]` diagnostics; the shape-parse result can flow into the existing string-diagnostic format |
| `traceability.ts` — frontmatter schema | Pattern B (native ZodError → string diagnostic) | Same as spec-state |

**Wrapper mechanics** (Pattern A): each check function that currently produces a `Diagnostic[]` keeps the same signature. Internally, a `const result = schema.safeParse(raw)` call is made; if `result.success === false`, the code iterates `result.error.issues` and maps each issue to a `Diagnostic` with the pre-assigned code and a composed message. The stable code is assigned by the wrapping function, not inferred from the zod error. This is a 5–10 line translation per check function.

---

## Q6 — Test strategy

**Existing test infrastructure**: `npm run test:scripts` runs `scripts/test-scripts.ts`, which covers parser behaviour end-to-end (valid inputs, malformed inputs, edge cases). These tests exercise the parser logic, not the schema definitions independently.

**Three options:**

**(a) New `TEST-ZSV-NNN` schema-validation tests independent of parser tests** — explicitly tests that the zod schema rejects out-of-shape inputs and accepts valid inputs. Pro: schema becomes a testable contract independent of parser behaviour. Con: some duplication with existing parser tests.

**(b) Rely on existing parser tests + zod inferred-type guarantee** — zod's type inference means a compiled parser with a schema already guarantees shape at the TypeScript level. Runtime tests catch what the type system cannot (e.g., dynamic inputs from disk). Pro: minimal new test surface. Con: schema definition itself is untested as a contract.

**(c) Hybrid** — add one schema-conformance test per target (`TEST-ZSV-001` through `TEST-ZSV-004`) that directly exercises `safeParse` on a known-good fixture and a known-bad fixture. Existing parser tests continue to run unchanged and serve as integration coverage.

**Recommendation: hybrid (c).** One `TEST-ZSV-NNN` test per target: call `schema.safeParse(validFixture)` — assert success; call `schema.safeParse(invalidFixture)` — assert failure with the expected issue path. This costs four small test cases and gives the schema definition its own test contract. Existing parser tests continue to provide integration coverage for the wrapper layer and the full diagnostic emission path.

---

## Alternatives considered

### Alternative A — Adopt zod (^3.x or ^4.x)

Replace ad-hoc `typeof` guards and manual casts with zod schemas in the four target parsers. Thin wrapper maps `ZodError` → `Diagnostic` for targets emitting stable codes; native `ZodError` propagation for argument-parsing functions.

**Pros**: eliminates manual guards; TypeScript infers return types from schemas; structured field-level error messages; one schema = one source of truth per parsed artifact; strong ecosystem, rich documentation, existing community patterns for the wrapper idiom.

**Cons**: first runtime dependency for `@luis85/agentic-workflow`; download/install overhead for downstream consumers (modest but non-zero); v3-to-v4 transition in progress means the pinning decision (`^3.x` vs `^4.x`) has minor ecosystem friction.

**Version note**: zod v4 is stable as of May 2025 and is now the default `zod` root export (since July 2025). The idea.md constraint pins `^3.x` — this was locked before v4 went stable. Requirements should surface whether `^4.x` is viable, given v4's smaller bundle and better TS performance.

### Alternative B — Adopt valibot

Valibot offers a 90% smaller bundle and a functional API with equal type-inference quality. For a server-side script-only use case, the bundle advantage is irrelevant, but the modular design means no unused validators are loaded.

**Pros**: smaller install footprint; full ESM; good TS strict-mode support; growing ecosystem.

**Cons**: `ValiError` not `ZodError` — the wrapper pattern for `RELEASE_READINESS_*` codes must be written from scratch against a less-familiar error shape; smaller ecosystem means fewer examples for the wrapper pattern; functional API is less idiomatic for a team more familiar with zod; switching cost is not justified by the bundle advantage in this context.

**Verdict**: not recommended. The bundle advantage does not apply; the migration cost is higher; the ecosystem is smaller.

### Alternative C — Extract a shared internal helper (`assertShape<T>`)

Implement a hand-rolled `assertShape<T>(value: unknown, fields: (keyof T)[]): T` helper in `scripts/lib/` that validates required field presence and basic type membership without adding a runtime dependency. All four targets migrate to use this helper instead of inline guards.

**Pros**: zero new dependencies; zero install-time cost; no ADR required for dep change; no `RELEASE_READINESS_*` wrapper needed (helper is internal and emits whatever string the caller provides).

**Cons**: `assertShape<T>` cannot infer types from a runtime definition — TypeScript still requires the caller to declare the type separately and trust that the runtime shape matches; error messages are still hand-assembled (caller must pass message strings); the helper must be maintained as requirements evolve; no structured error path (no `.issues[]`); this is the same architecture as today, marginally cleaner. It does not resolve the "scattered assumptions" problem — it merely wraps them.

**Verdict**: this is the do-nothing-new baseline. It is worth pursuing only if the ADR requirement for adding a runtime dependency cannot be met before the PR merges. If the ADR is filed in the design stage as required, Alternative A is strictly better than Alternative C.

---

## Technical considerations

**ESM under strict TypeScript (`tsconfig.scripts.json`, `"type": "module"`, `tsx` runtime):** Zod v3 ships dual CJS/ESM and works cleanly in this setup. Zod v4 is also ESM-first. No CommonJS interop hacks are required for either version. `tsx` handles ESM TypeScript imports natively. No risk here.

**ZodError shape**: `ZodError.issues` is an array of `ZodIssue` objects, each with `path` (array of string/number keys), `code` (enum), and `message`. The `path` array is the key field for mapping to `Diagnostic.path`. The wrapper function must convert `issue.path.join(".")` (or a more specific formatter) to the POSIX path string that `Diagnostic.path` expects.

**`RELEASE_READINESS_*` interaction**: the diagnostic-code constants are exported from `release-readiness.ts` and imported by at least `check-release-readiness.ts` (entry point) and indirectly by the test suite. The constants object itself does not change — only the internal logic that decides which code to emit changes (from an inline `if` to a `safeParse` result handler). No downstream breakage expected.

**`package.json` `"files"` and consumer install**: `scripts/` is in `"files"`. When a downstream consumer installs `@luis85/agentic-workflow`, they get `scripts/` and all its imports, including `zod`. Because `zod` is in `dependencies`, npm installs it automatically. This is the load-bearing reason `zod` must be in `dependencies`, not `devDependencies`.

**Shipping the zod import**: scripts import `zod` directly. No bundling step exists for `scripts/`. The consumer's Node.js process resolves the `zod` import from `node_modules` at runtime. This is standard ESM behaviour and requires no special configuration.

**ADR requirement**: adding the first `dependencies` entry is architecturally load-bearing. The ADR must be filed in the design stage and merged in the same PR, per CLAR-002.

**`docs/specorator-product/tech.md` update**: required in the same PR per the idea.md constraint. No technical blocker; it is a documentation obligation.

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-ZSV-001 | **Supply-chain risk — first runtime dep.** Adding `zod` to `dependencies` introduces a new transitive attack surface. `@luis85/agentic-workflow` currently has no runtime dependencies. | med | low | Pin to `^3.x` (or `^4.x`); add zod to automated dependency-triage bot scope (already exists as `dep-triage-bot`); review zod's security track record (no known CVEs at research time per Snyk data). |
| RISK-ZSV-002 | **Zod major-version churn.** Zod v4 became the default `zod` root export in July 2025. If `^3.x` is pinned and zod v5 ships within the PR window, the version becomes stale faster than expected. | low | low | Pin `^4.x` at implementation time (v4 is stable; v5 is not announced); use `zod/v3` subpath import as a fallback if v4 compat issues arise. TBD — owner: pm (version selection belongs in requirements). |
| RISK-ZSV-003 | **Error-format regression for `RELEASE_READINESS_*` consumers.** If the wrapper pattern is implemented incorrectly, the diagnostic code emitted on a shape mismatch could change, breaking consumers who pattern-match on specific codes. | high | low | Existing parser tests in `test:scripts` already exercise diagnostic-code emission paths. New `TEST-ZSV-NNN` schema-conformance tests provide an additional safety net. The wrapper function must be reviewed against every `RELEASE_READINESS_*` code path before merge. |
| RISK-ZSV-004 | **Test-coverage gap during migration.** If parser tests are updated before the wrapper layer is complete, a window exists where shape validation is not tested end-to-end. | med | med | Migrate schema + wrapper + parser tests atomically per target in a single commit; do not split schema definition from wrapper implementation across separate commits. |
| RISK-ZSV-005 | **`parseSimpleYaml` boundary.** The hand-rolled `parseSimpleYaml` in `repo.ts` returns `Record<string, unknown>`. Zod schemas in `spec-state.ts` and `traceability.ts` will parse the output of this function, not raw YAML. If `parseSimpleYaml` silently drops or misrepresents a field, the zod schema will report a false-positive error or miss a real one. | med | low | Add a note in requirements that `parseSimpleYaml` is not in scope for replacement; zod validates what `parseSimpleYaml` returns. Any future inconsistency in `parseSimpleYaml` will surface as a zod error, which is an improvement over silent null returns today. |
| RISK-ZSV-006 | **Semantic logic mis-classified as shape.** The code analysis above identified `checkTagAtMain` and quality-signal thresholds as semantic. If requirements writers treat these as schema-replaceable, the resulting schema will either over-constrain (rejecting valid inputs) or under-specify the behaviour. | med | low | Requirements must include explicit behavioural clauses for tag-SHA comparison and quality-signal thresholds, per the Q3 flag. The analyst has surfaced this here; pm must carry it forward. |

---

## Recommendation

**Adopt zod.** Alternative A (zod) is the recommended approach.

**Version**: pin `^4.x` at implementation time. Zod v4 was stable as of May 2025 and is the current default root export. It is 57% smaller than v3 and has 100x fewer TypeScript instantiations. The idea.md constraint said `^3.x` because v4 was not yet stable at that time; requirements should update this to `^4.x`. TBD — owner: pm.

**Migration order**:
1. `scripts/lib/release-package-contract.ts` — cleanest, no wrapper required for argument parsing; `RELEASE_PKG_*` wrapper for `checkReleasePackageContents`.
2. `scripts/lib/release-readiness.ts` — pattern A wrapper for all seven check functions; semantic carve-outs for `checkTagAtMain` and quality-signal thresholds documented in requirements.
3. `scripts/lib/spec-state.ts` — frontmatter schema with `superRefine` or imperative cross-property checks; requirements must specify which consistency rules need behavioural clauses.
4. `scripts/lib/traceability.ts` — narrow schema for frontmatter only; all graph-traversal logic remains imperative.

**Error-format strategy**: pattern A (thin `ZodError` → `Diagnostic` wrapper) for all functions emitting stable diagnostic codes (`RELEASE_PKG_*`, `RELEASE_READINESS_*`). Pattern B (native ZodError / throw) for argument-parsing functions that do not emit structured diagnostics. No change to the exported `RELEASE_READINESS_DIAGNOSTIC_CODES` constants.

**Test strategy**: hybrid. One `TEST-ZSV-NNN` schema-conformance test per target (four total), each exercising `safeParse` on a known-good and a known-bad fixture. Existing `npm run test:scripts` parser tests continue unchanged as integration coverage for the full diagnostic-emission path.

**What still needs validating in requirements**:
- Confirm or update zod version pin (`^3.x` → `^4.x`) — TBD, owner: pm.
- Behavioural requirement for `checkTagAtMain` (semantic, not schema-replaceable) — must be explicit EARS clause.
- Behavioural requirement for quality-signal threshold checks — must be explicit EARS clause.
- Which cross-property consistency rules in `spec-state.ts` warrant EARS clauses vs `superRefine` vs remain imperative.
- Confirm `RELEASE_PKG_*` codes are treated as a stable consumer surface on par with `RELEASE_READINESS_*` (research assumes yes; pm should validate).

---

## Sources

- [Zod v4 release notes — zod.dev/v4](https://zod.dev/v4)
- [Zod v4 versioning policy — zod.dev/v4/versioning](https://zod.dev/v4/versioning)
- [Zod v4 migration guide — zod.dev/v4/changelog](https://zod.dev/v4/changelog)
- [Valibot comparison guide — valibot.dev/guides/comparison](https://valibot.dev/guides/comparison/)
- [Zod bundle sizes — github.com/paulbrimicombe/zod-bundle-sizes](https://github.com/paulbrimicombe/zod-bundle-sizes)
- [BundlePhobia zod page — bundlephobia.com/package/zod](https://bundlephobia.com/package/zod)
- [Zod npm page (weekly downloads) — npmjs.com/package/zod](https://www.npmjs.com/package/zod)
- [Zod v4 InfoQ announcement — infoq.com/news/2025/08/zod-v4-available](https://www.infoq.com/news/2025/08/zod-v4-available)
- [Superstruct explained — betterstack.com](https://betterstack.com/community/guides/scaling-nodejs/superstruct-explained/)
- [ArkType vs Zod comparison — medium.com/@ruverd](https://medium.com/@ruverd/why-use-arktype-instead-of-zod-08c401fd4f6f)
- [Zod vs Valibot vs ArkType 2026 — pockit.tools](https://pockit.tools/blog/zod-valibot-arktype-comparison-2026/)
- [Zod 4 CommonJS bundle size issue — github.com/colinhacks/zod/issues/4637](https://github.com/colinhacks/zod/issues/4637)

---

## Quality gate

- [x] Each research question is answered or marked open.
- [x] Sources cited.
- [x] 3 alternatives explored (zod, valibot, internal helper).
- [x] User needs supported by evidence (specific code-path citations) or assumptions explicit.
- [x] Technical considerations noted (ESM, ZodError shape, stable codes, package shipping).
- [x] Risks listed with severity and mitigation.
- [x] Recommendation made (zod ^4.x, migration order, error-format strategy, test strategy).
