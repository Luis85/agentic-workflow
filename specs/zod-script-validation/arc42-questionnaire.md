---
id: ARC42-ZSV-001
title: Zod Runtime Validation for Script-Layer Parsers — Arc42 + 12-Factor Questionnaire
stage: design
feature: zod-script-validation
status: answered
owner: architect
inputs:
  - PRD-ZSV-001
  - RESEARCH-ZSV-001
adrs:
  - ADR-0023
created: 2026-05-02
updated: 2026-05-02
---

# Architecture Questionnaire — Arc42 + 12-Factor Baseline

> Scope reminder: this feature changes the script layer of a **template / library** (`@luis85/agentic-workflow`). It is not a deployed service. Many Arc42 sections aimed at running systems are `N/A`. The non-trivial sections are §1.5 (business context), §2 (constraints), §4.1 (style), §5 (building blocks), §8.3 (error handling), §9 (decisions, including the dep-policy ADR), §10.2 (perf budget), §11 (risks), and the dependency-related 12-factor cells.

---

## Part I — Arc42 Architecture Template

---

### 1 · Introduction and Goals

#### 1.1 Product Name and Purpose

```
@luis85/agentic-workflow — Specorator template for spec-driven agentic software
development. This feature adopts zod (^4.x) as the runtime-validation layer for
four script-layer parsers, replacing hand-rolled `typeof` guards with declarative
schemas while preserving the stable `RELEASE_READINESS_*` and `RELEASE_PKG_*`
diagnostic-code surfaces.
```

#### 1.2 Top Functional Requirements

1. Replace hand-rolled shape checks in four target parsers with zod schemas — REQ-ZSV-001..004
2. Preserve `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic codes byte-identical via wrapper — REQ-ZSV-005, REQ-ZSV-006
3. Keep semantic checks (`checkTagAtMain`, quality-signal thresholds, cross-property consistency) imperative, not in schemas — REQ-ZSV-007..009
4. Land `zod ^4.x` in `dependencies` so it installs on `npm i @luis85/agentic-workflow` — REQ-ZSV-010
5. Update `docs/specorator-product/tech.md` in the same PR as the dep landing — REQ-ZSV-011

#### 1.3 Quality Goals

| Priority | Quality Goal | Scenario / Measure |
| -------- | ------------ | ------------------ |
| 1 | Backward compatibility (diagnostic-code surface) | Existing `npm run test:scripts` cases pass unchanged; emitted `RELEASE_READINESS_*` / `RELEASE_PKG_*` codes are byte-identical for all currently-tested malformed-input fixtures. |
| 2 | Maintainability | Each parsed artifact's shape lives in exactly one schema definition file under `scripts/lib/`; no inline `typeof` guards remain in entry scripts. |
| 3 | Performance | `npm run verify` wall-clock runtime regression ≤ 5% (NFR-ZSV-001). |
| 4 | Type safety | Parser return types are inferred from schemas via `z.infer<typeof S>`; no manual interface duplication of schema-derived shapes. |
| 5 | Supply-chain hygiene | First runtime dependency (`zod`) tracked by existing `dep-triage-bot` within one scheduled run after merge (NFR-ZSV-003). |

#### 1.4 Stakeholders

| Stakeholder | Expectations |
| ----------- | ------------ |
| Specorator template maintainer | Structured zod errors with field paths; one schema diff to review; no churn beyond the four target parsers. |
| Downstream consumer of `@luis85/agentic-workflow` | `zod` installs automatically on `npm i`; existing `RELEASE_READINESS_*` / `RELEASE_PKG_*` codes unchanged; no behavioural surprises in shipped scripts. |
| Human maintainer (PR reviewer / merger) | ADR for first runtime dep; `tech.md` updated in same PR; verify gate green; test suite green. |

#### 1.5 Business Context

```
Deployment model: library / template (not a deployed service).
                  Distributed as (a) GitHub source archive and (b) GitHub Packages
                  npm package `@luis85/agentic-workflow`. Consumers either clone
                  the repo or `npm i` the published package.
