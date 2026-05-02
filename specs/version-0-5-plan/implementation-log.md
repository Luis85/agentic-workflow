---
id: IMPL-LOG-V05-001
title: Version 0.5 release and distribution plan — Implementation log
stage: implementation
feature: version-0-5-plan
status: in-progress
owner: dev
inputs:
  - SPECDOC-V05-001
  - TASKS-V05-001
created: 2026-05-02
updated: 2026-05-04
---

# Implementation log — Version 0.5 release and distribution plan

A running record of *what* was implemented, *why* a deviation was taken, and *what* was learned. Append-only during implementation; no rewriting history.

## Entries

### 2026-05-02 — T-V05-001 — Decide release branch strategy

- **Files changed:** `docs/adr/0020-v05-release-branch-strategy.md` (new); `docs/adr/README.md`; `docs/branching.md`
- **Commit:** *(staged together with T-V05-003 in PR #156; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-001 (REQ-V05-001, NFR-V05-002)
- **Owner:** architect
- **Outcome:** done
- **Deviation from spec:** none
- **Notes:** Adopted Shape A with explicit `release/vX.Y.Z` branches; `main` remains the canonical release source and tag origin; `develop` is not introduced. Resolves CLAR-V05-001. ADR-0020 captures the decision; `docs/branching.md` updated to name the release branch shape, promotion path, tag source, and cleanup rules.

### 2026-05-02 — Implementation escalation — REQ-V05-012 fresh-surface contract (Article X iteration)

- **Files changed:** `specs/version-0-5-plan/requirements.md`, `specs/version-0-5-plan/spec.md`, `specs/version-0-5-plan/design.md`, `specs/version-0-5-plan/tasks.md`, `docs/adr/0021-release-package-fresh-surface.md` (new), `docs/adr/README.md`, `docs/release-package-contents.md` (new), `docs/specorator.md`, `docs/sink.md`, `templates/release-package-stub.md` (new)
- **Commit:** PR #157 — fe0bed0 (architect surface + template-wide docs).
- **Spec reference:** ADR-0021, REQ-V05-012 (new), SPEC-V05-010 (new), TEST-V05-012 (new); satisfies user-introduced template-wide release-package-contents requirement.
- **Owner:** architect
- **Outcome:** done
- **Deviation from spec:** none — Article X (Iteration) of the constitution permits stage revisits when implementation surfaces a missing requirement; the requirement was added to upstream artifacts before the contract document was written.
- **Notes:** Three sub-rules: (1) released package documentation = stubs only; (2) ADRs do not ship in the released package; (3) intake folders ship empty (10 enumerated). `docs/adr/README.md` ships as a stub trailer in the released package; `templates/adr-template.md` ships unchanged. `docs/release-package-contents.md` is the canonical methodology page.

### 2026-05-02 — T-V05-002 — Define package contract

- **Files changed:** `specs/version-0-5-plan/package-contract.md` (new); `specs/version-0-5-plan/requirements.md` (REQ-V05-012 added); `specs/version-0-5-plan/tasks.md` (T-V05-002 broadened, T-V05-012 added); `specs/version-0-5-plan/workflow-state.md`
- **Commit:** PR #157 — e74d448.
- **Spec reference:** SPEC-V05-004 (REQ-V05-005, NFR-V05-002), SPEC-V05-010 (REQ-V05-012)
- **Owner:** pm
- **Outcome:** done (status `draft` until OQ-V05-001/002/003 close)
- **Deviation from spec:** none
- **Notes:** Package = `@luis85/agentic-workflow` on GitHub Packages (npm registry endpoint), public visibility (subject to OQ-V05-001 confirmation), version source = `package.json#version` mirrored to git tag (per ADR-0020). Three open questions logged: repo visibility (OQ-V05-001), final `package.json#files` glob (OQ-V05-002), manual stub-form packaging step until T-V05-012 automates it (OQ-V05-003). Resolves CLAR-V05-002.

### 2026-05-02 — Review fix — Codex round 1 on PR #157

- **Files changed:** `docs/adr/0021-release-package-fresh-surface.md` (Errata appended), `specs/version-0-5-plan/requirements.md`, `specs/version-0-5-plan/spec.md`, `specs/version-0-5-plan/design.md`, `specs/version-0-5-plan/tasks.md`, `specs/version-0-5-plan/package-contract.md`, `docs/release-package-contents.md`, `docs/sink.md`, `templates/release-package-stub.md`
- **Spec reference:** REQ-V05-012, SPEC-V05-010 (notation correction; decision unchanged); T-V05-004, T-V05-012 (DAG correction)
- **Owner:** orchestrator
- **Outcome:** done
- **Deviation from spec:** none (typo correction; DAG correction; install-instruction completion; doc-link correction)
- **Notes:** Four Codex findings addressed in one commit. (1) **P1 ADR glob.** Replaced `0\d{3}-*.md` (which is neither valid regex nor valid glob for the intended pattern) with the unambiguous shell glob `[0-9][0-9][0-9][0-9]-*.md` across all operational specs. ADR-0021 body kept unmodified per the constitution's ADR-immutability rule; an Errata section was appended at the bottom calling out the canonical operational form. (2) **P1 install instructions.** Added GitHub Packages prerequisites to `package-contract.md` §7 — `read:packages` PAT, `~/.npmrc` `_authToken`, scope-to-registry mapping in consumer `.npmrc`. The bare `npm install` no longer fails with `401 Unauthorized`. (3) **P2 stub link.** Removed the released-stub's link to the excluded ADR; trailer now points at `docs/release-package-contents.md` (which ships in stub form). (4) **P2 DAG.** Inverted the dependency between T-V05-012 (fresh-surface check script) and T-V05-004 (release readiness check) so that readiness composes the fresh-surface assertions. T-V05-012 → depends on T-V05-002 only; T-V05-004 → depends on T-V05-001, T-V05-002, T-V05-012. T-V05-004 satisfies expanded to include REQ-V05-012 / SPEC-V05-010.

### 2026-05-02 — T-V05-012 — Implement fresh-surface packaging step

- **Files changed:** `scripts/check-release-package-contents.ts` (new); `scripts/lib/release-package-contract.ts` (new); `tests/scripts/release-package-contract.test.ts` (new); `package.json` (new `check:release-package-contents` npm script); `tools/automation-registry.yml` (new check entry); `docs/scripts/check-release-package-contents/`, `docs/scripts/lib/release-package-contract/`, `docs/scripts/modules.md` (typedoc regenerated).
- **Commit:** *(staged in PR #173; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-010 (REQ-V05-005, REQ-V05-012); SPEC-V05-004; ADR-0021.
- **Owner:** dev
- **Outcome:** done
- **Deviation from spec:** none.
- **Notes:** New library `scripts/lib/release-package-contract.ts` exposes `checkReleasePackageContents(archive)` with three deterministic assertions evaluated in fixed order — (1) no file matching `docs/adr/[0-9][0-9][0-9][0-9]-*.md` ships; (2) each of the 10 enumerated intake folders (`inputs/`, `specs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`) is either absent or contains only a top-level `README.md`; (3) every shipping `docs/` page matches the stub shape from `templates/release-package-stub.md` (frontmatter with `title` / `folder` / `description` / `entry_point`, top-level `# ` heading, and at least one `<!-- TODO:` marker). Each violation is emitted as a structured diagnostic with stable codes `RELEASE_PKG_ADR`, `RELEASE_PKG_INTAKE`, `RELEASE_PKG_DOC_STUB`, plus `RELEASE_PKG_STUB_TEMPLATE_MISSING` for the SPEC-V05-010 fail-closed edge case (stub template absent from the archive). The CLI `scripts/check-release-package-contents.ts` accepts `--archive <dir>` (or `RELEASE_PACKAGE_ARCHIVE` env), exits 0 with a `skipped` notice when neither is supplied, and reuses the shared `failIfErrors` helper so the existing `--json` plumbing carries through unchanged. Twelve unit tests cover the four required scenarios from the chunk plan (clean archive passes; numbered ADR fails; non-empty intake fails; built-up doc fails) plus invariants on `INTAKE_FOLDERS`, `ADR_NUMBERED_PATTERN`, fail-closed semantics, and a combined-violations case. The script is left out of `npm run verify`'s default check list — it is intentionally a building block for T-V05-004 (release readiness check), which composes it after preparing a candidate archive. The `check:release-package-contents` entry was added to `tools/automation-registry.yml` so the inventory stays in lockstep. Closes T-V05-012; unblocks PR #158 (T-V05-004 + T-V05-005).

### 2026-05-02 — T-V05-003 — Add `.github/release.yml` for generated release notes

- **Files changed:** `.github/release.yml` (new)
- **Commit:** *(staged together with T-V05-001 in PR #156; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-003 (REQ-V05-003, REQ-V05-004)
- **Owner:** dev
- **Outcome:** done
- **Deviation from spec:** none
- **Notes:** Configured GitHub's auto-generated release notes for the v0.5 manual release workflow. Categories (top-down): Breaking Changes, Features, Bug Fixes, Documentation, Performance, Refactor, Tests, Build & CI, Reverts, Chores & Dependencies, Other Changes (catch-all `labels: ['*']`). Category labels map onto the Conventional-Commit types enforced by `.github/workflows/pr-title.yml`. `changelog.exclude.labels` covers `release`, `chore-release`, and `skip-changelog` so release-prep PRs don't show up in their own notes. `changelog.exclude.authors` filters `dependabot` and `github-actions` (both bare and `[bot]` forms); the file's leading comment notes that operational-bot author handles can be added once verified. YAML validated locally (parses to 11 categories + 3 excluded labels). The release workflow itself lands in T-V05-006; this PR only configures the notes.

### 2026-05-04 — T-V05-004 — Add release readiness check

- **Files changed:** `scripts/check-release-readiness.ts` (new); `scripts/lib/release-readiness.ts` (new); `package.json` (new `check:release-readiness` npm script); `tools/automation-registry.yml` (new check entry); `docs/scripts/check-release-readiness/`, `docs/scripts/lib/release-readiness/`, `docs/scripts/modules.md` (typedoc regenerated).
- **Commit:** *(staged in PR #158; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-005 (REQ-V05-007), SPEC-V05-008 (REQ-V05-010), SPEC-V05-010 (REQ-V05-005, REQ-V05-012); ADR-0020.
- **Owner:** dev
- **Outcome:** done
- **Deviation from spec:** none.
- **Notes:** New library `scripts/lib/release-readiness.ts` exposes `checkReleaseReadiness(opts)` with two layers. **Layer 1 — release metadata** runs in fixed order: (1) version alignment — `package.json#version` equals the candidate version (`RELEASE_READINESS_VERSION_MISMATCH`); (2) tag readiness — `vX.Y.Z` resolves and points at `main` HEAD per ADR-0020 (`RELEASE_READINESS_TAG_MISSING`, `RELEASE_READINESS_TAG_NOT_AT_MAIN`); (3) CHANGELOG entry — `## [vX.Y.Z]` heading present in `CHANGELOG.md` (`RELEASE_READINESS_CHANGELOG_MISSING`); (4) lifecycle release notes — `.github/release.yml` exists and matches the T-V05-003 shape (`RELEASE_READINESS_RELEASE_YML_MISSING`, `RELEASE_READINESS_RELEASE_YML_SHAPE`); (5) package metadata — `package.json#name` / `#publishConfig.registry` / `#repository` / `#files` match `package-contract.md` §2–§3 with one stable code per drifting field (`RELEASE_READINESS_PKG_NAME`, `RELEASE_READINESS_PKG_REGISTRY`, `RELEASE_READINESS_PKG_REPOSITORY`, `RELEASE_READINESS_PKG_FILES`); (6) workflow permissions — manual release workflow declares only `contents: write` + `packages: write` (`RELEASE_READINESS_WORKFLOW_MISSING`, `RELEASE_READINESS_WORKFLOW_PERMISSIONS`); (7) v0.4 quality signals — CI status + validation status + open blockers + open clarifications + maturity level all green or operator waiver recorded (`RELEASE_READINESS_QUALITY`). **Layer 2 — fresh-surface composition** imports `checkReleasePackageContents` from T-V05-012 and surfaces its diagnostics unchanged (`RELEASE_PKG_*` codes preserved). Layer 2 runs only when `--archive <dir>` is provided so the readiness check can be invoked before a candidate archive is materialised (T-V05-006 / SPEC-V05-009 dry runs); Layer 1 still runs in that case. The CLI `scripts/check-release-readiness.ts` accepts `--version <X.Y.Z>` (or `RELEASE_VERSION` env), `--archive <dir>` (or `RELEASE_PACKAGE_ARCHIVE` env), `--ci-status`, `--validation-status`, and `--quality-waiver` flags, and exits 0 with a `skipped` notice when neither `--version` nor `RELEASE_VERSION` is supplied so `npm run verify` can host the check. Empty flag values short-circuit with `RELEASE_READINESS_ARG` so release automation cannot silently bypass the check (Codex P1 regression carried from T-V05-012). The script reuses `failIfErrors` for `--json` plumbing. Tag readiness uses an injectable `GitInterface`; the CLI wires the real implementation via `git rev-parse --verify --quiet`. v0.4 quality signal repo-derived inputs (`openBlockers`, `openClarifications`, `maturityLevel`) come from `lib/quality-metrics.ts`; the two operator-set signals (`ciStatus`, `validationStatus`) come from CLI flags or `RELEASE_CI_STATUS` / `RELEASE_VALIDATION_STATUS` env. Satisfies SPEC-V05-005 (REQ-V05-007), SPEC-V05-008 (REQ-V05-010), SPEC-V05-010 (REQ-V05-005, REQ-V05-012); composes T-V05-012; unblocks PR #159 (T-V05-006) and PR #162 (T-V05-010 / T-V05-011).

### 2026-05-04 — T-V05-005 — Test release readiness behavior

- **Files changed:** `tests/scripts/release-readiness.test.ts` (new).
- **Commit:** *(staged in PR #158; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-005 (REQ-V05-007), SPEC-V05-008 (REQ-V05-010), SPEC-V05-010 (REQ-V05-005, REQ-V05-012).
- **Owner:** qa
- **Outcome:** done
- **Deviation from spec:** none.
- **Notes:** 21 unit tests cover the six required scenarios from the chunk plan plus invariants and Codex P1 regressions. Scenario 1: a fully valid release fixture (aligned version, tag at main HEAD, CHANGELOG entry, valid `release.yml`, contract-aligned package metadata, least-privilege workflow permissions, green quality signals) produces zero diagnostics. Scenario 2: missing `## [vX.Y.Z]` heading and absent `CHANGELOG.md` both fail with `RELEASE_READINESS_CHANGELOG_MISSING`. Scenario 3: absent `.github/release.yml` fails `RELEASE_READINESS_RELEASE_YML_MISSING`; malformed `release.yml` (missing `changelog` block) fails `RELEASE_READINESS_RELEASE_YML_SHAPE`. Scenario 4: package metadata drift fires one diagnostic per drifting field (name, registry, repository); empty `files` array fails `PkgFiles`; version mismatch fails `Version`. Scenario 5: extra workflow permission keys (`actions`, `id-token`) each fire `WorkflowPermissions`; `permissions: write-all` fails; absent workflow file fails `WorkflowMissing`. Scenario 6: numbered ADR + non-empty intake folder + built-up doc in candidate archive fail readiness with the underlying `RELEASE_PKG_ADR`, `RELEASE_PKG_INTAKE`, and `RELEASE_PKG_DOC_STUB` diagnostics surfaced unchanged through Layer 2. Additional tests: missing quality signals fail closed with `Quality`; explicit operator waiver suppresses Quality diagnostics; missing tag fails `TagMissing`; tag SHA != main HEAD fails `TagNotAtMain`; argv parser handles `--version`/`--archive` flags, env fallback, and empty-flag-value rejection. Tests use `node:test` + `node:assert/strict` with fixtures under `fs.mkdtempSync` and a stub `GitInterface` so no real git or filesystem is required. All 21 new tests pass; full suite (203 tests) green.

### 2026-05-04 — T-V05-006 — Add manual GitHub Release workflow

- **Files changed:** `.github/workflows/release.yml` (new); `tools/automation-registry.yml` (new `workflow:release` entry).
- **Commit:** *(staged in PR #159; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-002 (REQ-V05-002), SPEC-V05-003 (REQ-V05-003, REQ-V05-004), SPEC-V05-009 (REQ-V05-011); NFR-V05-001, NFR-V05-002, NFR-V05-005; ADR-0020.
- **Owner:** dev
- **Outcome:** done
- **Deviation from spec:** none.
- **Notes:** New `.github/workflows/release.yml` triggers on `workflow_dispatch` only — no `push`, no `pull_request`, no `pull_request_target` — and exposes five inputs: `version` (required string, `X.Y.Z`), `dry_run` (boolean, default `true`), `prerelease` (boolean, default `false`), `draft` (boolean, default `false`), `confirm` (string, default empty — operator types the literal `version` to authorise non-dry-run publish per SPEC-V05-002). Top-level `permissions:` block declares exactly `{ contents: write, packages: write }` per ADR-0020 / NFR-V05-001; `packages: write` is reserved for T-V05-007 and is unused in this PR. No job-level overrides widen scope, so `RELEASE_READINESS_WORKFLOW_PERMISSIONS` self-validates this file once readiness runs against it. `concurrency.group: release-${{ inputs.version }}` with `cancel-in-progress: false` prevents two operators from racing the same release. The single `release` job runs (1) `actions/checkout@v6` SHA-pinned with `fetch-depth: 0` and `persist-credentials: false`, (2) `actions/setup-node@v6` SHA-pinned with `node-version: 24` matching `verify.yml` (`engines.node: >=20`), (3) `npm ci`, (4) Layer 1 readiness via `npm run check:release-readiness -- --json` — all operator inputs + repo `vars` (`RELEASE_VERSION`, `RELEASE_CI_STATUS`, `RELEASE_VALIDATION_STATUS`, `RELEASE_QUALITY_WAIVER`) flow through the `env:` mapping so no `${{ inputs.* }}` value lands inside a `run:` shell string (zizmor template-injection guard); the readiness CLI's existing env fallback consumes them, (5) build-candidate-archive **stub** for T-V05-007 / PR #160, (6) Layer 2 readiness **stub** for T-V05-007, (7) confirm gate — when `dry_run == false`, fails with `::error::` if `INPUT_CONFIRM != INPUT_VERSION` (string compare via env mapping), (8) `gh release create v${INPUT_VERSION} --target main --title v${INPUT_VERSION} --generate-notes` plus `--prerelease` / `--draft` flags emitted from a bash array based on the boolean inputs, gated by `if: ${{ ! inputs.dry_run }}`, (9) dry-run alternate step that calls `gh api .../releases/generate-notes` to log the candidate body without creating any public artifact (SPEC-V05-009), gated by `if: ${{ inputs.dry_run }}`, and (10) release-asset attachment **stub** for T-V05-007. Tag-at-main check (chunk plan step 7) is intentionally not duplicated — Layer 1 readiness already enforces it via `RELEASE_READINESS_TAG_MISSING` / `RELEASE_READINESS_TAG_NOT_AT_MAIN`. The three stubs each emit a single `echo` naming the follow-up task so the workflow run history shows the slot. Generated release notes use the `.github/release.yml` categories from PR #156 (T-V05-003) automatically. `tools/automation-registry.yml` was updated with a new `workflow:release` entry (kind: workflow, read_only: false, safe_to_run_locally: false, used_by: [ci]) so the inventory stays in lockstep. No new TypeScript, no new tests; `actionlint` and `zizmor` (existing PR checks) gate the workflow file shape and security posture; the readiness check it composes is already covered by PR #158's 21 unit tests. Smoke-test invocation under `dry_run: true` is captured under T-V05-010 (PR #162). Satisfies SPEC-V05-002, SPEC-V05-003, SPEC-V05-009; unblocks PR #160 (T-V05-007 package publish), PR #161 (T-V05-008 / T-V05-009 docs), and PR #162 (T-V05-010 / T-V05-011 dry run + final readiness).

### 2026-05-04 — T-V05-007 — Add package publish path

- **Files changed:** `package.json` (v0.5 identity fields + `files` allowlist; removed `private: true`); `package-lock.json` (re-locked for renamed root package; no dependency changes); `.github/workflows/release.yml` (replaced three T-V05-007 stubs, added `npm publish` step, configured `actions/setup-node` with `registry-url` + `scope`); `tools/automation-registry.yml` (`workflow:release` purpose updated); `specs/version-0-5-plan/chunks/pr5-package-publish.md` (full-detail chunk plan); `specs/version-0-5-plan/workflow-state.md` (hand-off note + `last_updated`).
- **Commit:** *(staged in PR #160; commit SHA recorded after `npm run verify`)*
- **Spec reference:** SPEC-V05-004 (REQ-V05-005, REQ-V05-006); NFR-V05-001, NFR-V05-002; ADR-0021 (consumed via Layer 2 readiness composition).
- **Owner:** dev
- **Outcome:** done
- **Deviation from spec:** none.
- **Notes:** `package.json` adopts the contract identity from `package-contract.md` §2–§3 — `name: "@luis85/agentic-workflow"`, `version: "0.5.0"`, `repository: "https://github.com/Luis85/agentic-workflow"`, `publishConfig.registry: "https://npm.pkg.github.com"` plus `publishConfig.access: "public"`, `files` allowlist matching `EXPECTED_PACKAGE_FILES` from `scripts/lib/release-readiness.ts` (`.claude/`, `.codex/`, `.github/`, `agents/`, `docs/`, `examples/`, `memory/`, `scripts/`, `sites/`, `templates/`, `tests/`, `AGENTS.md`, `CHANGELOG.md`, `CLAUDE.md`). Removed `private: true` so `npm publish` is no longer refused at source. Added `description`, `license: "MIT"`, `homepage`, `bugs.url`, `keywords`, and `author` so the published manifest carries npm-conventional metadata. The release workflow now: (1) configures `actions/setup-node` with `registry-url: 'https://npm.pkg.github.com'` and `scope: '@luis85'` so the runner's `~/.npmrc` authenticates publish via `NODE_AUTH_TOKEN`; (2) builds a candidate archive in step 5 via `npm pack --pack-destination <tmp>`, captures `tarball` + `archive_dir` as `steps.pack.outputs.*`, and flattens with `tar --strip-components=1` so the layout matches the running repo and `checkReleasePackageContents` walks the same shape; (3) runs Layer 2 readiness in step 6 via `npm run check:release-package-contents -- --json` with `RELEASE_PACKAGE_ARCHIVE` set in the `env:` mapping (no `${{ inputs.* }}` inside the `run:` block, zizmor template-injection guard intact); (4) publishes in step 10 via `npm publish` with `NODE_AUTH_TOKEN: secrets.GITHUB_TOKEN`, gated by `if: ${{ ! inputs.dry_run }}` and preceded by a `node -p` pre-flight that rebuilds `name@version` from `package.json` and fails closed if it drifted from `INPUT_VERSION` (defence-in-depth against tag-race / late-merge between Layer 1 readiness and the irreversible publish call); (5) attaches the tarball in step 11 via `gh release upload "v${INPUT_VERSION}" "${TARBALL}" --clobber` so a partial-asset rerun is idempotent without manual cleanup (NFR-V05-005 recoverability). No `--access public` flag on `npm publish` — GitHub Packages inherits visibility from the repository on a public repo, and `publishConfig.access: "public"` already declares the intent in `package.json`. `tools/automation-registry.yml` `workflow:release` `purpose` updated to reflect the now-active pipeline (no more "stubs for T-V05-007"). No new TypeScript scripts; no changes to `package.json#scripts`. `actionlint` and `zizmor` (existing PR checks) gate the workflow file shape and security posture; the readiness checks composed by the workflow are already covered by 21 unit tests in PR #158 (`check:release-readiness`) and 12 unit tests in PR #173 (`check:release-package-contents`). Satisfies SPEC-V05-004 (REQ-V05-005, REQ-V05-006); exercises NFR-V05-001 (least-privilege publish — `packages: write` is the only write scope used by the publish step) and NFR-V05-002 (traceability — the same `vX.Y.Z` resolves the tag, the GitHub Release, the published package version, and the asset). Unblocks PR #161 (T-V05-008 operator guide + T-V05-009 distribution docs) and PR #162 (T-V05-010 end-to-end dry run + T-V05-011 final readiness verification).

## Pull request grouping

PR #156 (`feat/v05-branch-strategy-and-release-notes`) stages two tasks together because they share a thin surface area (release branching decision + the release-notes config consumed by the future release workflow) and neither needs the other to merge first. Per-task entries above record the file paths, owners, and traceability separately so the grouping does not blur task boundaries.

## Deviations summary

> Any deviation from spec must be listed here, with link to ADR if material.

| Date | Task | Deviation | Reason | ADR |
|---|---|---|---|---|
| — | — | none | — | — |

### 2026-05-04 — Review fix — Codex round-4 P1 on PR #160 (npm view error handling)

- **Files changed:** `.github/workflows/release.yml` (step 10 idempotency guard branches on `npm view` exit code + stderr).
- **Spec reference:** NFR-V05-005 (recoverability); REQ-V05-006.
- **Owner:** orchestrator
- **Outcome:** done
- **Deviation from spec:** none.
- **Notes:** Codex round-4 P1 on commit `3d7f7d5` flagged that the previous idempotency check treated *any* `npm view` failure as "not published" because `if npm view ... | grep -q ...` swallows non-zero exits inside an `if` test (workflow shell defaults to `bash -e {0}`). Transient registry / auth / DNS errors would therefore fall through to `npm publish` and still hit `EPUBLISHCONFLICT`, defeating the rerun path. Step 10 now captures `npm view`'s exit code and stderr explicitly, then branches: (a) exit 0 + version present → already published, skip `npm publish`; (b) `E404` matched in stderr → version genuinely not published, proceed; (c) any other non-zero → fail closed with `::error::` and the captured output, refusing to publish on an unconfirmed-conflict path.

### 2026-05-04 — Review fix — Codex round-3 on PR #160 (idempotent publish + contract clarification)

- **Files changed:** `.github/workflows/release.yml` (step 10 idempotent rerun via `npm view` pre-check); `specs/version-0-5-plan/package-contract.md` (§3 row + change-log entry — canonicalise on `npm-shrinkwrap.json`).
- **Spec reference:** REQ-V05-005 (package contract); SPEC-V05-004; NFR-V05-005 (recoverability); REQ-V05-006.
- **Owner:** orchestrator
- **Outcome:** done
- **Deviation from spec:** none (one spec-aligning fix + one contract clarification).
- **Notes:** Codex round-3 on commit `975a5ae` raised two findings. (1) **P1 — idempotent publish (NFR-V05-005).** When step 10 publishes successfully but step 11 (asset upload) fails, rerunning the workflow with the same inputs would die at `npm publish` because `npm publish` is not repeatable for the same `name@version` (`EPUBLISHCONFLICT`). Step 10 now queries the registry first via `npm view "@luis85/agentic-workflow@${INPUT_VERSION}" version --json`; if the version is already published, the step emits a `::notice::` and skips `npm publish`, letting the workflow continue to step 11 so the asset upload gets a chance to recover. Other `npm view` failures bubble up — no silent fallthrough. (2) **P2 — contract clarification.** Codex flagged the contract/implementation mismatch: `package-contract.md` §3 said `package-lock.json` ships as authored, but the published tarball ships `npm-shrinkwrap.json` instead (the npm-canonical publication-lockfile name; `npm pack` strips `package-lock.json` even when listed in `files`, and the runner's npm version does not auto-include it). The contract was the wrong artifact — the implementation choice is correct npm convention. Updated `package-contract.md` §3 to canonicalise on `npm-shrinkwrap.json` (with note that the codebase form keeps `package-lock.json` for day-to-day development; the workflow stages a byte-equal copy before pack), and appended a change-log entry. The workflow and `package.json` are unchanged from `975a5ae`.

### 2026-05-04 — Review fix — Codex P2 on PR #160 (lockfile shipping)

- **Files changed:** `.github/workflows/release.yml` (step 5 stages `npm-shrinkwrap.json` from `package-lock.json` before `npm pack`); `package.json` (`files` allowlist gains `npm-shrinkwrap.json`); `specs/version-0-5-plan/chunks/pr5-package-publish.md` (surface + step 5 description).
- **Spec reference:** `package-contract.md` §3 (lockfile ships); REQ-V05-005 (package contract); SPEC-V05-004.
- **Owner:** orchestrator
- **Outcome:** done
- **Deviation from spec:** none (spec-aligning fix — original PR #160 left `package.json#files` without a lockfile entry, so the published tarball had no lockfile despite `package-contract.md` §3 promising one).
- **Notes:** Codex P2 on commit `958cee6` flagged that `npm pack --dry-run` omitted `package-lock.json` even though `package-contract.md` §3 promises a shipped lockfile. Confirmed locally: `npm pack` strips `package-lock.json` even when listed in `files`, and `npm-shrinkwrap.json` is **not** auto-included on this npm version (810 files in the tarball, 0 lockfile of either name). Fixed by staging `package-lock.json` as `npm-shrinkwrap.json` (the npm-canonical publication-lockfile name) before `npm pack` runs in workflow step 5, and listing `npm-shrinkwrap.json` in `package.json#files` so the allowlist permits it. The codebase form keeps `package-lock.json` for day-to-day development; the runner is ephemeral so no cleanup of the staged shrinkwrap is needed. Verified: with both edits, `npm pack --dry-run` reports `27.1kB npm-shrinkwrap.json` in the tarball file list. `EXPECTED_PACKAGE_FILES` subset assertion in `check:release-readiness` is unaffected because the readiness check accepts extras.

### 2026-05-04 — Review fix — Codex P1 on PR #160

- **Files changed:** `.github/workflows/release.yml` (new `publish_package` input + tightened step 10 gate); `specs/version-0-5-plan/chunks/pr5-package-publish.md` (input list + step 10 description + edge case).
- **Spec reference:** SPEC-V05-009 (candidate dry run); REQ-V05-002 / NFR-V05-001 (explicit publish authorisation).
- **Owner:** orchestrator
- **Outcome:** done
- **Deviation from spec:** none (spec-aligning fix — original PR #160 left `dry_run: false` as the only publish gate, which would publish on draft/pre-release runs against SPEC-V05-009).
- **Notes:** Codex P1 on commit `9342ea8` flagged that the publish step ran for every non-dry-run invocation, so a maintainer using `draft` or `prerelease` to stage a candidate would also publish the npm package. Added a dedicated `publish_package` boolean input (default `false`) and tightened the publish gate to `if: ${{ ! inputs.dry_run && inputs.publish_package }}`. The asset upload remains on `! inputs.dry_run` so a draft Release can carry the tarball for reviewer inspection without publishing the package; `npm publish` only runs when an operator explicitly sets `publish_package: true` alongside `dry_run: false` and a matching `confirm` input. Aligns the workflow with SPEC-V05-009 (candidate dry run) and REQ-V05-002 (explicit publish authorisation).

## Quality gate

- [ ] All tasks accounted for (done, partial, blocked, or dropped).
- [ ] Implementation matches the spec; any deviation is logged with rationale (and ADR if material).
- [ ] No unrelated changes ("scope creep") in any task entry.
- [ ] Lint, type checks, unit tests green for the changed surface.
- [ ] Commits reference task IDs.
