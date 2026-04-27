---
description: Stock-taking Track — Phase 2 (Audit). Invokes the legacy-auditor to investigate processes, use-cases, integrations, data landscape, pain points, and technical debt, producing audit.md.
argument-hint: <project-slug>
allowed-tools: [Read, Edit, Write, Bash]
model: sonnet
---

# /stock:audit

Run Phase 2 (Audit) of a Stock-taking Engagement. Read [`docs/stock-taking-track.md`](../../../docs/stock-taking-track.md) for the full methodology.

## Inputs

- `$1` — project slug (optional if only one engagement is active).
- Active `stock-taking/<slug>/stock-taking-state.md` with `current_phase: audit`.
- Completed `stock-taking/<slug>/scope.md` (Phase 1 output).

## Procedure

1. Resolve `$1`: locate the active engagement with `current_phase: audit`.
2. Confirm `scope.md` status is `complete` in `stock-taking-state.md`. If not, report the blocker and recommend running `/stock:scope` first.
3. Invoke the `legacy-auditor` agent with the following instruction:

   > Run Phase 2 (Audit) for the stock-taking engagement at `stock-taking/<slug>/`. Read `stock-taking-state.md` and `scope.md`, then create `audit.md` from `templates/stock-taking-audit-template.md`. Fill all sections — process map, use-case catalog, integration map, data landscape, pain points, and technical debt register — using the audit boundary defined in `scope.md`. For any item where evidence is absent, record `unknown — resolve via: <action>` rather than inventing content. Run the quality gate and update `stock-taking-state.md` to advance to `current_phase: synthesize`.

4. Verify that `stock-taking/<slug>/audit.md` exists and `stock-taking-state.md` shows `audit.md: complete`.
5. Print a completion summary (phase, artifact, gate status, any `unknown` items flagged, recommended next command: `/stock:synthesize`).

## Don't

- Don't do the auditor's work yourself.
- Don't advance to Phase 3 if the quality gate was not passed.
- Don't allow invented findings — if the gate has `unknown` items blocking it, surface them to the user to resolve before continuing.
