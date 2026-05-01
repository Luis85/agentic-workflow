# State-file shared sections

> Reference for the free-form sections every track-state template carries. Linked from `workflow-state-template.md`, `discovery-state-template.md`, `stock-taking-state-template.md`, `deal-state-template.md`, `project-state-template.md`, `roadmap-state-template.md`, `quality-state-template.md`, `scaffolding-state-template.md`, `portfolio-state-template.md`. Skill / agent code must keep the section *headings* in each state file (validated by `check:specs`); the *prose explanations* are factored here so each template stays terse.

## Status enums

Per-artifact `status` (used in `artifacts:` map and progress tables): `pending` | `in-progress` | `complete` | `skipped` | `blocked`. Track-level `status` enums vary per track — see each track's state-template for its own enum.

## Skips section

Document any skipped phases / stages and why. Trivial work (cosmetic fixes, doc-only changes) may legitimately skip phases. The retrospective phase is never skipped. Phases may be skipped only when the engagement is compressed (e.g., a 1-day "Lightning" Discovery sprint that collapses Frame+Diverge); document the trade-off so a reader knows what was sacrificed.

## Blocks section

Anything currently blocking progress. One bullet per blocker — name the artifact, the blocker, and the responsible party where known. Move to closed once unblocked; the section is a live signal, not an audit log.

## Hand-off notes section

Free-form, append-only. What does the next agent / human need to know? Where did the previous agent stop? Format is one dated entry per hand-off (`YYYY-MM-DD (role): note`). Useful for resume-from-pause and for rerunning a phase against partial outputs.

## Open clarifications section

Add and resolve as they come up. Unresolved clarifications block phase / stage transitions. A track cannot be marked `status: done` (or the track's equivalent terminal status) while any `- [ ]` clarification remains. Active engagements may carry unresolved clarifications as visible advisory signals.

Format: each clarification is `- [ ] CLAR-NNN — <short question>` while open, becomes `- [x] CLAR-NNN — <question> *(resolved YYYY-MM-DD: <answer>)*` when closed.
