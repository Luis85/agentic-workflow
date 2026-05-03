---
title: Security CI gates
folder: docs
description: GitHub Actions workflows that harden the repo outside the verify gate — workflow lint, workflow security, and secret scanning.
entry_point: false
---

# Security CI gates

The [`verify` gate](verify-gate.md) is intentionally fast and deterministic. It is **not** a security audit. This document records the security-oriented GitHub Actions workflows that run alongside it.

Each gate is a separate workflow file under `.github/workflows/` so it can be enabled, disabled, or replaced without touching the verify gate.

| Workflow | File | Trigger | What it catches |
| --- | --- | --- | --- |
| **actionlint** | [`.github/workflows/actionlint.yml`](../.github/workflows/actionlint.yml) | PR + push to `main`, paths `.github/workflows/**`, `.github/actions/**` | Workflow YAML schema errors, deprecated action calls, shellcheck inside `run:` blocks. |
| **zizmor** | [`.github/workflows/zizmor.yml`](../.github/workflows/zizmor.yml) | PR + push to `main` (workflow paths) + weekly schedule | Workflow security smells: template injection, unpinned actions, excessive permissions, dangerous triggers. SARIF results land in the GitHub Security tab. |
| **gitleaks** | [`.github/workflows/gitleaks.yml`](../.github/workflows/gitleaks.yml) | PR + push to `main` + weekly schedule | Committed secrets — API keys, tokens, private keys — detected against the full git history. |
| **dependency-review** | [`.github/workflows/dependency-review.yml`](../.github/workflows/dependency-review.yml) | PRs touching `package.json`, `package-lock.json`, `npm-shrinkwrap.json`, or workflow/action files | New vulnerable npm or GitHub Actions dependencies introduced by the PR diff. Fails on `high` and `critical` severities; license policy is deferred. |

The least-privilege `permissions:` block on each workflow is documented in [`docs/rbac.md`](rbac.md) §GitHub Actions, alongside the harness and branch-protection rules that bound the rest of the autonomous flow.

## Why separate workflows

- **Independent failure surfaces.** A flaky workflow lint should not block a security scan and vice versa.
- **Targeted triggers.** `actionlint` and `zizmor` only run on workflow file changes; `gitleaks` runs on every PR.
- **Replaceable.** Adopters of this template can swap any of the three for an internal equivalent without rewiring the others.

## Why these gates first

`actionlint` and `zizmor` defend the CI pipeline itself — every other gate lives downstream of GitHub Actions, so that surface gets hardened first. `gitleaks` defends the repo against the most common single-event leak (a secret pasted into a commit). `dependency-review` catches vulnerable packages and actions before dependency diffs merge. Together they close the highest-leverage gaps for a workflow-template repo.

Higher-friction or domain-specific gates (CodeQL, OSSF Scorecard, markdownlint) are deferred until a concrete signal demands them. `typos`, conventional-commits PR titles, and dependency review are now implemented.

## Required status checks

The upstream `main` ruleset requires the always-running checks that every PR should produce:

- `Verify`
- `Conventional Commits PR title`
- `spell check`
- `scan for committed secrets`

The ruleset also requires an up-to-date branch and resolved review threads. It does not require approving reviews yet; for the current solo-maintainer workflow, required checks provide the stronger signal without adding approval ceremony. This makes the remote policy match the local rule that `npm run verify` must be green before merge.

Path-triggered security workflows are intentionally not global required checks:

- `actionlint` runs only for `.github/workflows/**` and `.github/actions/**`.
- `zizmor static analysis` runs only for workflow/action changes and on its weekly schedule.
- `dependency review` runs only for dependency manifest, lockfile, workflow, and local-action changes.

If GitHub rulesets in the target repository support path-scoped required checks, require those checks for the matching paths. Otherwise, reviewers must treat the path-triggered job result as merge-blocking whenever GitHub runs it.

## Dependency review policy

