---
description: Decompose a GitHub issue into independent draft PRs from tasks.md. Runs the issue-breakdown conductor.
argument-hint: <issue-number>
allowed-tools: [Agent, Read, Edit, Write, Bash, Grep, Glob]
model: sonnet
---

# /issue:breakdown

Decompose GitHub issue #$ARGUMENTS into independent draft PRs.

Run the `issue-breakdown` skill (`.claude/skills/issue-breakdown/SKILL.md`) against issue #$ARGUMENTS. The skill is the brain; this command is the entry point.

The skill enforces:

- The feature linked from the issue must have `tasks.md` status `complete` in its `workflow-state.md`. If not, it will tell you to run `/spec:tasks` first.
- Re-runs are idempotent: prior runs are detected by the `<!-- issue-breakdown-slice: issue-<n>-<NN> -->` HTML comment in PR bodies and the `<!-- BEGIN issue-breakdown:<slug> --> ... <!-- END issue-breakdown:<slug> -->` block in the parent issue body.

See `docs/issue-breakdown-track.md` for the full methodology and `docs/adr/0022-add-issue-breakdown-track.md` for the rationale.