Monetisation / funding: open-source template; no monetisation.
Tenancy approach: N/A — single-user CLI tooling per consumer's local install.
Expected scale (year 1): low — adoption-stage template; consumer count
                  unknown but small. The runtime cost of the validation layer
                  is per-consumer-per-script-invocation, not multi-tenant.
Expected scale (year 2): same — no scaling axis here other than developer
                  ergonomics.
```

---

### 2 · Constraints

#### 2.1 Technical Constraints

| Constraint | Rationale |
| ---------- | --------- |
| Node.js ≥ 20 | Pinned in `package.json` `engines.node`. |
| Strict-mode TypeScript via `tsconfig.scripts.json`, `"type": "module"` ESM, runtime via `tsx` | Existing project setup; zod must work cleanly under this configuration with no CommonJS interop. |
| `package.json` `"files"` ships `scripts/` | Script imports must resolve at runtime on consumer install; runtime deps must land in `dependencies`. |
| `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic-code identifiers are stable consumer surfaces | Wrapper layer must preserve byte-identical code emission. |
| Single-PR scope (CLAR-001) — four named target parsers only | No drive-by refactor; no broader frontmatter validation. |

#### 2.2 Organizational Constraints

| Constraint | Rationale |
| ---------- | --------- |
| Constitution Article IV — non-negotiable quality gates | `npm run verify` must remain green before PR merge. |
| Constitution Article V — traceability | All changes link via REQ-ZSV-NNN / T-ZSV-NNN / TEST-ZSV-NNN / ADR-NNNN. |
| Constitution Article VIII — ADR for irreversible decisions | First runtime dep is irreversible-flavoured (consumer-facing surface change). ADR mandatory. |
| Memory rule "Docs ride with their PR" | `docs/specorator-product/tech.md` updated in the same PR. |

#### 2.3 Regulatory / Compliance Requirements

- [ ] GDPR — N/A (no user data processed).
- [ ] SOC2 — N/A (template, not a hosted service).
- [ ] HIPAA — N/A.
- [ ] PCI-DSS — N/A.
- [ ] ISO 27001 — N/A.
- [ ] FedRAMP — N/A.
- [ ] Data Residency Requirements — N/A.
- [ ] Other: none.

#### 2.4 Compliance Details

```
N/A — open-source template / library; no regulated data processing in scope.
```

---

### 3 · Context and Scope

#### 3.1 User Types / Actors

| Actor | Channel | Description |
| ----- | ------- | ----------- |
| Specorator template maintainer | local checkout | Edits `scripts/lib/*`, runs `npm run verify` and `npm run test:scripts`; triages CI failures. |
| Downstream consumer | `npm i @luis85/agentic-workflow` then runs shipped `npm run check:*` scripts | Receives the runtime-installed `zod` plus structured diagnostics from migrated parsers. |
| CI runner (GitHub Actions) | scheduled / on-PR | Executes `verify.yml` and `release.yml`; consumes diagnostic-code output for gating decisions. |

#### 3.2 External System Integrations

| External System | Interface | Direction | Notes |
| --------------- | --------- | --------- | ----- |
| GitHub Packages registry (`npm.pkg.github.com`) | npm publish / install | bi-directional | Distribution channel for the package; unaffected by this feature except that the published tarball now carries a `zod` dependency. |
| `dep-triage-bot` (in-repo operational bot) | scheduled run | reads `package.json` | Will pick up `zod` on next cycle (NFR-ZSV-003). |
| zod (npm package) | runtime import | inbound | First runtime dependency. Pinned `^4.x`. |

#### 3.3 Data Flows Across System Boundary

**Inbound:**

```
- workflow-state.md / traceability frontmatter (read by parsers; validated by zod)
- release-package manifest content (read; validated by zod)
- release-readiness check inputs (parsed by `parseSimpleYaml`; validated by zod)
```

**Outbound:**

```
- Diagnostics with stable codes (RELEASE_READINESS_*, RELEASE_PKG_*) emitted to stdout/stderr or aggregated by callers
- ZodError instances (for parsers that do not emit stable diagnostic codes)
```

#### 3.4 Geographic / Deployment Scope

