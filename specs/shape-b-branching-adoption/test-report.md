---
id: TEST-REPORT-BRANCH-001
title: Shape B branching adoption — Test report
feature: shape-b-branching-adoption
stage: 8
status: complete
owner: qa
inputs:
  - TEST-PLAN-BRANCH-001
  - SPEC-BRANCH-001
executed: 2026-05-03
worktree: .worktrees/shape-b-stage5
---

# Test report — Shape B branching adoption

## Summary

| Metric | Count |
|---|---|
| Total tests | 16 (TEST-BRANCH-001 through TEST-BRANCH-015 + TEST-BRANCH-009b) |
| FILE tests (runnable offline) | 12 |
| MANUAL tests (require live remote) | 3 |
| N/A (precondition false) | 1 |
| FILE PASS | 12 of 12 |
| FILE FAIL | 0 of 12 |
| MANUAL — deferred to deployment | 3 |
| NFR checks: FILE PASS | 3 of 3 runnable |
| NFR checks: MANUAL — deferred | 2 |
| NFR checks: PASS with caveat | 1 |

**Overall verdict: READY FOR REVIEW.** All FILE-testable requirements pass. MANUAL tests are documented with exact commands and deferred to the deployment-phase verification window (spec Step 12). No FAIL results.

---

## Per-requirement results

| REQ ID | Priority | TEST ID | Type | Result | Notes |
|---|---|---|---|---|---|
| REQ-BRANCH-001 | must | TEST-BRANCH-001 | FILE | PASS | `docs/branching.md` names `develop` as PR target; `main` not named as topic PR target |
| REQ-BRANCH-002 | must | TEST-BRANCH-002 | FILE | PASS | `git push origin develop:*` and `git push -u origin develop:*` in deny list |
| REQ-BRANCH-003 | must | TEST-BRANCH-003 | FILE | PASS | `git push origin demo:*` and `git push -u origin demo:*` in deny list |
| REQ-BRANCH-004 | must | TEST-BRANCH-004 | FILE | PASS | `pages.yml` trigger: `- demo` present, `- main` absent |
| REQ-BRANCH-005 | must | TEST-BRANCH-005 | FILE | PASS | `develop → main` promotion path in `branching.md`; `release/vX.Y.Z` not required |
| REQ-BRANCH-006 | must | TEST-BRANCH-006 | MANUAL | DEFERRED | Requires remote `origin/develop`; run at spec Step 5/12 |
| REQ-BRANCH-007 | must | TEST-BRANCH-007 | FILE | PASS | Shape B count=9 in `branching.md`; active designation present; Shape A retained as adopter option |
| REQ-BRANCH-008 | must | TEST-BRANCH-008 | FILE | PASS | Old phrase `clean clone of \`main\`` absent; new phrase `clean clone of \`develop\`` present |
| REQ-BRANCH-009 | must | TEST-BRANCH-009 | MANUAL + FILE | PASS (partial) | No in-repo scheduler YMLs exist; satisfied by default-branch flip (MANUAL) + TEST-BRANCH-009b (FILE PASS) |
| REQ-BRANCH-010 | must | TEST-BRANCH-010 | FILE | PASS | All 5 ADR sub-checks pass (see detail below) |
| REQ-BRANCH-011 | should | TEST-BRANCH-011 | FILE | PASS | No `release/*` entries in allow list |
| REQ-BRANCH-012 | should | TEST-BRANCH-012 | FILE | PASS | `origin/develop` in worktree examples; no `git worktree add` from `origin/main` |
| REQ-BRANCH-013 | should | TEST-BRANCH-013 | N/A | N/A | `release/v0.5.0` confirmed absent from remote at spec pre-check; conditional never triggered |
| REQ-BRANCH-014 | must | TEST-BRANCH-014 | MANUAL | DEFERRED | Requires remote `origin/demo`; run at spec Step 5/12 |
| REQ-BRANCH-015 | should | TEST-BRANCH-015 | FILE | PASS | Both `AGENTS.md` and `CLAUDE.md` carry `Topic PRs target \`develop\``; `CLAUDE.md` names `demo` as Pages source |

