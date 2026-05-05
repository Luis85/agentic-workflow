---
description: Open an early draft PR for a GitHub issue after /spec:idea completes. Runs the issue-draft conductor.
argument-hint: <issue-number>
allowed-tools: [Agent, Read, Edit, Write, Bash, Grep, Glob]
model: sonnet
---

# /issue:draft

Open an early draft PR for GitHub issue #$ARGUMENTS.

Run the `issue-draft` skill (`.claude/skills/issue-draft/SKILL.md`) against issue #$ARGUMENTS. The skill is the brain; this command is the entry point.

The skill enforces:

- The feature linked from the issue must have `idea.md` status `complete` in its `workflow-state.md`. If not, it will tell you to run `/spec:idea` first.
- Re-runs are idempotent: if `draft_pr` is already set in `workflow-state.md`, the conductor surfaces the existing PR and aborts.

See `docs/issue-draft-track.md` for the full methodology and `docs/adr/0035-add-issue-draft-track.md` for the rationale.
