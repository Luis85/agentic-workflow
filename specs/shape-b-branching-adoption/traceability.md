---
id: TRACE-BRANCH-001
title: Shape B branching adoption — Traceability matrix
feature: shape-b-branching-adoption
stage: 9
status: complete
owner: reviewer
inputs:
  - PRD-BRANCH-001
  - DESIGN-BRANCH-001
  - SPEC-BRANCH-001
  - TASKS-BRANCH-001
  - ADR-0027
created: 2026-05-04
updated: 2026-05-03
---

# Traceability — shape-b-branching-adoption

Generated from `requirements.md`, `design.md`, `spec.md`, `tasks.md`, ADR-0027, and the on-disk file changes in `feat/shape-b-branching-stage5`.

Status legend:
- `Pass (file)` — verified by spec command against the on-disk file.
- `Pass (carry-in)` — already on `origin/main` from a prior PR; reviewed for body-immutability compliance.
- `Pending (remote)` — human-owned remote operation outside this PR's scope.

## REQ → downstream chain

| REQ | Spec interface | Tasks | Implementation file or remote op | Verification | Status |
|---|---|---|---|---|---|
| REQ-BRANCH-001 | IF-05 | T-BRANCH-016, T-BRANCH-018, T-BRANCH-022 | `docs/branching.md` lines 7, 11-18, 99-109 | Spec IF-05 grep checks (Shape B count = 7; bare-prose `main`-as-PR-target outside Shape A subsection = 0) | Pass (file) |
| REQ-BRANCH-002 | IF-01 (retain), IF-11 | T-BRANCH-003, T-BRANCH-004, T-BRANCH-012 | `.claude/settings.json:38,41` (existing `main`/`develop` push-deny retained) | `node -e ...['main','develop','demo'].forEach(...)` → "OK push-deny" | Pass (file); ruleset half pending |
| REQ-BRANCH-003 | IF-01, IF-11 | T-BRANCH-004, T-BRANCH-012 | `.claude/settings.json:40,43,59,62,65,68,71` (seven `demo` deny entries) | Spec IF-01 verification command 1 → "OK"; deny count = 21 | Pass (file); ruleset half pending |
| REQ-BRANCH-004 | IF-02, IF-10 | T-BRANCH-006, T-BRANCH-014, T-BRANCH-015 | `.github/workflows/pages.yml:6` (`branches: [demo]`) | Node yaml.parse → demo present, main absent | Pass (file); env allow-list pending |
| REQ-BRANCH-005 | IF-05 | T-BRANCH-016, T-BRANCH-018, T-BRANCH-022 | `docs/branching.md:99-109` (§"Release path under Shape B" replaces §"Release branches"; `release/vX.Y.Z` retained only inside the Shape A historical callout at line 109) | `grep -c "release/vX.Y.Z" docs/branching.md` = 2; both inside acceptable contexts | Pass (file) |
| REQ-BRANCH-006 | (no IF) | T-BRANCH-001, T-BRANCH-008 | Remote: `git push origin <SHA>:refs/heads/develop` | NFR-BRANCH-001 SHA equality (post-seed) | Pending (remote) |
| REQ-BRANCH-007 | IF-05 | T-BRANCH-016, T-BRANCH-018 | `docs/branching.md:7` (lead paragraph: "operates under Shape B as of ADR-0027"); `docs/branching.md:11` (Shape B subsection precedes Shape A) | `grep -c "Shape B" docs/branching.md` = 7 | Pass (file) |
| REQ-BRANCH-008 | IF-04 | T-BRANCH-016, T-BRANCH-017 | `agents/operational/docs-review-bot/PROMPT.md:46` ("clean clone of `develop`") | grep `clean clone of \`main\`` = 0; `clean clone of \`develop\`` = 1 | Pass (file) |
| REQ-BRANCH-009 | IF-09, IF-03 | T-BRANCH-010, T-BRANCH-024, T-BRANCH-025, T-BRANCH-027 | `.github/dependabot.yml:7,36` (`target-branch: develop`); bot scheduler half satisfied by T-BRANCH-010 default-branch flip per implementation log §Step 9 | Node yaml.parse → both updates blocks declare target-branch develop → "OK" | Pass (file, Dependabot half); Pending (remote, bot scheduler half) |
| REQ-BRANCH-010 | IF-08 | T-BRANCH-016, T-BRANCH-021, T-BRANCH-022 | `docs/adr/0027-adopt-shape-b-branching-model.md:4,16` (`status: Accepted`, `supersedes: [ADR-0020]`); `docs/adr/0020-v05-release-branch-strategy.md:4,16` (carry-in: `status: Superseded`, `superseded-by: [ADR-0027]`); `docs/adr/README.md:42` (index row) | All four spec NFR-BRANCH-004 grep checks; `git diff origin/main...HEAD -- docs/adr/0020-v05-release-branch-strategy.md` returns empty (body unchanged) | Pass (file + carry-in) |
| REQ-BRANCH-011 | IF-01 | T-BRANCH-003, T-BRANCH-004 | `.claude/settings.json` allow list (no `release/*` entries) | `grep -nE "release/" .claude/settings.json` returns nothing; spec IF-01 verification command 2 → "OK" | Pass (file) |
| REQ-BRANCH-012 | IF-06 | T-BRANCH-016, T-BRANCH-019 | `docs/worktrees.md:20,25,35,61` (Lifecycle paragraph + example + cleanup + pitfall) | `grep -c develop docs/worktrees.md` = 6 | Pass (file) |
| REQ-BRANCH-013 | (no IF) | T-BRANCH-001, T-BRANCH-002 | Remote: `git push origin --delete release/v0.5.0` (conditional) | `git ls-remote --heads origin release/v0.5.0` post-cleanup | Pending (remote) |
| REQ-BRANCH-014 | (no IF) | T-BRANCH-001, T-BRANCH-008 | Remote: `git push origin <SHA>:refs/heads/demo` | NFR-BRANCH-002 SHA equality | Pending (remote) |
| REQ-BRANCH-015 | IF-07 | T-BRANCH-016, T-BRANCH-020 | `AGENTS.md:33`; `CLAUDE.md:34` | `grep -c "Topic PRs target \`develop\`"` = 1 in both files | Pass (file) |

