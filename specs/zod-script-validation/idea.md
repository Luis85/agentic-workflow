---
id: IDEA-ZSV-001
title: Zod Runtime Validation for Script-Layer Parsers
stage: idea
feature: zod-script-validation
status: accepted
owner: analyst
created: 2026-05-02
updated: 2026-05-02
---

# Idea — Zod Runtime Validation for Script-Layer Parsers

## Problem statement

The script-layer parsers in `scripts/lib/` and several `scripts/check-*.ts` entry points currently validate input shapes with hand-rolled `typeof` guards and ad-hoc `throw new Error(...)` calls. This approach produces inconsistent error messages, scatters shape assumptions across multiple files, and gives TypeScript no type inference from the validation logic itself. When a parsed shape drifts — for example when a `workflow-state.md` frontmatter field is renamed or a release-package manifest changes structure — the first signal is a noisy, poorly-attributed runtime failure rather than a clear, structured error pointing at the offending field. Template maintainers and downstream consumers running `npm run verify` or `npm run check:*` bear the full cost of debugging these opaque failures.

## Target users

- **Primary:** Specorator template maintainers — the people editing `scripts/lib/*` and triaging script-level CI failures. They need parsers whose failure messages are actionable without reading source code.
- **Secondary:** Downstream consumers of `@luis85/agentic-workflow` who install the package and run its shipped scripts. They currently receive bespoke error messages; after adoption they will receive structured zod errors with field-level detail, and the runtime dependency (`zod`) will be present in `dependencies` so it installs automatically.

## Desired outcome

After adoption, every shape mismatch in the four target parsers produces a structured `ZodError` (or a wrapper that preserves existing `RELEASE_READINESS_*` diagnostic codes). TypeScript infers all parser return types from the declared zod schemas — there is one source of truth per artifact shape. Future shape changes are reviewable as a diff in the schema definition rather than scattered across multiple guard blocks. The `npm run verify` gate stays green; no existing `npm run test:scripts` case regresses.

## Constraints

- **Time:** Single PR, scripts-only. No churn beyond the four explicit targets.
- **Budget:** No meaningful budget constraint; this is an internal template improvement.
- **Technical:** Strict-mode TypeScript (`tsconfig.scripts.json`), `"type": "module"`, runtime under `tsx`. Zod must work cleanly in ESM under strict TS with no CommonJS interop hacks.
- **Policy / compliance:**
  - `zod` must land in `dependencies` (not `devDependencies`) because `scripts/` is included in `package.json` `"files"` and consumers need the runtime guard on `npm i`. This is the first entry in `dependencies`; it is a load-bearing change for downstream consumers. An ADR is required at the design stage before merging.
  - Existing `RELEASE_READINESS_*` diagnostic-code identifiers must remain stable. The parsing layer changes; the diagnostic-code surface does not.
  - `docs/specorator-product/tech.md` must be updated in the same PR as the dep change.
- **Other:** The four targets are locked (CLAR-001). No drive-by refactoring beyond what zod adoption itself requires.

## Locked decisions (do not re-litigate)

These were resolved as CLAR-001 and CLAR-002 before this stage:

- **Scope boundary:** scripts-only. The four targets are `scripts/lib/release-readiness.ts`, `scripts/check-release-package-contents.ts` + `scripts/lib/release-package-contract.ts`, `scripts/check-traceability.ts`, and `scripts/check-spec-state.ts`. Broader markdown-frontmatter validation across workflow artifacts is deferred; there is no current evidence of bugs at that layer.
- **Dep policy:** `zod` in `dependencies`, pinned `^3.x` (or current major at implementation time). The ADR formalising this decision is filed in the design/spec stage.

## Open questions

These are the research agenda for Stage 2. The analyst does not resolve them here.

- **Q1 — Install-time cost.** What is the bundle size and `npm i` install-time overhead of adding `zod` as the first `dependencies` entry for downstream consumers? Is there a meaningful impact worth communicating in release notes?
- **Q2 — Alternatives.** Are lighter-weight alternatives (`valibot`, `arktype`, `@badrap/valita`, `superstruct`) worth evaluating for this use-case? What are the concrete trade-offs vs zod in terms of bundle size, ESM support, type inference quality, and ecosystem stability?
- **Q3 — Semantic vs shape bugs.** Does any of the four target parsers have bugs that are *semantic* (wrong behaviour on valid input) rather than purely *shape* (missing or wrongly typed fields)? If so, the spec will need behavioural requirements, not just schema definitions.
- **Q4 — Migration order.** What is the recommended order for migrating the four targets? The working hypothesis is that `scripts/lib/release-readiness.ts` is the best first target because it has the cleanest existing pattern — research should confirm or revise this.
- **Q5 — Error-format strategy.** Should parsers surface zod's native `ZodError` shape, or wrap it to preserve the `RELEASE_READINESS_*` diagnostic-code format? Preserving the existing codes is a hard constraint; the research should surface what wrapping looks like in practice.
- **Q6 — Test strategy.** Should the feature add zod-specific schema-validation tests (TEST-ZSV-NNN series) independent of the existing parser tests, or is coverage through the existing `npm run test:scripts` suite sufficient given the inferred-type guarantee?

## Out of scope (preliminary)

- Markdown-frontmatter validation across the broader workflow artifact set (every `specs/*/` file, every `docs/` file). Different layer, different failure modes, no current evidence of bugs there. Revisit only if scripts-only adoption demonstrates clear value and a pattern worth extending.
- Any refactoring of logic that is not directly required by replacing the ad-hoc guards with zod schemas. No drive-by cleanup of unrelated code.
- Replacing or renaming the existing `RELEASE_READINESS_*` diagnostic-code identifiers. Those codes are part of the stable consumer-facing surface.
- Migrating CI workflows, GitHub Actions steps, or any non-script layer to use zod.

## References

- `specs/zod-script-validation/workflow-state.md` — CLAR-001 (scope) and CLAR-002 (dep policy) resolved before this stage.
- `package.json` `"files"` field — includes `scripts/`; `dependencies` is currently absent; `devDependencies` lists `tsx`, `typescript`, `@types/node`, `typedoc*`, `yaml`.
- PR #173 — original work that introduced `scripts/check-release-package-contents.ts` and `scripts/lib/release-package-contract.ts`; these are migration targets.
- PR #201 (merged) — `fix(commands): use haiku for trivial bootstrap cmds`; unrelated to this feature; noted only to confirm the scaffold path was unblocked before this work started.

---

## Quality gate

- [x] Problem statement is one paragraph and understandable to a non-expert.
- [x] Target users named.
- [x] Desired outcome stated.
- [x] Constraints listed.
- [x] Open questions captured.
- [x] Scope is bounded — no "boil the ocean" framing.
