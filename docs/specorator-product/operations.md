# Specorator Operations Steering

## Environments

| Environment | Purpose | Source |
|---|---|---|
| Local worktree | Implementation and verification | `.worktrees/<slug>/` topic branches |
| Pull request | Review, CI, and merge readiness | GitHub PRs against `main` |
| GitHub Pages | Public product page | `sites/` deployment workflow |
| GitHub Release | Tagged release notes and source archive | release branches and tags |
| GitHub Packages | npm package distribution | package workflow and `package.json` |

## Branch And PR Operations

- Keep `main` as the integration branch unless a future ADR changes the branch model.
- Use one topic branch per concern.
- Work in `.worktrees/<slug>/` for non-trivial repository changes.
- Run relevant verification before push and `npm run verify` before ready-for-review.
- Do not force-push, merge, delete remote branches, or publish releases without explicit authorization or documented autonomous-merge criteria.

## Release Cadence

- Release trains are versioned milestones.
- Release readiness is evidence-based: checks, release notes, package contract, public page state, and known limitations.
- Tags are cut from the approved release source after merge readiness is confirmed.
- Public positioning changes should land only after the evidence they cite exists or clearly states pending status.

## Deployment And Publishing

- GitHub Actions owns public page deployment and package/release workflows.
- Manual release steps must be recorded in release notes or readiness docs.
- Release-package contents must preserve fresh-surface starter semantics for downstream adopters.
- Generated release notes use `.github/release.yml`; update categories with Conventional Commit policy changes.
- **Repo Setting → "Immutable releases" must be DISABLED before every release dispatch.** When on, GitHub auto-flags every new Release immutable; a failed asset upload — or operator deletion — permanently burns the tag. Verify with `gh api repos/{owner}/{repo}/immutable-releases` before every dispatch — per the GitHub REST contract HTTP 404 means the setting is disabled (safe); HTTP 200 means the setting is enabled and the JSON `enforced_by_owner` field tells you whether the toggle came from this repo or an org-level default. The v0.5.0 incident burned `v0.5.0` and forced the v0.5.1 recovery release ([#233](https://github.com/Luis85/agentic-workflow/issues/233)). The release operator guide §1 lists this as pre-condition 5 and §7.7 documents the recovery path.

## Rollback

- Documentation or template regressions roll forward through a corrective PR.
- Product-page regressions can be reverted through a normal PR or redeployed from a known-good commit.
- Package or release mistakes require a documented remediation note; never silently rewrite published history.

## Observability

- CI logs are the primary operational evidence for checks and deployments.
- `npm run quality:metrics` provides repository and feature health signals.
- Release notes capture readiness verdicts, caveats, and verification commands.
- GitHub issues and PRs track roadmap and task state.

## Incident Response

- Security-sensitive incidents follow the repository's security guidance and require human authorization before public disclosure or credential rotation.
- Broken release or package workflows should be isolated to a branch and verified locally before rerun.
- Any process flaw that caused the incident should produce a follow-up issue, ADR, or memory note depending on permanence.
