---
id: TESTREPORT-V05-001
title: Version 0.5 release and distribution plan — Stage 8 test report
stage: testing
feature: version-0-5-plan
status: complete
owner: qa
inputs:
  - TESTPLAN-V05-001
  - SPECDOC-V05-001
  - PRD-V05-001
created: 2026-05-04
updated: 2026-05-04
---

# Test report — Version 0.5 release and distribution plan (Stage 8)

## 1. Summary

| Field | Value |
|---|---|
| Date | 2026-05-04 |
| Test plan reference | `specs/version-0-5-plan/test-plan.md` (TESTPLAN-V05-001) |
| Executor | qa agent (PR #162, branch `feat/v05-dry-run-and-verification`) |
| Node version | v24.12.0 |
| npm version | 11.9.0 |
| Working directory | `D:\Projects\agentic-workflow\.worktrees\v05-dry-run-and-verification` |
| Total deterministic commands run | 7 |
| Targeted test suites | `tests/scripts/release-readiness.test.ts`, `tests/scripts/release-package-contract.test.ts` (via `npm run test:scripts`) |
| Full suite result | 209 pass, 0 fail |
| `npm run verify` | PASS |
| Layer 1 readiness | FAIL (expected pre-release state — see §2) |
| Layer 2 fresh-surface check | FAIL — defect found (see §5) |
| T-V05-010 verdict | CONDITIONALLY COMPLETE — local deterministic path complete; remote workflow dispatch operator-authorised follow-up documented in §7 |
| T-V05-011 verdict | CONDITIONALLY COMPLETE — all local gates pass; Layer 2 fresh-surface defect raised as a `dev`-owned finding; operator-authorised follow-ups documented |

## 2. Deterministic results table

All commands run from `D:\Projects\agentic-workflow\.worktrees\v05-dry-run-and-verification`.

### Command 1 — Layer 1 readiness, no quality signals (TEST-V05-007)

```
npm run check:release-readiness -- --version 0.5.0 --json
```

| Field | Value |
|---|---|
| Exit code | 1 (expected) |
| Diagnostic codes | `RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_CHANGELOG_MISSING`, `RELEASE_READINESS_QUALITY` ×3 (CI status undefined, validation status undefined, 5 open clarifications) |
| REQ trace | REQ-V05-007 (check exists and fires), REQ-V05-010 (quality signals block publish) |

**Analysis:** The diagnostics are the expected pre-release state. The `v0.5.0` tag does not exist (ADR-0020: tag is cut from `main` after the release branch merges). `CHANGELOG.md` does not yet have a `[v0.5.0]` heading (promotion pending). Quality signal env vars absent because this is a dry-run testing pass. The check correctly fails closed — this is the correct behavior per SPEC-V05-005.

### Command 2 — Layer 1 readiness, green CI and validation signals (TEST-V05-010)

```
RELEASE_VERSION=0.5.0 RELEASE_CI_STATUS=green RELEASE_VALIDATION_STATUS=green \
npm run check:release-readiness -- --json
```

| Field | Value |
|---|---|
| Exit code | 1 (expected) |
| Diagnostic codes | `RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_CHANGELOG_MISSING`, `RELEASE_READINESS_QUALITY` (5 open clarifications across active features) |
| REQ trace | REQ-V05-010 — CI and validation signals are now green; quality check still blocks on 5 open clarifications across active features |

**Analysis:** Setting `RELEASE_CI_STATUS=green` and `RELEASE_VALIDATION_STATUS=green` suppresses the two CI/validation quality diagnostics. The 5 open clarifications remain because the repo has active features with open clarification items. Tag and CHANGELOG remain blocked — expected pre-release state.

### Command 3 — Layer 1 readiness, green signals + quality waiver (TEST-V05-010 waiver path)

```
RELEASE_VERSION=0.5.0 RELEASE_CI_STATUS=green RELEASE_VALIDATION_STATUS=green \
RELEASE_QUALITY_WAIVER="qa-dry-run: pre-release validation run on feat/v05-dry-run-and-verification; tag and CHANGELOG pending stable merge to main" \
npm run check:release-readiness -- --json
```

| Field | Value |
|---|---|
| Exit code | 1 (expected) |
| Diagnostic codes | `RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_CHANGELOG_MISSING` |
| REQ trace | REQ-V05-010 — waiver suppresses all Quality diagnostics; only structural pre-release gaps remain |

**Analysis:** Waiver correctly suppresses all `RELEASE_READINESS_QUALITY` codes. The two remaining diagnostics (`TAG_MISSING`, `CHANGELOG_MISSING`) are both pre-publish prerequisites that do not yet exist because the release branch has not been merged to `main`. This is the expected state on a feature branch. Confirms that the Layer 1 readiness check architecture correctly isolates structural gaps from quality signal gaps.

### Command 4 — npm pack dry-run (TEST-V05-011)

```
npm pack --dry-run
```

| Field | Value |
|---|---|
| Exit code | 0 |
| Package name | `@luis85/agentic-workflow` |
| Version | `0.5.0` |
| Would-be tarball | `luis85-agentic-workflow-0.5.0.tgz` |
| Would-be packed size | 857.7 kB |
| Would-be unpacked size | 2.8 MB |
| Would-be total files | 813 |

**Analysis:** Package identity confirmed correct. Exit 0 means the `package.json#files` allowlist is valid and npm can produce the archive. No tarball written to disk.

**Notable observation:** The dry-run listing includes numbered ADR files (e.g. `docs/adr/0001-record-architecture-decisions.md` through `docs/adr/0021-release-package-fresh-surface.md`). These violate SPEC-V05-010 assertion 1. See §5 (defect finding).

### Command 5 — npm pack + extract + Layer 2 fresh-surface check (TEST-V05-012)

```
# Stage shrinkwrap (mirrors workflow step 5)
cp package-lock.json npm-shrinkwrap.json

# Pack to temp directory (create destination first so this is reproducible
# on a clean machine — `npm pack --pack-destination` requires the dir to exist)
mkdir -p /tmp/qa-pack
npm pack --pack-destination /tmp/qa-pack

# Extract with strip-components (mirrors workflow step 5 tar invocation;
# `tar -C` likewise requires an existing target dir)
mkdir -p /tmp/qa-extract
tar -xzf /tmp/qa-pack/luis85-agentic-workflow-0.5.0.tgz \
  -C /tmp/qa-extract --strip-components=1

# Layer 2 check
RELEASE_PACKAGE_ARCHIVE=/tmp/qa-extract \
npm run check:release-package-contents -- --json
```

**Candidate archive details:**

| Field | Value |
|---|---|
| Tarball filename | `luis85-agentic-workflow-0.5.0.tgz` |
| Tarball path | `/tmp/qa-pack/luis85-agentic-workflow-0.5.0.tgz` |
| Tarball size | 864,582 bytes (864 kB) |
| Extracted file count | 814 files |
| SHA-256 | `2b9a4d2c5a43acf05df7f3c8d2f7f12757d49bf081defaa302713e25d27e62a4` |

**Layer 2 check result:**

| Field | Value |
|---|---|
| Exit code | 1 |
| `RELEASE_PKG_ADR` violations | 22 numbered ADR files (`docs/adr/0001-*.md` through `docs/adr/0021-*.md`) |
| `RELEASE_PKG_DOC_STUB` violations | Multiple — docs pages in `docs/` ship in built-up form (missing stub frontmatter, missing `<!-- TODO:` markers) |
| `RELEASE_PKG_INTAKE` violations | None observed in this run (intake folders either absent or contain only `README.md`) |

**This is a defect finding.** See §5. The check is working correctly — it correctly identifies that the codebase is not yet fresh-surface-prepared for publish.

### Command 6 — Targeted test suites (TEST-V05-007, TEST-V05-012)

```
npm run test:scripts
```

| Field | Value |
|---|---|
| Exit code | 0 |
| Total tests | 209 |
| Pass | 209 |
| Fail | 0 |
| Cancelled | 0 |
| Skipped | 0 |
| Duration | 3,665 ms |
| `release-readiness.test.ts` tests | 26 pass, 0 fail |
| `release-package-contract.test.ts` tests | 18 pass, 0 fail (counted within the 209 total) |

Scenarios covered by `release-readiness.test.ts`: valid release passes (Scenario 1), missing CHANGELOG (Scenario 2), absent CHANGELOG.md (Scenario 2b), missing `release.yml` (Scenario 3), malformed `release.yml` (Scenario 3b), `exclude: {}` fails shape (Scenario 3c), package metadata drift per field (Scenario 4), missing `files` entries (Scenario 4d), empty files array (Scenario 4b), version mismatch (Scenario 4c), unsafe top-level permissions (Scenario 5), `write-all` permissions (Scenario 5b), job-level permissions widen scope (Scenario 5d), job-level `write-all` (Scenario 5e), workflow absent (Scenario 5c), fresh-surface composition surfaces `RELEASE_PKG_*` (Scenario 6), missing quality signals fail closed (quality test 1), red CI status fails quality (quality test 2), waiver bypasses quality (quality test 3), missing tag fails `TagMissing`, tag SHA differs from main fails `TagNotAtMain`, argv parser (`parseReleaseReadinessArgs`), empty `--version` flag rejected, skip path with no version, CLI archive-without-version fails closed, CLI relative archive resolves against repoRoot.

Scenarios covered by `release-package-contract.test.ts`: ADR pattern matches canonical glob, INTAKE_FOLDERS enumerates 10 folders, clean archive passes, numbered ADR fails assertion 1, non-empty intake folder fails assertion 2, non-README file under intake fails assertion 2, non-directory intake path fails assertion 2 (Codex P2 regression), built-up doc fails assertion 3, doc missing frontmatter fails assertion 3, doc missing required frontmatter key fails assertion 3, doc missing top-level heading fails assertion 3, missing stub template fails closed, `parseReleasePackageArgs` (4 tests), violations across all three assertions reported together.

### Command 7 — npm run verify (TEST-V05-008)

```
npm run verify
```

| Field | Value |
|---|---|
| Exit code | 0 |
| Duration | 14.6 s |
| Gates passed | typecheck:scripts, test:scripts, check:automation-registry, check:agents, check:links, check:adr-index, check:commands, check:script-docs, check:workflow-docs, check:product-page, check:sites-tokens-mirror, check:frontmatter, check:obsidian, check:obsidian-assets, check:specs, check:roadmaps, check:traceability, check:token-budget |

All 18 verify gates green.

## 3. npm run verify gate summary

Full run: `verify: ok in 14.6s`. All gates passed. Relevant highlights:

- `typecheck:scripts` — TypeScript compile for all scripts (including `release-readiness.ts` and `release-package-contract.ts`) passed.
- `test:scripts` — 209 tests pass, including all 44 release-specific tests in `release-readiness.test.ts` (26, T-V05-005 plus follow-up Codex regressions) and `release-package-contract.test.ts` (18, T-V05-012 plus follow-up Codex regressions).
- `check:script-docs` — typedoc regenerated against release-readiness and release-package-contract libraries; no drift.
- `check:workflow-docs` — `.github/workflows/release.yml` satisfies the workflow documentation contract.
- `check:automation-registry` — `tools/automation-registry.yml` includes `check:release-readiness`, `check:release-package-contents`, and `workflow:release`.
- `check:specs` — `specs/version-0-5-plan/workflow-state.md` is valid against the spec-state schema.

## 4. Targeted test runs

### 4.1 tests/scripts/release-readiness.test.ts

Run via `npm run test:scripts`. 26 tests in the file, all green.

| Test | Result |
|---|---|
| Scenario 1 — valid release passes with no diagnostics | PASS |
| Scenario 2 — missing CHANGELOG entry fails with stable diagnostic | PASS |
| Scenario 2b — absent CHANGELOG.md file also fails with the same code | PASS |
| Scenario 3 — missing lifecycle release notes fails with stable diagnostic | PASS |
| Scenario 3b — release.yml missing changelog block fails ReleaseNotesShape | PASS |
| Scenario 3c — release.yml `exclude: {}` fails ReleaseNotesShape (Codex round-3 P2) | PASS |
| Scenario 4 — package metadata drift fails per drifting field | PASS |
| Scenario 4d — missing entries in package.json#files fail PkgFiles (Codex round-3 P1) | PASS |
| Scenario 4b — empty package.json#files fails PkgFiles | PASS |
| Scenario 4c — version mismatch fails Version code | PASS |
| Scenario 5 — unsafe workflow permissions fail with stable diagnostic | PASS |
| Scenario 5b — `permissions: write-all` fails | PASS |
| Scenario 5d — job-level permissions widen scope fails (Codex round-3 P1) | PASS |
| Scenario 5e — job-level `permissions: write-all` fails (Codex round-3 P1) | PASS |
| Scenario 5c — workflow file absent fails WorkflowMissing | PASS |
| Scenario 6 — fresh-surface composition surfaces RELEASE_PKG_* unchanged | PASS |
| quality signals: missing signals fail closed with Quality code | PASS |
| quality signals: red CI status fails Quality | PASS |
| quality signals: explicit operator waiver bypasses Quality assertions | PASS |
| tag readiness: missing tag fails TagMissing | PASS |
| tag readiness: tag SHA differs from main HEAD fails TagNotAtMain | PASS |
| parseReleaseReadinessArgs accepts --version and --archive in argv and env | PASS |
| parseReleaseReadinessArgs flags empty --version value (Codex P1 regression) | PASS |
| parseReleaseReadinessArgs returns no version when nothing provided (skip path) | PASS |
| CLI: archive without version fails closed (Codex P1 PR #158 regression) | PASS |
| CLI: relative archive path resolves against repoRoot, not caller CWD (Codex P2 PR #158 regression) | PASS |

### 4.2 tests/scripts/release-package-contract.test.ts

Run via `npm run test:scripts`. 18 tests in the file, all green.

| Test | Result |
|---|---|
| ADR_NUMBERED_PATTERN matches the canonical glob shape | PASS |
| INTAKE_FOLDERS enumerates the 10 intake folders from ADR-0021 §Decision.3 | PASS |
| clean fresh-surface archive passes all three assertions | PASS |
| numbered ADR file fails assertion 1 with a deterministic diagnostic | PASS |
| non-empty intake folder fails assertion 2 with a deterministic diagnostic | PASS |
| non-README file directly under an intake folder fails assertion 2 | PASS |
| non-directory intake path fails assertion 2 (Codex P2 regression) | PASS |
| built-up doc (missing stub TODO marker) fails assertion 3 | PASS |
| doc missing frontmatter fails assertion 3 | PASS |
| doc missing required frontmatter key fails assertion 3 | PASS |
| doc missing top-level heading fails assertion 3 | PASS |
| missing stub template fails closed before doc inspection | PASS |
| parseReleasePackageArgs accepts `--archive <dir>` and `--archive=<dir>` | PASS |
| parseReleasePackageArgs falls back to RELEASE_PACKAGE_ARCHIVE env | PASS |
| parseReleasePackageArgs returns `none` when nothing is provided | PASS |
| parseReleasePackageArgs flags empty `--archive` value (Codex P1 regression) | PASS |
| parseReleasePackageArgs argv beats env | PASS |
| violations across all three assertions are reported together | PASS |

## 5. Defect findings

### DEFECT-V05-001 — Fresh-surface contract not met: 22 numbered ADR files and multiple built-up docs ship in candidate archive

**Severity:** High (release blocker)

**REQ/SPEC trace:** SPEC-V05-010 assertion 1 (no numbered ADRs), SPEC-V05-010 assertion 3 (docs must be stubs); REQ-V05-012

**Evidence:** `npm run check:release-package-contents -- --archive /tmp/qa-extract --json` exits 1 with:

- 22 `RELEASE_PKG_ADR` diagnostics: files `docs/adr/0001-record-architecture-decisions.md` through `docs/adr/0021-release-package-fresh-surface.md` are all present in the extracted archive.
- Multiple `RELEASE_PKG_DOC_STUB` diagnostics: docs pages under `docs/` ship in built-up form (missing frontmatter keys, missing `<!-- TODO:` stub markers). The full diagnostic list includes pages in `docs/adr/` (built-up `README.md`), `docs/glossary/` (term files without stub frontmatter), `docs/daily-reviews/`, and several top-level `docs/` pages without frontmatter.

**Root cause:** The `package.json#files` allowlist includes `docs/` without any exclusion for `docs/adr/[0-9][0-9][0-9][0-9]-*.md`. The repository's built-up docs pages have not been converted to stub form. The manual stub-form packaging step (OQ-V05-003 in `package-contract.md`) has not been executed.

**Impact:** The release workflow's Layer 2 step (`check:release-package-contents`) will fail closed and block publish. Publish cannot proceed until this defect is resolved.

**Reproduction:**
```bash
cd <worktree>
mkdir -p /tmp/qa-pack /tmp/qa-extract
npm pack --pack-destination /tmp/qa-pack
tar -xzf /tmp/qa-pack/luis85-agentic-workflow-0.5.0.tgz -C /tmp/qa-extract --strip-components=1
RELEASE_PACKAGE_ARCHIVE=/tmp/qa-extract npm run check:release-package-contents -- --json
```

**Resolution path (dev-owned):** Two options:
1. Add an `.npmignore` exclusion for `docs/adr/[0-9][0-9][0-9][0-9]-*.md` to prevent numbered ADRs from shipping (satisfies assertion 1). Then convert all shipping `docs/` pages to stub form per `templates/release-package-stub.md` (satisfies assertion 3). This is the OQ-V05-003 automation gap.
2. Alternatively, add an explicit exclusion glob in `package.json#files` via `!docs/adr/[0-9][0-9][0-9][0-9]-*.md` (npm supports negation patterns) and convert docs pages to stubs.

**Do not fix in this PR.** This is a `dev`-owned task. Raising as a finding for review.

**Resolution (2026-05-02, dev, T-V05-013, round-2):** Round-2 fixes Codex review on PR #202 (commit `e336bd5`). **Codex P1** (`scripts/build-release-archive.ts:107`) — added `assertSafeOutDir` (new `scripts/lib/release-staging-safety.ts`) called before `fs.rmSync` so a mistyped `--out` cannot erase the repo. **Codex P2** (`.npmignore:23`) — `package.json#files` precedence over `.npmignore` made the round-1 ADR exclusion a false defence; the actual defence is `scripts/release-prepack-guard.mjs` wired as the npm `prepack` lifecycle script, which refuses `npm pack` of `@luis85/agentic-workflow` from any cwd that lacks the `.release-staging-marker` (written by `build:release-archive`). Bare `npm pack` from the repo root now fails closed. 18 new unit tests (13 safety + 5 prepack guard) on top of the round-1 32 = 50 new tests, total 259. `npm run verify` green across all 18 gates after `npm run fix` regenerates typedoc shells.

**Resolution (2026-05-02, dev, T-V05-013):** Resolved on the technical surface. Issue #90 §1's "convert codebase docs to stub form" reading was internally inconsistent with `docs/release-package-contents.md` line 40 ("the codebase form remains as authored — maintainers reading the codebase see one shape, consumers receive another"). Implemented the build-time-transform path instead: `scripts/build-release-archive.ts` stages a transformed copy under `.release-staging/` (numbered ADRs filtered, every shipping `docs/**/*.md` replaced with the stub form from `scripts/lib/release-stubify.ts`), and `.github/workflows/release.yml` step 5 calls the builder before `npm pack`. `.npmignore` excludes numbered ADRs, `.worktrees/`, and `.release-staging/` as defence-in-depth for direct-from-repo pack. Step 10 (`npm publish`) now publishes the byte-identical staged tarball so the published archive equals the GitHub Release asset and reflects the transform. Verified locally: rebuilt staging dir + `npm pack ./.release-staging` + Layer 2 check exits 0 with zero diagnostics. Closes OQ-V05-003 fully. CLAR-V05-003 and the operator-authorised remote dispatch remain as the v0.5 publish-readiness blockers; this defect is no longer one of them.

## 6. Skipped publish checks

The following checks require GitHub infrastructure or publish credentials and were explicitly skipped in this local execution per Article IX (Reversibility) of the constitution.

| Check | Reason skipped | Operator command |
|---|---|---|
| Remote `workflow_dispatch` dry-run | Shared-state action — creates a workflow run, uses GitHub API, writes run logs to the repository. Requires human authorisation. | See §7 below. |
| `npm publish` to GitHub Packages | Irreversible action — publishes a package version that cannot be deleted within the allowed registry window without `npm unpublish`. Requires `write:packages` credential. | Gated by `publish_package: true` and `dry_run: false`. Not exercised in this run. |
| `gh release create` | Irreversible action — creates a public GitHub Release. Once created, `gh release create` returns HTTP 422 on same-tag reruns per §7.1 of operator guide. Requires `contents: write` `GITHUB_TOKEN`. | Gated by `dry_run: false`. Not exercised in this run. |
| `gh release upload` | Requires an existing GitHub Release (from `gh release create`). | Gated by `dry_run: false`. Not exercised in this run. |
| Consumer `npm install` smoke test | Requires a published package version on GitHub Packages plus a `read:packages` PAT. | Per operator guide §5 step 4; exercised after stable publish. |

## 7. Operator-authorised follow-ups

### Remote dry-run dispatch (T-V05-010 remote path)

The exact command bundle that exercises the live infrastructure for T-V05-010 against the `main` branch. The operator must have `workflow` scope on their GITHUB_TOKEN (or use the GitHub Actions UI).

**Prerequisites before running:**
1. PR #162 is merged into `main`.
2. `v0.5.0` tag is cut on `main` (per ADR-0020 and operator guide §1).
3. `CHANGELOG.md` has a `[v0.5.0]` heading.
4. DEFECT-V05-001 is resolved (fresh-surface preparation complete, Layer 2 will pass).
5. Repository variables `RELEASE_CI_STATUS=green` and `RELEASE_VALIDATION_STATUS=green` are set.

**Command:**
```bash
gh workflow run release.yml \
  --ref main \
  -f version=0.5.0 \
  -f dry_run=true \
  -f prerelease=false \
  -f draft=false \
  -f confirm="" \
  -f publish_package=false
```

**Expected behavior (SPEC-V05-009):** The workflow executes the full readiness pipeline + `npm pack` archive build + Layer 2 fresh-surface assertions + `gh api .../releases/generate-notes` preview — without creating any public Release or publishing any package. Output is logged to the GitHub Actions run.

**Reference:** `docs/release-operator-guide.md` §4 (Dry run path).

### Stable publish path (not yet authorised)

The stable publish command bundle is documented in `docs/release-operator-guide.md` §5. It requires the operator to set `dry_run: false` and `confirm: 0.5.0`. It is explicitly not authorised in this testing pass — DEFECT-V05-001 must be resolved first, and CLAR-V05-003 (whether first publish should be draft/pre-release only) is still open.

## 8. Remaining authorisation needs

| Authorisation | Required for | Status |
|---|---|---|
| Repository variable `RELEASE_CI_STATUS=green` | Layer 1 quality signal check in the workflow | Pending operator action |
| Repository variable `RELEASE_VALIDATION_STATUS=green` | Layer 1 quality signal check in the workflow | Pending operator action |
| GitHub PAT with `workflow` scope (or GitHub Actions UI) | Triggering `workflow_dispatch` on `release.yml` | Not yet granted for this run |
| `GITHUB_TOKEN` with `packages: write` | `npm publish` step in the workflow | Available via Actions; not yet exercised |
| `GITHUB_TOKEN` with `contents: write` | `gh release create` + `gh release upload` in the workflow | Available via Actions; not yet exercised |
| CLAR-V05-003 closure | Whether stable publish is draft/pre-release only | Open clarification — must close before first stable publish |

## 9. Non-functional results

### Least-privilege publish (`NFR-V05-001`)

PASS. `.github/workflows/release.yml` top-level `permissions:` block declares exactly `{ contents: write, packages: write }`. No other scope. Verified by `RELEASE_READINESS_WORKFLOW_PERMISSIONS` check (test Scenario 5 confirms the check fires on extras) and by direct inspection of the workflow file.

### Operator guide runnable by non-author (`NFR-V05-004`)

PASS. `docs/release-operator-guide.md` covers all required sections (§1–§11): pre-conditions, six workflow inputs, pre-flight Layer 1, dry-run path, stable publish path, rollback, failed-publish recovery (§7.1–§7.6 including manual targeted commands for the non-idempotent `gh release create` case), post-release cleanup, quick-reference bundle, diagnostic code table, and references. `TEST-V05-008` §7.1 internal consistency check passed: `gh release create` documented as not rerunnable; manual targeted recovery commands present; idempotency guards present for `npm publish` and `gh release upload`.

### Idempotent rerun / recoverability (`NFR-V05-005`)

PASS. `docs/release-operator-guide.md` §7.1 documents the per-step recoverability matrix. `npm publish` uses an `npm view` pre-check (exit-code + stderr branch) that detects a prior publish and skips gracefully. `gh release upload --clobber` is idempotent. `gh release create` is documented as non-idempotent with explicit manual recovery commands rather than a workflow rerun. The operator guide §7.1 is internally consistent per `TEST-V05-008` manual review.

## 10. Coverage gaps

### Gap 1 — TEST-V05-006 (package publish from authorized release)

REQ-V05-006 requires that a package is published from an authorized release run. This cannot be covered in a local dry-run pass (irreversible shared-state action). Coverage deferred to the first stable publish run on `main` by the human operator.

### Gap 2 — DEFECT-V05-001 blocks TEST-V05-012 passing

TEST-V05-012 (fresh-surface contract) currently fails on the actual package archive. The check is working correctly (the failure is genuine), but the defect must be resolved by `dev` before the test can be marked green.

### Gap 3 — CLAR-V05-003 not yet closed

Whether the first publish should be draft/pre-release only is unresolved. The operator guide covers both paths, but the testing team cannot declare T-V05-010 fully complete until this clarification is resolved and the first remote dry-run returns a successful result.

## 11. Verdict per task

### Run release dry run (`T-V05-010`)

**Status: CONDITIONALLY COMPLETE**

**Rationale:** The local deterministic path (Layer 1 readiness, Layer 2 fresh-surface check, `npm pack` candidate archive, targeted test suites, `npm run verify`) has been executed fully. The Layer 1 readiness check correctly identifies pre-release gaps (`RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_CHANGELOG_MISSING`) that are expected on a feature branch before merge to `main`. The Layer 2 check correctly identifies DEFECT-V05-001 (fresh-surface preparation needed). All 44 release-specific unit tests (26 readiness + 18 package contract) pass. `npm run verify` is green.

The remote workflow dispatch path (the live GitHub Actions dry run that exercises SPEC-V05-009 against live infrastructure) is documented in §7 as the exact `gh workflow run` command, but has not been executed in this pass because it is a shared-state action requiring human authorisation (Article IX of the constitution). Once the operator runs the command documented in §7 after DEFECT-V05-001 is resolved and the prerequisites are met, T-V05-010 is fully complete.

**Blockers before marking fully complete:**
1. DEFECT-V05-001 resolved (fresh-surface preparation).
2. `v0.5.0` tag cut on `main` after PR #162 merges.
3. `CHANGELOG.md` `[v0.5.0]` entry promoted.
4. Operator runs `gh workflow run release.yml --ref main -f version=0.5.0 -f dry_run=true …` and records the result.

### Verify v0.5 release readiness (`T-V05-011`)

**Status: CONDITIONALLY COMPLETE**

**Rationale:** All deterministic gates within scope were run. The readiness check (`check:release-readiness`) is working correctly. Targeted tests pass (44 release-specific tests, 209 total). Package dry-run check is working correctly and caught DEFECT-V05-001. `npm run verify` is green. Link checks, agent checks, frontmatter checks, automation registry, and all other verify gates pass. Skipped publish checks and remaining authorisation needs are documented in §6–§8.

**Blockers before marking fully complete:**
1. DEFECT-V05-001 resolved by `dev`.
2. CLAR-V05-003 closed (draft/pre-release-only guidance for first publish).
3. Remote dry-run dispatch by operator returns a successful result.

**Not a test failure.** The conditions preventing a "fully complete" verdict are pre-release state and one dev-owned defect. The testing infrastructure itself is correct and all deterministic gates green.
