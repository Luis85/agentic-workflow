---
description: Stock-taking Track — Phase 3 (Synthesize). Invokes the legacy-auditor to distil findings into gap analysis, constraints, opportunities, migration considerations, and a Strangler Fig map, producing synthesis.md.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /stock:synthesize

Run Phase 3 (Synthesize) of a Stock-taking Engagement. Read [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) for the full methodology.

## Inputs

- `$1` — project slug (optional if only one engagement is active).
- Active `stock-taking/<slug>/stock-taking-state.md` with `current_phase: synthesize`.
- Completed `stock-taking/<slug>/scope.md` and `stock-taking/<slug>/audit.md`.

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: synthesize`.
2. Confirm both `scope.md` and `audit.md` are `complete` in `stock-taking-state.md`. If not, report the blocker and recommend the appropriate earlier command.
3. Invoke the `legacy-auditor` agent with the following instruction:

   > Run Phase 3 (Synthesize) for the stock-taking engagement at `stock-taking/<slug>/`. Read `stock-taking-state.md`, `scope.md`, and `audit.md`, then create `synthesis.md` from `templates/stock-taking-synthesis-template.md`. Fill all sections: gap analysis, hard constraints, soft constraints, candidate opportunities (observations only — no solution proposals), migration considerations, and Strangler Fig map. Set the `recommended_next` field to `discovery`, `spec`, or `both` with rationale. Run the quality gate and update `stock-taking-state.md` to advance to `current_phase: handoff`.

4. Verify that `stock-taking/<slug>/synthesis.md` exists and `stock-taking-state.md` shows `synthesis.md: complete`.
5. Print a completion summary (phase, artifact, gate status, `recommended_next` value, recommended next command: `/stock:handoff`).

## Don't

- Don't do the auditor's work yourself.
- Don't let the synthesis phase contain solution proposals or requirements — findings and observations only.
- Don't advance to Handoff if the quality gate was not passed.
