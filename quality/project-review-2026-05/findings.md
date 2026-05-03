---
id: PRV-PRJ-FIND-001
title: Agentic workflow — project review findings
status: complete
created: 2026-05-04
inputs:
  - quality/project-review-2026-05/history-review.md
---

# Project review findings — agentic-workflow

## Strengths to preserve

| ID | Finding | Evidence | Why it matters |
|---|---|---|---|
| PRV-STR-001 | The repo has a clear agent operating constitution and cross-tool contract. | `AGENTS.md`, `memory/constitution.md`, `.codex/instructions.md` | Reduces ambiguous agent behavior and makes reviewable autonomy possible. |
| PRV-STR-002 | The CI/security posture is stronger than typical early template repos. | SHA-pinned workflow actions, scoped `permissions`, actionlint, zizmor, CodeQL, gitleaks, dependency-review, Scorecard | Aligns with GitHub Actions hardening, OpenSSF Scorecard, and NIST SSDF Protect/Produce expectations. |
| PRV-STR-003 | Quality is increasingly measurable. | `npm run self-check` reported quality metrics, learning evidence, blockers, clarifications, and maturity level | Gives maintainers a concrete way to prioritize instead of relying on intuition. |
| PRV-STR-004 | The release package has a deliberate fresh-surface contract. | `scripts/build-release-archive.ts`, `scripts/release-prepack-guard.mjs`, release package tests | Reduces the risk of shipping internal/template-development noise to adopters. |
| PRV-STR-005 | Documentation architecture is moving toward adopter needs. | `docs/how-to/`, `docs/tutorials/`, `docs/cross-tool/`, Diataxis-inspired plans | Makes the workflow product easier to adopt beyond the original maintainer. |

## Friction and risks

| ID | Finding | Evidence | Severity | Notes |
|---|---|---|---|---|
| PRV-FRC-001 | Active workflow WIP is too high for the current quality gate capacity. | `npm run self-check` scanned 20 workflow states, reported 3 blockers, open clarifications in 3 active features, and an 82.6% workflow score | S2 | Issue #292 already recognizes this as quality debt. This is the top process risk. |
| PRV-FRC-002 | The verify gate showed a pass-after-fail pattern during review. | First `npm run verify:json` failed at `test:scripts`; later `npm run test:scripts` and `npm run verify:json` passed without code changes; open PR #291 had failing `Verify` | S2 | Not enough evidence to name a root cause, but this undermines "verify before push" confidence. |
| PRV-FRC-003 | Shape B is partly adopted, while some docs still preserve Shape A/v0.5 release language. | `docs/branching.md` covers both shapes; ruleset applies to `main`, `develop`, `demo`; issue #255 remains open | S3 | The coexistence is intentional, but downstream readers may confuse integration and release branch expectations. |
| PRV-FRC-004 | GitHub settings are documented but not fully machine-audited. | `docs/security-ci.md` and `docs/rbac.md` list settings; `gh api .../rulesets` confirms current ruleset; future `check-rbac.ts` is deferred | S3 | Repository rulesets, Pages, Code Security, 2FA, and alerts are partially outside committed YAML. |
| PRV-FRC-005 | Release provenance/attestation is not yet a visible release artifact. | SLSA comparison: release workflow builds packages and guards staging, but no consumer-facing provenance/attestation was found in docs or workflow output | S3 | SLSA L1 provenance would complement the existing release-readiness model. |
| PRV-FRC-006 | The script layer still contains a hand-rolled YAML subset parser. | `scripts/lib/repo.ts#parseSimpleYaml`; issue #209 tracks Zod runtime validation; specs explicitly defer broader parser replacement | S3 | Current tests cover many cases, but YAML behavior is a known boundary and should not accrete more responsibility. |
| PRV-FRC-007 | Internal plans and superpower specs risk crowding adopter-facing documentation. | Large `docs/superpowers/plans/` and many TODO/deferred planning references | S4 | Not broken, but release/archive docs should keep shielding adopters from internal backlog volume. |
| PRV-FRC-008 | Proposed ADRs in core workflow areas need regular status review. | `rg` found proposed ADRs including ADR-0013, ADR-0014, ADR-0022, ADR-0025, ADR-0027, and ADR-0030; ADR-0020 is superseded by ADR-0027 | S3 | Proposed ADRs are fine while a track is in motion; they become confusing if downstream docs treat them as settled policy. |
| PRV-FRC-009 | Release provenance has two different paths that should not be conflated. | `release.yml` targets GitHub Packages with `GITHUB_TOKEN`; npm trusted publishing/provenance guidance applies to eligible npmjs.com public packages; GitHub artifact attestations can cover build assets | S3 | The next decision should distinguish GitHub artifact attestation from npmjs.com trusted publishing. |

