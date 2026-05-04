---
id: PRV-PRJ-PLAN-001
title: Agentic workflow — project review plan
status: complete
created: 2026-05-04
inputs:
  - quality/project-review-2026-05/project-review-state.md
---

# Project review plan — agentic-workflow

## Review intent

- Problem: the repository has matured quickly into a workflow product with many tracks, scripts, CI gates, and operational bots; the maintainer needs a broad review that turns findings into actionable improvement work.
- Desired learning: identify what is working, what is fragile, what deviates from established practice, and which improvements should be sequenced first.
- Decisions this review should inform: near-term quality debt triage, v0.6/v0.7 readiness, branch/ruleset posture, security automation next steps, and how project reviews should recur.
- First draft PR selection criteria: documentation-only, high leverage, low blast radius, independently reviewable, and directly useful for future project reviews.

## Scope

- Included project / feature / release: repository-wide `agentic-workflow` / Specorator template.
- Review period: current repository state on 2026-05-04, with emphasis on recent merged PRs #259-#290 and open PRs/issues.
- Included branches or tags: `origin/develop`, `origin/main`, tags `v0.5.0` and `v0.5.1`.
- Included GitHub issues / PRs: open issues from `gh issue list`, recent merged PRs from `gh pr list`, open PR status rollups, latest workflow runs.
- Excluded areas: no implementation changes to product scripts or specs; no direct edits to active `specs/`; no changes to branch protection or repository settings.

## Evidence plan

| Source | Query or path | Why it matters | Status |
|---|---|---|---|
| Governance | `AGENTS.md`, `.codex/instructions.md`, `memory/constitution.md`, `.claude/memory/MEMORY.md` | Defines the expected operating contract | complete |
| Workflow definition | `docs/specorator.md`, `docs/project-review-workflow.md`, `docs/quality-framework.md`, `docs/verify-gate.md` | Baseline for stage gates and review output shape | complete |
| Git history | `git log --oneline --decorate --graph --max-count=80` | Branch hygiene, merge cadence, repeated rework | complete |
| Current workflow state | `specs/*/workflow-state.md` and `npm run self-check` | WIP, blockers, clarifications, quality score | complete |
| Verification | `npm ci`, `npm run test:scripts`, `npm run verify:json` | Local quality gate status | complete |
| GitHub PRs/issues/CI | `gh pr list`, `gh issue list`, `gh run list`, `gh api .../rulesets` | Remote governance and active delivery health | complete |
| Security posture | `.github/workflows/*`, `docs/security-ci.md`, Dependabot/code/secret scanning APIs | Supply-chain and CI risk review | complete |
| External benchmarks | GitHub Actions secure use, OpenSSF Scorecard, SLSA, NIST SSDF, Diataxis, ADR resources, Google engineering practices | Established patterns and best-practice comparison | complete |

## Review questions

- PRV-Q-001 — What repeated delivery friction appears in artifacts or history?
- PRV-Q-002 — Which workflow rules worked well and should be preserved?
- PRV-Q-003 — Which gaps should become concrete improvement proposals?
- PRV-Q-004 — Which proposal is small and valuable enough for a first draft PR?

## Issue plan

- Proposed issue title: `Project review 2026-05: repository health, risks, and improvement backlog`
- Labels: `area:docs`, `area:scripts`, `P2` where available.
- Summary sections: scope, evidence, key findings, recommended proposals, first draft PR, verification, remaining risks.

## Quality gate

- [x] Scope and exclusions are explicit.
- [x] Evidence sources are concrete and repeatable.
- [x] First draft PR criteria are stated before findings are written.