The dependency-review workflow uses GitHub's dependency graph diff for pull requests. It runs only when a PR changes the npm manifest/lock or GitHub Actions workflow/action files.

Policy:

- Fail on vulnerabilities with severity `high` or `critical`.
- Report lower-severity findings in the job output without blocking the PR.
- Keep `license-check: false` for now; license allow/deny policy needs a separate decision.
- Do not post PR comments from the action. Reviewers read the job summary and logs, and branch protection can require the `dependency review` check once the repo ruleset is updated.

The workflow complements, but does not replace, repository-level Dependabot alerts. Dependabot alerts must be enabled in the GitHub repository security settings so newly disclosed vulnerabilities in already-merged dependencies surface outside PR review.

## Local equivalents

When iterating on workflow YAML or hunting a leaked secret without waiting for CI:

```bash
# actionlint
ACTIONLINT_INSTALLER_SHA=914e7df21a07ef503a81201c76d2b11c789d3fca
ACTIONLINT_VERSION=1.7.12
bash <(curl -fsSL "https://raw.githubusercontent.com/rhysd/actionlint/${ACTIONLINT_INSTALLER_SHA}/scripts/download-actionlint.bash") "${ACTIONLINT_VERSION}"
./actionlint -color

# zizmor (requires uv: https://github.com/astral-sh/uv)
uvx zizmor==1.24.1 .

# gitleaks (requires the gitleaks binary: https://github.com/gitleaks/gitleaks)
gitleaks detect --source . --redact

# dependency-review has no direct local equivalent; it depends on GitHub's
# pull-request dependency graph comparison API. Use npm audit locally for
# a coarse npm-only check.
npm audit --audit-level=high
```

These are not bundled into `npm run verify` on purpose — see the verify gate doc for the rationale.

## zizmor persona split

`zizmor` runs twice in the workflow:

1. **Auditor persona, SARIF output** — uploads everything (including pedantic findings) to the Security tab so reviewers can see the full picture. This step is `continue-on-error` so the SARIF file always lands.
2. **Default persona, gate** — fails the build on `unpinned-uses` and any other default-persona finding. The auditor persona is reserved for SARIF visibility so reviewers see the full picture without making the build flap on stylistic findings.

Tighten the gate to `--persona=auditor` once every pedantic finding has been resolved.

## Action pinning

Every action call in this repo is pinned to a commit SHA with the human-readable version comment alongside, e.g.:

```yaml
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

Pinning to SHA is a hard requirement enforced by zizmor's `unpinned-uses` rule. To bump an action:

1. Find the new tag's commit SHA (`gh api repos/<owner>/<repo>/git/refs/tags/<tag>`; if the object type is `tag`, dereference it via `gh api repos/<owner>/<repo>/git/tags/<sha>`).
2. Update the `@<sha>` and the trailing `# <version>` comment in the same edit.
3. Verify the workflow still parses (`actionlint`) and is happy with zizmor.

SHA bumps are automated by Dependabot — see [`ci-automation.md`](ci-automation.md#dependabot-policy).

Pinned tool installers follow the same review habit even when they are not
GitHub Actions `uses:` references. `actionlint.yml` pins both the upstream
installer script commit and the downloaded actionlint release version.
`zizmor.yml` pins the PyPI package version used by `uvx`; bump it in the
workflow and the local-equivalent command above in the same PR.

## Adopting in a downstream project

When this template is adopted into a real project:

1. Keep all three workflow files unchanged unless you have a stronger internal equivalent.
2. If the project is hosted in a GitHub organisation, gitleaks may require a `GITLEAKS_LICENSE` secret — check the [gitleaks-action docs](https://github.com/gitleaks/gitleaks-action) for current terms.
3. Wire the SARIF tab in the GitHub UI: zizmor findings show under the repo's **Security → Code scanning** view once the first run completes.
4. Treat any new finding as a real defect — do not silence at the rule level without an ADR.
