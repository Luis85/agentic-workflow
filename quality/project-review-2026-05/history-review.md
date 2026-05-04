---
id: PRV-PRJ-HIST-001
title: Agentic workflow — history review
status: complete
created: 2026-05-04
inputs:
  - quality/project-review-2026-05/review-plan.md
---

# History review — agentic-workflow

## Git history summary

- Range reviewed: recent first-parent and side-branch history visible from `origin/develop` through `git log --oneline --decorate --graph --max-count=80`.
- Commit count: 80 commits sampled.
- Merge count: high. Recent history is dominated by PR merges, which matches the repo rule that all changes land through topic branches.
- Revert / fix-forward count: no formal `revert` commits in the sampled range; multiple fix-forward commits on active branches, especially around CI hardening, link cleanup, branch guard behavior, and issue sync.
- Release tags: `v0.5.1`, `v0.5.0`, `v0.4.0`.
- Notable branch patterns: recent PRs generally use clear prefixes (`ci/`, `docs/`, `feat/`, `fix/`, `chore/`). Shape B adoption is partly in flight: rulesets cover `main`, `develop`, and `demo`; open PRs target `develop`.

## Artifact review

| Artifact | Signal | Evidence | Notes |
|---|---|---|---|
| `AGENTS.md` | Strong single-source project contract | Root instructions define read-first files, traceability, worktrees, PR workflow, and no direct integration-branch commits | Healthy. The repo is unusually explicit about agent operating boundaries. |
| `.codex/instructions.md` | Codex-specific process aligns with root rules | Requires fresh worktree, `npm ci`, verification, commit, push, draft PR | Healthy and actionable. |
| `docs/project-review-workflow.md` | Review workflow exists and defines durable artifacts | Requires state, plan, history, findings, proposals, issue, and draft PR | This review dogfoods that flow. |
| `docs/security-ci.md` and workflows | CI security posture is recently hardened | Workflows use SHA-pinned actions, least-privilege `permissions`, actionlint, zizmor, CodeQL, gitleaks, dependency-review, Scorecard | Strong for a template repository. |
| `specs/*/workflow-state.md` | WIP and blocker pressure | `npm run self-check` reported 20 workflow states, 82.6% workflow score, 3 active blockers, and open clarifications in 3 features | Biggest process risk is concurrency/WIP, not missing process. |
| `docs/how-to/` | Diataxis-style user docs exist | 15 how-to pages plus README | Good direction; remaining risk is uneven graduation from internal plans to user-facing how-to/tutorial content. |

## Pull request and issue review

| Item | Signal | Evidence | Notes |
|---|---|---|---|
| Recent PRs #267-#290 | High delivery cadence | `gh pr list --state merged --limit 30` returned many same-day merged PRs across CI, docs, workflow, security, and feature planning | Throughput is high, but review load and active branch count are also high. |
| PR #291 | Current integration risk | `gh pr list --state open` showed `Verify` failing while other security/hygiene checks passed | Confirms quality gate reliability or feature-branch drift needs active attention. |
| Issue #292 | Existing priority recognizes quality debt | Title: "Block feature work until quality tooling is debt-free"; labels include `P1`, `area:ci`, `area:scripts` | Aligns with this review's recommendation to reduce WIP until quality gate is stable. |
| Issue #255 | Shape B branching is live work | Open P1 roadmap issue for `develop/main/demo` | Ruleset already covers all three branches; docs still contain some Shape A/v0.5 language that can confuse readers. |
| Issue #209 | Parser validation work is deferred | Open P2 v0.7.1 issue for Zod runtime validation | Valid follow-up; current `parseSimpleYaml` remains intentionally limited and should not be expanded casually. |

## CI and verification review

