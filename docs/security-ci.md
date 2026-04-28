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

## Why three separate workflows

- **Independent failure surfaces.** A flaky workflow lint should not block a security scan and vice versa.
- **Targeted triggers.** `actionlint` and `zizmor` only run on workflow file changes; `gitleaks` runs on every PR.
- **Replaceable.** Adopters of this template can swap any of the three for an internal equivalent without rewiring the others.

## Why these three first

`actionlint` and `zizmor` defend the CI pipeline itself — every other gate lives downstream of GitHub Actions, so that surface gets hardened first. `gitleaks` defends the repo against the most common single-event leak (a secret pasted into a commit). Together they close the highest-leverage gaps for a workflow-template repo.

Higher-friction or domain-specific gates (CodeQL, dependency-review, OSSF Scorecard, typos, markdownlint, conventional-commits PR titles) are deferred until a concrete signal demands them. Adding them later is a one-file change.

## Local equivalents

When iterating on workflow YAML or hunting a leaked secret without waiting for CI:

```bash
# actionlint
bash <(curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
./actionlint -color

# zizmor (requires uv: https://github.com/astral-sh/uv)
uvx zizmor .

# gitleaks (requires the gitleaks binary: https://github.com/gitleaks/gitleaks)
gitleaks detect --source . --redact
```

These are not bundled into `npm run verify` on purpose — see the verify gate doc for the rationale.

## zizmor persona split

`zizmor` runs twice in the workflow:

1. **Auditor persona, SARIF output** — uploads everything (including pedantic findings) to the Security tab so reviewers can see the full picture. This step is `continue-on-error` so the SARIF file always lands.
2. **Default persona, gate** — only fails the build on `medium`+ findings. This avoids blocking PRs on stylistic warnings (e.g. unpinned major-version tags) while still gating real risks (template injection, write-permission leaks, dangerous triggers).

Tighten the gate to `--persona=auditor` once the repo has paid down the inventory of pedantic findings.

## Action pinning

The current workflows reference major-version tags (e.g. `actions/checkout@v6`). The auditor persona surfaces this as a pedantic finding. Pinning every action to a commit SHA is a deliberate follow-up: it gives the strongest supply-chain guarantee but adds churn whenever an action releases. Until Dependabot is configured to bump SHAs automatically, the major-version tag is the default for all workflows in this repo.

## Adopting in a downstream project

When this template is adopted into a real project:

1. Keep all three workflow files unchanged unless you have a stronger internal equivalent.
2. If the project is hosted in a GitHub organisation, gitleaks may require a `GITLEAKS_LICENSE` secret — check the [gitleaks-action docs](https://github.com/gitleaks/gitleaks-action) for current terms.
3. Wire the SARIF tab in the GitHub UI: zizmor findings show under the repo's **Security → Code scanning** view once the first run completes.
4. Treat any new finding as a real defect — do not silence at the rule level without an ADR.