- [x] Single machine / on-premises — runs on whichever machine a consumer or CI runner uses.
- [ ] Single Region (cloud)
- [ ] Multi-Region (same country)
- [ ] Multi-Region (multiple countries)
- [ ] Global (all major regions)
- [x] Embedded / offline (no network dependency) — once `zod` is installed, the validation layer requires no network.

#### 3.5 Scope Details

```
Primary deployment location: consumer machine or CI runner (GitHub Actions ubuntu-latest).
Failover / DR location: N/A — no operating service.
Future expansion: N/A — bounded by feature scope.
Data sovereignty / residency notes: N/A.
```

---

### 4 · Solution Strategy

#### 4.1 Architectural Style

```
Style: Layered library / script toolkit. Entry scripts under `scripts/check-*.ts`
       delegate parsing + validation to modules under `scripts/lib/`. Schemas
       and wrappers form a thin validation layer beneath existing parser logic.
Rationale: Existing structure already separates entry scripts from `scripts/lib/`
       helpers. This feature adds a sub-layer (zod schema + diagnostic-mapping
       wrapper) inside `scripts/lib/`, preserving the layering and the existing
       imports surface.
Evolution plan: If broader markdown-frontmatter validation proves valuable
       later (currently NG1 / out-of-scope), the same schema + wrapper pattern
       can extend to those parsers. No service-style evolution path.
```

#### 4.2 Technology Stack

| Layer            | Technology | Rationale |
| ---------------- | ---------- | --------- |
| Frontend         | N/A | No UI in this feature. |
| Backend          | Node.js ≥ 20, TypeScript via `tsx`, ESM | Pinned by `package.json`; unchanged. |
| Database         | N/A | No DB. |
| Cache            | N/A | No runtime cache. |
| Queue / Messaging| N/A | Synchronous CLI execution. |
| Object Storage   | N/A | No object storage. |
| Infrastructure   | Consumer's local machine or GitHub Actions runner | Unchanged. |
| CI/CD            | GitHub Actions (existing `verify.yml`, `release.yml`) | Unchanged; verify gate must remain green. |
| Monitoring       | N/A — non-service deployment | Logs flow to stdout/stderr per CLI invocation. |
| Validation       | **zod ^4.x (new)** | First runtime dep; per CLAR-002 + research recommendation. |

#### 4.3 Multi-Tenancy Strategy

- [x] N/A — single-tenant, on-premises, or embedded system. Each consumer install runs as its own single-user invocation; tenancy is not modelled.

**Details / rationale:**

```
N/A — template/library distributed via package; no multi-tenant runtime.
```

#### 4.4 Key Design Patterns

| Pattern | Where Applied | Rationale |
| ------- | ------------- | --------- |
| Schema-first validation with inferred types | All four target parsers | One source of truth for shape; type inference flows downstream. |
| Adapter / Wrapper (ZodError → Diagnostic) | `release-readiness.ts`, `release-package-contract.ts` | Preserves stable diagnostic-code surface (REQ-ZSV-005, REQ-ZSV-006). |
| Post-schema imperative consistency pass | `spec-state.ts` | Cross-property consistency rules execute after schema validation, not as `superRefine` (REQ-ZSV-009). |

---

### 5 · Building Block View

#### 5.1 Major Modules / Services

| Module / Service | Responsibility |
| ---------------- | -------------- |
| `scripts/lib/release-package-contract.ts` (existing, modified) | Validate release-package manifest shape via zod; existing `RELEASE_PKG_*` diagnostics preserved by wrapper. |
| `scripts/lib/release-readiness.ts` (existing, modified) | Validate seven check-function inputs via zod; preserve `RELEASE_READINESS_*` codes by wrapper; semantic carve-outs remain imperative. |
| `scripts/lib/spec-state.ts` (existing, modified) | Validate workflow-state frontmatter via zod schema; cross-property consistency rules in a separate post-schema pass. |
| `scripts/lib/traceability.ts` (existing, modified) | Validate workflow-state frontmatter `area` field via zod. |
| **TBD-1 — zod-error-to-diagnostic wrapper module** | New shared helper that converts `ZodError.issues` to `Diagnostic` records carrying stable `RELEASE_READINESS_*` / `RELEASE_PKG_*` codes. Architect to decide: one shared module vs per-target wrapper. |

