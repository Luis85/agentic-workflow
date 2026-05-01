---
title: PR CI gate contract
folder: docs
description: What runs on every pull request, what blocks merge, what is deferred. Companion to verify-gate.md (local) and ci-automation.md (PR hygiene).
entry_point: false
---

# PR CI gate contract

Defines what runs on every pull request and what blocks merge. Companion to [`verify-gate.md`](verify-gate.md) (local source of truth) and [`ci-automation.md`](ci-automation.md) (PR-hygiene tooling — title check, typos, Dependabot).

This contract is the architecture output of T-V04-002. It consumes the v0.3 validation baseline confirmation produced by T-V04-001 and feeds the workflow file authored in T-V04-003 and the readiness check in T-V04-004.

## Principle

CI ≡ local. The PR CI workflow runs the same `npm run verify` script that contributors run before pushing. Any CI failure reproduces 1:1 locally with the same command. The composite stays the contract; what lives behind it is the project's choice (per [`verify-gate.md`](verify-gate.md) §Why one composite command).

## Required gate

Every pull request and every push to `main` runs `npm run verify` on a fresh `npm ci` checkout. The composite must exit zero for merge.

The following v0.3 baseline checks are the v0.3 promotion record (per SPEC-V04-007), all required, all blocking on PR:

| Check | Local repro | v0.3 source |
|---|---|---|
| Workflow-state frontmatter consistency | `npm run check:specs` | §Validation baseline, hard-fail #1 |
| Stage-progress table consistency | `npm run check:specs` | §Validation baseline, hard-fail #2 |
| Skipped-artifact `## Skips` documentation | `npm run check:specs` | §Validation baseline, hard-fail #3 |
| Examples folders contain `workflow-state.md` | `npm run check:specs` | §Validation baseline, hard-fail #4 |
| `TEST-*` references back to `REQ-*`/`NFR-*` | `npm run check:traceability` | §Validation baseline, hard-fail #5 |
| Traceability ID format / area / duplicate / unknown / invalid kind / missing `Satisfies` | `npm run check:traceability` | §Validation baseline, hard-fail #6 |

The remaining checks bundled by `npm run verify` are also blocking — they protect template surface beyond the v0.3 lifecycle work and are independently deterministic and low-noise (NFR-V04-001):

`typecheck:scripts`, `test:scripts`, `check:automation-registry`, `check:agents`, `check:links`, `check:adr-index`, `check:commands`, `check:script-docs`, `check:workflow-docs`, `check:product-page`, `check:frontmatter`, `check:obsidian`, `check:obsidian-assets`, `check:roadmaps`, `check:token-budget`.

The full ordered list lives in [`scripts/lib/tasks.ts`](../scripts/lib/tasks.ts) (`checkTasks`). Local repro for any individual check is `npm run <name>`.

## Advisory checks

None in v0.4. The advisory tier is reserved for checks that produce signal but should not block merge — e.g. metrics or readiness reports that require human judgement. v0.4 does not introduce any.

## Deferred

| Check | Reason | Re-evaluation trigger |
|---|---|---|
| Every `REQ-*`/`NFR-*` has at least one covering `TEST-*` | Test-plan format not yet locked deterministically; would block legitimate PRs (per v0.3 CLAR resolution and T-V04-001 row 7). | Test-plan format lock decision (separate v0.4 cycle action). |

## Local reproduction

Single command:

```bash
npm ci
npm run verify
```

CI runs the same two commands on a fresh checkout. Failure modes:

- **On pass:** verify prints `verify: ok in <Ns>`. CI job exits zero.
- **On fail:** verify names the failing stage, prints diagnostics, suggests the per-check repro command. CI job exits non-zero.

For narrow iteration, contributors run individual checks (`npm run check:specs`, `npm run check:traceability`, `npm run typecheck:scripts`, `npm run test:scripts`) — see [`verify-gate.md`](verify-gate.md) §This template repo for the tiered local gates (`check:fast`, `check:content`, `check:workflow`).

## False-positive guidance

Two known patterns where the validators emit diagnostics that look like false positives but are correct enforcement. Do not weaken the rule; phrase the artifact differently.

### Cross-feature ID references in narrative

The area-mismatch sub-rule in [`scripts/lib/traceability.ts`](../scripts/lib/traceability.ts) (`validateIdAreas`) flags any traceability ID in an artifact body whose area code differs from the workflow's area. This is correct: cross-area IDs cross traceability namespaces and would create a tangled dependency graph if linked.