## NFR → downstream chain

| NFR | Spec section | Verification command | Status |
|---|---|---|---|
| NFR-BRANCH-001 | §NFR Verification Checklist | `test "$(git rev-parse origin/develop)" = "${MAIN_HEAD_SHA}"` | Pending (remote — gated on T-BRANCH-008) |
| NFR-BRANCH-002 | §NFR Verification Checklist | `test "$(git rev-parse origin/demo)" = "${MAIN_HEAD_SHA}"` | Pending (remote — gated on T-BRANCH-008) |
| NFR-BRANCH-003 | §NFR Verification Checklist | `grep -rnE "main.*integration branch\|topic.*PR.*target.*main" docs/... \| grep -v "Shape A"` | Pass (file) — only acceptable hits remain (general policy line, "main checkout" terminology) |
| NFR-BRANCH-004 | §NFR Verification Checklist | Four `grep -E` commands + body-diff line count | Pass (file + carry-in) |
| NFR-BRANCH-005 | §NFR Verification Checklist | Node deny-count >= 19 | Pass (file) — count = 21 (corrected baseline 14 → post 21, +7 demo) |
| NFR-BRANCH-006 | §NFR Verification Checklist | `curl` Pages URL pre/post; both must return 200 | Pending (remote — gated on T-BRANCH-006/008/015 final substep) |

## ADR → REQ coverage

| ADR | Decision | Covers |
|---|---|---|
| ADR-0027 | Adopt Shape B (`develop`/`main`/`demo`); drop `release/vX.Y.Z`; manual `chore/promote-demo` PR; GitHub rulesets covering all three branches | REQ-BRANCH-001, -003, -004, -005, -006, -007, -010, -011, -014; CLAR-003, CLAR-004 |
| ADR-0020 (Superseded) | Original Shape A + `release/vX.Y.Z` decision | Frontmatter `status: Superseded`, `superseded-by: [ADR-0027]` (NFR-BRANCH-004); body immutable per ADR rule |

## Open spec items

| Open item | Resolution | Evidence |
|---|---|---|
| OPEN-BRANCH-001 (bot scheduler config paths) | N/A — no in-repo schedulers exist for the four named bots; they inherit the repo default branch | Implementation log §Step 9 (T-BRANCH-024 spike) |
| OPEN-BRANCH-002 (remove `main` from Pages env allow-list) | Deferred to optional Step 11 after Step 12 verification window | Spec §State Transitions Step 11 |
| OPEN-BRANCH-003 (CI gate failing topic PRs targeting `main`) | Out of scope per PRD NG; surfaced as EC-011 follow-up trigger | Spec §Edge Cases EC-011 |

## Tasks → REQ coverage