## Root-cause hypotheses

| ID | Hypothesis | Evidence | Confidence | What would confirm or falsify it |
|---|---|---|---|---|
| PRV-RC-001 | Recent hardening work improved safety but created a temporary queue of active branches and compatibility fixes. | PRs #267-#290 show dense same-day CI/security/workflow activity and multiple follow-up fixes | medium | Confirm by reviewing merged PR comments and CI failure logs; falsify if failures cluster in unrelated features. |
| PRV-RC-002 | The quality gate may contain order-sensitive or environment-sensitive tests. | `verify:json` failed once in `test:scripts`; direct reruns passed | low | Confirm with repeated local/CI runs and log collection; falsify if the first failure was due to a stale dependency/process artifact. |
| PRV-RC-003 | The repo is crossing from "template under construction" into "product for adopters," but some docs still speak to maintainers first. | How-to/tutorial work exists; internal plans remain extensive; release archive stubs internal docs | medium | Confirm through a first-time adopter walkthrough. |
| PRV-RC-004 | Settings and ADR drift are becoming review problems because the repo has more policy surfaces than committed checks can currently prove. | `docs/rbac.md` lists future `check-rbac.ts`; rulesets are API-backed; ADR status sweep is manual | medium | Confirm if future reviews repeatedly find stale settings or proposed ADR ambiguity; falsify if upcoming PRs add automated checks. |

## External benchmark alignment

- GitHub Actions secure use recommends least privilege and full-length SHA pinning for third-party actions. The repo mostly aligns through pinned `uses:` references and scoped token permissions.
- NIST SSDF emphasizes risk-based continuous improvement rather than checklist theater. The repo aligns through quality metrics and self-check, but should explicitly connect quality debt issues to corrective action closure.
- OpenSSF Scorecard is now present; maintainer account/organization controls such as 2FA still need periodic manual evidence because they are not encoded in the repo.
- SLSA provenance is a logical next step for the release package because the repo already treats release composition as a controlled build artifact.
- Diataxis supports the direction of separating tutorials, how-to guides, reference, and explanation; the repo should keep promoting proven internal plans into adopter-facing docs only when they answer a user need.
- GitHub artifact attestations and npm provenance both support stronger release trust, but they answer different deployment shapes. Artifact attestations fit the current tarball-release asset; npm trusted publishing fits a future npmjs.com publication path.
- OWASP SAMM supports using this review as an iterative maturity pass: record current state, choose a few next improvements, and measure again.

## Open questions

- [ ] PRV-Q-001 — Should release provenance/attestation be a v0.6/v0.7 requirement or deferred until the package publication flow is stable?
- [ ] PRV-Q-002 — Should Shape B documentation become the default now that the ruleset covers `develop`, or should docs continue presenting Shape A as the v0-v1 recommendation?
- [ ] PRV-Q-003 — What WIP limit should apply to active specs during quality debt periods?
- [ ] PRV-Q-004 — Should `check-rbac.ts` become part of v0.7 once the current settings baseline settles?
- [ ] PRV-Q-005 — Which proposed ADRs should be accepted, superseded, or explicitly kept proposed before the next release?
- [ ] PRV-Q-006 — Should release provenance start with GitHub artifact attestation for the tarball, or with a registry strategy decision for npm trusted publishing?

## Quality gate

- [x] Findings distinguish evidence from inference.
- [x] Each S1/S2 item has an owner or escalation path.
- [x] Findings do not prescribe solutions before proposals are ranked.
