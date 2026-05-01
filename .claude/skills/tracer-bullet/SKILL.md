---
name: tracer-bullet
description: Decompose spec into vertical-slice tasks; each slice ships end-to-end. Stage 6. Triggers "tracer bullet", "vertical slice".
argument-hint: [feature-slug, e.g. "user-profile"]
---

# Tracer-bullet planning

After Hunt & Thomas's "tracer bullets" and Pocock's `to-issues` and `request-refactor-plan`. The cure for half-finished features and integration drift is to make every step a thin end-to-end slice.

## Procedure

### Step 1 — Read the spec

Read `specs/<slug>/spec.md` (or whatever artifact is being decomposed). Identify:

- **Behaviors**: what observable user-visible outcomes the spec promises.
- **Layers touched**: data, API, business logic, UI, observability, etc.
- **Existing seams**: where the codebase is already factored to accept new behavior.

### Step 2 — Draft slices

For each behavior, draft a slice that:

- Touches every layer it needs to (data → API → UI for a user-visible feature; data → API for a backend-only).
- Is the **smallest meaningful slice** — the minimum that produces an observable change.
- Leaves the codebase in a **working, committable state** at slice end (tests pass, type-check passes, no broken paths).
- Has explicit acceptance criteria phrased as observable behavior, not file changes.
- Declares dependencies on other slices (`Blocked by: T-<AREA>-NNN`).

### Step 3 — Order slices

Sort slices by:

1. **TDD discipline first** (per `docs/specorator.md` §3.6) — test tasks for a requirement come before implementation tasks for the same requirement.
2. **Dependency-respecting** — no slice unblocked before its dependencies.
3. **Risk-first when ties** — the slice with the most uncertainty goes first so we learn early.
4. **Smallest first within a risk tier** — a 2-hour slice before a half-day slice.

Number slices `T-<AREA>-NNN` per the traceability scheme (`docs/traceability.md`).

### Step 4 — Write `tasks.md`

Write `specs/<slug>/tasks.md` from `templates/tasks-template.md`. For each slice:

- Title (verb-first, observable outcome).
- ID (`T-<AREA>-NNN`).
- Why this slice (one sentence linking to a REQ or SPEC ID).
- Acceptance criteria (observable behaviors, ≤4 bullets).
- Test approach (RED test or characterization test).
- Risk level (L/M/H — high if anything is unknown).
- Blocked by (list of slice IDs).
- Owner (agent role from specorator).

Include a **dependency graph** at the top of `tasks.md` (mermaid `flowchart` or simple ASCII).

End with a **Definition of done** section: the user-visible behaviors that prove the whole spec is satisfied.

## Anti-patterns to refuse

- **Horizontal slices.** "All the database changes" then "all the endpoints" then "all the UI" is forbidden. If the slice doesn't go end-to-end, it's the wrong shape.
- **Mega-slice.** Anything >½ day is too big — split it.
- **Speculative slice.** "Refactor X first to make later work easier" — only allowed if it's required by an immediate slice, otherwise defer to a later workflow.
- **Implementation-detail slice.** "Add helper function" is not a slice — it's implementation noise inside someone else's slice.

## Rules

- Refer to behaviors and contracts. Avoid file paths and line numbers in the task description (per the `docs/specorator.md` discipline).
- Use vocabulary from `docs/glossary/<slug>.md` exactly. If you need a new term, coin it via `/glossary:new "<term>"` (the [`new-glossary-entry`](../new-glossary-entry/SKILL.md) skill) before writing the task. Per [ADR-0010](../../../docs/adr/0010-shard-glossary-into-one-file-per-term.md), the legacy `ubiquitous-language` flow is deprecated.
- This skill produces `tasks.md`. The `dev` agent during `/spec:implement` is the one that walks the list with `tdd-cycle`.
