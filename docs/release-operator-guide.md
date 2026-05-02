---
title: "Release operator guide"
folder: "docs"
description: "Step-by-step path for the human release operator to publish a Specorator GitHub Release and (when enabled) a GitHub Package — covers dry run, authorization, publish, rollback, failed publish recovery, and post-release cleanup."
entry_point: false
---

# Release operator guide

This guide is the runnable, version-by-version operator path for publishing a Specorator release through the manual workflow at [`.github/workflows/release.yml`](../.github/workflows/release.yml). It satisfies [SPEC-V05-006](../specs/version-0-5-plan/spec.md) and is consumed before every publish from v0.5 onward.

> **Audience.** A maintainer who has not authored the release. The guide assumes you can read `package.json`, run `gh` locally, and trigger `workflow_dispatch` in the GitHub Actions UI. It does not assume you wrote the v0.5 plan.

> **Authorization boundary.** Cutting and merging the `release/vX.Y.Z` PR is ordinary topic-branch work ([`docs/branching.md`](branching.md)). **Publishing** the GitHub Release and (when enabled) the GitHub Package is a separate, manually authorized action. The workflow refuses to publish without an explicit `confirm` input that matches the requested `version` ([SPEC-V05-002](../specs/version-0-5-plan/spec.md), [NFR-V05-001](../specs/version-0-5-plan/requirements.md)).

## 1. Before you start

You should already have:

1. A merged `release/vX.Y.Z` PR on `main` per [ADR-0020](adr/0020-v05-release-branch-strategy.md):
   - `package.json#version` equals `X.Y.Z`,
   - `CHANGELOG.md` has an unreleased-promoted heading for `[vX.Y.Z]`,
   - `specs/version-X-Y-plan/release-notes.md` is finalised.
2. The canonical tag `vX.Y.Z` cut on `main` after the merge (never on the release branch). The workflow uses `gh release create … --verify-tag` and refuses to fall back to auto-tagging.
3. Green v0.4 quality signals available to the readiness check, surfaced through the `RELEASE_*` repository variables (or an explicit operator waiver via `RELEASE_QUALITY_WAIVER`). See `scripts/lib/release-readiness.ts` (`QualitySignals`) for the contract.
4. A GitHub Packages publish credential available to the workflow as `GITHUB_TOKEN` with `packages: write` already declared at the workflow level ([NFR-V05-001](../specs/version-0-5-plan/requirements.md)).

If any of these is missing, **stop**. The readiness check will fail closed (preferred), but the operator should not paper over a missing precondition by retrying.

## 2. Workflow inputs

The five `workflow_dispatch` inputs of `release.yml` are the authoritative control surface:

| Input | Type | Default | Meaning |
|---|---|---|---|
| `version` | string | (required) | `X.Y.Z`. Must equal `package.json#version` and the existing `vX.Y.Z` tag on `main`. |
| `dry_run` | boolean | `true` | `true` runs readiness + lifecycle steps without creating a Release ([SPEC-V05-009](../specs/version-0-5-plan/spec.md)). `false` enters the publish path. |
| `prerelease` | boolean | `false` | Marks the published Release as a pre-release. |
| `draft` | boolean | `false` | Creates the Release in draft state; operator finalises before publish. |
| `confirm` | string | `""` | When `dry_run == false`, must equal `version` literally. Mismatch fails the workflow before any irreversible step ([SPEC-V05-002](../specs/version-0-5-plan/spec.md)). |
| `publish_package` | boolean | `false` | When `true` and `dry_run == false`, publishes the package to GitHub Packages. Default `false` so a `draft` or `prerelease` candidate run does not push an irreversible `npm publish`. |

Inputs flow through `env:` mappings — never directly into a `run:` shell string — so no operator value is interpolated into shell text (zizmor template-injection guard).

## 3. Pre-flight — Layer 1 readiness, locally

Run the readiness check on your laptop before triggering the workflow. Same script the workflow runs:

