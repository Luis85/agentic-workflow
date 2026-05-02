---
id: TEST-PLAN-V05-001
title: Version 0.5 release and distribution plan — Stage 8 test plan
stage: testing
feature: version-0-5-plan
status: complete
owner: qa
inputs:
  - PRD-V05-001
  - SPECDOC-V05-001
  - TASKS-V05-001
  - PKG-CONTRACT-V05-001
created: 2026-05-02
updated: 2026-05-02
---

# Test plan — Version 0.5 release and distribution plan (Stage 8)

This plan covers **T-V05-010** (dry-run execution) and **T-V05-011** (readiness verification). Every TEST-V05-* identifier traces to a EARS clause (REQ-V05-*), spec item (SPEC-V05-*), and at least one deterministic command.

## 1. Entry criteria

All of the following must be true before testing begins:

- [ ] PRs #156, #158, #159, #160, #161, #173 merged into the working branch.
- [ ] `scripts/check-release-readiness.ts`, `scripts/lib/release-readiness.ts` present.
- [ ] `scripts/check-release-package-contents.ts`, `scripts/lib/release-package-contract.ts` present.
- [ ] `.github/workflows/release.yml` present.
- [ ] `docs/release-operator-guide.md` present.
- [ ] `tests/scripts/release-readiness.test.ts` and `tests/scripts/release-package-contract.test.ts` present.
- [ ] `package.json#name == "@luis85/agentic-workflow"`, `#version == "0.5.0"`, `#publishConfig.registry == "https://npm.pkg.github.com"`.
- [ ] `npm run verify` passes on the working branch before this plan is executed.

## 2. Exit criteria

Testing is complete when:

- All deterministic commands in §4 have been run and their exit codes recorded in `test-report.md`.
- `npm run verify` is green.
- Targeted test suites (`tests/scripts/release-readiness.test.ts`, `tests/scripts/release-package-contract.test.ts`) show 0 failures.
- `npm pack` candidate tarball has been produced and Layer 2 (`check:release-package-contents`) has been run against the extracted archive.
- All skipped publish checks and operator-authorised follow-ups are listed in `test-report.md` §6–§7.
- `test-report.md` records a verdict per task.
- Operator-authorised remote workflow dispatch command is documented for human approval.

## 3. Test coverage matrix

Every EARS clause that requires testing is mapped to one or more TEST-V05-* identifiers here. The operator-authorised column names the `gh workflow run` invocation that exercises the same clause against the live infrastructure.

| Test ID | REQ-V05-* | SPEC-V05-* | EARS clause summary | Deterministic command(s) | Operator-authorised command | Result artifact |
|---|---|---|---|---|---|---|
| `TEST-V05-002` | REQ-V05-002 | SPEC-V05-002 | Publish workflows require manual dispatch, explicit authorization, least-privilege permissions. | `npm run check:release-readiness -- --version 0.5.0 --json` (checks `RELEASE_READINESS_WORKFLOW_PERMISSIONS`); review `.github/workflows/release.yml` triggers and permissions block. | Remote dispatch with `dry_run: true` — no publish occurs. | `test-report.md` §2 + §3 |
| `TEST-V05-003` | REQ-V05-003 | SPEC-V05-003 | Workflow creates or updates a GitHub Release from accepted release tag and release notes. | `npm run check:release-readiness -- --version 0.5.0 --json` passes workflow-shape checks; dry-run dispatch logs `gh api .../releases/generate-notes` preview. | `gh workflow run release.yml --ref main -f version=0.5.0 -f dry_run=true -f prerelease=false -f draft=false -f confirm="" -f publish_package=false` | `test-report.md` §5 (operator-authorised follow-ups) |
| `TEST-V05-007` | REQ-V05-007 | SPEC-V05-005 | Readiness check validates version, tag, changelog, lifecycle notes, package metadata, workflow config, and permissions before publish. | `npm run check:release-readiness -- --version 0.5.0 --json`; `npm run test:scripts` (Scenarios 1–6 in `release-readiness.test.ts`). | (Covered by local deterministic path.) | `test-report.md` §2 |
| `TEST-V05-008` | REQ-V05-008 | SPEC-V05-006 | Operator guide provides runnable path from dry run through publish, rollback, recovery, and cleanup. | Review `docs/release-operator-guide.md` sections §1–§11; verify each command is internally consistent per §7.1 (`gh release create` not-idempotent, manual recovery commands provided). | Remote dispatch dry run exercises §4 of the guide. | `test-report.md` §2 |
| `TEST-V05-010` | REQ-V05-010 | SPEC-V05-008 | Quality signals (CI status, validation status, open blockers, open clarifications, maturity) must be green or explicitly waived. | `npm run check:release-readiness -- --version 0.5.0 --json` without env produces `RELEASE_READINESS_QUALITY` diagnostics; with `RELEASE_QUALITY_WAIVER` set, Quality codes are suppressed; unit tests `quality signals: missing signals fail closed with Quality code`, `quality signals: explicit operator waiver bypasses Quality assertions`. | (Covered by local deterministic path.) | `test-report.md` §2 |
| `TEST-V05-011` | REQ-V05-011 | SPEC-V05-009 | Operator workflow can create or validate a draft/pre-release candidate without publishing a stable package. | `npm pack --dry-run` validates archive shape without writing tarball; `npm pack` produces real candidate; `check:release-package-contents` validates archive against fresh-surface contract. Remote dispatch with `dry_run: true` logs generated-notes preview without creating a Release. | `gh workflow run release.yml --ref main -f version=0.5.0 -f dry_run=true -f prerelease=false -f draft=false -f confirm="" -f publish_package=false` | `test-report.md` §4 + §5 |
| `TEST-V05-012` | REQ-V05-005, REQ-V05-012 | SPEC-V05-010 | Released archive conforms to fresh-surface contract: no numbered ADRs, intake folders empty, docs in stub form. | `npm pack` + extract + `npm run check:release-package-contents -- --archive <extracted-dir> --json`; unit tests in `release-package-contract.test.ts` (12 tests). | Layer 2 readiness step runs in remote workflow dispatch; fails closed on any fresh-surface violation. | `test-report.md` §4 |

