---
title: CI automation
folder: docs
description: GitHub Actions workflows and Dependabot config that automate hygiene tasks — PR-title lint, spell check, Markdown style lint, and pinned-action bumps.
entry_point: false
---

# CI automation

Companion to [`verify-gate.md`](verify-gate.md) and [`security-ci.md`](security-ci.md). Documents the workflows that automate routine hygiene the [`verify`](verify-gate.md) gate is intentionally too narrow to enforce: convention checks against PR metadata, spell / Markdown style checks across docs, and dependency bump automation.

| Workflow | File | Trigger | What it does |
| --- | --- | --- | --- |
| **pr-title** | [`.github/workflows/pr-title.yml`](../.github/workflows/pr-title.yml) | `pull_request_target` opened / edited / reopened / synchronize | Validates PR title against Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`). Mirrors the [AGENTS.md](../AGENTS.md) commit convention. |
| **typos** | [`.github/workflows/typos.yml`](../.github/workflows/typos.yml) | PR + push to `main` | Spell-check across the repo. Allowlist in [`_typos.toml`](../_typos.toml). |
| **dependabot** | [`.github/dependabot.yml`](../.github/dependabot.yml) | Weekly (Monday 06:00 UTC) | Opens PRs for new versions of pinned GitHub Actions and npm dev-dependencies. Groups patches and minors to keep PR volume low. |

## Why these three

- **pr-title** enforces the existing convention. Without it, the rule lives only in `AGENTS.md` and gets violated. The check is cheap and informs reviewers immediately.
- **typos** targets a Markdown-heavy repo where prose drift accumulates faster than code drift. Fast (< 5s) and config-driven.
- **dependabot** closes the loop on the [SHA-pin policy](security-ci.md#action-pinning) — without an automated bumper, pinning is a maintenance burden that ages out the codebase.

## Why **not** markdownlint (yet)

`markdownlint-cli2` was scoped for this bundle but pulled out — the existing artefact templates produce ~2000 findings on first run, dominated by table-pipe-spacing (`MD060`), heading rules around H1 placeholders (`MD025`), and fenced-code language tags (`MD040`). Adding it without a dedicated cleanup PR would either spam CI or require disabling so many rules that the check becomes a no-op. Track it as a follow-up: a single sweep PR that auto-fixes table style and adds language tags to fenced blocks, then enable the workflow.

## PR-title rules

The PR-title check runs as `pull_request_target` so external contributors can be validated without granting write tokens. The action only reads the title — it does not run repo code.

Allowed types are intentionally narrow:

| Type | When to use |
| --- | --- |
| `feat` | New behaviour or capability |
| `fix` | Bug fix |
| `chore` | Maintenance, tooling, CI, dependencies |
| `docs` | Documentation only |
| `refactor` | Internal change, no behaviour change |
| `perf` | Performance improvement |
| `test` | Test-only changes |
| `build` | Build system, packaging |
| `ci` | CI configuration only |
| `revert` | Reverting an earlier change |

Scopes are optional. The convention recorded in [AGENTS.md](../AGENTS.md) is `<type>(<scope>): <subject>` and that pattern still applies — `requireScope` is set to `false` only because some tracks (e.g. cross-cutting docs PRs) genuinely have no single scope.

## typos config

`_typos.toml` lives at repo root.

- `extend-ignore-re` skips ALL-CAPS hyphenated identifiers (trace IDs like `T-AUTH-014`, implementation-log keys like `IMPL-LOG-IST-001`) and ADR numbers.
- `extend-words` allowlists project-specific terms (`Specorator`, `arc42`), domain abbreviations (`RTO`, `IST`, `ND`), tool names (`wrk`), and intentional non-words used in prose (`mis` in `mis-typed`, `criticals` in `no criticals`).
- `extend-exclude` skips generated content (`docs/scripts/**`), lock files, SVGs, and example trees.

The repo intentionally mixes British and American spellings across documents (e.g. `behaviour` in some ADRs, `synthesize` in others). Default typos behaviour is permissive on US/UK splits, so we do **not** lock a `locale`. If a project that adopts the template wants strict locale enforcement, add `[default] locale = "en-us"` (or `"en-gb"`) and run a one-shot rewrite.

If a real typo is rejected because of an allowlist entry, **delete the entry** rather than working around it — the allowlist is for surnames, brand names, intentional non-words, and identifier patterns only.

## Dependabot policy

- **github-actions:** SHA-pinned per [`security-ci.md`](security-ci.md). Dependabot bumps the SHA + version comment in lock-step. Patches and minors are grouped; majors land as separate PRs (manual review).
- **npm:** dev-dependencies only (`tsx`, `typescript`, `typedoc`). `versioning-strategy: increase-if-necessary` keeps `package.json` ranges loose; the lockfile gets the precise bump.

Both ecosystems run weekly Monday 06:00 / 06:30 UTC. The hour offset spreads PR creation so reviewers don't see a wall of bumps simultaneously.

### Release cooldown

Both blocks set `cooldown` so Dependabot waits before proposing newly published versions:

| Ecosystem | Default | Minor | Major |
| --- | --- | --- | --- |
| github-actions | 7 days | n/a | n/a |
| npm | 7 days | 3 days | 30 days |

Dependabot does not accept semver-keyed cooldowns for the github-actions ecosystem — only the flat `default-days` field is honoured there. The npm ecosystem accepts the full split.

The cooldown defends against the "compromised release window" supply-chain attack, where a hostile version is published and yanked within hours of release. By the time Dependabot proposes the bump, the ecosystem has had time to react.

## Local equivalents

```bash
# typos
typos --config _typos.toml

# Conventional Commits PR-title check has no local equivalent — read the
# rule in AGENTS.md and pick the matching type.
```

## Adopting in a downstream project

1. Replace the README badge URLs with your own repo coordinates (or remove the row).
2. Update `dependabot.yml` `directory:` if `package.json` is not at repo root.
3. Decide whether to lock a `locale` in `_typos.toml`. The template stays unlocked because it mixes en-us and en-gb spellings; a real product probably picks one.
