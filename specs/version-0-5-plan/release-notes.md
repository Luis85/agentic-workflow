---
id: RELEASE-V05-001
title: Specorator v0.5.0 — Release and distribution
stage: release
feature: version-0-5-plan
version: 0.5.0
status: draft
owner: release-manager
inputs:
  - REVIEW-V05-001
created: 2026-05-02
updated: 2026-05-02
---

# Release notes — Specorator v0.5.0

## Summary

v0.5.0 adds the release and distribution infrastructure for Specorator. You can now publish a versioned release of the workflow template — as a GitHub Release with generated release notes and an attached tarball, and (when you choose to enable it) as an installable GitHub Package at `@luis85/agentic-workflow`. All publish operations are manually authorized: no version is cut or package pushed without an explicit operator decision and a confirm gate. The release package ships as a clean starter — intake folders empty, ADRs excluded, docs in stub form — so consumers who install it get a blank slate, not this repository's history.

The `release/v0.5.0` branch carries the lifecycle release-notes finalization and `package-contract.md` status flip. Once this PR merges to `main` and the operator cuts the `v0.5.0` tag, the two-step publish sequence described below is ready to run.

## Changes

### Added

- **Release workflow** (`.github/workflows/release.yml`): manual `workflow_dispatch` only. Inputs: `version`, `dry_run` (default `true`), `prerelease`, `draft`, `confirm`, `publish_package`. Includes a confirm gate that refuses to run any irreversible step unless `confirm == version`. Satisfies REQ-V05-002, SPEC-V05-002.
- **Release readiness check** (`npm run check:release-readiness`): Layer 1 validates version, tag, changelog, `.github/release.yml` shape, `package.json` metadata against `package-contract.md`, workflow permissions, and v0.4 quality signals. Layer 2 runs the fresh-surface assertions against the candidate archive. Satisfies REQ-V05-007, REQ-V05-010, SPEC-V05-005, SPEC-V05-008.
- **Fresh-surface build tool** (`npm run build:release-archive`): builds a staged tree under `.release-staging/` by filtering numbered ADRs, clearing intake folders, and converting every shipping `docs/**/*.md` to stub form. `npm pack ./.release-staging` (not `npm pack`) is the canonical pack invocation. Satisfies REQ-V05-012, SPEC-V05-010, ADR-0021.
- **Prepack guard** (`scripts/release-prepack-guard.mjs`): refuses `npm pack @luis85/agentic-workflow` from any directory that lacks the staging marker, preventing accidental direct-pack of the repository root. Defence-in-depth per ADR-0021.
- **Package contract** (`specs/version-0-5-plan/package-contract.md`): the accepted, human-reviewed contract for `@luis85/agentic-workflow` — registry target, package name, include list, exclude list (numbered ADRs, per-feature spec folders, all 10 intake folder hierarchies), version source, consumer promise, and install prerequisites. Satisfies REQ-V05-005, SPEC-V05-004, PKG-CONTRACT-V05-001.
- **Generated release notes config** (`.github/release.yml`): 11 categories mapped from Conventional Commit PR-title types; excludes `dependabot` and `github-actions` author handles. Satisfies REQ-V05-003, REQ-V05-004, SPEC-V05-003.
- **Release operator guide** (`docs/release-operator-guide.md`): runnable, version-by-version pre-conditions, dry-run path, stable-publish path, rollback rules, six failed-publish recovery scenarios (including the `gh release create` non-idempotency constraint), post-release cleanup, quick-reference command bundle, and diagnostic code table. Satisfies REQ-V05-008, SPEC-V05-006, NFR-V05-004, NFR-V05-005.
- **Release package contents doc** (`docs/release-package-contents.md`): template-wide reference for the fresh-surface include/exclude enumeration (maintenance rule: any new intake folder must be added here and to ADR-0021 in the same PR). Satisfies SPEC-V05-007.
- **ADR-0020**: Adopt Shape A with `release/vX.Y.Z` branches — `main` is the canonical tag source; `develop` is not introduced. Satisfies REQ-V05-001.
- **ADR-0021**: Ship the released template package as a fresh-surface starter — docs as stubs, ADRs excluded, all 10 intake folders empty. Satisfies REQ-V05-012.
- **Release scripts** in `scripts/` and `scripts/lib/`: `release-readiness.ts`, `release-package-contract.ts`, `release-archive-builder.ts`, `release-stubify.ts`, `release-staging-safety.ts`. All wired into `tools/automation-registry.yml`; typedoc shells in `docs/scripts/` regenerated.
- **Automation registry entries** in `tools/automation-registry.yml`: `workflow:release`, `check:release-readiness`, `check:release-package-contents`, `build:release-archive`.
- **Product page and public docs**: `sites/index.html` updated with a new FAQ item and step-1 mention of the GitHub Release and GitHub Package channels. `README.md`, `docs/specorator.md` §3.10, and `docs/release-package-contents.md` cross-referenced. Satisfies REQ-V05-009, SPEC-V05-007.