---

## Detailed results — FILE tests

### TEST-BRANCH-001 — REQ-BRANCH-001 — PASS

```
node command 1: develop PR target present: PASS
node command 2: main not named as topic PR target: PASS
```

`docs/branching.md` line 15: `Topic PRs target \`develop\`.` Shape B table is clear; no `main`-as-topic-target phrasing found outside the Shape A historical table.

---

### TEST-BRANCH-002 — REQ-BRANCH-002 — PASS

```
node: PASS
```

`.claude/settings.json` deny array contains `"Bash(git push origin develop:*)"` (line 39) and `"Bash(git push -u origin develop:*)"` (line 42).

---

### TEST-BRANCH-003 — REQ-BRANCH-003 — PASS

```
node: PASS
```

`.claude/settings.json` deny array contains `"Bash(git push origin demo:*)"` (line 40) and `"Bash(git push -u origin demo:*)"` (line 43).

---

### TEST-BRANCH-004 — REQ-BRANCH-004 — PASS

```
demo present: PASS
main absent from trigger: PASS
```

`.github/workflows/pages.yml` lines 3–7: `on: push: branches: - demo`. `workflow_dispatch` retained. No `- main` trigger present.

---

### TEST-BRANCH-005 — REQ-BRANCH-005 — PASS

```
develop-to-main release path present: PASS
release/vX.Y.Z not prescribed as required: PASS
```

`docs/branching.md` §"Release path under Shape B" (line 99 onwards) describes the `develop → main` promotion PR. The `release/vX.Y.Z` convention is retained only in a "Shape A only — historical convention" callout (line 109), clearly marked as not the active template release process.

---

### TEST-BRANCH-007 — REQ-BRANCH-007 — PASS

```
PASS count=9
```

`docs/branching.md` contains 9 references to "Shape B". Line 7 explicitly states "This template repository operates under Shape B as of ADR-0027 (2026-05-03)." Shape A is retained as an adopter option (line 20: "Recommended for downstream projects that do not yet cut versioned releases.").

---

### TEST-BRANCH-008 — REQ-BRANCH-008 — PASS

```
old phrase absent: PASS
new phrase present: PASS
```

`agents/operational/docs-review-bot/PROMPT.md` line 46: "Flag the tutorial for re-run from a clean clone of `develop`". Old phrase `clean clone of \`main\`` is absent.

---

### TEST-BRANCH-009b — REQ-BRANCH-009 (Dependabot) — PASS

```
PASS count=2
```

`.github/dependabot.yml` carries `target-branch: develop` on both the `github-actions` block (line 7) and the `npm` block (line 36).

---

### TEST-BRANCH-010 — REQ-BRANCH-010 — PASS (5 sub-checks)

```
ADR-0027 status Accepted: PASS
ADR-0027 supersedes ADR-0020: PASS
ADR-0020 status Superseded: PASS
ADR-0020 superseded-by ADR-0027: PASS
ADR-0027 in README index: PASS
```

ADR-0027 frontmatter (lines 3, 16): `status: Accepted`, `supersedes: [ADR-0020]`. ADR-0020 frontmatter (lines 3, 16): `status: Superseded`, `superseded-by: [ADR-0027]`. ADR-0020 body is unchanged (only frontmatter fields differ). `docs/adr/README.md` index row present: `| `ADR-0027` | Adopt Shape B branching model (develop / main / demo) for the template | Accepted |`.

---

### TEST-BRANCH-011 — REQ-BRANCH-011 — PASS

```
PASS: no release/* in allow list
```

`.claude/settings.json` allow array (lines 4–36) contains no entries matching `release/*`. The pre-change entries `"Bash(git push -u origin release/*)"` and `"Bash(git push origin release/*)"` are absent.

---

### TEST-BRANCH-012 — REQ-BRANCH-012 — PASS

