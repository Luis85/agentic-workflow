---
id: RETRO-V03-001
title: Version 0.3 release plan — Retrospective
stage: learning
feature: version-0-3-plan
status: complete
owner: retrospective
inputs:
  - RELEASE-V03-001
created: 2026-05-01
updated: 2026-05-01
---

# Retrospective — Version 0.3 release plan

## Outcome

- **Shipped on plan?** Yes. v0.3 closed via `release-notes.md` `status: complete` (PR #112) on 2026-05-01. The plan itself was filed 2026-04-28; nine sub-tasks landed in eight feature PRs over three days. No date target was set in `idea.md`, so "on plan" is judged by scope, not calendar.
- **Met success metrics?**
  - "A new reader can follow a complete lifecycle in `examples/` without opening template internals first." — Met. `examples/cli-todo/` ships all 11 stage artifacts plus a stage-ordered `examples/README.md`. Re-check: gather one external reader during the v0.4 cycle and watch them open files in stage order.
  - "`npm run verify` catches missing or inconsistent workflow artifacts." — Met. The new hard-fail validators caught 14 pre-existing trace gaps in `examples/cli-todo/spec.md` during PR #107 and one duplicate-frontmatter-id error masked by `collectDocumentDefinition` during PR #94.
  - "v0.3 implementation can be split into small PRs without stacked branches." — Met. Eight PRs landed without a single stacked branch.
  - "v0.4 can identify a named set of v0.3 validation checks to promote into required CI." — Met. `release-notes.md` §Validation baseline for v0.4 lists hard-fail and advisory checks by name with false-positive risks.
- **Surprises (positive and negative).**
  - **Positive:** the characterization-test-first refactor (T-V03-005a / 005b) found a real bug — `collectDocumentDefinition` was dropping duplicate-frontmatter-id errors into a throwaway array. The Codex review caught it. Without the refactor, the bug would still be silent.
  - **Positive:** TDD shipped each validator slice in roughly an hour from red bar to PR open. Pure-function shape (`<noun>DiagnosticsForText`) made the tests trivial.
  - **Negative:** none of the canonical Stage 7-9 artifacts (`implementation-log.md`, `test-plan.md`, `test-report.md`, `review.md`, `traceability.md`) made sense for a meta-feature where each sub-task ships its own PR. The closure required marking five artifacts `skipped` with rationale (PR #112). The template did not anticipate this case.

## What worked

- **Tracer-bullet slicing.** T-V03-003 was decomposed into three independent slices (Skips section, examples coverage, TEST → REQ/NFR). Each slice was a working `verify`-green PR. No big-bang validator change.
- **Pure-library + thin script wrapper pattern.** `scripts/lib/spec-state.ts` and `scripts/lib/traceability.ts` are testable in isolation. The script is a 10-line walker. Future validators should keep this shape.
- **Branch per concern + verify before push.** Eight PRs, zero stacks, zero `--no-verify` skips, zero broken `main`. The convention held under fast iteration.
- **Codex P1 / P2 review loop.** Three Codex P2s (PR #107 scoping bug, PR #108 ID inconsistency, PR #110 invalid `npm test` command) and one P1 (PR #94 dropped errors) caught problems that would otherwise have shipped. Round-trip from review to fix to merge stayed under fifteen minutes per finding.
- **CLAR resolution inline in `workflow-state.md`.** Both CLAR-V03-001 and CLAR-V03-002 were resolved in-place with the resolution text and date kept next to the original question. No drift between the resolution and the artifacts that depend on it.

## What didn't work

- **Stage 7-9 mismatch for meta-features.** As noted in §Outcome surprises. The plan-level lifecycle assumes each Specorator feature has its own implementation log, test plan, test report, review, and trace matrix. For a meta-feature whose "implementation" is a sequence of sub-PRs, those artifacts are noise. PR #112 worked around this by marking the artifacts `skipped` with rationale, which is correct but felt off-protocol.
- **`tasks.md` did not anticipate slicing.** T-V03-003 ended up shipping in three slices, each a separate PR; T-V03-005 ended up shipping in two slices. The original `tasks.md` listed each as one task. The mismatch surfaced in PR descriptions and the v0.3 issue, not in the task list itself. Future plans should accept that single-line tasks may grow into slices and label them as such on first contact, not in retrospect.
- **Initial `validateTestCoverage` over-aggregated.** The first cut of T-V03-003 slice 3 (PR #107) walked every artifact's text instead of scoping to the TEST's definition source. Codex P2 caught it. A 1-minute thought experiment about "where can a TEST's coverage legitimately live" before writing the function would have prevented the round-trip.
- **`npm run test:scripts` is opaque to release-readers.** PR #110 referenced `npm test -- --test ...` because the standard Node convention exists; the repo's actual convention is the custom `test:scripts` script. The release notes had to be patched. An obvious follow-up: add a `test` alias in `package.json` that points at `test:scripts` so the standard idiom works too. Filed as an action below.

## Spec adherence

- **Did we drift from spec?** No structural drift. The PRD requirements (REQ-V03-001 through REQ-V03-007) all map to shipped work. `release-notes.md` lists the PRs satisfying each requirement.
- **Were deviations documented?**
  - CLAR-V03-001 and CLAR-V03-002 were resolved with dated rationale in `workflow-state.md`. CLAR-V03-002 in particular shipped a hard-fail / advisory split that was not in the original PRD; the split is documented and the deferred item (every REQ/NFR has at least one TEST) is named as a v0.4 promotion candidate in `release-notes.md`.
  - T-V03-004 was effectively folded into T-V03-003 slice 3 plus the existing characterization tests from PR #94. Documented in PR #112's hand-off note.
- **Did we change requirements mid-flight?** No. The hard-fail/advisory split is an acceptance-criteria refinement on REQ-V03-002 / REQ-V03-003, not a new requirement. It was tracked through the clarification mechanism rather than re-baselined into the PRD.

## Process observations

- **Stages 1-6 (idea → tasks)** were already complete on 2026-04-28; the v0.3 work was Stage 7+ and largely sequential because each sub-task touched the same script files.
- **Stage 7 + 10 (implementation + release) interleaved.** Each sub-task PR was a vertical slice that shipped its own implementation, tests, and (per PR #112's §Skips rationale) its own trace evidence. The eleven canonical stages assume one feature → one set of artifacts; the v0.3 plan was many features → one plan. The §Skips workaround held up under verify but is the largest piece of "process tax" we paid.
- **Quality gates that flagged real issues — keep them.**
  - The `check:traceability` validator flagged 14 cli-todo trace gaps during PR #107. Real issue, real fix.
  - The `check:spec-state` skipped-artifact validator surfaced the §Skips documentation gap on PR #112. Real issue, real fix.
  - The `check:script-docs` validator caught a missing typedoc regen during PR #110. Real issue.
- **Quality gates that produced noise — tune them.** None. Every validator failure during v0.3 was a real defect.
- **Agents / roles that needed manual intervention — fix scope or tools.** None during v0.3. The plan was driven by `claude` (this assistant) acting as orchestrator + dev + release-manager + retrospective; no specialist agent escalation was needed.

## Actions

> Each action has an owner and a follow-up.

| Action | Type | Owner | Due |
|---|---|---|---|
| Add a `test` alias in `package.json` that delegates to `test:scripts`, so the standard `npm test` idiom works in addition to the custom script. Update `release-notes-template.md` Verification steps to mention `npm test`. | tooling | dev | 2026-06-01 (v0.4 cycle) |
| Add a §Notes-on-meta-features paragraph to `templates/workflow-state-template.md` and `docs/specorator.md` clarifying that plan-level features may legitimately skip Stage 7-9 artifacts when each sub-task ships as its own PR. Required content: a §Skips rationale plus per-PR trace evidence. | template | analyst | 2026-06-01 (v0.4 cycle) |
| Promote the v0.3 hard-fail validators (skipped-stage docs, examples coverage, TEST → REQ/NFR coverage) into required CI gates. Source list: `release-notes.md` §Validation baseline for v0.4. | tooling | release-manager | v0.4 cycle |
| Add the deferred CLAR-V03-002 advisory check ("every `REQ-*`/`NFR-*` has at least one covering `TEST-*`") to v0.4 scope. Decide on test-plan format lock first; until then, the check would block legitimate PRs. | adr / validator | analyst | v0.4 cycle |
| Update `tasks.md` template guidance: a task that touches more than one independent code path or artifact should be labelled "may slice" so PR planners expect it to land as several PRs. Avoids retrospective surprise. | template | planner | 2026-06-01 |

## Lessons (one-liners worth remembering)

- **Pure function + thin script wrapper is the only validator shape that survives review.** Every v0.3 validator landed as `<noun>DiagnosticsForText` (or similar) in `scripts/lib/`. The script is a walker.
- **Scope coverage to definition source.** Codex P2 on PR #107 — "any line in any artifact" coverage scans give false negatives. Always ask: where is this object defined, and what artifact owns the chain?
- **Characterization tests catch silent bugs.** PR #94's `collectDocumentDefinition` fix was discovered by extracting the function and testing it, not by reading the code.
- **The lifecycle is one feature → one set of artifacts.** Plan-level meta-features need explicit §Skips rationale until the template grows native support.
- **Codex review pays for itself.** Four findings on four PRs caught real problems. Each round-trip cost less than fifteen minutes.

---

## Quality gate

- [x] Three buckets covered (worked / didn't / actions).
- [x] Every action has an owner and a due date.
- [x] Spec adherence assessed.
- [x] Improvements proposed back into the kit (templates / agents / constitution).
