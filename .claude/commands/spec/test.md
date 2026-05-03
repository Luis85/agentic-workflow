---
description: Stage 8 — Testing. Invokes qa to draft / refresh test-plan.md, run the suite, and produce test-report.md.
argument-hint: [feature-slug]
allowed-tools: [Agent, Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /spec:test

Run **stage 8 — Testing**.

1. Resolve slug; verify implementation tasks are `done` (or partial with explicit reason).
2. **Pre-stage gate** — see `docs/specorator.md §3.0`: if no open PR exists for the current branch and `gh` is available, ask the user whether to create a draft PR before stage work begins.
3. **Spawn the `qa` subagent.**
4. The QA agent:
   - finalises `specs/<slug>/test-plan.md` (if drafted earlier, refresh now);
   - runs the test suite per `docs/steering/tech.md`;
   - produces `specs/<slug>/test-report.md`:
     - per-requirement results table,
     - failures with reproduction + severity,
     - non-functional results vs. thresholds,
     - coverage gaps disclosed.
5. Verify every EARS clause has ≥ 1 test referencing its REQ ID. Orphan tests and orphan requirements are defects.
6. Update `workflow-state.md`.
7. **Post-stage gate** — see `docs/specorator.md §3.0`: update `issues/<number>-<slug>.md` (`stage`, `roadmap_status`, `updated_at`), push the branch, and mark the PR ready for review.
8. If any S1/S2 failure is open, recommend looping back to `/spec:implement`. Otherwise recommend `/spec:review`.
