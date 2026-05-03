---
id: PRV-PRJ-DOMAIN-001
title: Agentic workflow — domain review passes
status: complete
created: 2026-05-04
inputs:
  - quality/project-review-2026-05/history-review.md
  - quality/project-review-2026-05/findings.md
  - quality/project-review-2026-05/web-research.md
---

# Domain review passes — agentic-workflow

These passes deepen the initial review by domain. Each pass separates observed evidence, external benchmark, deeper finding, and concrete follow-up candidate.

## Pass 1 — Governance, WIP, and Decision Flow

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Integration branch posture | Ruleset `main` applies to `refs/heads/main`, `refs/heads/develop`, and `refs/heads/demo`; PRs now target `develop` | Google engineering practices favor small, self-contained changes; branch rules should make that normal | Shape B is operationally present even while some release-branch documentation still describes v0.5 Shape A decisions. This is not a defect, but it creates reader ambiguity during transition. | Add a Shape B transition note that tells contributors which docs are current policy and which are historical release strategy. |
| Active workflow load | `npm run quality:metrics -- --json` reports 20 workflow states; active blockers in `graphify-integration`, `repo-adoption-track`, `shape-b-branching-adoption`; open clarifications in 3 active features | NIST SSDF and OWASP SAMM both frame improvement as risk-driven iteration, not unbounded parallelism | The repo has enough deterministic instrumentation to know where the backlog is unhealthy. The missing piece is an explicit WIP policy for periods when quality debt is P1. | Add a WIP burn-down checklist tied to issue #292 and `npm run quality:metrics`. |
| ADR status flow | ADR-0020 is superseded by ADR-0027; ADR-0013, ADR-0014, ADR-0022, ADR-0025, ADR-0027, and ADR-0030 remain proposed | ADR guidance from Backstage and Google Cloud treats ADRs as a history of decisions, with supersession preserved rather than deleted | Proposed ADRs are useful for in-flight design, but many proposed records in core workflow areas can make it harder to tell what is normative today. | Add a quarterly ADR status sweep, or extend `check:adr-index` to flag proposed ADRs older than a threshold. |
| Issue-first workflow | Issue #293 now owns the review backlog; PR #294 links back to it | SSDF response practices require action tracking, not just findings | The repo is using issues well for review handoff; the next maturity step is linking each accepted proposal to a child issue rather than leaving a broad umbrella issue. | Split accepted proposals from #293 into child issues after PR #294 is reviewed. |

## Pass 2 — CI Security and Supply Chain

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Workflow hardening | Workflows use SHA-pinned actions, `persist-credentials: false`, scoped `permissions`, and path-triggered actionlint/zizmor/dependency-review | GitHub Actions secure-use guidance recommends least privilege and full-length SHA pinning | The committed workflow posture is strong and should be preserved. The highest residual risk is settings drift outside YAML. | Add a repository settings evidence checklist or `check-rbac` script. |
| Scorecard | `.github/workflows/scorecard.yml` runs weekly and on push to `main`, publishes SARIF where possible | OpenSSF Scorecard is designed to surface project security-health checks | Scorecard has been adopted, but its output is advisory and currently lacks a triage artifact in this review package. | Add "Scorecard triage" to the periodic project-review checklist. |
| Code scanning | CodeQL scans `javascript-typescript` and `actions`; zizmor uploads SARIF and also gates workflow changes | GitHub code scanning and SSDF verification practices emphasize finding issues before release | Coverage is strong for a TypeScript/workflow template. The path-triggered nature is correct, but reviewers must keep treating those checks as blocking whenever they run. | Keep path-scoped checks documented as blocking; consider a ruleset evidence check when GitHub exposes path requirements consistently. |
| Dependabot and dependency review | Dependabot alerts API returned `[]`; dependency review runs on manifest, lockfile, and workflow changes | SSDF and Scorecard both value managed third-party components | The repo has good prevention and alerting. License policy remains intentionally deferred and should stay deferred until a real allow/deny policy exists. | Document an explicit "no license blocking yet" rationale in future security reviews. |
| Secret scanning | gitleaks is required; secret scanning API returned `[]`; GitGuardian also reports on PRs | GitHub secure-use guidance warns that secrets can be transformed and not always redacted | Good layered posture. The remaining risk is human/organization settings such as secret scanning availability and 2FA, which need manual evidence. | Include manual GitHub settings screenshots or API summaries in a settings review artifact. |