#### 5.2 Application Layers

```
entry script (scripts/check-*.ts)
   │
   ▼ imports
parser + check logic (scripts/lib/<target>.ts)
   │
   ▼ uses
zod schema (scripts/lib/<target>.ts or scripts/lib/<target>-schema.ts — TBD-2)
   │
   ▼ on shape violation
ZodError → Diagnostic wrapper (TBD-1)

Dependency rule: entry scripts depend only on `scripts/lib/*`. `scripts/lib/*` may
                 depend on `zod` (new) and on other modules in `scripts/lib/`.
                 No circular imports; no entry script imports zod directly.
```

#### 5.3 Inter-Module Communication

```
Synchronous: TypeScript function calls within the same Node.js process.
Asynchronous: N/A (no async beyond existing fs / git invocations in the parsers).
Event bus / broker: N/A.
```

#### 5.4 Shared Libraries / Cross-Cutting Modules

| Library / Module | Purpose |
| ---------------- | ------- |
| `zod ^4.x` | Schema definition + runtime parsing + type inference. |
| Existing `scripts/lib/repo.ts` `parseSimpleYaml` | YAML→`Record<string, unknown>` parsing; zod validates the output (NG2: not in scope for replacement). |
| Existing `RELEASE_READINESS_DIAGNOSTIC_CODES`, `RELEASE_PKG_*` constants | Stable diagnostic-code identifiers; preserved unchanged. |
| **TBD-1 — error-mapping helper module** | Converts `ZodError.issues` → `Diagnostic` with stable code. |

---

### 6 · Runtime View

#### 6.1 User Authentication Flow

```
N/A — CLI tool runs under the user's local OS account; no application-level auth.
```

#### 6.2 Core Business Workflow

**Scenario:** A consumer runs `npm run check:release-readiness` against a malformed
input file.

```
1. Entry script `scripts/check-release-readiness.ts` reads input file via `fs`.
2. Entry calls a function in `scripts/lib/release-readiness.ts`.
3. The lib function calls `parseSimpleYaml` to obtain `Record<string, unknown>`.
4. The lib function runs `schema.safeParse(parsed)` against the zod schema.
5. On success: returned typed object flows into existing check logic; semantic
   checks (e.g. `checkTagAtMain`, threshold comparisons) run as before.
6. On failure: the wrapper converts `ZodError.issues` into a `Diagnostic` record
   whose `code` is the stable `RELEASE_READINESS_*` identifier; the entry script
   prints the diagnostic and exits with the existing non-zero code.
```

#### 6.3 Tenant / Instance Provisioning

- [x] N/A — single-tenant, on-premises, or embedded system.

```
N/A.
```

#### 6.4 Background Processes / Async Workflows

| Process | Trigger | Frequency | Notes |
| ------- | ------- | --------- | ----- |
| `dep-triage-bot` (existing) | scheduled cron | per existing schedule | Will pick up `zod` after merge; no changes required by this feature. |

---

### 7 · Deployment View

#### 7.1 Deployment Targets

- [x] On-Premises — via `npm i @luis85/agentic-workflow` on consumer machine; or via clone-and-run.
- [ ] AWS / Azure / GCP / Kubernetes / Serverless / Docker — N/A; no deployed service.

#### 7.2 Environments

| Environment   | Purpose | Infrastructure | Provisioning |
| ------------- | ------- | -------------- | ------------ |
| Local Dev     | Maintainer's machine running scripts via `tsx`. | Local Node.js 20+. | `npm ci`. |
| CI            | GitHub Actions runners executing `verify.yml`, `release.yml`. | `ubuntu-latest`. | Defined in workflow YAML. |
| Staging       | N/A — no deployed service. | — | — |
| Production    | Consumer's machine on `npm i`. | Whatever the consumer has. | `npm i @luis85/agentic-workflow`. |
| Demo / Sandbox| N/A. | — | — |

#### 7.3 CI/CD Pipeline

```
1. PR opens → GitHub Actions runs `verify.yml` (npm ci → npm run verify → tests).
2. PR title check, gitleaks, GitGuardian, typos, conventional-commits run.
3. PR merges to main → `release.yml` (when version bumped) → publish to GitHub Packages.

Deployment strategy: not applicable to this feature — change is library-internal.
                     The published package gains a `dependencies` entry; consumers
                     will receive `zod` on their next install.
Rollback approach: revert PR; bump patch; re-publish. Existing release-readiness
                   gating already prevents broken releases.
```

#### 7.4 Infrastructure as Code

```
IaC tool: GitHub Actions workflow YAML (existing).
Secret management: GitHub repo secrets (existing) — no change for this feature.
Configuration management: package.json + npm-shrinkwrap.json (existing).
```

---

### 8 · Crosscutting Concepts

#### 8.1 Authentication and Authorization

```
Authentication:    N/A — local CLI; OS user owns the process.
Authorization:     N/A.
Tenant isolation:  N/A.
API keys:          N/A.
```

#### 8.2 Observability Strategy

```
Logging:   stdout/stderr from script invocations; consumed by terminal or CI log.
Metrics:   N/A — no service to monitor.
Tracing:   N/A.
Alerting:  CI red-build is the only alert surface; existing.
SLOs:      N/A; performance budget tracked as NFR-ZSV-001 (≤ 5% verify regression).
```

#### 8.3 Error Handling and Failure Strategy

```
Error types:
  - Shape mismatch — ZodError → Diagnostic (stable code) for parsers with stable
    diagnostic surfaces; native ZodError thrown for argument parsers without
    stable surfaces.
  - Semantic violation (e.g. `TAG_NOT_AT_MAIN`, threshold breach) — existing
    Diagnostic with stable code; emitted from imperative check logic.
  - I/O / system errors (file not found, git failure) — propagate as before.

Retry policy:        N/A — synchronous CLI, no transient remote calls in scope.
Circuit breaker:     N/A.
Dead letter queue:   N/A.
Graceful degradation: parsers return non-zero exit code with structured diagnostics;
                     no fallback parsing path.
```

#### 8.4 Data Management

```
Schema management: zod schemas under scripts/lib/. Schema diffs are reviewed in
                   the same PR as the change. Versioning of artifacts (e.g.
                   workflow-state.md format) is the broader workflow's
                   responsibility, not this feature's.
Backups:           N/A — no persistent state owned by these scripts.
Data lifecycle:    N/A.
PII handling:      N/A — no PII in workflow artifacts.
Caching strategy:  N/A.
```

#### 8.5 Cross-Cutting Patterns

```
Correlation IDs:  N/A — single-process CLI invocations.
Rate limiting:    N/A.
Feature flags:    N/A — change is unconditional once merged. No feature-flag
                  gating planned (see §11.1 for rollback plan).
API versioning:   N/A — no public API surface introduced; the diagnostic-code
                  surface is the closest equivalent and is preserved (§9).
Audit logging:    N/A.
```

---

### 9 · Architecture Decisions

#### 9.1 Key Architecture Decision Records

| ADR | Decision | Alternatives Considered | Rationale | Status |
| --- | -------- | ----------------------- | --------- | ------ |
| [ADR-0023](../../docs/adr/0023-adopt-zod-as-first-runtime-dependency.md) | Adopt zod ^4.x as the first runtime dependency in `dependencies`; preserve `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic codes via a thin `ZodError`-to-`Diagnostic` wrapper. | (a) keep hand-rolled `typeof` guards (do nothing); (b) extract a shared internal `assertShape<T>(...)` helper without a third-party library; (c) adopt `valibot` for smaller bundle size. | (a) does not address the maintenance and inference cost; (b) does not give type inference and reproduces hand-rolled shape logic; (c) bundle size is irrelevant in `tsx` Node.js runtime. zod is the de-facto standard with the strongest ecosystem and inference; v4 is 57% smaller and has 100x fewer TS instantiations than v3. | proposed |

#### 9.2 Open Decisions

| # | Open Question | Options | Leaning Toward | Blocked By |
| - | ------------- | ------- | -------------- | ---------- |
| 1 (TBD-1) | Where does the `ZodError`→`Diagnostic` wrapper live? | (a) one shared helper module under `scripts/lib/zod-diagnostic.ts`; (b) per-target wrapper colocated with the schema. | (a) shared helper — single test surface, single mapping policy, mirrors how `RELEASE_READINESS_*` constants already live in one place. | Architect call in `/spec:design` Part C. |
| 2 (TBD-2) | Are schemas inlined into the existing `scripts/lib/<target>.ts` modules, or extracted to sibling `<target>-schema.ts` files? | (a) inline; (b) sibling file. | (b) sibling file for `release-readiness.ts` (size — seven check inputs) and `spec-state.ts` (cross-property complexity); inline for `traceability.ts` and `release-package-contract.ts` (small surface). | Architect call in `/spec:design` Part C. |
| 3 | Does this feature introduce a `zod` schema-conformance fixture directory? | (a) inline fixture objects in test files; (b) `tests/fixtures/zod-schemas/` dir with valid + invalid samples per target. | (a) inline — REQ-ZSV-013 only requires one valid + one invalid per target; fixture-dir overhead unjustified at this scale. | Architect call in `/spec:design` Part C. |

#### 9.3 ADR Process

```
Format:           N/A — kit defaults apply.
Storage location: N/A — kit defaults apply (see docs/sink.md).
Review cadence:   N/A — kit defaults apply (reviewed at design gate).
```

---

### 10 · Quality Requirements

#### 10.1 Availability Targets

```
Uptime SLA:          N/A — no service.
RTO:                 N/A.
RPO:                 N/A.
Maintenance windows: N/A.
```

#### 10.2 Performance Targets

```
API response time:    N/A.
Page load time (LCP): N/A.
Concurrent users:     N/A.
Throughput:           N/A.
Database query time:  N/A.
verify gate runtime:  ≤ 5% regression vs pre-migration baseline (NFR-ZSV-001).
                      Soft target; if exceeded, document delta or request waiver.
```

#### 10.3 Scalability Requirements

```
Current load:    one verify gate run per PR; one local run per maintainer save-cycle.
6-month target:  same.
12-month target: same.
Scaling approach: N/A — no horizontal scale axis.
Scaling trigger:  N/A.
```

#### 10.4 Security Quality Scenarios

| Scenario | Measure | Target |
| -------- | ------- | ------ |
| Supply-chain compromise of `zod` | `dep-triage-bot` flags new `zod` advisories within one scheduled run | NFR-ZSV-003 — scan within one bot cycle after merge |
| Prototype-pollution / unexpected coercion in zod parse | Existing parser tests + new schema-conformance tests catch behavioural drift | All `npm run test:scripts` tests green |

---

### 11 · Risks and Technical Debt

#### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| RISK-ZSV-001 — Supply-chain risk: first runtime dep | low | medium | Pin `^4.x`; `dep-triage-bot` scope; review zod's security history (no known CVEs at research time). |
| RISK-ZSV-002 — Zod major-version churn before merge | low | low | Pin `^4.x`; if v5 stabilises pre-merge, update intentionally. |
| RISK-ZSV-003 — Error-format regression for `RELEASE_READINESS_*` consumers | low | high | Wrapper module fully covered by existing parser tests; new TEST-ZSV-NNN schema-conformance tests; reviewer must confirm byte-identical code emission for every code path. |
| RISK-ZSV-004 — Test-coverage gap during atomic migration | medium | medium | Per-target migration commit must contain schema + wrapper + tests in one atomic commit; never split. |
| RISK-ZSV-005 — `parseSimpleYaml` boundary surprises | low | medium | NG2 keeps `parseSimpleYaml` out of scope; zod validates its output, not raw YAML. Any future `parseSimpleYaml` drift surfaces as a structured zod error rather than silent breakage. |
| RISK-ZSV-006 — Semantic logic mis-classified as schema-replaceable | low | medium | REQ-ZSV-007/008/009 explicitly carve out the semantic logic; reviewer enforces. |

#### 11.2 Intentional Technical Debt

| Debt | Why Accepted | Plan to Resolve | Deadline |
| ---- | ------------ | --------------- | -------- |
| `parseSimpleYaml` not migrated to a structured YAML parser | Out of scope for this feature; no current evidence of bugs; replacement is a separate, larger change. | Open follow-up issue if any zod schema reports a `path` rooted at a `parseSimpleYaml` ambiguity. | None — defer to follow-up if triggered. |
| Markdown-frontmatter validation across the broader workflow not migrated | NG1 — different layer; no evidence of bugs there yet. | Revisit once scripts-only adoption proves value. | None — explicit out-of-scope. |

#### 11.3 Unknowns and Assumptions

| Assumption | If Wrong, Impact | Validation Plan |
| ---------- | ---------------- | --------------- |
| zod v4 ESM import is stable under `tsx` + strict-mode TS without CommonJS interop | Build fails on `npm run typecheck:scripts`; dev cannot proceed. | Architect verifies during Part C by sketching the import path; dev confirms in T-ZSV-001 (smallest first slice). |
| `RELEASE_READINESS_*` test coverage exercises every emit path | A code path emits a different code post-migration without a test failure → silent regression. | Reviewer checks each code constant against at least one test fixture; opens T-ZSV task to add fixtures for any unexercised code before merge. |
| `dep-triage-bot` automatically picks up new `dependencies` entries | NFR-ZSV-003 silently misses; first runtime dep goes unscanned. | Maintainer confirms bot scope at merge; opens follow-up if scope is `devDependencies`-only. |

---

### 12 · Glossary

> Existing per-term files under `docs/glossary/<slug>.md` apply where defined. New terms introduced by this feature are listed below; if any becomes load-bearing, file via `/glossary:new`.

#### 12.1 Domain Terms

| Term | Definition |
| ---- | ---------- |
| **zod schema** | Declarative type definition + runtime parser produced by the `zod` library. `z.object({...})`, `z.string()`, etc. Source of truth for both shape validation and TypeScript type inference. |
| **ZodError** | Structured error class returned by `safeParse` on a shape mismatch. Carries `.issues[]`, each with a `path` array identifying the offending field. |
| **Diagnostic** | Existing Specorator type: `{ code, message, ... }` carrying a stable `RELEASE_READINESS_*` or `RELEASE_PKG_*` identifier consumers may pattern-match. |
| **Wrapper (in this feature)** | The mapping function from `ZodError.issues` to `Diagnostic` that preserves stable code emission. |
| **Semantic carve-out** | Behavioural check (e.g. SHA comparison, threshold comparison, cross-property consistency) that schemas cannot replace; remains imperative per REQ-ZSV-007/008/009. |

#### 12.2 Acronyms and Abbreviations

| Acronym | Meaning |
| ------- | ------- |
| EARS | Easy Approach to Requirements Syntax |
| ESM | ECMAScript Modules |
| NFR | Non-Functional Requirement |
| PRD | Product Requirements Document |
| RAT | Riskiest Assumption Test |
| TBD | To Be Decided |

---

## Part II — 12-Factor App Assessment

> Note: `@luis85/agentic-workflow` is a library/template, not a long-running process. Several factors do not literally apply (Port Binding, Concurrency, Disposability) and are marked `N/A` with reason. Factors that apply to a published npm package (Codebase, Dependencies, Build/Release/Run, Dev/Prod Parity) are the meaningful ones for this feature.

### Readiness Summary

| Factor                 | Principle                                                   | Readiness  |
| ---------------------- | ----------------------------------------------------------- | ---------- |
| I. Codebase            | One codebase tracked in revision control, many deploys      | **Ready**  |
| II. Dependencies       | Explicitly declare and isolate dependencies                 | **Partial → Ready (after this feature)** |
| III. Config            | Store config in the environment                             | **N/A**    |
| IV. Backing Services   | Treat backing services as attached resources                | **N/A**    |
| V. Build, Release, Run | Strictly separate build and run stages                      | **Ready**  |
| VI. Processes          | Execute the app as one or more stateless processes          | **Ready**  |
| VII. Port Binding      | Export services via port binding                            | **N/A**    |
| VIII. Concurrency      | Scale out via the process model                             | **N/A**    |
| IX. Disposability      | Maximize robustness with fast startup and graceful shutdown | **Ready**  |
| X. Dev/Prod Parity     | Keep dev, staging, and production as similar as possible    | **Ready**  |
| XI. Logs               | Treat logs as event streams                                 | **Ready**  |
| XII. Admin Processes   | Run admin/management tasks as one-off processes             | **Ready**  |

---

### Factor I — Codebase

```
Single repo (this monorepo); single distribution as @luis85/agentic-workflow.
Deploys = consumer installs and CI runs. Ready.
```

---

### Factor II — Dependencies

```
Currently: package.json declares `devDependencies` only; no `dependencies`.
After this feature: `dependencies` gains its first entry (`zod ^4.x`), pinned by
`npm-shrinkwrap.json`. Isolation via npm; runtime imports resolve from
`node_modules`. Adding `zod` to `dependencies` (not `devDependencies`) is the
correctness fix that elevates this factor from Partial to Ready: scripts/ ships
to consumers and currently has no isolated runtime resolution path for any
non-stdlib import.
```

---

### Factor III — Config

```
N/A — no service runtime config. Script behaviour is determined by CLI args and
filesystem inputs already part of the workflow.
```

---

### Factor IV — Backing Services

```
N/A — no DB, cache, queue, or third-party service integration in scope.
```

---

### Factor V — Build, Release, Run

```
Build = `tsx` interprets TS at runtime; no ahead-of-time bundle. Release =
`npm publish` to GitHub Packages with `npm-shrinkwrap.json` pinning the
dependency tree (including new `zod` entry). Run = consumer's `npm run check:*`
or maintainer's `npm run verify`. Stages are separated; releases are immutable
once published. Ready.
```

---

### Factor VI — Processes

```
Each script invocation is a stateless one-off Node.js process; no in-memory
state across invocations. Ready.
```

---

### Factor VII — Port Binding

```
N/A — no HTTP/TCP server; CLI tool.
```

---

### Factor VIII — Concurrency

```
N/A — single-process CLI; no horizontal scaling axis.
```

---

### Factor IX — Disposability

```
Scripts start fast (sub-second) and exit cleanly on completion. Ready.
```

---

### Factor X — Dev/Prod Parity

```
"Dev" = maintainer's local checkout running scripts via `tsx`. "Prod" = consumer's
install running the same scripts via `tsx`. Same Node.js engine constraint
(`>=20`); same `npm-shrinkwrap.json`; same scripts source. Ready.
```

---

### Factor XI — Logs

```
Scripts write structured (or about-to-be-structured-via-Diagnostic) output to
stdout/stderr; consumer or CI captures the stream. Ready.
```

---

### Factor XII — Admin Processes

```
The `npm run check:*` and `npm run fix:*` commands are themselves admin/one-off
processes shipped with the codebase. Ready.
```

---

## Quality gate

- [x] All sections have a non-`_TBD_` answer or a numbered entry in **9.2 Open Decisions** (TBD-1, TBD-2, and #3).
- [x] Each row in **9.1** with status `proposed` has a filed ADR under `docs/adr/` ([ADR-0023](../../docs/adr/0023-adopt-zod-as-first-runtime-dependency.md)). Architect flips to `accepted` at the design gate.
- [x] Each `Partial` or `Gap` 12-Factor readiness has a follow-up — Factor II is the one row, and it flips to Ready by REQ-ZSV-010 itself; no separate §9.2 / §11.2 row needed.
- [x] Every PRD requirement (`REQ-ZSV-NNN`) is referenced at least once in §1.2 or §3.1 / §3.2.
- [x] Open clarifications copied into `specs/zod-script-validation/workflow-state.md` → Open clarifications (CLAR-003, CLAR-004, CLAR-005).
