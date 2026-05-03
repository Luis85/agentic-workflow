---
feature: shape-b-branching-adoption
area: BRANCH
current_stage: learning
status: done
last_updated: 2026-05-03
last_agent: retrospective
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: complete
  tasks.md: complete
  implementation-log.md: complete
  test-plan.md: complete
  test-report.md: complete
  review.md: complete
  traceability.md: complete
  release-notes.md: complete
  retrospective.md: complete
---

# Workflow state — shape-b-branching-adoption

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | complete |
| 6. Tasks | `tasks.md` | complete |
| 7. Implementation | `implementation-log.md` + code | complete |
| 8. Testing | `test-plan.md`, `test-report.md` | complete |
| 9. Review | `review.md`, `traceability.md` | complete |
| 10. Release | `release-notes.md` | complete |
| 11. Learning | `retrospective.md` | complete |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`.

## Notes on meta-features

Plan-level meta-features may skip Stage 7-9 canonical artifacts when each sub-task ships as its own PR with implementation evidence, tests, review, and trace links. Record the rationale under `## Skips` and point to the per-PR evidence.

## Skips

- Stages 5-11 deferred this round — scope ends at Stage 4 (Design) + ADR + GitHub issue per agreed plan. Tag-scheme cleanup (#233) gates downstream stages.

## Blocks

- Implementation gated on parent issue triage and v0.5 immutable-release recovery (#233).

## Hand-off notes

```
2026-05-03 (orchestrator): Scaffolded after grill-resolved scope.
                           Decisions: Shape B in; release/* drop;
                           feat/ keep; squash out; tag-scheme deferred.
                           Next: /spec:idea capturing decisions as brief.
2026-05-03 (analyst): idea.md complete and quality gate passed (all 6 boxes checked).
                      Five open questions surface the research agenda:
                      bot audit (Q1), demo protection rules (Q2/CLAR-001),
                      ADR-0020 supersession strategy (Q3), develop branch
                      seeding and historical cleanup (Q4), Pages/demo initial
                      cut source (Q5).
                      Next: /spec:research.
2026-05-03 (analyst): research.md complete. All 5 questions answered.
                      Key findings: only docs-review-bot requires a 1-line
                      PROMPT.md edit (literal "main" in tutorial-drift rule);
                      other 4 bots are branch-agnostic in PROMPT.md. Reference
                      Specorator repo confirms develop+demo pattern with Pages
                      on demo branch. Single new ADR recommended to supersede
                      ADR-0020 (no errata required pre-supersession). release/v0.5.0
                      not visible on remote; develop does not exist on remote —
                      clean seed from main HEAD. demo seeded from main HEAD;
                      push-deny in settings.json + GitHub branch-protection rule
                      recommended. CLAR-001 resolved: promote-only for demo.
                      TBDs for architect: demo promotion automation and ruleset vs.
                      legacy protection rule choice.
                      Next: /spec:requirements.
2026-05-03 (pm): requirements.md complete. 15 EARS requirements written
                 (REQ-BRANCH-001 through REQ-BRANCH-015): 11 must, 4 should.
                 Covers: develop as PR target, push-deny for develop and demo,
                 pages.yml flip to demo, release/* drop from allow list,
                 develop+demo seeding, branching.md Shape B designation,
                 docs-review-bot PROMPT.md 1-line fix, bot scheduler updates,
                 new ADR superseding ADR-0020, release/v0.5.0 cleanup,
                 AGENTS.md/CLAUDE.md/worktrees.md updates.
                 CLAR-002 resolved at requirements stage (ADR-0020 supersession
                 strategy confirmed: single new ADR, frontmatter update only).
                 CLAR-003 (demo promotion automation) and CLAR-004 (ruleset vs.
                 legacy protection rule) are open — no blocker for design;
                 owner: architect.
                 Next: /spec:design.
2026-05-03 (architect): spec.md complete. SPEC-BRANCH-001 written end-to-end:
                 12 implementation interfaces (IF-01..IF-12), 6 data-structure
                 contracts (DS-01..DS-06), 12-step ordered rollout with explicit
                 preconditions / actions / success criteria / REQ links per step,
                 12 enumerated edge cases (EC-001..EC-012), and an NFR verification
                 checklist with deterministic shell-runnable checks for each of
                 NFR-BRANCH-001..006. All 15 REQ-BRANCH-NNN + 6 NFR-BRANCH-NNN
                 traced in the requirements coverage table at the bottom.
                 Key spec resolutions for the three OPEN-BRANCH-NNN questions
                 carried in from design:
                 - OPEN-BRANCH-001 (bot scheduler config paths): IF-09 procedure
                   = locate (`.github/workflows/<bot>.yml` first guess), edit the
                   integration-branch arg to `develop`, escalate as a clarification
                   if the scheduler lives outside the repo. Tasks must enumerate
                   one task per bot with the discovered path.
                 - OPEN-BRANCH-002 (remove `main` from Pages env allow-list):
                   resolved as Step 11 = optional, recommended after the 30-day
                   verification window completes.
                 - OPEN-BRANCH-003 (CI gate failing topic PRs targeting `main`):
                   explicitly out of scope; surfaced in EC-011 as a follow-up
                   trigger if RISK-BRANCH-004 recurs.
                 Hand-off to: planner (Tasks).
                 Open items for planner: enumerate one task per IF (12 tasks
                 minimum) plus the four bot-scheduler tasks (IF-09 expansion).
                 Per-bot scheduler-config discovery is a Stage 6 spike that may
                 surface a clarification (EC-010 path).
                 Per workflow-state.md Skips section, scope was originally
                 capped at Stage 4 + ADR + GitHub issue (Stages 5-11 gated on
                 #233). Spec stage was opt-in by user; tasks stage may proceed
                 if the user opts in again.
                 Next: /spec:tasks (or stop here per agreed scope).

2026-05-03 (qa): test-plan.md and test-report.md complete. 16 tests written
                 (TEST-BRANCH-001 through TEST-BRANCH-015 + TEST-BRANCH-009b).
                 FILE tests: 12 of 12 PASS. MANUAL tests: 3 deferred to deployment
                 phase. N/A: 1 (REQ-BRANCH-013, release/v0.5.0 absent from remote).
                 Zero failures. NFR-BRANCH-005 deny count=21 (threshold 19, PASS).
                 One NFR-003 heuristic false positive disclosed and confirmed not
                 a defect (correct Shape B prose in AGENTS.md). All must/should
                 requirements have test coverage. MANUAL-deferred tests require
                 spec Steps 5, 5b, 7, 12 on the live remote before closure.
                 Recommendation: ready for /spec:review. MANUAL tests are
                 deployment-phase gate items, not Stage 9 blockers.
                 Next: /spec:review.

2026-05-03 (planner): tasks.md complete. 29 tasks written (T-BRANCH-001 through
                 T-BRANCH-029) in TDD order, covering all 15 REQ-BRANCH-NNN and
                 6 NFR-BRANCH-NNN. Breakdown by type: 10 test/verification tasks
                 (qa), 12 implementation tasks (dev), 5 manual/remote-ops tasks
                 (human), 1 pre-condition/scaffolding task, 1 release/state task.
                 Key design decisions in the task plan:
                 - T-BRANCH-001 is the mandatory gate; all other tasks depend on it.
                 - T-BRANCH-003 (baseline deny count) precedes T-BRANCH-004
                   (settings.json edit) to satisfy NFR-BRANCH-005 TDD ordering.
                 - T-BRANCH-024 is an explicit discovery spike for OPEN-BRANCH-001
                   (bot scheduler config paths); T-BRANCH-025 is conditional on its
                   findings. If no in-repo schedulers name `main`, T-BRANCH-025
                   becomes a documentation-only task and REQ-BRANCH-009 is
                   satisfied by T-BRANCH-010 (default-branch flip).
                 - Steps with irreversible remote effects (branch seeding,
                   default-branch flip, ruleset PATCH) are owner=human.
                 - The docs PR (T-BRANCH-022) batches IF-04 through IF-08; its
                   five sub-tasks (T-BRANCH-017 through T-BRANCH-021) can be
                   authored in parallel after T-BRANCH-016.
                 First ready task: T-BRANCH-001 (human — pre-condition check).
                 Hand-off to: human (T-BRANCH-001), then dev (T-BRANCH-003 and
                 T-BRANCH-004 after baseline), qa (T-BRANCH-005 post-merge).
                 Next: /spec:implement

2026-05-03 (architect): design.md complete (Part C only — Parts A and B are
                 N/A, no user-facing UI surface). All 15 REQ-BRANCH-NNN and
                 6 NFR-BRANCH-NNN mapped in the requirements coverage table.
                 CLAR-003 RESOLVED: manual chore/promote-demo PR per release;
                 no auto-trigger this iteration (revisit if cadence rises or
                 maintainer pool grows). CLAR-004 RESOLVED: GitHub rulesets
                 (not legacy branch-protection rules) targeting main, develop,
                 demo with maintainer in bypass list — rulesets are available
                 on free-tier personal accounts for public repos and provide
                 a single allow-list spanning all three branches.
                 ADR-0027 written (next free number) supersedes ADR-0020.
                 ADR-0020 frontmatter updated: status=Superseded,
                 superseded-by=[ADR-0027]; body untouched per immutable-body
                 rule. ADR README index updated.
                 Rollout sequence: 10 ordered steps spanning 5 PRs + 2 manual
                 GitHub UI actions; non-destructive; pre-condition checks for
                 release/v0.5.0, develop, demo absence. Pages continuity
                 (NFR-BRANCH-006) preserved by sequencing the github-pages
                 environment allow-list update before the pages.yml trigger
                 flip.
                 Three open clarifications surfaced for spec stage
                 (OPEN-BRANCH-001 through 003) — none block specification.
                 Hand-off to: planner (Tasks) — but per workflow-state.md
                 Skips section, scope ends at Stage 4 + ADR + GitHub issue
                 (Stages 5-11 gated on parent issue triage and #233). Spec
                 stage may proceed if user opts in.
                 Next: /spec:specify (or stop here per agreed scope).

2026-05-04 (release-manager): release-notes.md complete. Verdict from review:
                 APPROVED_WITH_FINDINGS (no blockers). release-notes.md written
                 covering: summary, 12 files changed, post-merge checklist (8
                 human-owned remote-ops in critical-path order), rollback plan
                 (trigger, mechanism, data implications, communication),
                 9 file-level + 4 remote-ops verification steps, 6 known
                 limitations disclosed (none buried), observability signals
                 (CI gate, Pages deploy, PR discipline metric, counter-metric).
                 Product-page check: no user-visible product capability or
                 public CTA changes — sites/index.html not affected.
                 Quality KPI: npm run quality:metrics not run (no saved baseline
                 for this feature; this is a documentation/config-only change
                 with no script artefacts that the metrics runner would score).
                 AUTHORISATION GATE: release-notes.md is complete and ready.
                 Human must authorise before any tag, push, or remote operation.
                 Next: /spec:retro (retrospective already complete per state above).
                 Pending human actions: post-merge checklist in release-notes.md
                 §Post-merge checklist; close issue #255 when complete.

2026-05-04 (reviewer): review.md and traceability.md complete. Verdict:
                 APPROVED_WITH_FINDINGS. All 11 file-level REQs (REQ-BRANCH-001,
                 -002, -003, -004, -005, -007, -008, -010, -011, -012, -015) PASS
                 against spec verification commands. NFR-BRANCH-003, -004, -005
                 PASS (deny count = 21). Four REQs (REQ-BRANCH-006, -009 partial,
                 -013, -014) and three NFRs (-001, -002, -006) intentionally
                 PENDING — they depend on human-owned remote ops (T-BRANCH-001,
                 -002, -006, -008, -010, -012) that are out of scope for this
                 file-change PR per implementation log §"Tasks NOT executed".
                 Six findings logged: F-001 (low, workflow-state status drift),
                 F-002 (medium, five remote/human tasks must be sequenced post-
                 merge), F-003 (medium, pages.yml staged-but-inert until remote
                 ops complete), F-004 (low, this PR targets main by necessity),
                 F-005 (low, resolved spec-line link), F-006 (low, pre-existing
                 typedoc env artefact). No blocking findings. Brand review:
                 not-applicable (no UI surfaces touched). Verify gate green
                 (less the pre-existing check:script-docs typedoc artefact).
                 ADR-0020 body immutability respected; git diff against
                 origin/main returns empty for that file.
                 Hand-off to: release-manager. Sequence and execute the five
                 pending human-owned remote tasks (T-BRANCH-006, -008, -010,
                 -012, plus the gh workflow run pages.yml --ref demo
                 verification) per spec §State Transitions order. Capture
                 NFR-BRANCH-001/002/006 evidence in implementation-log.md.
                 Then update workflow-state to current_stage: release.
                 Next: /spec:release.
```

## Open clarifications

- [x] CLAR-001 — confirm `demo` branch protection rules pre-design (push-deny? promote-only from main or develop?)
                  RESOLVED 2026-05-03: push-deny in .claude/settings.json + GitHub branch-protection rule;
                  promote-only from main; no direct push for hotfixes. Promotion automation is TBD for architect.
- [x] CLAR-002 — fate of `release/v0.5.0` historical branch + ADR-0020 supersede strategy (mark superseded, or supersede + amend in place?)
                  RESOLVED 2026-05-03: verify release/v0.5.0 with git ls-remote at implementation time; delete
                  if found. ADR-0020 supersession: single new ADR; update ADR-0020 frontmatter only (status +
                  superseded-by); no errata required pre-supersession per immutable-body rule.
- [x] CLAR-003 — whether demo promotion (after main tag cut) is a manual release-checklist step or an automated
                  GitHub Actions trigger on main tag creation. Owner: architect.
                  RESOLVED 2026-05-03 (architect): manual chore/promote-demo PR per release; no CI auto-trigger
                  this iteration. Rationale: single-maintainer cadence does not justify the credential
                  surface a write-to-protected-branch workflow would require. Recorded in ADR-0027 §Compliance
                  with explicit revisit triggers (cadence > 1/month for 2 months OR maintainer pool grows).
- [x] CLAR-004 — confirm whether a legacy branch-protection rule or GitHub ruleset is used for demo and develop
                  given this repo's GitHub plan tier. Owner: architect.
                  RESOLVED 2026-05-03 (architect): GitHub rulesets (not legacy branch-protection rules).
                  Rationale: rulesets available on free-tier personal accounts for public repos; legacy rules
                  being phased out by GitHub; rulesets give one allow-list spanning main+develop+demo with a
                  single bypass list (the maintainer) for the manual demo promotion. Recorded in ADR-0027
                  §Compliance.
- [x] OPEN-BRANCH-001 — exact path/syntax for the four scheduler-only bot configs (review-bot, plan-recon-bot,
                  dep-triage-bot, actions-bump-bot). Likely .github/workflows/<bot>.yml; some may live outside
                  the repo. Owner: spec author. Does not block specification start.
                  RESOLVED 2026-05-03 (dev T-BRANCH-024 spike): no .github/workflows/<bot>.yml scheduler files
                  exist in the repo. T-BRANCH-025 converted to documentation-only N/A finding.
- [x] OPEN-BRANCH-002 — whether to remove `main` from the github-pages environment allow-list immediately at
                  rollout step 7 or leave it for a follow-up. Architecturally optional. Owner: spec author.
                  RESOLVED 2026-05-04: Pages env allow-list now contains demo, develop, main. Main retained for
                  backwards compatibility (no harm). Remote op T-BRANCH-006 complete.
- [x] OPEN-BRANCH-003 — whether to add a PR-base CI check that fails when a topic PR targets `main`
                  (RISK-BRANCH-004 mitigation). Out of scope for this feature per PRD NG; flagged for future.
                  Owner: spec author / future feature.
                  RESOLVED 2026-05-03: explicitly out of scope per PRD NG. No action required for this feature.
