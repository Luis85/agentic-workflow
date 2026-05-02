# PR 5 — Package publish path

Tasks: T-V05-007
Issue: #90

## T-V05-007 — Add package publish path

Owner: dev | Estimate: L | Depends on: T-V05-002 ✅ (PR #157), T-V05-006 ✅ (PR #159)

After package contract approval: update package metadata to the v0.5 identity defined in `specs/version-0-5-plan/package-contract.md` §2–§3, and extend the manual release workflow (`.github/workflows/release.yml`) so that an authorised dry run produces a candidate archive that passes Layer 2 fresh-surface readiness, and an authorised non-dry-run run publishes the accepted package to GitHub Packages with least-privilege permissions.

### Surface

- `package.json` — adopt the contract identity: `name: "@luis85/agentic-workflow"`, `version: "0.5.0"`, `repository`, `publishConfig.registry: "https://npm.pkg.github.com"`, `files` allowlist matching `EXPECTED_PACKAGE_FILES`, drop `private: true`, add `description` / `license: "MIT"` / `homepage` / `bugs` / `keywords` / `author` so the published manifest is npm-publish-ready.
- `package-lock.json` — refreshed for the renamed root package; no dependency changes.
- `.github/workflows/release.yml` — replace the three T-V05-007 stubs (build candidate archive, Layer 2 readiness, release-asset attachment), add the `npm publish` step, and configure `actions/setup-node` with `registry-url` + `scope` so `NODE_AUTH_TOKEN` authenticates the publish call.
- `tools/automation-registry.yml` — bump the `workflow:release` `purpose` to reflect the now-active pipeline (no more "stubs for T-V05-007").

No new TypeScript scripts; no changes to `package.json#scripts`. The workflow composes existing `check:release-readiness` (Layer 1 — PR #158) and `check:release-package-contents` (Layer 2 — PR #173).

### Trigger and inputs

Same five inputs as T-V05-006 plus one new input introduced by T-V05-007:

- `publish_package` — boolean, default `false`. Operator must explicitly opt in to push the npm package to GitHub Packages on the current run; defaulting to `false` means candidate runs (`dry_run`, `draft`, `prerelease`, or any non-publish review run) cannot accidentally publish an irreversible stable package version (SPEC-V05-009 candidate dry run). The package publish step is gated on `! dry_run && publish_package`; the GitHub Release create and the asset upload still run on `! dry_run` so a draft Release can carry the tarball for reviewer inspection without publishing the package.

`dry_run: true` (default) runs Layer 1 readiness, materialises a candidate archive, and runs Layer 2 readiness against it without creating any public artifact. `dry_run: false` adds the GitHub Release create and the asset upload — both gated on the `confirm == version` check from SPEC-V05-002. `dry_run: false && publish_package: true` additionally publishes the package to GitHub Packages.

### Permissions

Unchanged from T-V05-006: top-level `permissions:` declares exactly `{ contents: write, packages: write }`, enforced by `RELEASE_READINESS_WORKFLOW_PERMISSIONS`. T-V05-007 is the consumer of `packages: write` — `npm publish` to `npm.pkg.github.com` requires it.

### Job sequence

The numbered comments in the workflow file already pin the slot for each step; T-V05-007 fills slots 5, 6, 10, and 11 and tightens slot 2.

1. **Checkout.** Unchanged.
2. **Setup Node.** Add `registry-url: https://npm.pkg.github.com` and `scope: '@luis85'` so the action writes `~/.npmrc` with the registry mapping. `NODE_AUTH_TOKEN` (set on the publish step) provides the credential. SHA pin and `node-version: 24` unchanged.
3. **Install.** Unchanged (`npm ci`).
4. **Readiness — Layer 1 (release metadata).** Unchanged. Now also exercises `RELEASE_READINESS_PKG_NAME` / `PkgRegistry` / `PkgRepository` / `PkgFiles` for real because `package.json` carries the contract identity.
5. **Build candidate archive.** Replace the stub with `npm pack --pack-destination <tmp>`; capture the tarball path and an extracted directory as step outputs (`steps.pack.outputs.tarball`, `steps.pack.outputs.archive_dir`). The extracted directory has `package/` flattened with `tar --strip-components=1` so the layout matches the running repo, which is what `checkReleasePackageContents` walks.
6. **Readiness — Layer 2 (fresh-surface).** Replace the stub with `npm run check:release-package-contents -- --json`, passing the archive directory via the `RELEASE_PACKAGE_ARCHIVE` env mapping. Diagnostics surface `RELEASE_PKG_ADR` / `RELEASE_PKG_INTAKE` / `RELEASE_PKG_DOC_STUB` / `RELEASE_PKG_STUB_TEMPLATE_MISSING` per ADR-0021 / SPEC-V05-010.
7. **Confirm gate.** Unchanged.
8. **Create GitHub Release.** Unchanged (`gh release create … --verify-tag --generate-notes`).
9. **Dry-run preview.** Unchanged.
10. **Publish to GitHub Packages.** New step, gated by `if: ${{ ! inputs.dry_run && inputs.publish_package }}` so candidate runs (draft / prerelease / review-only) cannot accidentally push a stable package version. Runs `npm publish` against `https://npm.pkg.github.com` using `NODE_AUTH_TOKEN: secrets.GITHUB_TOKEN`. A pre-flight `node -p` check rebuilds `name@version` from `package.json` and compares against `${INPUT_VERSION}` so a tag-race / late-merge between Layer 1 readiness and now still fails closed before the irreversible publish call. No `--access` flag — GitHub Packages inherits visibility from the repository.
11. **Attach release asset.** Replace the stub with `gh release upload "v${INPUT_VERSION}" "${TARBALL}" --clobber`. Runs after step 8 so the release exists. `--clobber` lets a partial-asset rerun replace what an earlier failed publish left behind without manual cleanup (NFR-V05-005 recoverability).

### Edge cases (must surface, not swallow)

- `package.json#name` drifts from `EXPECTED_PACKAGE_NAME` between Layer 1 (step 4) and publish (step 10) — the step-10 pre-flight catches it and fails before `npm publish`.
- `npm pack` succeeds but Layer 2 finds a numbered ADR / non-empty intake / built-up doc — Layer 2 fails the run before the confirm gate; no Release, no publish, no asset upload.
- `npm publish` fails after a successful `gh release create` (network blip, registry hiccup) — the Release exists but the package does not. NFR-V05-005 recovery: rerun the workflow with the same inputs; `--verify-tag` + Layer 1 + Layer 2 still pass; `npm publish` either succeeds or fails identifiably; `gh release upload --clobber` attaches the asset whether or not it was attached on the previous run.
- `gh release upload` fails after `npm publish` succeeds — the package is published, the Release exists, the asset is missing. Same rerun path as above; `--clobber` makes the upload idempotent.
- Operator widens `permissions:` in error — `RELEASE_READINESS_WORKFLOW_PERMISSIONS` catches it in step 4 before any state is mutated.
- Operator runs `dry_run: false` to publish a draft / pre-release Release without intending to push the npm package — `publish_package` defaults to `false`, so step 10 is skipped; the Release is created, the tarball is attached as an asset (step 11), but no irreversible `npm publish` runs (SPEC-V05-009 candidate dry run; addresses Codex P1 on PR #160).

### Tests

- `actionlint` (existing CI workflow) — must pass.
- `zizmor` (existing CI workflow) — must pass; no `pull_request_target`, no script-injection from inputs (every `${{ inputs.* }}` value lands inside `env:` mappings or as action arguments, never inside a `run:` shell string).
- Workflow itself remains not unit-testable; the readiness checks it composes are already covered by PR #173 (12 tests for `check:release-package-contents`) and PR #158 (21 tests for `check:release-readiness`).
- Smoke test: `gh workflow run release.yml -f version=0.5.0 -f dry_run=true` once `v0.5.0` artefacts exist. Result captured under T-V05-010 (PR #162).

### Acceptance criteria

- `package.json` carries the v0.5 identity: `name: "@luis85/agentic-workflow"`, `version: "0.5.0"`, `repository`, `publishConfig.registry: "https://npm.pkg.github.com"`, `files` matching `EXPECTED_PACKAGE_FILES`, no `private: true`, plus `description` / `license` / `homepage` / `bugs` / `keywords` / `author`.
- `package-lock.json` re-locks for the renamed root package with no dependency changes.
- `.github/workflows/release.yml` — `actionlint` + `zizmor` green; the three T-V05-007 stubs replaced; `npm publish` step added; `actions/setup-node` configured with `registry-url` + `scope`.
- `tools/automation-registry.yml` `workflow:release` `purpose` updated.
- Implementation log appended for T-V05-007; `workflow-state.md` `last_agent: dev` and `last_updated` bumped.
- `npm run verify` green.

### Satisfies

REQ-V05-005, REQ-V05-006, NFR-V05-001, NFR-V05-002, SPEC-V05-004.

### Dependencies

- ✅ T-V05-002 (PR #157) — package contract document; identity fields adopted by `package.json`.
- ✅ T-V05-006 (PR #159) — manual release workflow with the three stubs T-V05-007 fills.
- ✅ T-V05-012 (PR #173) — `check:release-package-contents` (Layer 2 readiness) called by step 6.
- ✅ T-V05-004 / T-V05-005 (PR #158) — `check:release-readiness` (Layer 1) consumed by step 4; readiness fixtures already encode the expected package identity.

### Unblocks

- PR #161 (T-V05-008 operator guide, T-V05-009 distribution docs) — operator guide names the publish step, the asset upload, and the recovery paths; distribution docs reference the published package.
- PR #162 (T-V05-010 release dry run, T-V05-011 final readiness verification) — `dry_run: true` invocation now exercises the full Layer 1 + Layer 2 + pack pipeline end-to-end without publishing.