### Changed

- `package.json`: `name` → `@luis85/agentic-workflow`; `version` → `0.5.0`; added `publishConfig.registry`, `repository`, `files`, `description`, `license`, `homepage`, `bugs`, `keywords`, `author`; dropped `private: true`. The package is now npm-publish-ready.
- `docs/branching.md`: documents the `release/vX.Y.Z` convention per ADR-0020.
- `docs/specorator.md` §3.10: documents distribution channels and operator path.
- `CHANGELOG.md`: `[v0.5.0]` entry promoted from `[Unreleased]`.
- `tools/automation-registry.yml`: release workflow and readiness checks registered.

### Removed

Nothing removed in this release. `private: true` was removed from `package.json` as part of enabling publish.

## User-visible impact

**Template adopters (new users installing from GitHub Packages or cloning from a release tag):**

- The first release of `@luis85/agentic-workflow` ships as a clean starter. Install via `npm install --save-dev @luis85/agentic-workflow` with the GitHub Packages auth prerequisites from `package-contract.md` §7. Manual file copy is the supported install path for v0.5; a scaffolder CLI is a post-v0.5 goal.
- The published archive includes no numbered ADRs, no per-feature spec folders, and no in-flight workflow state. Intake folders (`specs/`, `inputs/`, `discovery/`, `projects/`, `portfolio/`, `roadmaps/`, `quality/`, `scaffolding/`, `stock-taking/`, `sales/`) ship empty. Your first feature's spec folder will be `specs/<your-feature>/`, not `specs/version-0-5-plan/`.
- GitHub Packages requires authentication even for public packages. A GitHub Personal Access Token (Classic) with `read:packages` scope is required. See `package-contract.md` §7 for the exact `~/.npmrc` and `.npmrc` configuration.
- No breaking changes to the workflow stages (1–11), slash commands, skill entry points, templates, or governance files. These surfaces are stable within major releases.

**Maintainers and contributors:**

- Every release from v0.5 forward goes through the operator guide (`docs/release-operator-guide.md`). The workflow enforces `dry_run: true` and `confirm` gate by default — a run cannot accidentally publish.
- `npm pack` from the repository root is now blocked by the prepack guard. Use `npm run build:release-archive && npm pack ./.release-staging` instead (covered in §7.1 of the operator guide).
- `package-contract.md` is now `accepted`; all three open questions (OQ-V05-001 to OQ-V05-003) are closed.

**No action required** for existing users of the repository who work in topic branches: the workflow stages, agent prompts, verify gate, and CI are unchanged.

## Readiness summary

- Release readiness guide: not used (this release has no multi-stakeholder gate conditions or compliance risks that require the full readiness guide template; the review verdict and conditions summary below are sufficient).
- Go/no-go verdict: **Approved with conditions met**. REVIEW-V05-001 verdict was "Approved with conditions" on 2026-05-02. Both Decider-owned conditions have been resolved:
  1. CLAR-V05-003 closed by Decider — first publish is draft + prerelease, then promoted to stable (two-step path).
  2. `RELEASE_CI_STATUS=green` and `RELEASE_VALIDATION_STATUS=green` repo vars set by Decider.