### Additional coverage rows (non-functional and structural)

| TEST-V05-* | NFR/REQ | Requirement | Test approach | Result artifact |
|---|---|---|---|---|
| TEST-V05-002-NFR | NFR-V05-001 | Least-privilege publish actions. | Inspect `release.yml` `permissions:` block; `RELEASE_READINESS_WORKFLOW_PERMISSIONS` in readiness check. | `test-report.md` §2 |
| TEST-V05-005-NFR | NFR-V05-005 | Idempotent rerun for failed publish. | Review `docs/release-operator-guide.md` §7.1 (`gh release create` not-idempotent; manual targeted commands provided; `npm publish` idempotent with `npm view` pre-check; `gh release upload --clobber` idempotent). Verify §7.1 internal consistency. | `test-report.md` §2 |

## 4. Test scenarios and commands

### 4.1 TEST-V05-007 — Release readiness, Layer 1, no quality signals (expected: fail with QUALITY codes)

```bash
npm run check:release-readiness -- --version 0.5.0 --json
```

Expected: exit code 1; diagnostics include `RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_CHANGELOG_MISSING`, `RELEASE_READINESS_QUALITY`.

**Rationale:** The `v0.5.0` tag does not yet exist and the CHANGELOG does not yet have a `[v0.5.0]` entry; these are expected pre-release states. The quality-signals are absent because `RELEASE_CI_STATUS` / `RELEASE_VALIDATION_STATUS` are not set. The check is working correctly when it fails closed on these.

### 4.2 TEST-V05-010 — Release readiness, Layer 1, green quality signals (expected: only structural diagnostics remain)

```bash
RELEASE_VERSION=0.5.0 \
RELEASE_CI_STATUS=green \
RELEASE_VALIDATION_STATUS=green \
npm run check:release-readiness -- --json
```

Expected: exit code 1; diagnostics include `RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_CHANGELOG_MISSING`, and one or more `RELEASE_READINESS_QUALITY` for open clarifications. The `RELEASE_READINESS_QUALITY` for CI status and validation status are suppressed. The tag and CHANGELOG diagnostics persist because neither the `v0.5.0` tag nor the CHANGELOG entry exists before stable merge to `main`.

### 4.3 TEST-V05-010 — Quality waiver path (expected: only tag and CHANGELOG remain)

```bash
RELEASE_VERSION=0.5.0 \
RELEASE_CI_STATUS=green \
RELEASE_VALIDATION_STATUS=green \
RELEASE_QUALITY_WAIVER="qa-dry-run: pre-release validation run on feat/v05-dry-run-and-verification; tag and CHANGELOG pending stable merge to main" \
npm run check:release-readiness -- --json
```

Expected: exit code 1; diagnostics contain only `RELEASE_READINESS_TAG_MISSING` and `RELEASE_READINESS_CHANGELOG_MISSING`. Quality codes are suppressed by the waiver. Confirms REQ-V05-010 waiver bypass path.

### 4.4 TEST-V05-011 — npm pack dry-run (no tarball written)

```bash
npm pack --dry-run
```

Expected: exit code 0; outputs listing of would-be archive files including tarball summary line `name: @luis85/agentic-workflow`, `version: 0.5.0`, `total files: NNN`. No tarball written to disk.

### 4.5 TEST-V05-012 — npm pack candidate archive + Layer 2 fresh-surface check

```bash
# Stage lockfile under canonical publication name (mirroring workflow step 5)
cp package-lock.json npm-shrinkwrap.json
mkdir -p /tmp/qa-pack
npm pack --pack-destination /tmp/qa-pack

# Extract (strip npm's `package/` top-level wrapper)
mkdir -p /tmp/qa-extract
tar -xzf /tmp/qa-pack/luis85-agentic-workflow-0.5.0.tgz -C /tmp/qa-extract --strip-components=1

# Layer 2 fresh-surface check
RELEASE_PACKAGE_ARCHIVE=/tmp/qa-extract \
npm run check:release-package-contents -- --json

# Cleanup
rm -f npm-shrinkwrap.json
```