```bash
RELEASE_VERSION=X.Y.Z \
RELEASE_CI_STATUS=green \
RELEASE_VALIDATION_STATUS=pass \
npm run check:release-readiness -- --json
```

A green run prints `{"diagnostics": []}`; a failed run prints one or more diagnostics with the codes listed in §10. Resolve every diagnostic before triggering the workflow — the workflow runs the same check and will fail closed.

## 4. Dry run path

Use this for every release until you are convinced the artifact is correct. Dry run is **non-destructive**: it runs the full readiness pipeline, builds a candidate archive with `npm pack`, runs the Layer 2 fresh-surface assertions ([SPEC-V05-010](../specs/version-0-5-plan/spec.md)), and prints a generated-notes preview without creating a public Release or publishing the package.

Trigger:

1. Go to **Actions → Release → Run workflow**.
2. Inputs:
   - `version`: `X.Y.Z`
   - `dry_run`: `true` (default)
   - `prerelease`, `draft`, `publish_package`: leave defaults
   - `confirm`: leave empty
3. Run.

Inspect the run log:

- Step "Readiness — Layer 1" → green.
- Step "Build candidate archive" → tarball name + extracted dir.
- Step "Readiness — Layer 2 (fresh-surface)" → green.
- Step "Log dry-run candidate (no Release created)" → printed candidate tag and generated release-notes body.

If any step fails, fix the underlying cause (do **not** rerun without a fix) and trigger another dry run.

## 5. Stable publish path

Only after at least one fully green dry run, request a stable publish.

1. Trigger **Actions → Release → Run workflow** with:
   - `version`: `X.Y.Z`
   - `dry_run`: `false`
   - `prerelease`: `false`
   - `draft`: `false`
   - `confirm`: type the literal `X.Y.Z` (the confirm gate compares it to `version` and fails if they differ — [SPEC-V05-002](../specs/version-0-5-plan/spec.md)).
   - `publish_package`: `true` if you intend to push the GitHub Package on this run; `false` if you only want to publish the Release this run.

2. The workflow executes, in order:
   - Layer 1 readiness — release metadata.
   - `npm pack` — candidate archive built and extracted.
   - Layer 2 readiness — fresh-surface contract ([ADR-0021](adr/0021-release-package-fresh-surface.md)).
   - Confirm gate — refuses to continue unless `confirm == version`.
   - `gh release create vX.Y.Z --target main --verify-tag --generate-notes` — creates the GitHub Release using the `.github/release.yml` categories.
   - `npm publish` — only when `publish_package: true`; idempotent (see §7.1).
   - `gh release upload vX.Y.Z … --clobber` — attaches the candidate tarball as a release asset.

3. Verify on `https://github.com/Luis85/agentic-workflow/releases/tag/vX.Y.Z`:
   - Release notes body matches the dry-run preview.
   - Tarball asset is attached.
   - GitHub Packages page shows `@luis85/agentic-workflow@X.Y.Z` (only if `publish_package: true`).

4. Smoke-test consumer install path against the published package. Per `package-contract.md` §7 — note that the `@luis85:registry=…` line on its own is not enough; npm needs the matching `_authToken` line on `npm.pkg.github.com/` even for public packages, otherwise `npm install` fails with `401 Unauthorized` against GitHub Packages and is easy to misread as a package bug:

   ```bash
   # in a throwaway directory; subshell scopes NODE_AUTH_TOKEN and the trap
   # removes the credential file regardless of how the block exits.
   (
     export NODE_AUTH_TOKEN=<your-PAT-with-read:packages>
     trap 'rm -f .npmrc' EXIT
     cat > .npmrc <<'EOF'
   @luis85:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   always-auth=true
   EOF
     npm install --save-dev @luis85/agentic-workflow@X.Y.Z
   )
   ```

   Failure here is a release-quality bug, not a publish bug — capture it and decide whether to deprecate or supersede before announcing.

## 6. Rollback