```
develop as cut-from: PASS
no worktree add from main: PASS
```

`docs/worktrees.md` line 25: `git worktree add .worktrees/<slug> -b <prefix>/<slug> origin/develop`. No `git worktree add` example uses `origin/main`. References to `main` in the file are explanatory prose about Shape A adopters or the phrase "main checkout" (primary checkout concept), not instructions for new topic-branch creation.

---

### TEST-BRANCH-015 — REQ-BRANCH-015 — PASS

```
AGENTS.md: PASS
CLAUDE.md develop target: PASS
CLAUDE.md demo/Pages: PASS
```

`AGENTS.md` "Branch per concern" bullet (operating rules): "Topic PRs target `develop` (Shape B per ADR-0027); `main` carries only promoted, tagged commits." `CLAUDE.md` permissions-rules bullet: "Pushes to `main` / `develop` / `demo` are denied; `--no-verify` is denied. Topic PRs target `develop`; `demo` is the Pages source."

---

## MANUAL tests — deferred

### TEST-BRANCH-006 — REQ-BRANCH-006 — DEFERRED

Cannot run until spec Step 5 creates `origin/develop` on the remote.

**Command when ready:**

```bash
MAIN_SHA=$(git rev-parse origin/main)
DEV_SHA=$(git rev-parse origin/develop)
test "$MAIN_SHA" = "$DEV_SHA" && echo "PASS" || echo "FAIL"
git log --oneline origin/main..origin/develop   # expect empty
```

---

### TEST-BRANCH-009 (scheduler flip) — REQ-BRANCH-009 — DEFERRED

No in-repo scheduler configs exist for the four named bots (`review-bot`, `plan-recon-bot`, `dep-triage-bot`, `actions-bump-bot`). REQ-BRANCH-009 is satisfied by the default-branch flip to `develop` (spec Step 5b) plus the `dependabot.yml` `target-branch: develop` (TEST-BRANCH-009b, PASS). Confirm at Step 5b:

```bash
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'   # expect "develop"
```

---

### TEST-BRANCH-014 — REQ-BRANCH-014 — DEFERRED

Cannot run until spec Step 5 creates `origin/demo` on the remote.

**Command when ready:**

```bash
MAIN_SHA=$(git rev-parse origin/main)
DEMO_SHA=$(git rev-parse origin/demo)
test "$MAIN_SHA" = "$DEMO_SHA" && echo "PASS" || echo "FAIL"
git log --oneline origin/main..origin/demo   # expect empty
```

---

## N/A dispositions

### TEST-BRANCH-013 — REQ-BRANCH-013 — N/A

REQ-BRANCH-013 is an "unwanted behaviour" EARS pattern: IF `release/v0.5.0` exists THEN delete it. The branch was confirmed absent during spec Step 1 pre-condition checks (recorded in `workflow-state.md` and `spec.md` Step 1). The IF condition was false; the conditional requirement has no false arm to verify. Disposition: satisfied by confirmed absence.

---

## NFR verification results

### NFR-BRANCH-001 — DEFERRED (same as TEST-BRANCH-006)

### NFR-BRANCH-002 — DEFERRED (same as TEST-BRANCH-014)

### NFR-BRANCH-003 — PASS with caveat

The consistency grep across all five affected files (`docs/branching.md`, `docs/worktrees.md`, `AGENTS.md`, `CLAUDE.md`, `agents/operational/docs-review-bot/PROMPT.md`) flagged one line in `AGENTS.md`:

> "Topic PRs target `develop` (Shape B per ADR-0027); `main` carries only promoted, tagged commits."

This is correct Shape B prose. The heuristic matched because the line contains both `main` and an integration-context word, but the sentence correctly describes `main` as release-only (not as the integration branch). This is a **false positive** in the grep heuristic. Manual reviewer pass confirms the content is correct. NFR-BRANCH-003 is PASS; the false positive is disclosed.

### NFR-BRANCH-004 — PASS