Expected: Layer 2 fails with `RELEASE_PKG_ADR` (numbered ADR files present), `RELEASE_PKG_DOC_STUB` (docs not in stub form), and possibly `RELEASE_PKG_INTAKE`. This is the expected outcome: the check works correctly and the pre-publish fresh-surface preparation work (OQ-V05-003) is not yet done.

**This is a defect finding, not a test failure.** See §5 of `test-report.md` for the formal finding.

### 4.6 TEST-V05-005 — Targeted tests: release-readiness.test.ts and release-package-contract.test.ts

```bash
npm run test:scripts
```

Expected: all tests pass. The full suite includes the 21 release-readiness tests and 12 release-package-contract tests.

### 4.7 TEST-V05-008 — npm run verify (all gates)

```bash
npm run verify
```

Expected: exit code 0; all gates (`typecheck:scripts`, `test:scripts`, `check:automation-registry`, `check:agents`, `check:links`, `check:adr-index`, `check:commands`, `check:script-docs`, `check:workflow-docs`, `check:product-page`, `check:sites-tokens-mirror`, `check:frontmatter`, `check:obsidian`, `check:obsidian-assets`, `check:specs`, `check:roadmaps`, `check:traceability`, `check:token-budget`) pass.

### 4.8 TEST-V05-002 — Operator guide §7.1 internal consistency (REQ-V05-011 + NFR-V05-005)

Manual review of `docs/release-operator-guide.md` §7.1:

- Confirm: `gh release create` is documented as NOT rerunnable on an existing Release (HTTP 422).
- Confirm: §7.1 provides manual targeted commands rather than a workflow rerun.
- Confirm: `npm publish` idempotency guard (`npm view` pre-check with E404/non-404 branching) is present.
- Confirm: `gh release upload --clobber` is present (idempotent asset attachment).
- Confirm: subshell + trap credential cleanup is present (Codex round-3/4 P2 fixes).

Expected: all four checks pass. Documents that REQ-V05-011 (operator workflow supports candidate dry run before stable publication) is internally consistent.

## 5. Skipped publish checks

The following checks require live GitHub infrastructure or `packages: write` credentials and are explicitly skipped in this local execution. They are documented for the operator to exercise via remote workflow dispatch.

| Check | Reason skipped | Operator command that exercises it |
|---|---|---|
| `gh workflow run release.yml … dry_run: true` | Shared-state action — creates a workflow run in the GitHub repo; requires `GITHUB_TOKEN` with `workflow` scope or UI dispatch. | See §7 of `test-report.md`. |
| `npm publish` | Requires `write:packages` credential against GitHub Packages; publishes an irreversible npm version. | Gated by `publish_package: true` and `dry_run: false` in the release workflow; not run during local dry-run testing. |
| `gh release create` | Requires `contents: write` GITHUB_TOKEN; creates a public GitHub Release. | Gated by `dry_run: false` in the release workflow; not run in dry-run path. |
| `gh release upload` | Requires `contents: write` GITHUB_TOKEN + an existing GitHub Release. | Gated by `dry_run: false`; not run in dry-run path. |

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `v0.5.0` tag and CHANGELOG entry absent during local dry-run | Certain (pre-release state) | High — Layer 1 readiness fails | Expected pre-release state; readiness check correctly blocks publish; operator waiver used to isolate structural diagnostics from pre-release gaps. |
| Fresh-surface preparation (OQ-V05-003) not automated | Certain (open question in package-contract.md) | High — Layer 2 readiness fails on actual pack | Layer 2 defect finding raised in test-report.md; dev must resolve before stable publish. |
| Remote workflow dispatch not exercised locally | Certain (Article IX boundary) | Medium — T-V05-010 remote path not validated | Exact command documented in test-report.md §5; operator must run after human authorisation. |

## 7. Traceability

Every REQ-V05-* with a testing-stage obligation:

| REQ-V05-* | TEST-V05-* | Status |
|---|---|---|
| REQ-V05-001 | (Covered by T-V05-001; doc review in T-V05-011) | Upstream |
| REQ-V05-002 | TEST-V05-002 | This plan |
| REQ-V05-003 | TEST-V05-003 | This plan |
| REQ-V05-005 | TEST-V05-012 | This plan |
| REQ-V05-007 | TEST-V05-007 | This plan |
| REQ-V05-008 | TEST-V05-008 | This plan |
| REQ-V05-010 | TEST-V05-010 | This plan |
| REQ-V05-011 | TEST-V05-011 | This plan |
| REQ-V05-012 | TEST-V05-012 | This plan |
| NFR-V05-001 | TEST-V05-002-NFR | This plan |
| NFR-V05-005 | TEST-V05-005-NFR | This plan |