Affected when an `implementation-log.md`, `release-notes.md`, or `retrospective.md` narrates work that references another feature's IDs (e.g. v0.4 work referencing `T-V03-003`).

**How to phrase** — use PR numbers (`v0.3 PR #95`), file paths (`specs/version-0-3-plan/release-notes.md §Validation baseline`), or non-ID prose (`v0.3 retrospective`). The traceability matrix is the place for cross-feature linkage; narrative artifacts use prose.

### Traceability IDs in fenced code blocks

`idsIn` matches IDs anywhere in a line, including inside fenced code blocks. Today no template artifact embeds raw IDs in code, so the risk is zero. If a future template change introduces that pattern (e.g. a code example that quotes a real ID), the validator will need a code-block skip.

**Action** — until a real case appears, no change. If a code example needs a real ID, fence it with a placeholder (`REQ-EXAMPLE-001`) or quote-style (`"REQ-AUTH-001"` rendered prose, not fenced).

## Workflow file contract

The PR CI workflow file lives at `.github/workflows/verify.yml`. T-V04-003 authors it; T-V04-004 verifies presence and markers via `npm run doctor`.

Required structure:

| Slot | Required value |
|---|---|
| Trigger | `pull_request` (any branch) and `push: branches: [main]` |
| Runner | `ubuntu-latest` |
| Step 1 | `actions/checkout@<SHA>` (SHA-pinned per [`security-ci.md`](security-ci.md)) |
| Step 2 | `actions/setup-node@<SHA>` with `node-version: '20'` (or `node-version-file` if a `.nvmrc` is added) |
| Step 3 | `npm ci` |
| Step 4 | `npm run verify` |
| Concurrency | `group: verify-${{ github.ref }}`, `cancel-in-progress: true` |
| Permissions | `contents: read` (least privilege) |

Fail-fast is implicit: any non-zero exit fails the job. `npm run verify` is configured to stop at the first failing check (per [`scripts/lib/tasks.ts`](../scripts/lib/tasks.ts) and the runner's behaviour) and print the reproduction command.

T-V04-004 readiness check (extends `scripts/doctor.ts`) verifies:
- File `.github/workflows/verify.yml` exists.
- Trigger contains `pull_request` and `push` to `main`.
- Steps include `npm ci` and `npm run verify`.
- `actions/checkout` and `actions/setup-node` are SHA-pinned (matches the existing security-ci pinning policy).

## Out of scope — CLAR-V04-002 disposition

CLAR-V04-002 asked whether v0.4 includes scheduled read-only health reporting. **Answer: deferred to v0.5 or later.**

- The v0.4 PRD [§Non-goals](../specs/version-0-4-plan/requirements.md#non-goals) explicitly excludes "external telemetry, hosted dashboard, or analytics service" and a "mandatory new lifecycle stage."
- v0.4 produces local + machine-readable signals: `npm run quality:metrics` (T-V04-005, ships JSON output) and the v0.5 release-quality handoff record (T-V04-012). A scheduled job consuming those signals is the natural shape for v0.5.
- A scheduled workflow today would add an unsupervised surface, contrary to NFR-V04-003 (privacy — keep local) and the process-light posture.

v0.5 (release automation) is the natural home: it can author a scheduled workflow that runs `quality:metrics --json`, archives the result, and surfaces drift. v0.4 leaves all metrics on-demand.

## Adoption in a downstream project

The contract is portable. To adopt:

1. Wire your own `verify` composite (see [`verify-gate.md`](verify-gate.md) §Adoption).
2. Mirror the workflow-file structure above with your stack's commands.
3. Decide which of your validators are required vs deferred against your equivalent of the v0.3 baseline.
4. Document false-positive guidance specific to your validators.
5. Wire a doctor-style readiness check that confirms the workflow file is present and structured.

The v0.3-baseline table is template-specific and should be replaced with the project's own check inventory.

## Refs

- T-V04-001 — v0.3 validation baseline confirmation (baseline source for §Required gate).
- T-V04-003 — implements `.github/workflows/verify.yml` against §Workflow file contract.
- T-V04-004 — extends `npm run doctor` to verify the contract markers.
- REQ-V04-001 (PR CI gates), REQ-V04-002 (preserve local-first), REQ-V04-008 (consume v0.3 baseline).
- NFR-V04-001 (deterministic, low-noise).
- SPEC-V04-001 (PR CI gate), SPEC-V04-002 (CI readiness contract), SPEC-V04-007 (v0.3 baseline promotion).