| Task | Status (per implementation log) | REQs |
|---|---|---|
| T-BRANCH-001 | Pending (remote, human) | REQ-BRANCH-006, -013, -014; NFR-BRANCH-001, -002 |
| T-BRANCH-002 | Pending (remote, human, conditional) | REQ-BRANCH-013 |
| T-BRANCH-003 | Done (implementation log §Baseline) | NFR-BRANCH-005, REQ-BRANCH-002, REQ-BRANCH-011 |
| T-BRANCH-004 | Done (implementation log §Step 3) | REQ-BRANCH-002, -003, -011; NFR-BRANCH-005 |
| T-BRANCH-005 | Done (implementation log §Step 3 verification, count = 21) | NFR-BRANCH-005 |
| T-BRANCH-006 | Pending (remote, human) | REQ-BRANCH-004 (sequencing), NFR-BRANCH-006 |
| T-BRANCH-007 | Pending (depends on T-BRANCH-006) | NFR-BRANCH-006 sequencing |
| T-BRANCH-008 | Pending (remote, human) | REQ-BRANCH-006, -014; NFR-BRANCH-001, -002 |
| T-BRANCH-009 | Pending (depends on T-BRANCH-008) | NFR-BRANCH-001, -002 |
| T-BRANCH-010 | Pending (remote, human) | REQ-BRANCH-009 |
| T-BRANCH-011 | Pending (depends on T-BRANCH-010) | REQ-BRANCH-009 |
| T-BRANCH-012 | Pending (remote, human) | REQ-BRANCH-002, -003 (remote layer); CLAR-004 |
| T-BRANCH-013 | Pending (depends on T-BRANCH-012) | REQ-BRANCH-002, -003 |
| T-BRANCH-014 | Done (implementation log §Step 7 baseline) | REQ-BRANCH-004 |
| T-BRANCH-015 | Done (file edit; final `workflow_dispatch` trigger pending human) | REQ-BRANCH-004; NFR-BRANCH-006 |
| T-BRANCH-016 | Done (implementation log §Step 8 pre-state) | REQ-BRANCH-001, -005, -007, -008, -010, -012, -015; NFR-BRANCH-003, -004 |
| T-BRANCH-017 | Done (implementation log §Step 8) | REQ-BRANCH-008; NFR-BRANCH-003 |
| T-BRANCH-018 | Done (implementation log §Step 8) | REQ-BRANCH-001, -005, -007; NFR-BRANCH-003 |
| T-BRANCH-019 | Done (implementation log §Step 8) | REQ-BRANCH-012; NFR-BRANCH-003 |
| T-BRANCH-020 | Done (implementation log §Step 8) | REQ-BRANCH-015; NFR-BRANCH-003 |
| T-BRANCH-021 | Done (implementation log §Step 8) | REQ-BRANCH-010; NFR-BRANCH-004 |
| T-BRANCH-022 | In-progress (this PR is the docs PR) | REQ-BRANCH-001, -005, -007, -008, -010, -012, -015; NFR-BRANCH-003, -004 |
| T-BRANCH-023 | In-progress (this review = post-merge verification proxy) | All REQs from T-BRANCH-022 |
| T-BRANCH-024 | Done (implementation log §"Tasks NOT executed") | REQ-BRANCH-009 (discovery); resolution = N/A |
| T-BRANCH-025 | N/A (resolution from T-BRANCH-024) | REQ-BRANCH-009 |
| T-BRANCH-026 | Done (implementation log §Step 10 baseline) | REQ-BRANCH-009 (Dependabot sub-req) |
| T-BRANCH-027 | Done (implementation log §Step 10) | REQ-BRANCH-009; RISK-BRANCH-007 |
| T-BRANCH-028 | Pending (30-day verification window after remote ops complete) | All REQs and NFRs |
| T-BRANCH-029 | Pending (workflow-state update at full completion) | Workflow governance |

## Findings → REQ links

| Finding | Severity | REQ link |
|---|---|---|
| F-001 workflow-state artifact-status drift | low | Workflow governance (Article V) — not a REQ |
| F-002 five remote/human tasks pending | medium | REQ-BRANCH-006, -009, -013, -014; NFR-BRANCH-001, -002, -006 |
| F-003 pages.yml staged-but-inert | medium | REQ-BRANCH-004 sequencing; NFR-BRANCH-006 |
| F-004 PR base = main (acknowledged) | low | RISK-BRANCH-004 mitigation |
| F-005 spec line 285 example link (resolved) | low | None — verify gate now green |
| F-006 check:script-docs env artefact (pre-existing) | low | None — outside feature scope |
| F-007 check:links error in qa-produced test-report.md | medium | None directly; qa-stage hygiene |

No orphan REQs, ADRs, tasks, or findings.
