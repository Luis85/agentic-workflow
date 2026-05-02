---
id: REVIEW-V05-001
title: Version 0.5 release and distribution plan — Review
stage: review
feature: version-0-5-plan
status: complete
owner: reviewer
inputs:
  - PRD-V05-001
  - DESIGN-V05-001
  - SPECDOC-V05-001
  - TASKS-V05-001
  - IMPL-LOG-V05-001
  - TESTPLAN-V05-001
  - TESTREPORT-V05-001
  - PKG-CONTRACT-V05-001
created: 2026-05-02
updated: 2026-05-02
---

# Review — Version 0.5 release and distribution plan

## Verdict

- [x] Approved with conditions — proceed to release once the two Decider-owned items in §Recommendation close. Technical work is green; remaining blockers belong to the human Decider, not to dev/qa/release-manager.
- [ ] Approved — proceed to release.
- [ ] Blocked — must address before release.

The work landed clean on `origin/main` at SHA `302c4a6` (PR #202 merge). All 18 verify gates pass (14.6 s); 94/94 release-surface tests pass (re-run by reviewer); quality metrics report `overallScore 97.1`, maturity level 3 (Traceable), zero blockers, one open clarification (CLAR-V05-003 — Decider-blocked, expected). DEFECT-V05-001 (the Stage 8 defect raised by qa) was resolved on the technical surface across 6 review-fix rounds on PR #202, and the build-time-transform path now produces a fresh-surface staged tree that satisfies SPEC-V05-010 against the actual `package.json#files` allowlist. The remaining open items are not technical — they are CLAR-V05-003 (draft/pre-release vs stable for the first publish) and the operator-authorised `gh workflow run` dispatch (Article IX), both of which are by design out of agent scope and require explicit human authorisation.

## Requirements compliance

Every functional requirement has a downstream chain (Spec → Task(s) → Code → Test). Every NFR has surface evidence and at least one structural test. The single pending verification — REQ-V05-006 (publish from authorized release run) — is acknowledged as a coverage gap that can only close with operator-authorised live infrastructure.

| REQ ID | Satisfied? | Evidence |
|---|---|---|
| REQ-V05-001 | Satisfied | SPEC-V05-001, T-V05-001, ADR-0020 (`accepted`), `docs/branching.md`. Doc review passes (TEST-V05-001). |
| REQ-V05-002 | Satisfied | SPEC-V05-002, T-V05-006, `.github/workflows/release.yml` lines 17–48 (workflow_dispatch only) + 62–64 (least-privilege top-level permissions) + 160–169 (confirm gate). Layer 1 readiness asserts `WORKFLOW_PERMISSIONS` (test scenario 5). TEST-V05-002 + TEST-V05-002-NFR. |
| REQ-V05-003 | Satisfied | SPEC-V05-003, T-V05-003 + T-V05-006, `.github/release.yml`, `.github/workflows/release.yml` step 9a `gh release create … --verify-tag --generate-notes`. Layer 1 `RELEASE_READINESS_RELEASE_YML_*` shape check + scenario 3/3b/3c tests. |
| REQ-V05-004 | Satisfied | SPEC-V05-003, T-V05-003, `.github/release.yml` (11 categories, 3 excluded labels, dependabot/github-actions excluded). |
| REQ-V05-005 | Satisfied | SPEC-V05-004 + SPEC-V05-010, T-V05-002 + T-V05-007 + T-V05-012 + T-V05-013, `package-contract.md` (PKG-CONTRACT-V05-001) + ADR-0021 (`accepted`) + `package.json` v0.5 identity fields + `scripts/lib/release-package-contract.ts`. TEST-V05-005 + TEST-V05-012. |
| REQ-V05-006 | Satisfied with operator follow-up | SPEC-V05-004, T-V05-007, `.github/workflows/release.yml` step 10 (npm publish gated on `! dry_run && publish_package`, idempotency guard, scope-mapped `~/.npmrc`). Live exercise (TEST-V05-006) requires operator-authorised dispatch — Article IX. Coverage gap acknowledged in `test-report.md` §10. |
| REQ-V05-007 | Satisfied | SPEC-V05-005, T-V05-004 + T-V05-005, `scripts/check-release-readiness.ts` + `scripts/lib/release-readiness.ts` + 26 unit tests in `tests/scripts/release-readiness.test.ts`. TEST-V05-007 deterministic. |
| REQ-V05-008 | Satisfied | SPEC-V05-006, T-V05-008, `docs/release-operator-guide.md` (11 sections, six-input table, six-scenario recovery matrix). Internal consistency confirmed by qa (TEST-V05-008 + TEST-V05-005-NFR). |
| REQ-V05-009 | Satisfied | SPEC-V05-007, T-V05-009, `README.md` + `docs/specorator.md` §3.10 + `docs/release-package-contents.md` + `sites/index.html` (FAQ + step 1). `check:public-surfaces` green. |
| REQ-V05-010 | Satisfied | SPEC-V05-008, T-V05-004, `scripts/lib/release-readiness.ts` quality-signal layer + waiver path + 3 quality unit tests. TEST-V05-010 deterministic (3 commands; waiver path confirmed). |
| REQ-V05-011 | Satisfied with operator follow-up | SPEC-V05-009, T-V05-006 + T-V05-010, `.github/workflows/release.yml` step 9b dry-run path + `dry_run: true` default + `publish_package: false` default. Local TEST-V05-011 green; remote dry-run dispatch is operator-authorised. |
| REQ-V05-012 | Satisfied | SPEC-V05-010, T-V05-002 + T-V05-012 + T-V05-013, `scripts/build-release-archive.ts` + `scripts/lib/release-archive-builder.ts` + `scripts/lib/release-stubify.ts` + `scripts/lib/release-package-contract.ts` + `scripts/release-prepack-guard.mjs` + `scripts/lib/release-staging-safety.ts` + `.github/workflows/release.yml` step 5/6/10. ADR-0021 (`accepted`). Defence-in-depth verified: builder + prepack guard + staged marker + safety guard. 18-test contract suite + 13 archive-builder + 19 stubify + 13 staging-safety + 5 prepack-guard tests = 68 v0.5 fresh-surface tests. |

| NFR ID | Surface | Evidence |
|---|---|---|
| NFR-V05-001 | Least-privilege publish | `.github/workflows/release.yml` `permissions: { contents: write, packages: write }`; `RELEASE_READINESS_WORKFLOW_PERMISSIONS` test scenarios 5/5b/5d/5e. |
| NFR-V05-002 | Reproducibility / traceability | Single `vX.Y.Z` resolves tag, GitHub Release, GitHub Packages version, and release asset (npm publish + gh release upload of the byte-identical staged tarball). |
| NFR-V05-003 | Maintainability | TypeScript scripts + lib boundary + typedoc shells regenerated; new entries in `tools/automation-registry.yml`. |
| NFR-V05-004 | Operator usability | `docs/release-operator-guide.md` is runnable end-to-end (qa confirmed §7.1 internal consistency; round-1 P1 fix forced manual recovery commands rather than a workflow rerun). |
| NFR-V05-005 | Recoverability | `gh release upload --clobber` (idempotent), `npm publish` `npm view` exit-code + stderr branch (idempotent rerun), `gh release create` documented as non-idempotent with manual recovery commands provided. Subshell + trap credential cleanup in §7.1 (rounds 3–4). |

## Design compliance

Implementation honours `DESIGN-V05-001`. Specifically:

- **Branch model.** Shape A with explicit `release/vX.Y.Z` branches accepted via ADR-0020; `develop` not introduced. Matches design recommendation.
- **Release workflow model.** All 8 design steps land in `.github/workflows/release.yml` (manual dispatch → readiness → archive build → Layer 2 → confirm gate → release create / dry-run preview → npm publish → asset upload). Tag-at-main check delegated to Layer 1 readiness rather than duplicated, per design.
- **Release candidate path.** Dry run / draft / prerelease all available; default for `dry_run` is `true`, default for `publish_package` is `false`, so a candidate run cannot accidentally publish.
- **Package contract model.** All seven decisions resolved in `package-contract.md`; ADR-0021 captures the fresh-surface contract; OQ-V05-001 (visibility) and OQ-V05-002 (`files` glob) were deferred at draft time — OQ-V05-002 closed by the v0.5 identity adoption in T-V05-007; OQ-V05-001 implicitly resolved by the public repo and `publishConfig.access: "public"`. OQ-V05-003 (manual stub-form packaging) closed by T-V05-013.
- **Build-time transform pattern (T-V05-013 design subsection, lines 88–108).** All five pipeline steps land: file allowlist via `npm pack --dry-run --json --ignore-scripts`; classifier (skip / stubify / copy); pure stubify transform; staged tree under `.release-staging/`; `npm pack ./.release-staging`. Defence-in-depth via prepack guard + staging marker + safety guard exactly as designed (rounds 1–6 made the layering more correct, not different).
- **Affected surfaces table.** Every row in design lines 110–131 has a corresponding code or doc surface in the diff.

No design drift detected. The round-1 → round-6 evolution on PR #202 is consistent with the design — round-2 added the prepack guard and safety guard (defence-in-depth, design line 106 / 128–130); round-3 fixed a chicken-and-egg interaction with the guard (`--ignore-scripts`); round-4 propagated the build-time-transform shape into the operator runbook §7.1 / §9 (consistent with design line 92 promise that the transform is pre-pack); round-5 attempted a non-destructive mode (`--no-clean`); round-6 correctly removed it because `package.json#files` whitelists whole directories so there is no safe non-destructive semantic. Removing `--no-clean` is the right design — the CLI now produces a deterministic mirror, never a stale tree.

## Spec compliance

Every SPEC-V05-* item has a downstream task and a passing test. Material deviations:

- **None.** No deviations recorded in `implementation-log.md` deviations table; the only "new" requirement was `REQ-V05-012` (fresh-surface contract), which was correctly handled per Article X (Iteration) — requirements/spec/design updated **before** implementation, ADR-0021 filed, no silent invent.

The four edge cases enumerated in SPEC-V05-010 are all defended:

1. Maintainer accidentally adds a feature folder under `specs/` → assertion 2 catches before publish.
2. New intake folder added → maintenance rule documented; readiness is the backstop only for the enumerated set (a known limitation, called out).
3. Doc page added without stub form → build-time transform stubifies it automatically; assertion 3 fails closed if stub template is missing.
4. ADR file lands between readiness and publish → workflow re-runs Layer 2 against the *final* archive in step 6 before publish, not against an earlier readiness result.

## Constitution check

Each article checked against the diff:

- **I — Spec-driven.** Every code surface traces back to a spec item. The post-implementation REQ-V05-012 escalation followed the article: spec updated *before* code (ADR-0021 + REQ-V05-012 + SPEC-V05-010 + TEST-V05-012 landed in PR #157, then the script in PR #173, then the readiness composition in PR #158).
- **II — Separation of concerns.** Each PR is owned by a single agent class (architect / pm / dev / qa / release-manager / orchestrator for review-fixes). No code in research; no requirements changes during implementation except via the formal Article X iteration loop.
- **III — Incremental progression.** PR DAG is correct: T-V05-001 + T-V05-003 → T-V05-002 + T-V05-012 → T-V05-004 + T-V05-005 → T-V05-006 → T-V05-007 → T-V05-008 + T-V05-009 → T-V05-010 + T-V05-011 → T-V05-013. Round-1 P2 on PR #157 corrected the DAG so T-V05-004 depends on T-V05-012 — i.e. readiness cannot pass before the fresh-surface assertions are wired.
- **IV — Quality gates.** All 18 verify gates green. Two-layer validation honoured: deterministic checks (typecheck, tests, schema, link, traceability, frontmatter) + critic-agent review (Codex on every PR; the round-by-round narrative shows real findings, not rubber-stamping).
- **V — Traceability.** Every artifact links upstream. Some downstream — see traceability matrix. No requirement is orphan; no test is orphan.
- **VI — Agent specialisation.** Boundaries respected. Review-fix commits are owned by `orchestrator` per the documented pattern. No agent broadened its tool list.
- **VII — Human oversight.** Two open items are explicitly Decider-owned (CLAR-V05-003 + remote workflow dispatch). No agent pre-empted either.
- **VIII — Plain language.** Functional requirements use EARS notation; ADRs use active voice. Verified by `check:frontmatter` + EARS coverage 100% in quality metrics.
- **IX — Reversibility.** Operator-authorised remote dispatch is correctly out of agent scope. The release workflow itself enforces irreversibility through `dry_run: true` default + `confirm` gate + `--verify-tag` defence-in-depth.
- **X — Iteration.** REQ-V05-012 escalation is a textbook Article X application: implementation surfaced a missing requirement → spec updated first → propagated forward consistently.

No constitutional violations.

## Risks

| ID | Status | Notes |
|---|---|---|
| RISK-V05-001 (publish without approval) | Mitigated | `workflow_dispatch` only + `confirm` gate + `dry_run: true` default + `publish_package: false` default + least-privilege permissions. |
| RISK-V05-002 (premature package contract) | Mitigated | `package-contract.md` accepted by pm; OQ-V05-001/002/003 closed; ADR-0021 captures fresh-surface; readiness check enforces metadata fields per-row. |
| RISK-V05-003 (premature `develop` introduction) | Mitigated | Shape A retained per ADR-0020. |
| RISK-V05-004 (release-notes drift) | Mitigated | `.github/release.yml` categories aligned with PR-title CI types; lifecycle release-notes flow through the same channels. |
| RISK-V05-005 (version/tag/changelog drift) | Mitigated | Layer 1 readiness asserts version, tag, changelog, lifecycle release notes, package metadata, workflow config in fixed order with stable diagnostic codes. |
| RISK-V05-006 (first publish is first end-to-end exercise) | Mitigated | Dry run is the default. `publish_package` is opt-in. CLAR-V05-003 (Decider-owned) explicitly asks the operator to choose draft/pre-release vs stable for the first publish. |

New risks discovered during implementation — none material. The round-2 → round-6 churn on PR #202 surfaced a subtle issue (whole-directory allowlist semantics + non-destructive mode = stale-file leak), which is now correctly resolved by removing `--no-clean`.

## Brand review

Brand review: not-applicable. The diff between this branch base and HEAD is empty — the worktree is reviewing the cumulative state already on `origin/main`. The user-visible UI surfaces touched within the v0.5 PR sequence (`sites/index.html` step 1 + new FAQ item from T-V05-009) used existing `step` and `faq-item` components per the `brand-reviewer` rules and the `release-manager` hand-off note (PR #161 — additive only, no new tokens, no emoji, no new visual treatment). No `brand-reviewer` finding was raised by the parent `/spec:review` command for this run.

## Findings

A review without findings is suspicious. The findings below are not blockers — they are consistency notes and small follow-ups. None changes the verdict; all are scheduled-fix or accepted-as-is.

### R-V05-001 — `requirementsWithTests` reports 0 in quality-metrics output

- **Severity:** medium
- **Category:** maintainability (tooling)
- **Where:** `npm run quality:metrics -- --feature version-0-5-plan --json` reports `requirementsWithTests: 0`, `testCoverage: 0` for v0.5.
- **Description:** `spec.md` lines 90–101 enumerate TEST-V05-001 through TEST-V05-012 with explicit `REQ-V05-*` mapping. `test-plan.md` and `test-report.md` carry stable TEST IDs. The quality-metrics walker does not count these tests against requirements, so the headline number understates v0.5's actual test coverage. The maturity-level summary string ("No completed workflow has complete downstream test evidence yet") is therefore not reflective. This does not change the review verdict because the underlying tests demonstrably exist (44 release-specific unit tests pass; reviewer re-ran 94/94 release-surface tests cleanly), but the metric-side miscount is real and worth a follow-up at the tooling layer.
- **Recommendation:** raise a follow-up issue against `scripts/quality-metrics.ts` (or `scripts/lib/quality-metrics.ts`) to either (a) parse `### TEST-V05-* | REQ-V05-* |` table rows in `spec.md` test-scenarios sections, or (b) parse `Test scenarios` table cells of `spec.md` so coverage reflects the actual REQ → TEST chain. Not a v0.5 blocker.
- **Owner:** dev (post-v0.5 follow-up); raise as a separate issue, not in v0.5 scope.
- **Status:** scheduled-fix

### R-V05-002 — TEST-V05-006 (live publish) cannot be exercised pre-release

- **Severity:** low
- **Category:** docs / coverage
- **Where:** `spec.md` line 95; `test-report.md` §10 Gap 1.
- **Description:** TEST-V05-006 ("publish a package from an authorized release run") is by definition unreachable until a stable publish runs. Coverage is correctly deferred to first stable publish. Already documented as Gap 1 in test-report.md. Calling it out here as a finding so the post-publish retrospective owner remembers to backfill the test record from the operator-authorised run.
- **Recommendation:** Stage 11 retrospective records the live publish outcome and closes TEST-V05-006 in `test-report.md`.
- **Owner:** retrospective agent (Stage 11) and release-manager (during the stable publish run).
- **Status:** accepted-as-is

### R-V05-003 — Round-2 → round-6 review-fix history exceeds the soft loop cap

- **Severity:** low
- **Category:** process
- **Where:** `implementation-log.md` rounds 1 through 6; `feedback_pr_review_loop.md` soft cap.
- **Description:** PR #202 ran 6 review-fix rounds. Round-4 hit the soft cap; round-5 fixed a real bug introduced by my own round-2 + round-4 work (`--no-clean` self-contradictory rejection); round-6 fixed the wrong-layer fix from round-5 by removing `--no-clean` entirely. Each round addressed a real Codex finding — none was ping-pong — but the loop length is worth noting against the v0.5 retrospective. The implementation log records the why honestly ("the round-4 P2 fix was the wrong layer") which is the right pattern.
- **Recommendation:** retrospective should pull a learning lesson on "when a flag is a code smell" — once Codex caught the marker-rejection contradiction, the right move was to question whether the flag itself was sound, not to fix the rejection. Avoid over-engineering optional modes when the deterministic semantics are mandatory.
- **Owner:** retrospective agent (Stage 11).
- **Status:** scheduled-fix (in retro)

### R-V05-004 — `requirements.md` REQ-V05-012 lacks explicit `Pattern:` field consistency

- **Severity:** low
- **Category:** docs (style)
- **Where:** `specs/version-0-5-plan/requirements.md` lines 128–141 (REQ-V05-012).
- **Description:** REQ-V05-012 declares `Pattern: event-driven`, but the EARS clause shape used in body ("When the release workflow publishes a versioned package, the published archive shall conform to the fresh-surface contract …") is event-driven, which is correct. However, the EARS condition is evaluated *pre-publish* (the readiness check fails closed before publish), not "when the release workflow publishes". The semantic alignment is fine — the pattern fires before the action — but a strict EARS reader could read "when the workflow publishes" as a post-condition. Style nit, not a defect.
- **Recommendation:** consider rewording to "When the release workflow prepares a versioned package for publish, the candidate archive shall conform to the fresh-surface contract …" in a future spec touch. Not blocking.
- **Owner:** pm (when next touching the requirement).
- **Status:** accepted-as-is

### R-V05-005 — `package-contract.md` status remains `draft`

- **Severity:** low
- **Category:** docs (status hygiene)
- **Where:** `specs/version-0-5-plan/package-contract.md` line 7.
- **Description:** `status: draft` per frontmatter, but the document's three open questions are now closed (OQ-V05-001 implicit, OQ-V05-002 closed by v0.5 identity adoption, OQ-V05-003 closed by T-V05-013 per the change-log entry). The contract is the sole upstream input to several gates (Layer 1 `RELEASE_READINESS_PKG_*` checks read it; T-V05-013 enumerates files via the allowlist it codifies). Leaving it `draft` is mildly inconsistent with the work being signed off.
- **Recommendation:** before Stage 10 release, `pm` should flip status to `accepted` and add a final change-log entry confirming all OQs closed. Trivial edit.
- **Owner:** pm (during release prep, not now).
- **Status:** scheduled-fix

## Traceability matrix

Status of `traceability.md`: complete. Every REQ-V05-* row has Spec → Tasks → Code → Tests cells filled. Two REQ rows mark live-infrastructure verification as deferred (REQ-V05-006, REQ-V05-011 remote-dispatch path); both are documented as coverage gaps in `test-report.md` §10 with explicit closure paths. No orphan tests, no orphan tasks, no orphan ADRs. The matrix is regenerable from frontmatter + body markup per `docs/traceability.md`.

## EARS coverage assessment

The agent's task explicitly asks for a per-clause check that every EARS clause has a corresponding TEST and the TEST is exercised. Result:

| EARS clause | TEST-V05-* | Exercised? | Where |
|---|---|---|---|
| REQ-V05-001 (branch strategy) | TEST-V05-001 | Yes — doc review of `docs/branching.md` + ADR-0020. | `test-plan.md` §3 |
| REQ-V05-002 (publish authority) | TEST-V05-002, TEST-V05-002-NFR | Yes — `tests/scripts/release-readiness.test.ts` scenarios 5/5b/5d/5e + workflow inspection in `test-report.md` §9. | `test-report.md` §2/§9 |
| REQ-V05-003 (release workflow) | TEST-V05-003 | Yes (local) — Layer 1 workflow-shape check passes; remote dispatch is operator-authorised follow-up §7. | `test-report.md` §2 |
| REQ-V05-004 (generated notes config) | TEST-V05-004 | Yes — `.github/release.yml` shape asserted by Layer 1 + scenario 3/3b/3c tests. | `test-report.md` §2 |
| REQ-V05-005 (package contract) | TEST-V05-005, TEST-V05-012 | Yes — `package-contract.md` accepted by pm; 18 contract tests pass; archive contents asserted. | `test-report.md` §4.2 |
| REQ-V05-006 (publish from authority) | TEST-V05-006 | Deferred to live publish — Article IX. Documented gap. | `test-report.md` §10 Gap 1 |
| REQ-V05-007 (readiness check) | TEST-V05-007 | Yes — 26 readiness tests + CLI run. | `test-report.md` §2/§4.1 |
| REQ-V05-008 (operator guide) | TEST-V05-008 | Yes — manual review confirmed §7.1 internal consistency. | `test-report.md` §9 |
| REQ-V05-009 (public docs) | TEST-V05-009 | Yes — `check:public-surfaces` green; sites/index.html FAQ + step 1 verified. | `npm run verify` gates |
| REQ-V05-010 (quality signals) | TEST-V05-010 | Yes — 3 quality unit tests + CLI runs (no signals / green / waiver). | `test-report.md` §2 commands 1–3 |
| REQ-V05-011 (release candidate) | TEST-V05-011 | Yes (local) — `npm pack --dry-run` + `npm pack` candidate; remote dry-run is operator-authorised follow-up §7. | `test-report.md` §2 command 4 + §7 |
| REQ-V05-012 (fresh-surface contract) | TEST-V05-012 | Yes — 18 contract tests + post-T-V05-013 verification (build CLI + Layer 2 = zero diagnostics on staged tarball). | `test-report.md` §5 resolution chain |
| NFR-V05-001 (least-privilege) | TEST-V05-002-NFR | Yes — workflow inspection + scenario 5 family. | `test-report.md` §9 |
| NFR-V05-002 (reproducibility) | (covered through REQ-V05-002/003/006) | Yes — single `vX.Y.Z` resolves all four artifacts. | implementation-log T-V05-007 |
| NFR-V05-003 (maintainability) | (`npm run verify` gates) | Yes — typedoc, automation registry, test:scripts. | verify gates |
| NFR-V05-004 (operator usability) | TEST-V05-008 | Yes — qa manual review of §1–§11. | `test-report.md` §9 |
| NFR-V05-005 (recoverability) | TEST-V05-005-NFR | Yes — operator guide §7.1 internal consistency confirmed. | `test-report.md` §9 |

Every EARS clause has at least one TEST. Every TEST that can be exercised against a deterministic command has been exercised in `test-report.md`. The two TEST IDs whose exercise is deferred to live infrastructure (TEST-V05-006 always; TEST-V05-003 / TEST-V05-011 remote-dispatch path) are documented as gaps with explicit closure paths.

## Quality metrics evidence

`npm run quality:metrics -- --feature version-0-5-plan --json` (executed by reviewer at the start of the review):

- `overallScore` = 97.1 / 100
- `maturity.level` = 3 ("Traceable")
- `requirementCoverage` = 100% (17 / 17 requirements have spec links)
- `stageTraceabilityCoverage` = 100%
- `earsCoverage` = 100% (`earsExpected: true`)
- `frontmatterCoverage` = 100%
- `openClarifications` = 1 (CLAR-V05-003 — Decider-owned)
- `blockers` = 0
- `requirementsWithTests` = 0 (see R-V05-001 — tooling miscount, not a real gap)

The KPI is high but I am explicitly NOT letting it override the review. The R-V05-001 tooling finding is the proof: a high score did not stop me from reading `spec.md` lines 90–101 myself, finding the test enumeration, and confirming the gap was a metric-side artefact rather than a test-coverage hole. The other findings (R-V05-002 to R-V05-005) come from reading the artifacts, not the score.

## Recommendation

**Before Stage 10 release** (in this order):

1. **Decider closes CLAR-V05-003** — does the first v0.5 publish go out as draft+prerelease, or stable from the start? Both paths are documented in `docs/release-operator-guide.md` and `package-contract.md` §6. Either choice is acceptable; the choice is the Decider's intent call, not a workflow gap.
2. **Decider authorises operator-led `gh workflow run release.yml --ref main -f version=0.5.0 -f dry_run=true …`** on `main`. The exact command is in `test-report.md` §7. Pre-conditions in §7: PR sequence merged, `v0.5.0` tag cut on `main`, `CHANGELOG.md` `[v0.5.0]` heading promoted, `RELEASE_CI_STATUS=green` + `RELEASE_VALIDATION_STATUS=green` repo vars set.
3. **`pm` flips `package-contract.md` status from `draft` → `accepted`** (R-V05-005) in the same PR that promotes the CHANGELOG heading.

**Stage 10 (`/spec:release`)** can begin once items 1 and 2 are scheduled. Stage 11 (`/spec:retro`) should pull lessons on R-V05-002 (live publish coverage backfill) and R-V05-003 (loop length / "when a flag is a code smell").

---

## Quality gate

- [x] Requirements satisfied (verified against RTM and EARS coverage table above).
- [x] Design honoured (no drift; round-1 → round-6 fixes consistent with design intent).
- [x] No critical findings open.
- [x] Risk assessment current (six risks, all mitigated, no new material risks).
- [x] Traceability matrix complete and consistent.
- [x] Constitution check passes (all ten articles).
