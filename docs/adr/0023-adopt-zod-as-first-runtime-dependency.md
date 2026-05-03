---
id: ADR-0023
title: Adopt zod as the first runtime dependency for script-layer validation
status: accepted
date: 2026-05-02
deciders:
  - human maintainer
consulted:
  - analyst (RESEARCH-ZSV-001)
  - pm (PRD-ZSV-001)
informed:
  - downstream consumers of `@luis85/agentic-workflow`
supersedes: []
superseded-by: []
tags: [scripts, dependencies, validation]
---

# ADR-0023 — Adopt zod as the first runtime dependency for script-layer validation

## Status

Accepted

## Context

The four script-layer parsers in `scripts/lib/` (`release-readiness.ts`, `release-package-contract.ts`, `spec-state.ts`, `traceability.ts`) currently validate input shapes with hand-rolled `typeof` guards and ad-hoc `throw new Error(...)` calls. This produces inconsistent error messages, scatters shape assumptions across multiple files, and gives TypeScript no inference from validation logic.

`package.json` `"files"` ships `scripts/` to consumers. Today the package has **no `dependencies` entry** — only `devDependencies`. Any runtime dependency added to support script imports would be the first such entry, materially changing the install surface for downstream consumers of `@luis85/agentic-workflow`.

`RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic-code identifiers are a stable consumer-facing surface (research-confirmed before this ADR; CLAR-002). Any validation-layer change must preserve byte-identical code emission for currently-tested paths.

The constitution (Article VIII) requires an ADR for irreversible or load-bearing decisions; landing the package's first runtime dependency qualifies.

References: PRD-ZSV-001, RESEARCH-ZSV-001, IDEA-ZSV-001, ARC42-ZSV-001 §9.1.

## Decision

We will adopt **zod ^4.x** as the first runtime dependency in `package.json` `dependencies`, and we will preserve the `RELEASE_READINESS_*` and `RELEASE_PKG_*` diagnostic-code surfaces by routing `ZodError.issues` through a thin `ZodError`-to-`Diagnostic` wrapper that maps each shape violation to the existing stable code constant.

Specifically:

- `package.json` `dependencies` gains `"zod": "^4.x"` (concrete range fixed at implementation time).
- `npm-shrinkwrap.json` pins the resolved zod version + transitive tree.
- Schema definitions live under `scripts/lib/`, not inlined into entry scripts.
- The wrapper layer is mandatory for parsers emitting stable diagnostic codes; native `ZodError` is acceptable only for argument-parsing functions that do not currently emit stable codes.
- Semantic carve-outs (`checkTagAtMain`, quality-signal thresholds, cross-property consistency in `spec-state.ts`) remain imperative; schemas validate shape only, not behaviour (REQ-ZSV-007/008/009).
- `docs/specorator-product/tech.md` is updated in the same PR to record that the package now carries a runtime dependency, with this ADR referenced (REQ-ZSV-011).

## Considered options

### Option A — Adopt zod ^4.x in `dependencies` (chosen)

- Pros:
  - De-facto standard with the strongest ecosystem and weekly-download share among TypeScript validation libraries (research source: npm registry, BundlePhobia).
  - v4 (stable since May 2025) is ~57% smaller and has 100x fewer TS instantiations than v3.
  - First-class ESM support; works under `tsx` + strict-mode TS without CommonJS interop hacks.
  - Inferred types (`z.infer<typeof S>`) replace manual interface duplication of schema-derived shapes.
  - Familiar API surface — lower cognitive cost for future maintainers and downstream consumers.
- Cons:
  - Introduces the first runtime dependency for the package, materially expanding the install surface.
  - Larger than minimal alternatives (e.g. valibot) in raw bundle size — not a meaningful concern in `tsx`/Node.js where tree-shaking is irrelevant.
  - Couples the project to zod's release cadence and security posture.

### Option B — Adopt valibot in `dependencies`

- Pros:
  - Significantly smaller bundle size (~1.4 kB vs zod's ~13–17 kB min+gz on v3, ~8–9 kB on v4).
  - Functional/modular API tree-shakes per-import.
  - Full ESM.
- Cons:
  - Bundle size advantage is irrelevant in a `tsx`/Node.js script context — there is no bundler step for `scripts/`.
  - Smaller ecosystem and adoption; fewer third-party schema libraries (e.g. resolver integrations, OpenAPI generators) target valibot today.
  - Less familiar to maintainers; switching cost on every contribution.

### Option C — Extract a shared internal `assertShape<T>(...)` helper, no third-party library

- Pros:
  - Zero new runtime dependency; preserves the current "no `dependencies` entry" posture.
  - Keeps code review and supply-chain surface fully internal.
- Cons:
  - Reproduces the hand-rolled-guard problem at one level of indirection; the helper still needs case-by-case shape definitions.
  - Does not provide TypeScript inference from validation logic; manual interface duplication remains.
  - Pushes the cost of "good error messages" onto the helper's author; in practice, helpers like this drift toward zod-shaped APIs over time.
  - Does not address the maintenance pain identified in RESEARCH-ZSV-001 §user-needs.

## Consequences

### Positive

- One source of truth per parsed artifact shape; schema diff = the unit of review for shape changes.
- Structured errors with field-level paths replace bespoke `throw new Error(...)` strings.
- TypeScript type inference flows from schemas to parser return types — manual interface duplication ends.
- Stable diagnostic-code surface preserved unchanged via the wrapper (REQ-ZSV-005, REQ-ZSV-006).
- Future broader frontmatter-validation work can reuse the same schema + wrapper pattern (NG1 explicitly defers this; the door stays open).

### Negative

- Package gains its first runtime dependency. Consumers running `npm i @luis85/agentic-workflow` now install zod transitively.
- Project assumes responsibility for tracking zod's security advisories and major-version churn (RISK-ZSV-001, RISK-ZSV-002).
- Wrapper layer must be reviewed against every existing `RELEASE_READINESS_*` / `RELEASE_PKG_*` code path before merge, or risks code emission regression (RISK-ZSV-003).

### Neutral

- `dep-triage-bot` (existing operational bot) gains an entry to track; no change to bot scope is required, only validation that bot picks up `dependencies` entries (covered by NFR-ZSV-003 and §11.3).
- `scripts/` import shape is unchanged from the consumer's perspective; only the diagnostic message text gains structure.

## Compliance

- **CI verification** — `npm run verify` includes `npm run typecheck:scripts` and `npm run test:scripts`; both must pass before merge. The verify gate is the deterministic check.
- **Test coverage** — REQ-ZSV-013 mandates per-target schema-conformance tests (`safeParse` valid + invalid fixture). These are checked at `npm run test:scripts`.
- **Code review** — reviewer must confirm byte-identical diagnostic-code emission for every `RELEASE_READINESS_*` and `RELEASE_PKG_*` constant exercised by the existing test suite (RISK-ZSV-003 mitigation).
- **Documentation co-shipment** — REQ-ZSV-011 binds `docs/specorator-product/tech.md` update to the same PR; verify gate's `check:script-docs` and `check:product-page` workflows do not directly enforce this, so reviewer must confirm.
- **Supply-chain monitoring** — `dep-triage-bot` will scan `zod` and its transitive tree within one scheduled run after merge (NFR-ZSV-003). Maintainer confirms bot scope at merge.
- **Lock-file discipline** — `npm-shrinkwrap.json` must be regenerated and committed alongside the `package.json` change. Without this, downstream consumers may resolve different transitive trees.

## References

- PRD-ZSV-001 — Functional requirements (REQ-ZSV-001..013), NFRs, release criteria.
- RESEARCH-ZSV-001 — Library comparison, bundle/install evidence, alternatives, risks.
- IDEA-ZSV-001 — CLAR-002 dep-policy resolution that mandated this ADR.
- ARC42-ZSV-001 §9.1 — Key decision row this ADR formalises.
- ADR-0021 — Fresh-surface release packaging (related; this ADR adds the first runtime dep that the fresh-surface package will ship).
- [zod.dev/v4](https://zod.dev/v4) — v4 release notes.
- [zod.dev/v4/versioning](https://zod.dev/v4/versioning) — versioning policy.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
