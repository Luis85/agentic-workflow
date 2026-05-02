---
name: issue-breakdown
description: Conductor for the issue-breakdown track. Post-/spec:tasks. Decomposes a GitHub issue into independent draft PRs by parsing tasks.md, opens one draft PR per parallelisable batch, edits the parent issue body to track progress. Triggers "/issue:breakdown <n>", "break this issue down into draft PRs", "decompose issue".
argument-hint: <issue-number>
---

# Issue-breakdown conductor

You conduct the issue-breakdown track defined in `docs/issue-breakdown-track.md`. Your job: **gate** between phases, **dispatch** the `issue-breakdown` specialist agent at `.claude/agents/issue-breakdown.md`, **never** do the agent's work yourself. Filed by ADR-0022 (`docs/adr/0022-add-issue-breakdown-track.md`).

Shared rules (gating, escalation, intake-gate, constraints common to all conductors): `.claude/skills/_shared/conductor-pattern.md`.

## Read first

- `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md` — source-of-truth spec.
- `docs/issue-breakdown-track.md` — methodology.
- `templates/tasks-template.md` — the layout the agent parses.
- `memory/constitution.md` — Articles I, II, VI, IX especially.

## Inputs

- `<issue-number>` — required GitHub issue number passed as `$ARGUMENTS`.

## What you do, step by step

### Step 1 — Pre-flight

Confirm `gh auth status` succeeds. If not, surface to the user and exit.

Read the issue:

```bash
gh issue view <issue-number> --json number,title,body,labels,state,url
```

If `state != "OPEN"`, hard-stop. Tell the user the issue must be open.

### Step 2 — Resolve spec lineage

Dispatch the `issue-breakdown` agent with the issue payload. The agent attempts:

1. First `specs/<slug>/` link in issue body.
2. `spec:<slug>` label.
3. Surface candidates.

If the agent returns multiple candidates, batch a single `AskUserQuestion`:

- One option per candidate `specs/<slug>/` (recommended-first by `last_updated`).
- "Other" → free-text override (skip).

If the agent returns a single candidate, accept silently.

### Step 3 — Verify gate

Agent reads `specs/<slug>/workflow-state.md`. If `tasks.md` status is not `complete`, hard-stop. Surface to the user: "run `/spec:tasks` first; this conductor only runs post-tasks".

### Step 4 — Idempotency check

Agent searches for prior-run PRs via the slice-tag HTML comment.

If matches exist, batch one `AskUserQuestion`:

- `Resume — open only the missing slices` (Recommended).
- `Re-plan — recompute slices and open new ones (existing PRs untouched)`.
- `Abort`.

If matches exist *and* the parent issue body has no `<!-- BEGIN issue-breakdown:<slug> -->` block, refuse and surface: "prior run detected (PRs #x #y) but issue body block missing — restore manually before re-running."

### Step 5 — Parse tasks.md

Agent parses `specs/<slug>/tasks.md` and returns a slice list `[{ordinal, scope, goal, task_ids[], dod[], blocked_by[], may_slice}]`.

If the agent returns `parse-error`, surface the offending heading to the user and exit.

### Step 6 — Confirm slices

Batch one `AskUserQuestion`. Include the integration branch the agent resolved in Step 1 so the user can spot a Shape-A vs Shape-B mismatch before any PR is opened:

> N slices computed from `## Parallelisable batches` in `tasks.md`:
>
> - 01 — <goal> (T-AUTH-001, T-AUTH-005)
> - 02 — <goal> (T-AUTH-002)
> - …
>
> Open N draft PRs against issue #<n>, branched off `<integration-branch>` (resolved from `git symbolic-ref refs/remotes/origin/HEAD`)?

Options:

- `Open N drafts` (Recommended).
- `Edit slicing` — free-text "Other" answer; pass back to the agent as additional context for a re-parse with overrides.
- `Abort`.

If the agent returned just **one** slice, also offer `Skip — open one PR by hand instead`. Some single-slice flows are more friction than they save.

### Step 7 — Per-slice loop

Hand off control fully to the agent. The agent walks the per-slice loop sequentially: branch → empty commit → push → draft PR. You wait.

If the agent returns a partial-failure outcome (rate limit, dirty tree mid-run, etc.), surface the failure and the recoverable PR list to the user. Idempotency on re-run will resume.

### Step 8 — Update parent issue body

Agent renders and applies the sentinel-bracketed `## Work packages` section to the issue body.

### Step 9 — Audit log + hand-off note

Agent writes `specs/<slug>/issue-breakdown-log.md` and appends one dated line to the `## Hand-off notes` section of `specs/<slug>/workflow-state.md`.

### Step 10 — Report

Print a 3-line summary to the user:

- Path to feature folder.
- Count of PRs opened (with numbers).
- Path to audit log.

## Constraints (issue-breakdown-specific)

Generic conductor constraints + escalation pattern: `.claude/skills/_shared/conductor-pattern.md`. Specifics for this skill:

- **Never** invoke `tracer-bullet` at runtime. `tasks.md` is the input; it has already been produced upstream.
- **Never** modify `tasks.md`. If parse fails, the user fixes it (or re-runs `/spec:tasks`).
- **Never** open more than one PR per parallelisable batch (or per `🪓 may-slice` task).
- **Sequential** PR creation only — no `gh pr create` parallelism.
- Phase 2 (operational bot at `agents/operational/issue-breakdown-bot/`) is a separate PR; do not invoke or import any Phase-2-only file.

## Boundary with /spec:tasks

`/spec:tasks` produces `tasks.md` with `## Parallelisable batches`. This skill consumes that artifact. Their boundary is:

- `/spec:tasks` decides *what* to build (slices, dependencies, DoD).
- `/issue:breakdown` decides *how to track that work on GitHub* (one PR per slice, parent issue as dashboard).

Do not bleed `/issue:breakdown` concerns back into `/spec:tasks` or vice versa.

## References

- Design spec: `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`.
- Methodology: `docs/issue-breakdown-track.md`.
- ADR: `docs/adr/0022-add-issue-breakdown-track.md`.
- Tasks template: `templates/tasks-template.md`.
- Slicing primitive (consumed upstream by `/spec:tasks`): `.claude/skills/tracer-bullet/SKILL.md`.
- Sink: `docs/sink.md`.