Tag creation, GitHub Release publication, and GitHub Packages publication are **all irreversible** under the rules in [Article IX](../memory/constitution.md) of the constitution. Rollback is therefore *forward-only*: you supersede, you do not undo.

| Symptom | Action | Why this and not "delete" |
|---|---|---|
| Release notes are wrong but artifact is correct. | Edit the Release in the GitHub UI ("Edit release"), regenerate body if needed. The tag and assets stay. | Reversible content fix; no new version needed. |
| Artifact is wrong (bad tarball, wrong fresh-surface) but the package is **not** published. | Edit the Release to `draft` in the UI to remove it from the public list, then supersede via `vX.Y.(Z+1)` with the corrected source. Update the broken Release's notes to point at the superseding tag. **Do not** delete or move the `vX.Y.Z` tag and **do not** rerun the workflow on the same `vX.Y.Z`. | The workflow's `RELEASE_READINESS_TAG_NOT_AT_MAIN` and `gh release create` (HTTP 422 on existing Release) both refuse a same-tag rerun once a fix lands on `main`; tag move / deletion are denied by `.claude/settings.json`. Same-version supersession is the only forward-only path the gates permit. [NFR-V05-005](../specs/version-0-5-plan/requirements.md). |
| Artifact and package are published, and consumers will hit an issue. | Cut `vX.Y.(Z+1)` with a fix, deprecate the broken version on GitHub Packages (`npm deprecate @luis85/agentic-workflow@X.Y.Z "<reason>"`), and update the broken Release notes to point to the superseding version. **Do not** force-push or rewrite tags. | Force-push to `main` and tag deletion are denied by `.claude/settings.json` and break consumer caches; supersession preserves history. [NFR-V05-005](../specs/version-0-5-plan/requirements.md). |
| Catastrophic problem (license violation, secret leak). | Yank the package version (`npm unpublish @luis85/agentic-workflow@X.Y.Z` within the registry's allowed window), make the Release a draft, file an incident, and supersede with `vX.Y.(Z+1)`. | Documented escape hatch; do not use for ordinary mistakes. |

In every case, append an entry to `specs/version-X-Y-plan/release-notes.md` and the implementation log naming the rollback action and the superseding version.

## 7. Failed publish recovery

Recoverability differs per step:

- `npm publish` (the workflow's idempotency guard wraps `npm view` so a successful publish is detected on a rerun) — idempotent.
- `gh release upload --clobber` — idempotent.
- `gh release create` — **not idempotent**: an existing Release at `vX.Y.Z` makes the step fail with HTTP 422 ("release already exists"). The workflow has no skip branch.

So the rule is: **do not rerun the workflow as a recovery primitive once `gh release create` has succeeded**. Use the targeted manual commands below instead. The recovery scenarios are numbered by the failing step.

### 7.1 `npm publish` failed after `gh release create` succeeded

Symptom: the GitHub Release exists (the tarball may or may not be attached), but `npm view @luis85/agentic-workflow@X.Y.Z` reports `404`. Cause: network blip, registry hiccup, or `EPUBLISHCONFLICT` from a prior partial run.

Recovery — run the failed steps manually from a local checkout of `vX.Y.Z`. **Do not** rerun the workflow; `gh release create` will fail on the existing Release before the publish-recovery logic is reached.

You will need a GitHub Personal Access Token with the `write:packages` scope (or a fine-grained token with `Packages: write` on the repository). The workflow gets this for free via `actions/setup-node` + `secrets.GITHUB_TOKEN`; for manual recovery, configure it explicitly:

The whole recovery block is wrapped in a `(...)` subshell so the credential never enters the operator's interactive shell. The trap fires when the subshell exits — success, error, or `^C` — and removes the project-scoped `.npmrc`. `NODE_AUTH_TOKEN` is exported only inside the subshell, so it is not visible to the parent shell at all (no `unset` needed).

```bash
# Run the whole block as a paste-once unit. Everything inside the (...)
# subshell is scoped — NODE_AUTH_TOKEN never reaches the parent shell, and
# the trap removes the credential file before the subshell returns control.
(
  set -e
  trap 'rm -f .npmrc' EXIT

  # 0. From a clean clone, check out the exact tagged commit.
  git fetch --tags origin
  git checkout vX.Y.Z

  # 1. Authenticate npm against GitHub Packages — actions/setup-node does this
  # on the runner; for manual recovery, write a project-scoped .npmrc so
  # `npm publish` resolves the registry and credential exactly the way the
  # workflow does.
  export NODE_AUTH_TOKEN=<your-PAT-with-write:packages>
  cat > .npmrc <<'EOF'
@luis85:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
always-auth=true
EOF

  # 2. Build the publication-canonical archive — same shape the workflow ships.
  npm ci
  cp package-lock.json npm-shrinkwrap.json
  TARBALL="$(npm pack --silent)"

  # 3. Idempotent publish — mirrors the workflow's exit-code + stderr branch,
  # so a transient registry / auth / DNS error fails closed instead of
  # falling through to `npm publish` and producing EPUBLISHCONFLICT on a
  # real prior publish.
  set +e
  view_output="$(npm view "@luis85/agentic-workflow@X.Y.Z" version --json 2>&1)"
  view_exit=$?
  set -e
  if [ "$view_exit" -eq 0 ] && echo "$view_output" | grep -q '"X.Y.Z"'; then
    echo "Already published — skipping npm publish"
  elif echo "$view_output" | grep -qE '"code": *"E404"|E404|code E404|404 Not Found'; then
    npm publish
  else
    echo "npm view failed with a non-404 error — refusing to publish" >&2
    echo "$view_output" >&2
    exit 1   # trap removes .npmrc; subshell exit drops NODE_AUTH_TOKEN
  fi

  # 4. Replace any partial release asset.
  gh release upload "vX.Y.Z" "${TARBALL}" --clobber
)
# Back in the parent shell — NODE_AUTH_TOKEN was never set here, and the
# .npmrc the subshell created has already been removed by the trap.
```

The exit-code + stderr branch on `npm view` is intentional: an `if npm view … >/dev/null 2>&1` check would treat **any** non-zero (auth, DNS, registry hiccup) as "not published" and run `npm publish`, which then either succeeds against a missing publish (good) or fires `EPUBLISHCONFLICT` against a real prior publish that the view could not confirm (bad — masks the real failure). The same guard ships in the workflow's step 10 (Codex round-4 P1 on PR #160).

This satisfies [NFR-V05-005](../specs/version-0-5-plan/requirements.md) recoverability without force-pushing protected branches and without depending on a workflow rerun the gates would refuse. Hardening the workflow itself to make `gh release create` skip an existing Release is tracked as future work; until then, manual recovery is the supported path.

### 7.2 `gh release create` failed before tag verification

Symptom: workflow stops at "Create GitHub Release" with `tag vX.Y.Z does not exist` (`--verify-tag`).

Recovery: cut the missing tag on `main` (do **not** let `gh release create` auto-create it):

```bash
git fetch origin
git checkout main
git pull --ff-only
git tag vX.Y.Z
git push origin vX.Y.Z
```

Then rerun the workflow.

### 7.3 Layer 1 readiness diagnostic

Symptom: workflow stops at "Readiness — Layer 1" with one or more `RELEASE_READINESS_*` codes (§10).

Recovery: read the JSON diagnostics, fix the underlying source (version mismatch, missing CHANGELOG entry, missing tag, drifted package metadata, widened workflow permissions, missing quality signal), and rerun. Do not rerun until the cause is fixed.

### 7.4 Layer 2 fresh-surface diagnostic

Symptom: workflow stops at "Readiness — Layer 2 (fresh-surface)" with one of `RELEASE_PKG_ADR`, `RELEASE_PKG_INTAKE`, `RELEASE_PKG_DOC_STUB`, `RELEASE_PKG_STUB_TEMPLATE_MISSING`.

Recovery: the candidate archive violates the fresh-surface contract from [ADR-0021](adr/0021-release-package-fresh-surface.md) / [SPEC-V05-010](../specs/version-0-5-plan/spec.md). Either:

- An ADR file leaked into the archive — confirm `package.json#files` and codebase ADR placement; the contract says no numbered ADR files ship.
- An intake folder under `inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, or `sales/` shipped non-empty — strip per-engagement state from the codebase before cutting, or update the manual stub-form step (OQ-V05-003 in `package-contract.md` is the open automation gap).
- A `docs/` page is not in stub form — restore the stub shape from `templates/release-package-stub.md`.

### 7.5 Confirm gate refused

Symptom: workflow stops at "Confirm gate" with `confirm input does not match version — refusing to publish (SPEC-V05-002)`.

Recovery: trigger a new run with `confirm` set to the literal `X.Y.Z`. Do not paste a different version into `confirm`; the gate is the explicit-authorisation boundary [Article IX](../memory/constitution.md) of the constitution requires.

### 7.6 Operator waiver path (last resort)

If a Layer 1 quality signal is genuinely not available (e.g. v0.4 maturity evidence cannot be regenerated in time), the human release operator may set `RELEASE_QUALITY_WAIVER` for the workflow run with a free-text justification. The waiver:

- Suppresses only the `RELEASE_READINESS_QUALITY` diagnostic; never `Version`, `TagMissing`, `TagNotAtMain`, `ChangelogMissing`, fresh-surface, or workflow-permissions diagnostics.
- Must be recorded verbatim in `specs/version-X-Y-plan/release-notes.md` and the implementation log entry for the publish ([REQ-V05-010](../specs/version-0-5-plan/requirements.md) acceptance — *explicit* waiver).

A waiver with no recorded justification is a release defect.

## 8. Post-release cleanup

After a successful stable publish:

1. **Delete the release branch.**
   ```bash
   git push origin --delete release/vX.Y.Z
   git branch -D release/vX.Y.Z   # or in the worktree
   ```
   Release branches are not reused per [`docs/branching.md`](branching.md).

2. **Close v0.4 quality `RELEASE_*` waivers** if any were used. Reset the variables to their post-release state (`green` for pass-through, unset waiver).

3. **Record the publish in the implementation log.** Append a `Release published` entry to `specs/version-X-Y-plan/implementation-log.md` naming: tag SHA, GitHub Release URL, package version URL, any rollback or waiver, the operator who triggered the run.

4. **Update the changelog.** If `CHANGELOG.md` still has `[Unreleased]` content for items that shipped in `vX.Y.Z`, fold them into the released heading.

5. **Trigger Stage 11 (Retrospective)** for the release feature folder via `/spec:retro` so the loop closes.

## 9. Quick-reference command bundle

```bash
# Pre-flight — Layer 1 readiness, locally
RELEASE_VERSION=X.Y.Z RELEASE_CI_STATUS=green RELEASE_VALIDATION_STATUS=pass \
  npm run check:release-readiness -- --json

# Pre-flight — Layer 2 fresh-surface, locally. The check walks an extracted
# archive directory, not the codebase, so build + extract first; same shape the
# workflow uses (`tar --strip-components=1` flattens the `package/` top-level
# the npm tarball wraps around the contents).
TARBALL="$(npm pack --silent)"
mkdir -p release-staging
tar -xzf "${TARBALL}" -C release-staging --strip-components=1
RELEASE_PACKAGE_ARCHIVE=./release-staging \
  npm run check:release-package-contents -- --json
rm -rf release-staging "${TARBALL}"

# Cut canonical tag on main (after release branch is merged)
git tag vX.Y.Z && git push origin vX.Y.Z

# Trigger the workflow — UI: Actions → Release → Run workflow
# Inputs: version=X.Y.Z, dry_run=true|false, confirm=X.Y.Z (publish only),
#         publish_package=true (only when pushing the GitHub Package)
```

## 10. Diagnostic codes — quick reference

The release-readiness scripts emit machine-stable codes. Treat them as the contract.

### Layer 1 — `scripts/lib/release-readiness.ts`

| Code | Meaning |
|---|---|
| `RELEASE_READINESS_VERSION_MISMATCH` | `package.json#version` ≠ requested `version`. |
| `RELEASE_READINESS_TAG_MISSING` | `vX.Y.Z` tag does not exist. |
| `RELEASE_READINESS_TAG_NOT_AT_MAIN` | Tag does not point to a commit on `main`. |
| `RELEASE_READINESS_CHANGELOG_MISSING` | `CHANGELOG.md` missing or has no `[vX.Y.Z]` heading. |
| `RELEASE_READINESS_RELEASE_YML_MISSING` | `.github/release.yml` (PR-categorisation config) missing. |
| `RELEASE_READINESS_RELEASE_YML_SHAPE` | `.github/release.yml` shape is invalid. |
| `RELEASE_READINESS_PKG_NAME` | `package.json#name` ≠ `@luis85/agentic-workflow`. |
| `RELEASE_READINESS_PKG_REGISTRY` | `publishConfig.registry` ≠ `https://npm.pkg.github.com`. |
| `RELEASE_READINESS_PKG_REPOSITORY` | `package.json#repository` ≠ `https://github.com/Luis85/agentic-workflow`. |
| `RELEASE_READINESS_PKG_FILES` | `package.json#files` is missing required entries. |
| `RELEASE_READINESS_PACKAGE_JSON_MISSING` | `package.json` not found or unreadable. |
| `RELEASE_READINESS_WORKFLOW_MISSING` | `.github/workflows/release.yml` not found. |
| `RELEASE_READINESS_WORKFLOW_PERMISSIONS` | Top-level `permissions:` block ≠ `{ contents: write, packages: write }`. |
| `RELEASE_READINESS_QUALITY` | A v0.4 quality signal is missing or not green and no waiver is recorded. |

### Layer 2 — `scripts/lib/release-package-contract.ts`

| Code | Meaning |
|---|---|
| `RELEASE_PKG_ADR` | A numbered ADR file matched `docs/adr/[0-9][0-9][0-9][0-9]-*.md` in the candidate archive. |
| `RELEASE_PKG_INTAKE` | An enumerated intake folder shipped with state beyond a top-level `README.md`. |
| `RELEASE_PKG_DOC_STUB` | A `docs/` page in the candidate archive is not in stub form. |
| `RELEASE_PKG_STUB_TEMPLATE_MISSING` | `templates/release-package-stub.md` is missing — Layer 2 cannot validate. |

## 11. References

- Workflow file: [`.github/workflows/release.yml`](../.github/workflows/release.yml).
- Release readiness library: [`scripts/lib/release-readiness.ts`](../scripts/lib/release-readiness.ts) — diagnostic codes are the contract.
- Fresh-surface library: [`scripts/lib/release-package-contract.ts`](../scripts/lib/release-package-contract.ts).
- Release branch + tag rules: [ADR-0020](adr/0020-v05-release-branch-strategy.md), [`docs/branching.md`](branching.md).
- Released package shape: [ADR-0021](adr/0021-release-package-fresh-surface.md), [`docs/release-package-contents.md`](release-package-contents.md).
- Package contract: [`specs/version-0-5-plan/package-contract.md`](../specs/version-0-5-plan/package-contract.md).
- Stage 10 companion artifact (optional): [`docs/release-readiness-guide.md`](release-readiness-guide.md).
- Requirements and spec: [`specs/version-0-5-plan/requirements.md`](../specs/version-0-5-plan/requirements.md), [`specs/version-0-5-plan/spec.md`](../specs/version-0-5-plan/spec.md). REQ-V05-008, REQ-V05-010, REQ-V05-011, NFR-V05-004, NFR-V05-005, SPEC-V05-006, SPEC-V05-008, SPEC-V05-009.