## Pass 3 — Release Packaging and Provenance

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Release guardrails | `release.yml` requires manual `workflow_dispatch`, typed confirm, dry-run default, readiness Layer 1 and Layer 2, staged archive, release asset attach, and package publish opt-in | SSDF release integrity and SLSA provenance emphasize controlled build inputs and reproducibility | The release flow is deliberately conservative and incident-informed. It is already stronger than many early package workflows. | Preserve the two-layer readiness model; avoid bundling release workflow changes with unrelated docs. |
| Token-based package publish | GitHub Packages publish uses `GITHUB_TOKEN` and suppresses trusted publishing audit because GitHub Packages npm does not currently support the same npmjs trusted-publishing path | npm trusted publishing recommends OIDC over long-lived tokens for npmjs.com and generates provenance for eligible public packages | The current GitHub Packages choice is defensible, but the docs should distinguish GitHub Packages from npmjs.com provenance capability so readers do not assume provenance is available automatically. | Add a release provenance decision: GitHub artifact attestation, npmjs trusted publishing migration, or explicit deferral. |
| Artifact attestation | No attestation generation was found in `release.yml`; GitHub docs support artifact attestations for build provenance | GitHub artifact attestations record repo, workflow, commit SHA, event, and OIDC-derived provenance claims | Attestation is a good next increment because the repo already produces a release tarball asset. It can be evaluated independently from changing the package registry. | Prototype attesting the tarball asset in a draft release dry run. |
| Release branch strategy | ADR-0020 is superseded by ADR-0027, but `release.yml` comments still encode v0.5 Shape A release assumptions and `--target main` | ADR supersession should preserve history while making current policy discoverable | The release workflow may intentionally still target `main`; the ambiguity is whether Shape B promotion now changes any release dispatch expectations. | Add a release flow note under Shape B: "tag and release still from `main` after promotion" or update workflow comments if policy changed. |

## Pass 4 — Quality Tooling and Parser Boundaries

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Verify reliability | First review run of `npm run verify:json` failed at `test:scripts`; reruns passed; PR #294 Verify passed; PR #291 had Verify in progress after previous failures | Quality gates are valuable only when failures are trusted | The finding should stay as a reliability signal, not an established flaky-test diagnosis. The next pass should collect repeated runs or CI job logs before changing code. | Add a verify stability issue with a reproduction matrix: OS, Node version, first run vs rerun, CI job URL. |
| Metrics maturity | `quality:metrics` reports L2 Managed, 82.6% overall score, stage-aware requirement chain coverage below 80% | SSDF/SAMM favor measurable improvement over broad assertions | The repo has enough data to make review non-subjective. The weakest current metrics are traceability coverage and active blockers/clarifications. | Save a metrics baseline with `npm run quality:metrics -- --save` after the review PR merges, then compare after burn-down. |
| Parser boundary | `parseSimpleYaml` supports a limited subset; issue #209 tracks Zod validation; specs intentionally defer parser replacement | Structured parsers and schema validation reduce silent interpretation drift | The parser should remain a small subset. The project should resist adding YAML features to the parser to satisfy one document edge case. | In #209, validate outputs with Zod and add fixtures for rejected YAML, rather than expanding parser syntax. |
| Test suite shape | `npm run test:scripts` runs 291 tests; scripts/tests count is about 100 TypeScript files | Google review guidance asks whether tests would fail when the code breaks | The script test suite is broad. The next quality gain is not raw test count; it is mutation-like confidence for validators and failure diagnostics. | Add targeted "bad fixture must fail" tests when each validator changes. |

## Pass 5 — Documentation, Adoption, and Product Surface

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Documentation architecture | `docs/how-to/`, `docs/tutorials/`, `docs/cross-tool/`, `docs/specorator-product/`, and generated script docs all exist | Diataxis distinguishes tutorials, how-to guides, reference, and explanation by user need | The categories are present; the main risk is first-time reader routing. Internal plans and superpower specs should not be the early adopter path. | Add an adopter walkthrough log and use it to prune or reroute first-read links. |
| Generated docs | `docs/scripts/**` is generated from TypeDoc and verified by `check:script-docs` | Reference docs should be optimized for scanning and random access | Generated script docs are appropriate reference material, but they should not be the primary tutorial path. | Keep script docs out of first-run tutorial flow except as "reference when needed." |
| Public product page | `sites/index.html` is part of required public surface checks | Product-facing docs should reveal actual product state, not internal implementation backlog | The page is protected by checks, but review did not run visual/browser validation in this docs-only pass. | Include product-page visual checks in any future user-visible review pass. |
| Internal planning archive | `docs/superpowers/plans/` has large TODO/deferred plans | Diataxis warns against mixing learning, task, reference, and explanation needs | The internal archive is useful to maintainers but can make the repo feel more complex than the template's public contract. | Add a "maintainer archive" label or README routing note if first-time readers land there. |

