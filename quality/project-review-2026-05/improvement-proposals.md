---
id: PRV-PRJ-PROP-001
title: Agentic workflow — improvement proposals
status: complete
created: 2026-05-04
inputs:
  - quality/project-review-2026-05/findings.md
---

# Improvement proposals — agentic-workflow

## Recommendation summary

- Recommended first draft PR: this PR, adding the repository-wide review artifacts and creating a tracking issue.
- Tracking issue: [#293 — Project review 2026-05: repository health, risks, and improvement backlog](https://github.com/Luis85/agentic-workflow/issues/293)
- Deferred proposals: verify flake investigation, WIP/clarification burn-down, settings audit automation, release provenance, parser boundary hardening, adopter-docs graduation.

## Proposals

### PRV-PROP-001 — Keep the project review as a durable quality artifact

- Problem: repository-wide reviews can disappear into chat unless captured as repeatable artifacts.
- Evidence: `docs/project-review-workflow.md` already defines a review sink; this review produced actionable findings across process, CI, docs, and settings.
- Expected benefit: creates a repeatable baseline for future project reviews and gives GitHub issues/PRs concrete evidence to link.
- Affected surfaces: `quality/project-review-2026-05/`, GitHub issue, draft PR.
- Effort: small.
- Risk: low; documentation-only.
- Owner: project reviewer / maintainer.
- Success signal: issue and draft PR are linked, review artifacts pass `npm run verify:json`.
- First draft PR candidate: yes.
- Proposed branch: `docs/project-review-2026-05`.
- Proposed PR title: `docs(quality): add 2026-05 project review`.
- Verification: `npm ci`, `npm run test:scripts`, `npm run verify:json`.

### PRV-PROP-002 — Investigate and stabilize the verify failure pattern

- Problem: a gate that sometimes fails then passes without changes weakens the "verify before push" contract.
- Evidence: first local `npm run verify:json` failed at `test:scripts`; reruns passed; GitHub PR #291 showed failing `Verify`.
- Expected benefit: restores confidence that failures represent code or artifact defects, not non-determinism.
- Affected surfaces: `scripts/test-scripts.ts`, relevant test fixtures, CI logs.
- Effort: medium.
- Risk: medium; fix may touch shared test runner behavior.
- Owner: script tooling maintainer.
- Success signal: repeated `npm run verify:json` passes locally and on CI; failure mode has a tracked root cause or a fixed test.
- First draft PR candidate: no.
- Proposed branch: `fix/verify-stability`.
- Proposed PR title: `fix(verify): stabilize script test gate`.
- Verification: repeated `npm run verify:json`; CI Verify on PR; targeted failing test reruns.

### PRV-PROP-003 — Enforce a temporary WIP burn-down before new feature expansion

- Problem: active workflow count, blockers, and clarifications are higher than the current process can comfortably absorb.
- Evidence: `npm run self-check` reported 20 workflow states, 3 blockers, open clarifications in 3 features, and issue #292 already asks to block feature work until tooling debt is cleared.
- Expected benefit: reduces context churn, shortens review queues, and makes release readiness easier to judge.
- Affected surfaces: GitHub issues #292, #255, #209, open PRs, active `specs/*/workflow-state.md`.
- Effort: medium.
- Risk: medium; may delay feature work.
- Owner: maintainer / roadmap manager.
- Success signal: zero active blockers, no unresolved open clarifications in active specs, and self-check score trending upward.
- First draft PR candidate: no.
- Proposed branch: `docs/wip-burn-down-plan`.
- Proposed PR title: `docs(quality): add WIP burn-down plan`.
- Verification: `npm run self-check`; `npm run quality:metrics`.

### PRV-PROP-004 — Add a settings evidence checklist or `check-rbac` follow-up

- Problem: GitHub rulesets, Pages, Dependabot alerts, Code Security, secret scanning, and maintainer 2FA are not fully represented by committed YAML.
- Evidence: docs already list required settings; ruleset API confirms active rules for `main`, `develop`, `demo`; branch protection endpoint returns 404 because rulesets are used instead of legacy protection.
- Expected benefit: closes the gap between documented security posture and audit evidence.
- Affected surfaces: `docs/rbac.md`, `docs/security-ci.md`, optional `scripts/check-rbac.ts`.
- Effort: medium.
- Risk: low to medium depending on automation depth.
- Owner: security / tooling maintainer.
- Success signal: one command or checklist records settings evidence with dates and API commands.
- First draft PR candidate: no.
- Proposed branch: `docs/settings-evidence-checklist`.
- Proposed PR title: `docs(security): add repository settings evidence checklist`.
- Verification: `npm run check:links`; API command dry-run.

### PRV-PROP-005 — Add release provenance or an explicit SLSA posture decision

- Problem: release composition is controlled, but consumers do not yet receive clear provenance/attestation evidence.
- Evidence: SLSA Build L1 expects provenance describing build platform, process, and inputs; current release flow builds a staged archive but no explicit provenance artifact was found.
- Expected benefit: improves supply-chain transparency and complements existing Scorecard/CodeQL/dependency-review controls.
- Affected surfaces: `.github/workflows/release.yml`, `docs/release-operator-guide.md`, `docs/release-readiness-guide.md`, possibly ADR.
- Effort: medium to large.
- Risk: medium; release automation is sensitive.
- Owner: release manager / security maintainer.
- Success signal: release artifacts include provenance or docs record an explicit deferral with rationale.
- First draft PR candidate: no.
- Proposed branch: `docs/release-provenance-decision`.
- Proposed PR title: `docs(release): record SLSA provenance posture`.
- Verification: release dry-run, `npm run check:release-readiness`, `npm run verify:json`.

### PRV-PROP-006 — Keep parser hardening scoped and do not expand `parseSimpleYaml`

- Problem: a custom YAML subset parser is useful but easy to overextend.
- Evidence: `scripts/lib/repo.ts` implements `parseSimpleYaml`; issue #209 tracks Zod validation; specs explicitly defer replacing the YAML boundary.
- Expected benefit: prevents subtle state-file parsing bugs while preserving current lightweight tooling.
- Affected surfaces: issue #209, `scripts/lib/repo.ts`, `scripts/lib/*` validators.
- Effort: medium.
- Risk: medium; parser changes can affect many checks.
- Owner: script tooling maintainer.
- Success signal: schema validation improves around parser outputs without increasing the parser's accepted YAML surface.
- First draft PR candidate: no.
- Proposed branch: `feat/zod-parser-boundaries`.
- Proposed PR title: `feat(scripts): validate parser boundaries with zod`.
- Verification: `npm run test:scripts`; parser fixture tests; `npm run verify:json`.

### PRV-PROP-007 — Run a first-time adopter documentation walkthrough

- Problem: the repo contains strong internal process documentation, but adopter-facing guidance still needs proof from an external user's path.
- Evidence: Diataxis-aligned docs exist; `docs/tutorials/first-feature.md` and `docs/how-to/` are present; internal plans remain extensive.
- Expected benefit: clarifies what a new user should read, run, and ignore during first adoption.
- Affected surfaces: `docs/tutorials/first-feature.md`, `docs/how-to/`, `README.md`, `sites/index.html`.
- Effort: medium.
- Risk: low.
- Owner: docs maintainer.
- Success signal: a clean-room walkthrough produces no missing-step issues or produces filed follow-ups.
- First draft PR candidate: no.
- Proposed branch: `docs/adopter-walkthrough`.
- Proposed PR title: `docs(onboarding): record first-time adopter walkthrough`.
- Verification: `npm run check:content`; manual walkthrough log.

## Issue body draft

```markdown
## Project review

Scope: repository-wide review of `agentic-workflow` / Specorator as of 2026-05-04, covering governance, workflow state, git/GitHub history, CI/security posture, docs, release process, and external benchmarks.

Key learnings:
- Strong governance, traceability, CI security, and release-surface discipline are worth preserving.
- Main risks are WIP/clarification load, verify reliability, settings evidence gaps, release provenance, parser boundary debt, and adopter-doc graduation.

Improvement proposals:
- Keep this project review as a durable quality artifact.
- Investigate the verify pass-after-fail pattern.
- Burn down active blockers and clarifications before expanding feature work.
- Add repository settings evidence or `check-rbac` automation.
- Record or implement release provenance/SLSA posture.
- Keep parser hardening scoped around `parseSimpleYaml`.
- Run a first-time adopter documentation walkthrough.

First draft PR: <PR URL after creation>

Verification:
- `npm ci`
- `npm run test:scripts`
- `npm run verify:json`

Remaining risks:
- Review is broad but not an exhaustive static analysis of every artifact.
- Some GitHub settings require maintainer confirmation outside committed files.
```

## Quality gate

- [x] At least one proposal is small enough for a draft PR.
- [x] Every proposal links back to at least one finding.
- [x] Governance or constitution changes are explicitly escalated instead of silently applied.
