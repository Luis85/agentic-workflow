# PR 8 — Fresh-surface packaging check

Tasks: T-V05-012  
Issue: #90

## T-V05-012 — Implement fresh-surface packaging step
Owner: dev | Estimate: M | Depends on: T-V05-002 ✅ (merged in PR #157)

Add `scripts/check-release-package-contents.ts` (or equivalent) that asserts the candidate published archive matches the fresh-surface contract from ADR-0021 / SPEC-V05-010 / `package-contract.md`:

1. **No ADR files ship.** No file matching `docs/adr/[0-9][0-9][0-9][0-9]-*.md` is present in the published archive. `docs/adr/README.md` ships as a stub per `templates/release-package-stub.md`.
2. **Intake folders ship empty.** Each of the 10 enumerated intake folders (`inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`) is either absent from the archive or contains only a top-level `README.md` (no per-feature subdirectories, per-deal files, per-engagement state, per-cycle logs).
3. **Docs ship as stubs.** Every `docs/` page that ships in the archive matches the stub shape defined in `templates/release-package-stub.md`.

The script is the building block. `T-V05-004` (release readiness check, PR #158) then composes it so the readiness gate enforces both release metadata correctness and the fresh-surface contract together. **This PR must merge before #158** per the inverted DAG recorded in `tasks.md` and the workflow-state hand-off note from PR #157.

## Acceptance criteria

- `scripts/check-release-package-contents.ts` implemented and exposed via `npm run check:release-package-contents` (or wired into `npm run verify` with the package-shape check explicitly skippable when no candidate archive is present).
- Tests under `tests/scripts/` cover at minimum: clean fresh-surface archive passes; archive containing a numbered ADR fails; archive with a non-empty intake folder fails; archive with a built-up doc (missing stub markers) fails. Each failure mode produces a deterministic, traceable diagnostic.
- Implementation log appended for T-V05-012; workflow-state `last_agent` bumped.
- `npm run verify` green.

## Satisfies

REQ-V05-005, REQ-V05-012, NFR-V05-002, SPEC-V05-004, SPEC-V05-010.

## Unblocks

- PR #158 (T-V05-004 release readiness check + T-V05-005 tests) — readiness must compose this script per the broadened DAG.
