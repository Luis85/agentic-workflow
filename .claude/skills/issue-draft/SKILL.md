---
name: issue-draft
description: >
  Conductor for the issue-draft track. Post-/spec:idea opt-in track that opens a draft PR seeded from
  idea.md and applies a living PRD sentinel block to the parent issue. Evolves both automatically via
  issue-pr-sync as stages complete. Triggers: "/issue:draft <n>", "open early draft PR for this issue",
  "start tracking this issue with a draft PR".
argument-hint: <issue-number>
---

# Issue-draft conductor

You conduct the issue-draft track defined in `docs/issue-draft-track.md`. Your job: **gate** between phases, **dispatch** the `issue-draft` specialist agent, **never** do the agent's work yourself.

Shared conductor rules: `.claude/skills/_shared/conductor-pattern.md`.

## Read first

- `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md` — source-of-truth design.
- `docs/issue-draft-track.md` — methodology.
- `docs/adr/0035-add-issue-draft-track.md` — rationale.
- `memory/constitution.md` — Articles I, II, VI, IX.

## Inputs

- `<issue-number>` — required GitHub issue number passed as `$ARGUMENTS`.

## What you do, step by step

### Step 1 — Pre-flight

Confirm `gh auth status` succeeds. If not, surface to the user and exit.

Read the issue:

```bash
gh issue view <issue-number> --json number,title,body,labels,state,url
```

If `state != "OPEN"`, hard-stop.

### Step 2 — Resolve spec slug

Dispatch the `issue-draft` agent with the issue payload. The agent resolves the slug via its three-strategy fallback. If multiple candidates are returned, batch one `AskUserQuestion`:

- One option per candidate `specs/<slug>/` (recommended-first by `idea.md` last-updated).
- "Other" → free-text override.

### Step 3 — Verify gate

Agent reads `specs/<slug>/workflow-state.md`. If `idea.md` is not `complete`, hard-stop: "run `/spec:idea` first."

### Step 4 — Idempotency check

Agent reads `workflow-state.md`. If `draft_pr` is already set, batch one `AskUserQuestion`:

- `View existing draft PR #<n>` (Recommended).
- `Abort`.

Do not re-open. If the user wants a fresh draft PR, they must close the existing one and clear `draft_pr` from `workflow-state.md` manually.

### Step 5 — Confirm

Batch one `AskUserQuestion`:

> Open a draft PR for `specs/<slug>/` against issue #<issue-number>?
> Branch: `feat/<slug>-draft`
> PR title: `feat(<area>): <feature title> [draft]`
>
> The issue body will receive a PRD sentinel block. Both will be kept in sync by `issue-pr-sync` as stages complete.

Options:
- `Open draft PR` (Recommended).
- `Abort`.

### Step 6 — Dispatch agent

Hand off control to the `issue-draft` agent. Wait for its structured outcome.

If outcome is `aborted` or `pre-flight-failed`, surface the failure to the user.

### Step 7 — Report

Print a 3-line summary:

- Draft PR number and URL.
- Issue PRD block applied (`#<issue-number>`).
- Path to `workflow-state.md` where `draft_pr` was recorded.

## Constraints

- Never invoke `issue-pr-sync` — that skill is invoked by subsequent stage conductors, not by this conductor.
- Never modify spec artifacts other than `workflow-state.md`.
- Phase 2 (operational bot) is a separate PR; do not reference Phase-2-only files.

## References

- Methodology: `docs/issue-draft-track.md`.
- Agent: `.claude/agents/issue-draft.md`.
- Shared sync skill: `.claude/skills/issue-pr-sync/SKILL.md`.
- ADR: `docs/adr/0035-add-issue-draft-track.md`.
