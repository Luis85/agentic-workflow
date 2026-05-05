---
id: ADR-0035
title: Add issue-draft track for early draft PR and living PRD from /spec:idea
status: proposed
date: 2026-05-04
deciders:
  - Luis Mendez
consulted:
  - Claude Sonnet 4.6
informed:
  - Repo maintainers
supersedes: []
superseded-by: []
tags: [workflow, github, issue-lifecycle]
---

# ADR-0035 — Add issue-draft track for early draft PR and living PRD from /spec:idea

## Status

Proposed

## Context

When a feature reaches `/spec:idea`, the GitHub issue and the Specorator workflow (`specs/<slug>/`) are decoupled. The issue accumulates freeform discussion while specs, requirements, and design artifacts develop in isolation. There is no canonical accumulation point for early ideas, no forcing function toward a PRD-shaped issue, and no feedback loop that surfaces spec progress back to collaborators watching the issue. External feedback arrives too late (post-spec, post-tasks).

The `/issue:breakdown` track (ADR-0022) partially addresses this post-Stage 6 — but nothing addresses the Stages 1–6 gap.

## Decision

Add `issue-draft` as a *post-Stage-1* opt-in track:

- New `/issue:draft <n>` conductor skill at `.claude/skills/issue-draft/SKILL.md`.
- New slash command at `.claude/commands/issue/draft.md`.
- New specialist agent at `.claude/agents/issue-draft.md` with tool scope `[Read, Edit, Write, Bash, Grep, Glob]`.
- New shared `issue-pr-sync` skill at `.claude/skills/issue-pr-sync/SKILL.md` — the first skill in this repo invoked by other conductors rather than by a slash command directly.
- New methodology doc `docs/issue-draft-track.md`.
- New templates `templates/issue-prd-template.md` and `templates/issue-draft-pr-body-template.md`.
- Three new optional YAML fields in `specs/<slug>/workflow-state.md`: `draft_pr`, `draft_pr_branch`, `issue_number`. These are purely additive — absent on all features that never run `/issue:draft`.
- Additive final step in each of the five stage conductors (Stages 2–6) and in the `/issue:breakdown` conductor: invoke `issue-pr-sync` non-fatally.

## Considered options

### Option A — Extend existing conductors directly
Each conductor contains its own sync logic inline. Simple but duplicates the sentinel rendering and `gh` call pattern six times.

- Pros: no new skill abstraction.
- Cons: drift risk; any fix must be applied to six files.

### Option B — Shared `issue-pr-sync` skill (chosen)
Sync logic lives in one skill; conductors call it as a final step.

- Pros: single implementation; easy to evolve; follows the shared-primitive pattern already used by `verify` and `new-adr`.
- Cons: first skill-invoked-by-skills pattern in this repo (new convention to document).

### Option C — New `/issue:lifecycle` wrapper conductor
A high-level conductor wraps the spec workflow and manages the PR/issue updates as a cross-cutting concern.

- Pros: unified control point.
- Cons: parallel entry point to `/orchestrate`; users who drive stages manually get no automatic updates.

## Consequences

### Positive

- Living PRD shape for issues from Stage 1 onward.
- Early draft PR as a discussion/feedback hub — external collaborators can comment before any code is written.
- Spec lineage accumulates in the draft PR body automatically, no manual maintenance.
- Graceful handoff to `/issue:breakdown` at Stage 6.
- Introduces the shared-skill pattern (`issue-pr-sync`) — reusable for future cross-cutting concerns.

### Negative

- New skill + agent + command + methodology doc + ADR + 2 templates to maintain.
- New `issue-pr-sync` skill convention (invoked by conductors) must be documented so future maintainers know it has no slash command.
- Additive final step in six existing conductor files — drift risk if conductors diverge.
- Three new optional fields in `workflow-state.md` — intentional relaxation of the "frontmatter schema is fixed" rule; mitigated by purely-additive nature and no migration.

### Neutral

- New sink rows for both templates and the three workflow-state fields.
- Phase 2 (operational bot, label-triggered) is a follow-up — out of scope for this ADR.

## Compliance

- `scripts/check-agents.ts` — `issue-draft` agent registered (frontmatter + `## Scope` heading).
- `scripts/check-command-docs.ts` — `/issue:draft` command registered; `npm run fix` regenerates the command-inventory block.
- `scripts/check-frontmatter.ts` — frontmatter on new skill, agent, templates, ADR, methodology doc.
- `scripts/check-adr-index.ts` — auto-indexed.
- `scripts/check-markdown-links.ts` — all new cross-links resolve.
- `AGENTS.md` agent-classes table — `issue-draft` row added.
- `CLAUDE.md` "Other tracks" table — `/issue:draft` entry added.

## References

- Design spec: `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md`.
- Methodology: `docs/issue-draft-track.md`.
- Companion ADR: `docs/adr/0022-add-issue-breakdown-track.md`.
- Sink: `docs/sink.md`.
