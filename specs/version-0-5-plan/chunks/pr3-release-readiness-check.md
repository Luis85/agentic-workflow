# PR 3 — Release readiness check + tests

Tasks: T-V05-004, T-V05-005
Issue: #90

## T-V05-004 — Add release readiness check

Owner: dev | Estimate: M | Depends on: T-V05-001 ✅ (PR #156), T-V05-002 ✅ (PR #157), T-V05-012 ✅ (PR #173)

Implement a deterministic release readiness check that asserts a candidate release is publishable. The check must compose two layers of validation — release metadata correctness and the fresh-surface package contract — into a single readiness call so neither can pass while the other is broken.

### Layer 1 — Release metadata correctness

Validate, in fixed order, with stable diagnostic codes:

1. **Version alignment.** `package.json#version` mirrors the candidate git tag (tag `vX.Y.Z` ↔ version `X.Y.Z`, per ADR-0020 + `package-contract.md` §5).
2. **Tag readiness.** The release tag is cut from `main` and points at the merge commit promoted via the release branch shape recorded in ADR-0020.
3. **CHANGELOG entry.** A `CHANGELOG.md` entry exists for the candidate version string.
4. **Lifecycle release notes.** `.github/release.yml` is present and configured per T-V05-003 (categories + label / author exclusions).
5. **Package metadata.** `package.json#name`, `#publishConfig.registry`, `#repository`, and `#files` match `specs/version-0-5-plan/package-contract.md` §2 and §3.
6. **Workflow permissions.** The manual release workflow's job permissions are least-privilege (`contents: write`, `packages: write`, no broader scopes than required).
7. **v0.4 quality signals (SPEC-V05-008).** Required CI status, validation status, open blockers, open clarifications, and maturity evidence are green or an explicit operator waiver is recorded.

### Layer 2 — Fresh-surface package contract

Compose `scripts/check-release-package-contents.ts` (T-V05-012, merged in PR #173) so the readiness check refuses to authorize publish unless **all three** fresh-surface assertions pass against the candidate archive:

1. No file matches `docs/adr/[0-9][0-9][0-9][0-9]-*.md`.
2. Each enumerated intake folder (10 listed in ADR-0021 §Decision.3) is absent or contains only `README.md`.
3. Every shipping `docs/` page matches the stub shape from `templates/release-package-stub.md`.

Diagnostic codes from `scripts/lib/release-package-contract.ts` flow through unchanged (`RELEASE_PKG_ADR`, `RELEASE_PKG_INTAKE`, `RELEASE_PKG_DOC_STUB`, `RELEASE_PKG_STUB_TEMPLATE_MISSING`).

### Surface

- `scripts/check-release-readiness.ts` (or equivalent), exposed via `npm run check:release-readiness -- --version <X.Y.Z> [--archive <dir>] [--json]`.
- Skippable cleanly when invoked without a release context (no `--version` and no env var) — the same skip-path discipline T-V05-012 set, so `npm run verify` can host the check without forcing every developer to prepare an archive.
- Wired into `tools/automation-registry.yml`.
- Shared lib at `scripts/lib/release-readiness.ts` (pure functions, unit-testable without CLI side effects).

Satisfies: REQ-V05-007, REQ-V05-010, REQ-V05-012, NFR-V05-003, SPEC-V05-005, SPEC-V05-008, SPEC-V05-010.

## T-V05-005 — Test release readiness behavior

Owner: qa | Estimate: M | Depends on: T-V05-004

Add focused unit tests under `tests/scripts/release-readiness.test.ts` covering at minimum:

1. **Valid release passes.** Aligned version + tag + CHANGELOG + lifecycle notes + package metadata + fresh-surface archive ⇒ no diagnostics.
2. **Missing CHANGELOG entry fails.** Candidate version not present in `CHANGELOG.md` ⇒ deterministic diagnostic.
3. **Missing lifecycle release notes fails.** Absent or stub `.github/release.yml` ⇒ deterministic diagnostic.
4. **Package metadata drift fails.** `package.json#name` / `#publishConfig.registry` / `#files` deviates from `package-contract.md` ⇒ deterministic diagnostic per drifting field.
5. **Unsafe workflow permissions fail.** Workflow grants broader scopes than `contents: write` + `packages: write` ⇒ deterministic diagnostic.
6. **Fresh-surface composition wired.** Numbered ADR / non-empty intake / non-stub doc in candidate archive ⇒ readiness fails with the underlying `RELEASE_PKG_*` diagnostics surfaced (not swallowed).

Each diagnostic must be deterministic, traceable, and scoped to a stable code so PR #158 reviewers and downstream T-V05-006 can rely on them.

Satisfies: REQ-V05-007, REQ-V05-010, NFR-V05-003, SPEC-V05-005, SPEC-V05-008.

## Acceptance criteria

- `scripts/check-release-readiness.ts` implemented and exposed via `npm run check:release-readiness`.
- All six test scenarios pass.
- `tools/automation-registry.yml` updated with the new check.
- Implementation log appended for T-V05-004 and T-V05-005; workflow-state `last_agent` bumped.
- `npm run verify` green.

## Dependencies

- ✅ T-V05-001 (PR #156) — release branch strategy / ADR-0020.
- ✅ T-V05-002 (PR #157) — package contract.
- ✅ T-V05-012 (PR #173) — fresh-surface check building block.

## Unblocks

- PR #159 (T-V05-006 manual GitHub Release workflow) — the publish step calls into readiness.
- PR #162 (T-V05-010 release dry run, T-V05-011 final readiness verification) — both gate on this check.
