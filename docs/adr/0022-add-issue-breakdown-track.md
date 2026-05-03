---
id: ADR-0022
title: Adopt issue-breakdown track for parallelising post-tasks issue work
status: proposed
date: 2026-05-02
deciders:
  - Luis Mendez
consulted:
  - Claude Opus 4.7 (1M context)
informed:
  - Repo maintainers
supersedes: []
superseded-by: []
tags: [workflow, github, parallelisation]
---

# ADR-0022 — Adopt issue-breakdown track for parallelising post-tasks issue work

## Status

Proposed

## Context

When a feature reaches `/spec:tasks`, the path from "tasks.md is complete" to "multiple people working on independent draft PRs against this issue" is manual today. Engineers eyeball `tasks.md`, run `gh pr create --draft` per slice, type each PR body, and edit the issue body to track progress. The repo already owns the right slicing primitive (the `tracer-bullet` skill, which produces `## Parallelisable batches` in `tasks.md`), but nothing consumes that structure to produce GitHub state.

The new track must:

1. Run *after* `/spec:tasks` (Article II — separation of concerns; planning ≠ GitHub state).
2. Re-use existing slicing output (no parallel slicing engine).
3. Keep the parent issue as the canonical progress dashboard.
4. Match the shape of every other opt-in track (conductor + slash command + agent + methodology doc + ADR), with an operational-bot follow-up.

## Decision

Add `issue-breakdown` as a *post-stage-6* opt-in track:

- New conductor skill at `.claude/skills/issue-breakdown/SKILL.md` driven by `/issue:breakdown <issue-number>`.
- New specialist subagent at `.claude/agents/issue-breakdown.md` with a narrow tool list (`Read, Edit, Write, Bash, Grep, Glob`).
- New methodology doc `docs/issue-breakdown-track.md`.
- New PR-body and issue-section templates under `templates/`.
- New append-only audit log at `specs/<slug>/issue-breakdown-log.md`.
- Phase 2 (label-triggered operational bot) ships in a follow-up.

The conductor parses `tasks.md` directly using its template-guaranteed anchors (`## Parallelisable batches`, per-task `**Description:**`, `**Definition of done:**`, `**Depends on:**`, the spec's `## Quality gate`). Each parallelisable batch becomes one draft PR; `🪓 may-slice` annotations override the batch grouping. The conductor does not invoke `tracer-bullet` at runtime — that skill is consumed once during `/spec:tasks` to produce the artifact.

## Alternatives considered

1. **Extend `/spec:tasks` to auto-open PRs.** Rejected — couples task-planning to GitHub state and breaks separation of concerns.
2. **Operational bot only, no conductor.** Rejected — inconsistent with every other multi-step workflow's shape; lacks a clean entry point for novel runs and re-runs.
3. **Mechanical 1:1 task→PR.** Rejected — produces too many tiny PRs and ignores `blockedBy` chains.
4. **Stacked branches off a `feat/issue-<n>` integration branch.** Rejected — adds a merge step the repo doesn't currently use.
5. **Body + scaffolding commit (test stubs, type stubs).** Rejected — conductor would need per-language file conventions; out of scope for v1.

## Consequences

### Positive

- Standard surface for parallelisable issue work.
- Spec lineage preserved in PR bodies (every slice PR cites `requirements.md`, `design.md`, `spec.md`, `tasks.md` IDs).
- Idempotent (sentinel-bracketed re-edit zone; HTML-comment slice tag on PRs).
- Mirrors existing opt-in track shape — low cognitive cost for adopters.

### Negative

- One more skill + agent + methodology doc to maintain.
- Coupled to the heading layout of `templates/tasks-template.md` (drift risk; mitigated by the conductor's "refuse on missing anchor" rule).
- Empty scaffold commit per slice is mildly noisy in `git log`.
- Sentinel-block re-edits are last-write-wins (documented in the spec).

### Neutral

- New append-only audit-log artifact under `specs/<slug>/issue-breakdown-log.md`. No schema change to `workflow-state.md`.
- A future structured side-car (`specs/<slug>/tasks.json` emitted by `tracer-bullet`) would replace the regex parser. Out of scope for v1.

## References

- `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`
- `docs/specorator.md`
- `docs/sink.md`
- `templates/tasks-template.md`
- `.claude/skills/tracer-bullet/SKILL.md`
- ADR-0005 (Discovery Track), ADR-0006 (Sales Cycle), ADR-0011 (Project Scaffolding) — opt-in track precedent.
