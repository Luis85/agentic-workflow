---
feature: shape-b-branching-adoption
area: BRANCH
current_stage: specification
status: active
last_updated: 2026-05-03
last_agent: architect
artifacts:
  idea.md: complete
  research.md: complete
  requirements.md: complete
  design.md: complete
  spec.md: pending
  tasks.md: pending
  implementation-log.md: pending
  test-plan.md: pending
  test-report.md: pending
  review.md: pending
  traceability.md: pending
  release-notes.md: pending
  retrospective.md: pending
---

# Workflow state — shape-b-branching-adoption

## Stage progress

| Stage | Artifact | Status |
|---|---|---|
| 1. Idea | `idea.md` | complete |
| 2. Research | `research.md` | complete |
| 3. Requirements | `requirements.md` | complete |
| 4. Design | `design.md` | complete |
| 5. Specification | `spec.md` | pending |
| 6. Tasks | `tasks.md` | pending |
| 7. Implementation | `implementation-log.md` + code | pending |
| 8. Testing | `test-plan.md`, `test-report.md` | pending |
| 9. Review | `review.md`, `traceability.md` | pending |
| 10. Release | `release-notes.md` | pending |
| 11. Learning | `retrospective.md` | pending |

> **Statuses:** `pending` | `in-progress` | `complete` | `skipped` | `blocked`. Section semantics + status enums: see [`_shared/state-file-sections.md`](./_shared/state-file-sections.md).

## Notes on meta-features

Plan-level meta-features may skip Stage 7-9 canonical artifacts when each sub-task ships as its own PR with implementation evidence, tests, review, and trace links. Record the rationale under `## Skips` and point to the per-PR evidence. See [`_shared/state-file-sections.md`](./_shared/state-file-sections.md) for the full rule.

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
- [ ] OPEN-BRANCH-001 — exact path/syntax for the four scheduler-only bot configs (review-bot, plan-recon-bot,
                  dep-triage-bot, actions-bump-bot). Likely .github/workflows/<bot>.yml; some may live outside
                  the repo. Owner: spec author. Does not block specification start.
- [ ] OPEN-BRANCH-002 — whether to remove `main` from the github-pages environment allow-list immediately at
                  rollout step 7 or leave it for a follow-up. Architecturally optional. Owner: spec author.
- [ ] OPEN-BRANCH-003 — whether to add a PR-base CI check that fails when a topic PR targets `main`
                  (RISK-BRANCH-004 mitigation). Out of scope for this feature per PRD NG; flagged for future.
                  Owner: spec author / future feature.