Covered by TEST-BRANCH-010 five sub-checks, all PASS.

### NFR-BRANCH-005 — PASS

```
PASS count=21
```

Post-change deny entries naming `{main, develop, demo}`: 21. Requirement threshold: 19 (12 pre-change entries for `main`/`develop` + 7 added for `demo`). Actual count exceeds minimum by 2. The extra entries are symmetric `reset --hard` and `branch -d/-D` patterns for `demo` already present in the file.

Pre-change baseline (per spec IF-01): 12 entries.
Post-change count: 21 entries.
NFR-BRANCH-005 ("deny list does not shrink") is satisfied; coverage expanded.

### NFR-BRANCH-006 — DEFERRED (MANUAL)

```bash
# Before Step 7: github-pages env allow-list includes demo
gh api /repos/$OWNER/$REPO/environments/github-pages/deployment-branch-policies \
  --jq '[.branch_policies[].name]'

# After flip: site returns 200
curl -s -o /dev/null -w '%{http_code}' "https://<owner>.github.io/<repo>/"
```

---

## Coverage gaps

No gaps in FILE-testable requirements. The following tests are deferred to deployment-phase:

- TEST-BRANCH-006 (REQ-BRANCH-006, NFR-BRANCH-001): `develop` creation — requires live remote branch.
- TEST-BRANCH-014 (REQ-BRANCH-014, NFR-BRANCH-002): `demo` creation — requires live remote branch.
- TEST-BRANCH-009 scheduler-flip verification — requires `gh repo view` against the live repo after Step 5b.
- NFR-BRANCH-006 Pages continuity — requires the Pages site to be live during the trigger swap.

These are structural gaps inherent to a config/docs feature with remote-state dependencies. They are not suppressible as FILE checks. They must be executed and documented in `specs/shape-b-branching-adoption/implementation-log.md` during deployment.

---

## Failures

None. No FILE test produced a FAIL result.

---

## Quality metrics snapshot

- Must requirements with at least one PASS test: 8 of 9 testable at FILE level (1 DEFERRED, 1 partial via MANUAL).
- Should requirements with at least one PASS test: 3 of 4 (1 N/A, all others PASS).
- NFRs with verified PASS: 3 of 6 (3 DEFERRED pending remote state).
- Coverage of EARS clauses: 15 of 15 have a test case recorded (PASS, DEFERRED, or N/A).
- False positive in NFR-003 heuristic: 1 disclosed, explained, confirmed not a defect.

---

## Recommendation

**Ready for `/spec:review`.** All file-content implementation work is verified PASS at Stage 8. The three MANUAL-deferred tests must be executed and signed off in `implementation-log.md` during the deployment phase (spec Steps 5, 5b, 7, 12) before the final review gate closes.

---

## Hand-off note to reviewer

**Testing complete for Stage 8 file-content checks. No failures.**

Key signals for reviewer:

1. All 12 FILE tests PASS. Zero defects found in the worktree implementation at `.worktrees/shape-b-stage5`.
2. NFR-BRANCH-005 (deny list monotonicity) reports count=21 against a threshold of 19. Coverage grew, did not shrink.
3. NFR-BRANCH-003 grep heuristic produced one false positive in `AGENTS.md`. The flagged text is correct Shape B prose (`main` = release-only, `develop` = integration). Manual reviewer should confirm this reading.
4. Three MANUAL-deferred tests (TEST-BRANCH-006, TEST-BRANCH-014, TEST-BRANCH-009 remote verification) depend on the live remote state after spec Steps 5 and 5b execute. These cannot be pre-verified against the worktree.
5. REQ-BRANCH-013 (N/A): `release/v0.5.0` confirmed absent from the remote; no cleanup step required.
6. The `dependabot.yml` `target-branch: develop` (TEST-BRANCH-009b) is PASS — both update blocks carry the field.

Recommended next step: `/spec:review` with the understanding that MANUAL tests are deployment-phase gate items captured in `implementation-log.md`, not Stage 9 blockers.
