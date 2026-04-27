---
description: Stock-taking Track — Phase 1 (Scope). Invokes the legacy-auditor to define audit boundaries, identify systems and stakeholders, catalogue available source material, and produce scope.md.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /stock:scope

Run Phase 1 (Scope) of a Stock-taking Engagement. Read [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) for the full methodology.

## Inputs

- `$1` — project slug (optional if only one engagement is active; required when multiple exist).
- Active `stock-taking/<slug>/stock-taking-state.md` with `current_phase: scope`.

## Procedure

1. Resolve `$1`:  locate the active engagement — `ls stock-taking/` then read `stock-taking-state.md` files to find the one with `current_phase: scope` and `status: active`. If ambiguous, ask the user.
2. Confirm `stock-taking-state.md` shows `current_phase: scope`. If the state shows a later phase, do not rerun scope — instead report current state and recommend the correct command.
3. Invoke the `legacy-auditor` agent with the following instruction:

   > Run Phase 1 (Scope) for the stock-taking engagement at `stock-taking/<slug>/`. Read `stock-taking-state.md`, create `scope.md` from `templates/stock-taking-scope-template.md`, fill all sections, run the quality gate, and update `stock-taking-state.md` to advance to `current_phase: audit`.

4. Verify that `stock-taking/<slug>/scope.md` exists and `stock-taking-state.md` shows `scope.md: complete`.
5. Print a completion summary (phase, artifact, gate status, recommended next command: `/stock:audit`).

## Don't

- Don't do the auditor's work yourself. If you find yourself drafting the scope content, stop and invoke the `legacy-auditor`.
- Don't advance to Phase 2 if the quality gate was not passed — report the unmet criteria to the user.
