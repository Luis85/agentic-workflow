# PR 4 — Manual GitHub Release workflow

Tasks: T-V05-006
Issue: #90

## T-V05-006 — Add manual GitHub Release workflow

Owner: dev | Estimate: M | Depends on: T-V05-003 ✅ (PR #156), T-V05-004 ✅ (PR #158)

Add a `workflow_dispatch` release workflow at `.github/workflows/release.yml` that supports dry-run, draft / pre-release mode, generated release notes, and release-asset attachment **without enabling package publish** (T-V05-007 adds the package step).

### Trigger and inputs

- `on: workflow_dispatch` only — no `push`, no `pull_request` (REQ-V05-002 / NFR-V05-001 / SPEC-V05-002).
- Required inputs:
  - `version` — `X.Y.Z` semantic version, validated against `package.json#version` and the existing tag.
  - `dry_run` — boolean, default `true`. When `true`, runs readiness + lifecycle steps without creating a GitHub Release (REQ-V05-011 / SPEC-V05-009).
  - `prerelease` — boolean, default `false`. When `true`, the published Release is marked pre-release.
  - `draft` — boolean, default `false`. When `true`, the Release is created in draft state (operator finalises).
  - `confirm` — string. Operator must type the literal `version` value to authorise non-dry-run publish (per SPEC-V05-002 explicit publish confirmation). Mismatched / empty value short-circuits before any release call.

### Permissions

- Top-level `permissions:` block — exactly `contents: write` and `packages: write` (per `RELEASE_READINESS_DIAGNOSTIC_CODES.WorkflowPermissions` and ADR-0020). The `packages: write` is reserved for T-V05-007; this PR does not call any package action.
- No job-level overrides that widen scope. `RELEASE_READINESS_WORKFLOW_PERMISSIONS` enforces both top-level and per-job blocks (PR #158 round-3 P1).

### Job sequence

1. **Checkout.** `actions/checkout@v5` with `fetch-depth: 0` so the readiness check can resolve tags.
2. **Setup Node.** `actions/setup-node@v6` matching `package.json#engines.node` (`>=20`).
3. **Install.** `npm ci` for deterministic dependencies.
4. **Readiness — Layer 1.** `npm run check:release-readiness -- --version ${{ inputs.version }} --json` — runs metadata-only readiness (no archive yet). Fails the run on any Layer 1 diagnostic. Operator-supplied quality signals via `--ci-status`, `--validation-status`, or `--quality-waiver` (mapped from inputs / repository variables).
5. **Build candidate archive (skipped this PR).** Stub job step that prepares the fresh-surface archive — left as a no-op `echo` until T-V05-007 wires the actual packaging. A comment names the follow-up.
6. **Readiness — Layer 2 (skipped this PR).** Mirrors step 4 but with `--archive <dir>` once step 5 lands. Stub.
7. **Tag check.** Confirms the `v${{ inputs.version }}` tag exists on `main` HEAD (per ADR-0020). Fails with the same diagnostic semantics as `RELEASE_READINESS_TAG_*`.
8. **Confirm gate.** Compares `${{ inputs.confirm }}` to `${{ inputs.version }}`. When `dry_run == false` and the values do not match, fails before the Release create call.
9. **Create GitHub Release.** `gh release create` (or `softprops/action-gh-release` pinned to a SHA — pick whichever already passes `zizmor` / `actionlint`):
   - `tag_name: v${{ inputs.version }}`
   - `name: v${{ inputs.version }}`
   - `target_commitish: main`
   - `body: <output of generated release notes from `.github/release.yml`>` (REQ-V05-003, REQ-V05-004 — the categories from PR #156's `.github/release.yml` apply automatically).
   - `prerelease`, `draft` from inputs.
   - When `dry_run == true`, this step is skipped and the workflow logs the candidate body for review without creating any public artifact.
10. **Release asset attachment (skipped this PR).** Hook for T-V05-007 / future asset packaging; left as a no-op named step.

### Surface

- `.github/workflows/release.yml` (new).
- `tools/automation-registry.yml` — new `workflow:release` entry (kind: workflow, read_only: false, safe_to_run_locally: false).
- No new TypeScript scripts; the workflow composes existing `check:release-readiness` and the GitHub CLI / action.
- No changes to `package.json` scripts (T-V05-007 will add publish-related ones).

### Edge cases (must surface, not swallow)

- Operator triggers with `dry_run: true` and `prerelease: true` — both honoured; the dry-run skip applies regardless. Logs reflect both flags.
- `confirm` mismatch on a non-dry-run — fails before Release create; the readiness check already ran, so the run still surfaces any prior diagnostics.
- Tag does not exist — readiness `RELEASE_READINESS_TAG_MISSING` fails the run; no Release create attempted.
- `package.json#version` does not match the input — readiness `RELEASE_READINESS_VERSION_MISMATCH` fails the run.
- Job-level permissions widened in error — `RELEASE_READINESS_WORKFLOW_PERMISSIONS` will be caught by the readiness step against this same workflow file (self-validating once committed).

### Tests

- `actionlint` (existing CI workflow) — must pass.
- `zizmor` (existing CI workflow) — must pass; no `pull_request_target`, no script-injection from inputs (use `${{ inputs.* }}` only inside `env:` mappings or as arguments to actions, never inside `run:` shell strings).
- Workflow itself is not unit-testable; the readiness check it composes is already covered (PR #158, 26 tests).
- Smoke test: trigger the workflow on a feature branch with `dry_run: true` once merged. Result captured under T-V05-010.

### Acceptance criteria

- `.github/workflows/release.yml` created; `actionlint` + `zizmor` green on it.
- `tools/automation-registry.yml` updated with the new entry.
- Workflow composes `npm run check:release-readiness` for Layer 1 metadata validation; the Layer 2 fresh-surface step is wired as a stub (T-V05-007 will fill in archive prep).
- `dry_run: true` is the default; non-dry-run requires `confirm` matching `version`.
- Implementation log appended for T-V05-006; `workflow-state.md` `last_agent: dev` and `last_updated` bumped.
- `npm run verify` green.

### Satisfies

REQ-V05-002, REQ-V05-003, REQ-V05-004, REQ-V05-011, NFR-V05-001, NFR-V05-002, NFR-V05-005, SPEC-V05-002, SPEC-V05-003, SPEC-V05-009.

### Dependencies

- ✅ T-V05-003 (PR #156) — `.github/release.yml` shape consumed by generated release notes.
- ✅ T-V05-004 (PR #158) — `npm run check:release-readiness` Layer 1 + Layer 2 composition.

### Unblocks

- PR #160 (T-V05-007 package publish path) — extends this workflow with the package step + asset attachment.
- PR #161 (T-V05-008 operator guide, T-V05-009 distribution docs) — operator guide names the exact inputs and confirm gate; distribution docs reference the workflow.
- PR #162 (T-V05-010 release dry run, T-V05-011 final readiness verification) — `dry_run: true` invocation and final readiness gate against the candidate.