- Quality metrics at review time: `overallScore` 97.1 / 100, maturity level 3 (Traceable), `requirementCoverage` 100%, `earsCoverage` 100%, 0 blockers. Note: `requirementsWithTests` metric reported 0 due to a tooling miscount (R-V05-001) — the actual test coverage is confirmed by 94/94 release-surface tests passing; a follow-up issue is filed against `scripts/quality-metrics.ts`.
- All 18 verify gates passed at 14.6 s; 94/94 release-surface tests passed (re-run by reviewer).
- R-V05-005 resolved in this PR: `package-contract.md` status flipped from `draft` to `accepted`.

## Known limitations

- **TEST-V05-006 deferred (R-V05-002):** the live publish acceptance test ("publish a package from an authorized release run") cannot be exercised until the first stable publish is complete. Coverage gap is documented in `test-report.md` §10 Gap 1. The Stage 11 retrospective will backfill the test record from the operator-authorized run.
- **GitHub Packages auth required for public packages:** consumers must configure `read:packages` token even though the package and repository are public. `npm install` returns `401 Unauthorized` without it. This is a GitHub Packages platform constraint, not a package bug. See `package-contract.md` §7.
- **Manual install path for v0.5:** there is no scaffolder CLI (`npm create @luis85/agentic-workflow`). Manual copy from `node_modules/@luis85/agentic-workflow/` is the only supported path. A scaffolder is a post-v0.5 goal and is not promised in this release.
- **First publish is the first end-to-end exercise:** the release workflow, readiness checks, and build-time transform have been fully tested locally and in CI; the remote workflow dispatch with `publish_package: true` has not been run before (RISK-V05-006). Dry run is the default; the two-step CLAR-V05-003 path (draft+prerelease, then stable) is designed to let the operator inspect the artifact before the irreversible npm publish.
- **`quality-metrics` undercounts test coverage (R-V05-001):** the `requirementsWithTests: 0` metric is a tooling miscount; the real REQ → TEST chain is fully traced in `traceability.md` and `spec.md`. A post-v0.5 follow-up issue targets `scripts/quality-metrics.ts`.
- **`gh release create` is not re-runnable** once it has succeeded on a given tag. If the release workflow fails after `gh release create` but before the asset upload or npm publish, use the manual recovery commands in `docs/release-operator-guide.md` §7.1. Do not rerun the full workflow.
- **ADR-0021 glob notation errata:** the `docs/adr/0\d{3}-*.md` pattern used in the ADR body is not a valid shell glob. The operational form is `[0-9][0-9][0-9][0-9]-*.md`. The decision is unchanged; see ADR-0021 §Errata.

## Verification steps

1. From the worktree or a fresh clone of `main` at the `v0.5.0` tag, run `npm run verify` — all 18 gates must pass.
2. Run `npm run quality:metrics -- --feature version-0-5-plan` and confirm `overallScore` >= 97 and `blockers: 0`.
3. Run the pre-flight readiness check:
   ```
   RELEASE_VERSION=0.5.0 RELEASE_CI_STATUS=green RELEASE_VALIDATION_STATUS=green npm run check:release-readiness -- --json
   ```
   Expect `{"diagnostics": []}`.
4. Trigger the dry-run workflow dispatch from GitHub Actions UI (`dry_run: true`, `confirm` empty) and confirm all four steps pass: Layer 1 readiness, candidate archive build, Layer 2 fresh-surface, dry-run candidate log.
5. Inspect the dry-run candidate log for correct generated release notes body and absence of numbered ADR filenames or per-feature spec paths in the tarball listing.
6. After the dry-run passes, trigger the first publish (CLAR-V05-003 two-step path):
   - Step 1 — draft + prerelease: `dry_run=false prerelease=true draft=true confirm=0.5.0 publish_package=false`. Inspect the draft Release on GitHub.
   - Step 2 — stable + npm publish: `dry_run=false prerelease=false draft=false confirm=0.5.0 publish_package=true`. Verify `https://github.com/Luis85/agentic-workflow/releases/tag/v0.5.0` and `@luis85/agentic-workflow@0.5.0` on GitHub Packages.
7. Smoke-test consumer install with the subshell pattern in `docs/release-operator-guide.md` §5 (requires a `read:packages` PAT).

## Rollback plan

Rollback for this release is forward-only per Article IX of the constitution and the rules in `docs/release-operator-guide.md` §6. Tags, GitHub Releases, and GitHub Packages publishes are irreversible under repository settings (force-push and tag deletion denied by `.claude/settings.json`).