## Pass 6 — Agent/RBAC and Operational Boundaries

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Agent specialization | `docs/rbac.md` maps agent tool scopes and writes; constitution Article VI requires specialization | Least privilege and separation of duties are common security and quality controls | The repo has unusually strong agent boundary documentation. The risk is drift as new agents, skills, and bots are added. | Promote future `check-rbac.ts` when churn in agents/workflows increases. |
| Operational bots | `agents/operational/*` define prompts; `docs/rbac.md` states fail-closed credential behavior | Secure automation should fail closed and avoid broad credentials | The documented bot contract is sound. The review did not execute bot dry runs, so bot behavior remains evidence-by-docs plus tests, not live exercise. | Add bot dry-run evidence to periodic project review. |
| Local harness deny rules | `AGENTS.md`, `.codex/instructions.md`, and branching docs forbid direct integration-branch commits | Least privilege should apply to both CI tokens and local agent actions | Strong process posture. The root checkout still had an unrelated untracked `.claude/worktrees/` entry before this review, which shows local worktree hygiene needs occasional cleanup. | Run `npm run doctor` or worktree hygiene checks before large review cycles. |
| PR review loop | Codex opens PRs; PR #294 is draft and linked to issue #293 | Google review guidance stresses docs with behavior changes and careful review of generated/reference material | The PR loop is working. For deep reviews, prefer one draft PR with multiple review-pass commits over many loosely connected review comments. | Keep this PR draft until domain pass review is accepted. |

## Pass 7 — Agentic Control Plane, Bot Drift, and Issue Integrity

| Topic | Evidence | Benchmark | Deepened finding | Follow-up |
|---|---|---|---|---|
| Local command permissions | `.claude/settings.json` allowlists common git operations, denies direct pushes to `main`/`develop`, force pushes, `--no-verify`, and destructive repo deletes; its comment says permission rules are literal command-string prefix matches | OWASP LLM and Agentic AI guidance emphasizes prompt injection, excessive agency, tool access, and threat modeling | The repo already treats local agent execution as a security surface. The next maturity step is a threat model plus regression checks for known command-shape aliases and bypass cases. | Add an agentic control-plane threat model and permission-bypass fixture tests. |
| Operational bot autonomy | `issue-breakdown-bot` is headless, refuses ambiguity, uses issue-level concurrency, writes sentinel sections, and supports `DRY_RUN`; `review-bot` is read-only and only creates review issues | Agentic controls should limit agency, preserve auditability, and fail closed | The bot contracts are unusually explicit. Residual risk is not the concept of bots; it is drift between standalone prompts, interactive skills, and actual workflow behavior. | Add bot dry-run fixtures and a cross-surface drift checklist. |
| Issue mirror integrity | `issues/` is a canonical local mirror; `sync:issues` is pull-only; `check:issues` warns for missing links and hard-fails malformed frontmatter, but stays outside `verify` | SSDF/SAMM style reviews should record response and tracking evidence | The offline-safe decision is correct. Project reviews should still run issue checks as explicit evidence because stale issue metadata weakens traceability. | Add `sync:issues -- --dry-run --json` and `check:issues` to project-review handoff. |
| Release consumer evidence | Release provenance and SBOM are separate artifacts; current review found no release attestation and no SBOM posture decision | SLSA separates provenance generation, authenticity, and verification; npm and CycloneDX provide SBOM options | The release trust roadmap should avoid bundling everything into one generic "supply chain" task. Provenance answers "how was it built"; SBOM answers "what is inside it." | Record separate decisions for artifact attestation and SBOM posture. |
| First-reader routing | `docs/sink.md` is comprehensive and accurate; the adopter path lives across README, tutorials, how-to guides, and product page | Diataxis supports splitting docs by user need | The current doc set is powerful for maintainers but dense for first-time adopters. This is an information architecture risk, not a content absence. | Add a first-reader route that names what to read first and what to ignore until needed. |

## Domain pass backlog

| Priority | Backlog item | Reason |
|---|---|---|
| P1 | Verify stability investigation | Directly affects trust in the gate. |
| P1 | WIP/blocker burn-down | Reduces active process risk and review load. |
| P2 | Settings evidence checklist | Closes YAML-vs-repo-settings audit gap. |
| P2 | Release provenance decision | High leverage for supply-chain trust. |
| P2 | Shape B release-flow note | Prevents contributor confusion during branch-model transition. |
| P2 | Agentic control-plane threat model | Keeps expanding autonomous tooling inside explicit trust boundaries. |
| P2 | Operational bot dry-run and drift tests | Converts prompt-level controls into regression evidence. |
| P3 | Project-review issue mirror checks | Improves traceability without making universal verify network-dependent. |
| P3 | ADR proposed-status sweep | Improves governance hygiene without blocking current work. |
| P3 | First-time adopter walkthrough | Validates product documentation from the outside-in. |
| P3 | SBOM posture decision | Complements provenance without rushing release workflow changes. |