| Check | Pattern | Evidence | Notes |
|---|---|---|---|
| Local install | Pass | `npm ci` added 30 packages, audit found 0 vulnerabilities | Good baseline. |
| Local verify | Initially flaky, then pass | First `npm run verify:json` failed in `test:scripts`; subsequent `npm run test:scripts` and `npm run verify:json` passed without edits | Treat as reliability risk until another run or CI confirms. |
| GitHub ruleset | Active and broad | `gh api repos/Luis85/agentic-workflow/rulesets/15593441` shows active ruleset over `main`, `develop`, and `demo`, PR required, up-to-date required, resolved threads required, required checks configured | Strong setting-level control. |
| Branch protection API | 404 | `gh api repos/.../branches/main/protection` returned "Branch not protected" | Not a contradiction: repository uses rulesets, not legacy branch protection. Docs should keep that distinction clear. |
| Dependabot alerts | Clear | `gh api .../dependabot/alerts` returned `[]` | Good current signal. |
| Code scanning alerts | Clear | `gh api .../code-scanning/alerts` returned `[]` | Good current signal; depends on CodeQL/zizmor uploads continuing. |
| Secret scanning alerts | Clear | `gh api .../secret-scanning/alerts` returned `[]` | Good current signal. |

## External benchmark review

| Source | Relevant standard | Comparison |
|---|---|---|
| GitHub Actions secure use | Least privilege for `GITHUB_TOKEN`, SHA-pinned actions, handling untrusted input safely | Repo aligns well: pinned `uses:` refs, permissions blocks, `pull_request` instead of `pull_request_target` for PR-title check, zizmor/actionlint gates. |
| OpenSSF Scorecard | Weighted security-health checks and maintainer 2FA recommendation | Repo has added Scorecard. Human/organization controls such as 2FA remain outside committed evidence and should be explicit in settings review. |
| SLSA Build levels | Provenance exists at L1; hosted signed provenance at L2 | Release archive and readiness are strong, but package provenance/attestation is not yet visible as a consumer-facing release artifact. |
| NIST SSDF | Prepare, Protect, Produce, Respond; risk-based continuous improvement | Repo maps strongly to Prepare/Produce through docs, quality gates, and traceability. Respond-to-vulnerabilities process is partly present through alerts and dependency review but could use a clearer issue/incident playbook. |
| Diataxis | Four user needs: tutorials, how-to, reference, explanation | Repo has how-to/reference/explanation material; first-run tutorial proof remains a useful adoption gap to close. |
| ADR guidance | ADRs preserve architectural rationale | Repo uses numbered ADRs heavily and keeps an ADR index; status consistency and supersession discipline should remain review targets. |
| Google engineering practices | Self-contained changes and public review guidance | Repo aligns through one concern per branch and PR-title gates; recent parallel PR volume suggests a need for WIP limits or batch review discipline. |

## Repeated-change hotspots

| Surface | Pattern | Evidence | Notes |
|---|---|---|---|
| `.github/workflows/` | Repeated hardening and permission tuning | Recent PRs #268-#290 | Positive, but workflow changes need continued path-scoped mandatory review. |
| `scripts/` and `tests/scripts/` | Expanding validation surface | 100 TypeScript files in scripts/tests; verify now covers many content and workflow checks | Strong investment; parser/schema consistency remains the main technical debt. |
| `docs/superpowers/plans/` | Large internal planning backlog | TODO/deferred matches and token-budget continuation plan | Useful context, but heavy internal plans can dilute adopter-facing docs. |
| `specs/*/workflow-state.md` | Many active workflows | 12 active or paused specs among 20 workflow states | WIP pressure is the strongest process finding. |

## Unknowns

- [x] PRV-UNK-001 — Whether the initial local `verify:json` failure is a true flaky test or an environmental/transient process artifact. Evidence: pass on rerun, but remote PR #291 also has `Verify` failures.
- [x] PRV-UNK-002 — Whether all GitHub organization/user-level controls are configured, especially maintainer 2FA and repository Actions policies. These are not fully represented in committed files.
- [x] PRV-UNK-003 — Whether release provenance/attestation is intentionally deferred or simply not specified yet.

## Quality gate

- [x] Every claim links to a source path, commit, issue, PR, command result summary, or external benchmark source.
- [x] Evidence and inference are separated.
- [x] Unknowns are named instead of filled by guesswork.