- **Trigger criteria:** use the rollback path if (a) the released artifact violates the fresh-surface contract (numbered ADRs or per-feature spec folders present in the published tarball), (b) the published package produces `npm install` failures unrelated to auth configuration, (c) a license violation or secret leak is confirmed, or (d) the release notes are materially wrong in a way that causes consumer harm.
- **Mechanism:**
  - Release notes content wrong but artifact correct: edit the GitHub Release body in the UI. No new version needed.
  - Artifact wrong, package not yet published: set the Release to draft in the GitHub UI, then cut `v0.5.1` with the fix. Update the `v0.5.0` Release notes to point at `v0.5.1`. Do not delete or move the `v0.5.0` tag.
  - Artifact and package published, consumers affected: cut `v0.5.1` with a fix, run `npm deprecate @luis85/agentic-workflow@0.5.0 "<reason>"`, update `v0.5.0` Release notes to point at `v0.5.1`. Do not force-push or rewrite tags.
  - Catastrophic issue (secret leak, license violation): run `npm unpublish @luis85/agentic-workflow@0.5.0` within the registry's allowed window, make the Release a draft, file an incident, and cut `v0.5.1`. This escape hatch is for emergencies only.
  - In every case: append an entry to this file and to `specs/version-0-5-plan/implementation-log.md` naming the rollback action and the superseding version.
- **Data implications:** no persistent data is created by this release. Consumers who have already installed `@luis85/agentic-workflow@0.5.0` and copied files into their repository are not automatically affected by a package deprecation or supersession; they need to re-copy updated files manually.
- **Communication:** notify via the `v0.5.0` GitHub Release notes (edit in place) and, for a package deprecation or yanked publish, via the GitHub Packages page and a pinned issue on `Luis85/agentic-workflow`. Internal note: append to `specs/version-0-5-plan/implementation-log.md` and update `CHANGELOG.md` with a `[v0.5.1]` entry describing the corrective action.

## Observability

This is a template repository; there are no production services or runtime metrics. Observability is through CI and repository tooling:

- **CI:** GitHub Actions logs at `https://github.com/Luis85/agentic-workflow/actions` — every `npm run verify` run, every release workflow run.
- **Quality metrics:** `npm run quality:metrics -- --feature version-0-5-plan` for feature-level KPI snapshot. `npm run quality:metrics` for repo-level health.
- **Release readiness:** `npm run check:release-readiness -- --version 0.5.0 --json` for pre-publish diagnostic codes.
- **Fresh-surface check:** `npm run check:release-package-contents -- --archive .release-staging --json` after `npm run build:release-archive` to confirm the staged tree meets SPEC-V05-010 assertions.
- **Package presence:** `npm view @luis85/agentic-workflow@0.5.0 version --json` (requires `read:packages` token) confirms the package is live on GitHub Packages.
- No new persistent dashboards or alert thresholds are introduced by this release.

## Communication

- **Internal:** workflow-state.md hand-off note (below) summarizes the remaining operator sequence. The reviewer's hand-off in `specs/version-0-5-plan/workflow-state.md` and `review.md` §Recommendation are the pre-publish checklist.
- **External:** the GitHub Release notes (generated by `gh release create --generate-notes` from `.github/release.yml` categories) are the public-facing announcement. `sites/index.html` and `README.md` were updated in PR #161 to describe the v0.5 distribution channels.
- **Support:** `docs/release-operator-guide.md` is the runnable operator reference for any maintainer executing a publish or recovery action.
- No embargo. The release is public once the stable workflow run completes.

---

## Quality gate

- [x] Summary written for the audience (users / stakeholders, not engineers).
- [x] User-visible impact stated.
- [x] Readiness conditions and approvals summarized, or guide marked not used.
- [x] Known limitations disclosed.
- [x] Verification steps documented.
- [x] Rollback plan documented (all four fields: Trigger criteria, Mechanism, Data implications, Communication).
- [x] Observability hooks in place.
- [x] Communication plan ready.
- [ ] Merged worktrees pruned (`git worktree prune`) and stale topic worktrees/branches cleaned up. — Pending operator action post-merge.
