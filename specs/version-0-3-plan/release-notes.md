---
id: RELEASE-V03-001
title: Version 0.3 release plan — Release notes
stage: release
feature: version-0-3-plan
version: v0.3.0
status: complete
owner: release-manager
inputs:
  - PRD-V03-001
  - SPECDOC-V03-001
  - TASKS-V03-001
created: 2026-05-01
updated: 2026-05-01
---

# Release notes — v0.3 (Worked example + artifact validation)

## Summary

v0.3 makes the lifecycle concrete. The repository now contains one complete worked example — `examples/cli-todo/` — that walks every Specorator stage from idea to retrospective on a tiny CLI todo app, plus a hardened set of deterministic artifact-validation checks that run via `npm run verify`. Contributors can study a real walk-through, and `verify` catches the most common workflow drift before a PR reaches review.

The release is intentionally non-breaking. No new lifecycle stage. No constitution change. No CI gate rollout (v0.4 owns that).

## Changes

### New

- **`examples/cli-todo/`** — complete 11-stage worked example (T-V03-001, PR #68). All canonical artifacts present from `idea.md` through `retrospective.md`, with a `workflow-state.md` that marks the example done.
- **Reading guidance in `examples/README.md`** — first-time readers get a stage-ordered table of contents (T-V03-002).
- **Hard-fail validation: skipped artifacts must be documented** (T-V03-003 slice 1, PR #95). Workflow-state frontmatter that marks an artifact `skipped` now requires the artifact filename to appear under the `## Skips` section.
- **Hard-fail validation: every `examples/<feature>/` must contain `workflow-state.md`** (T-V03-003 slice 2, PR #101). Catches partially-landed example folders.
- **Hard-fail validation: every `TEST-*` must reference at least one `REQ-*`/`NFR-*` in its definition source** (T-V03-003 slice 3, PR #107). Heading-defined TESTs scan their section body; table-row-defined TESTs scan their own row in `spec.md` / `test-plan.md` / `test-report.md`. Coverage is scoped to the TEST's definition artifact, so a row in `traceability.md` cannot rescue an orphan TEST.
- **`scripts/lib/spec-state.ts` extracted with 20 characterization tests** (T-V03-005a, PR #93). The previously inlined validation logic now lives in a pure library with a thin script wrapper.
- **`scripts/lib/traceability.ts` extracted with 18 characterization tests, plus an upstream fix** (T-V03-005b, PR #94). `collectDocumentDefinition` now threads errors through the shared accumulator instead of dropping duplicate-frontmatter-id errors into a throwaway array (Codex P1 review finding).
- **Public product page swapped from a fictional example to the worked one** (T-V03-007, PR #108). `sites/index.html` Stage 1 / Stage 3 / Stage 6 cards now show real `examples/cli-todo/` content with consistent IDs across the cards.

### Improved

- Diagnostics for spec-state and traceability checks are now stable enough to promote into CI in v0.4. Each diagnostic includes a file path; wording does not depend on hash ordering or environment.
- Existing checks (current-stage consistency, complete-artifact file presence, done-state rules, duplicate IDs, area mismatches, unknown references, invalid reference kinds, missing `Satisfies`) are now backed by regression tests after the spec-state and traceability characterization sweeps.

### Fixed

- `collectDocumentDefinition` no longer silently drops duplicate-frontmatter-id errors (Codex P1 fix in PR #94).

### Deprecated

- None.

### Removed

- None.

## User-visible impact

- **Who is affected:** every contributor running `npm run verify` locally. CI is unchanged in v0.3 — verify is still a local gate.
- **Action required:**
  - Existing specs whose workflow-state marks an artifact `skipped` must mention the artifact filename under `## Skips`. Specs that already used `> None.` continue to pass; only specs that *do* skip artifacts need to add documentation.
  - Existing examples folders without `workflow-state.md` will now fail `npm run verify`. Add one or remove the folder.
  - Existing `TEST-*` definitions without a covering `REQ-*`/`NFR-*` will now fail. Add the missing reference to the section body or table row.
- **Breaking changes:** None at the workflow / template level. The validation rules are stricter — that may surface pre-existing trace gaps as new diagnostics. The `examples/cli-todo/spec.md` had 14 such pre-existing gaps; PR #107 patched them.

## Known limitations

- **TEST coverage of REQ / NFR is not yet enforced.** v0.3 enforces the reverse direction (every `TEST-*` references back to a `REQ-*`/`NFR-*`). The forward direction (every `REQ-*`/`NFR-*` has at least one covering `TEST-*`) is deferred to v0.4 because test-plan formats are not yet locked enough for a deterministic check. Tracked as `CLAR-V03-002` advisory item.
- **`examples/cli-todo/` is illustrative.** Code paths in its implementation log and traceability matrix are anchors for the worked example, not files shipped in this repository.
- **Windows is out of scope for the worked example.** The cli-todo PRD documents this as `NG10`.
- **CI gates are not promoted in v0.3.** Validators run locally via `npm run verify`. v0.4 owns the CI promotion decision.

## Verification steps

After pulling v0.3:

1. `npm ci` — installs dependencies with the lockfile.
2. `npm run verify` — full local verify gate (formatter + linter + types + `test:scripts` + checks + build). Expect `verify: ok`.
3. `npm run check:specs` — workflow-state validation. Expect `check:specs: ok`.
4. `npm run check:traceability` — traceability validation. Expect `check:traceability: ok`.
5. `npm run test:scripts` — runs every file under `tests/scripts/`, including the 24 spec-state and 23 traceability characterization tests. Expect all pass. (Already run as part of step 2; this step is for narrower iteration.)
6. Open `examples/cli-todo/workflow-state.md` and read artifacts in stage order.
7. Open `https://luis85.github.io/agentic-workflow/` and confirm the example section references `examples/cli-todo/` (not the legacy `password-reset` placeholder).

## Rollback plan

- **Trigger criteria:** any v0.3 validator emits false-positive diagnostics that block legitimate PRs across multiple specs.
- **Mechanism:** revert the offending PR (`git revert <merge-sha>` then PR through `main`). The validation logic lives behind small pure functions in `scripts/lib/spec-state.ts` and `scripts/lib/traceability.ts`; reverts are surgical.
- **Data implications:** none. v0.3 ships no runtime, no migrations, no persisted state.
- **Communication:** post in the project channel and update the v0.3 issue (#88) with the revert SHA and reason.

## Observability

- Not applicable. v0.3 ships no runtime services. The "telemetry" of v0.3 is `npm run verify` exit code and diagnostic output.

## Communication

- **Internal announcement:** issue #88 (the v0.3 tracking issue) closes when this release ships and gets a final comment summarizing what landed.
- **External announcement:** the GitHub Pages product page (`sites/index.html`) carries the v0.3 worked-example pivot. README roadmap row flips from "Planned" to "Done" in the T-V03-008 release-readiness PR.
- **Support / docs updates:** `examples/README.md` (already updated in T-V03-002) is the canonical reader entry point.

## Validation baseline for v0.4

This subsection feeds T-V03-009 (v0.4 validation handoff).

- **Hard-fail in v0.3 (candidates for CI promotion in v0.4):**
  - Workflow-state frontmatter consistency (`scripts/lib/spec-state.ts`).
  - Stage-progress table consistency (`scripts/lib/spec-state.ts`).
  - Skipped-artifact documentation under `## Skips` (T-V03-003 slice 1).
  - Examples folders contain `workflow-state.md` (T-V03-003 slice 2).
  - `TEST-*` references back to `REQ-*`/`NFR-*` (T-V03-003 slice 3).
  - Traceability ID format, area mismatch, duplicate ID, unknown reference, invalid reference kind, and missing `Satisfies` field (`scripts/lib/traceability.ts`).
- **Advisory deferred to v0.4 (CLAR-V03-002):**
  - Every `REQ-*`/`NFR-*` has at least one covering `TEST-*` — deferred until test-plan formats are locked enough to avoid false positives.
- **Known false-positive risks:**
  - `idsIn` matches IDs anywhere in a line, including inside fenced code blocks. Today this is fine because no artifact embeds raw IDs in code. If a future template does, the validator may need to skip code blocks.
  - `splitItemSections` uses heading regex; deeply nested headings beyond `####` are not parsed as item sections.

---

## Quality gate

- [x] Summary written for readers.
- [x] User-visible impact stated.
- [x] Known limitations disclosed.
- [x] Verification steps documented.
- [x] Rollback plan documented.
- [x] Observability hooks in place (n/a documented).
- [x] Communication plan ready.
