---
title: Issue-breakdown track — design
date: 2026-05-02
status: draft
authors:
  - Luis Mendez (with Claude Opus 4.7)
related:
  - docs/specorator.md
  - .claude/skills/tracer-bullet/SKILL.md
  - .claude/skills/orchestrate/SKILL.md
  - docs/sink.md
  - AGENTS.md
---

# Issue-breakdown track — design

## Problem

Today, when a GitHub issue describes a product increment whose Specorator workflow has reached `/spec:tasks` (i.e. `tasks.md` is `complete`), the path from "tasks ready" to "multiple people working on independent draft PRs against this issue" is manual:

- A human reads `tasks.md`, decides what slices look like, opens `gh pr create --draft` per slice, types each PR body, and then edits the issue body to track progress.
- This is repetitive, error-prone, and skips the repo's existing slice-decomposition discipline (the `tracer-bullet` skill).
- Multiple people cannot trivially pick up parallel work, because the chunking and PR scaffolding live only in the human's head.

We need an integrated workflow that: (a) decomposes a `tasks.md` into vertical slices via the canonical skill, (b) opens one independent draft PR per slice, (c) keeps the parent issue as the canonical progress dashboard, and (d) exposes both an interactive (conductor) and an unattended (operational bot) surface — matching how every other workflow in this repo is shaped.

## Goals

1. **Conversational entry point.** A new `/issue:breakdown <issue-number>` slash command and matching conductor skill drive the flow end-to-end, gating with `AskUserQuestion`.
2. **Vertical-slice decomposition** of `tasks.md` rows into independent draft PRs via the existing `tracer-bullet` skill — no parallel slicing engine.
3. **Body-only PRs.** Each PR is opened with a generated body (spec lineage, task IDs, DoD, references, standard PR template) and a single empty scaffold commit (no source diff). Implementers write the first real commit.
4. **Issue stays canonical.** Conductor edits the parent issue body once to add a `## Work packages` section linking each draft PR. GitHub's task-list-link feature auto-strikes entries when PRs close.
5. **Branch per slice, off `main`.** Honours the repo's `branch per concern` rule. No worktrees pre-created — implementers run the worktree skill themselves when picking up a slice.
6. **Idempotent.** Re-running the conductor against the same issue resumes (skips slices that already have PRs) or re-plans (creates only missing PRs); never duplicates.
7. **Audit log under the feature.** A free-form `specs/<slug>/issue-breakdown-log.md` records each run's slice→PR mapping for traceability. Workflow-state schema is *not* changed.
8. **Phase 2: operational bot.** Headless variant under `agents/operational/issue-breakdown-bot/` triggers on `breakdown-me` label and shares the conductor's source-of-truth prompt.

## Non-goals

- Replacing `/spec:tasks`. The conductor is strictly post-tasks.
- Decomposing issues that have no spec lineage. Hard-stop with a recommendation to run `/spec:start` and the upstream stages.
- Auto-implementing the slices. The PR is empty; implementers write code.
- Auto-merging slice PRs. Out of scope; existing review-bot + verify-gate handle that.
- Stacked branches off an integration parent. Slices target `main` directly. Cross-slice dependencies are expressed via `Depends on #<PRn>` in the PR body, not by branch graph.
- Mutation of `tasks.md` or `workflow-state.md` schema. Only a free-form `## Hand-off notes` line is appended.

## Out-of-scope alternatives considered

These were rejected during brainstorming:

- **Extend `/spec:tasks` to auto-open PRs.** Couples task-planning to GitHub state and breaks separation of concerns (Article II).
- **Operational bot only, no conductor.** Lacks a clean entry point for novel runs and re-runs; inconsistent with every other multi-step workflow in the repo (each has both a conductor skill and a slash command).
- **Mechanical 1:1 task→PR.** Produces too many tiny PRs and ignores `blockedBy` chains.
- **Stacked branches off `feat/issue-<n>` integration branch.** Adds a merge step the repo doesn't currently use.
- **Body + scaffolding commit (test stubs, type stubs).** Conductor would need to know the project's file conventions per-language; out of scope for v1.

These are recorded in the ADR (see "Decisions" below).

## High-level flow

```
/issue:breakdown <n>
   │
   ├─ Pre-flight ────────── gh auth ok? issue open? read issue.
   │
   ├─ Resolve spec ──────── issue body specs/ link → label spec:<slug>
   │                        → AskUserQuestion (list candidates)
   │
   ├─ Verify gate ───────── workflow-state.md tasks.md == complete?
   │                        if not, hard-stop with "run /spec:tasks first"
   │
   ├─ Idempotency ───────── gh pr list --search "Refs #<n>"
   │                        existing PRs found → AskUserQuestion
   │                        (resume / re-plan / abort)
   │
   ├─ Slice ─────────────── dispatch tracer-bullet skill on tasks.md
   │                        → [{slug, goal, task_ids[], dod[], depends_on[]}]
   │
   ├─ Confirm ──────────── AskUserQuestion: open drafts / edit / abort
   │
   ├─ Per-slice loop ────── (sequential)
   │      ├─ git switch -c feat/<slug>-slice-NN-<short> main
   │      ├─ git commit --allow-empty -m "chore(<area>): scaffold T-<AREA-NNN> slice"
   │      ├─ git push -u origin <branch>
   │      └─ gh pr create --draft --base main --head <branch>
   │              --title "feat(<area>): <goal> (slice NN/N)"
   │              --body-file <rendered-pr-body>
   │
   ├─ Update parent issue ─ gh issue edit <n> --body-file <rendered-issue>
   │                        (idempotent BEGIN/END sentinel block)
   │
   ├─ Audit log ─────────── append specs/<slug>/issue-breakdown-log.md
   │
   └─ Hand-off note ─────── append one line to specs/<slug>/workflow-state.md
                            ## Hand-off notes section
```

## Components

### File map

New artifacts:

```
.claude/skills/issue-breakdown/SKILL.md         # conductor (Phase 1)
.claude/commands/issue/breakdown.md             # /issue:breakdown <num>
.claude/agents/issue-breakdown.md               # specialist subagent
docs/issue-breakdown-track.md                   # methodology doc
docs/adr/NNNN-add-issue-breakdown-track.md      # required ADR
templates/issue-breakdown-pr-body-template.md   # PR body skeleton
templates/issue-breakdown-issue-section.md      # issue `## Work packages` seed
agents/operational/issue-breakdown-bot/         # Phase 2 (follow-up PR)
  PROMPT.md
  README.md
.github/workflows/issue-breakdown-bot.yml       # Phase 2
```

Updates to existing files:

- `.claude/commands/README.md` — add `issue/` namespace.
- `.claude/skills/README.md` — list new skill.
- `AGENTS.md` — add row to skill table; add row to agent classes table.
- `docs/sink.md` — declare sink for `specs/<slug>/issue-breakdown-log.md`.
- `CLAUDE.md` — link new track from "Other tracks (opt-in)" table.

### Conductor skill (`.claude/skills/issue-breakdown/SKILL.md`)

Frontmatter: `name`, `description`, `argument-hint: <issue-number>`. Imports `_shared/conductor-pattern.md` for gating + escalation rules (consistent with `orchestrate`, `discovery-sprint`, `sales-cycle`).

Body sections:

1. Read first (state, references).
2. Pre-flight (auth, issue read).
3. Resolve spec lineage (3 fallback strategies).
4. Verify gate (`tasks.md` complete).
5. Idempotency check.
6. Slice (dispatch `tracer-bullet`; parse output).
7. Confirm (single `AskUserQuestion`).
8. Per-slice loop (branch → empty commit → push → draft PR).
9. Update parent issue body (sentinel-bracketed re-edit zone).
10. Audit log + hand-off note.
11. Constraints (idempotent; never `--no-verify`; sequential; no `main` writes).
12. References.

### Subagent (`.claude/agents/issue-breakdown.md`)

```yaml
---
name: issue-breakdown
description: Decomposes an issue + completed tasks.md into vertical-slice draft PRs.
tools: [Read, Edit, Write, Bash, Grep, Glob]
---
```

Tool scoping rationale (per Article VI):

- **Read / Grep / Glob** — read `specs/<slug>/`, `tasks.md`, templates.
- **Edit / Write** — write `issue-breakdown-log.md`; staged PR/issue body files; one-line hand-off note in `workflow-state.md`.
- **Bash** — `git`, `gh`. Pushes to `main` / `develop` already denied by `.claude/settings.json`. Branch pushes to `feat/*` allowed.
- **No Agent tool** — no further dispatch; `tracer-bullet` runs as a Skill not a subagent.

### Slash command (`.claude/commands/issue/breakdown.md`)

Thin wrapper; pattern matches `/orchestrate` → orchestrate skill.

```yaml
---
description: Decompose a GitHub issue into independent draft PRs from tasks.md.
argument-hint: <issue-number>
---

Run the issue-breakdown skill for issue #$ARGUMENTS.
```

### PR body template (`templates/issue-breakdown-pr-body-template.md`)

```markdown
<!-- Generated by issue-breakdown skill. Edit freely after first real commit. -->

## Slice <NN>/<N>: <goal>

Refs #<issue-number>

## Spec lineage

- Feature: `specs/<slug>/`
- Requirements: `specs/<slug>/requirements.md` § <REQ-IDs>
- Design: `specs/<slug>/design.md` § <section anchors>
- Spec: `specs/<slug>/spec.md` § <interface IDs>
- Tasks: `specs/<slug>/tasks.md` § <T-IDs>

## Tasks in this slice

- [ ] T-AREA-NNN — <title>
- [ ] T-AREA-NNN — <title>

## Depends on

- #<PRn> (slice <MM>) — or `none`

## Definition of done

- [ ] All tasks above marked done in `tasks.md`
- [ ] Tests for relevant TEST-IDs pass
- [ ] `npm run verify` green
- [ ] Docs updated in this PR
- [ ] PR template checklist below complete

---

<!-- Standard PR template appended verbatim from .github/PULL_REQUEST_TEMPLATE.md -->
```

The conductor renders the slice-specific header and then concatenates the verbatim contents of `.github/PULL_REQUEST_TEMPLATE.md`. No drift: if the PR template changes, future runs pick up the new version automatically.

### Issue section template (`templates/issue-breakdown-issue-section.md`)

```markdown
## Work packages

<!-- BEGIN issue-breakdown:<slug> -->
Generated <YYYY-MM-DD> by `/issue:breakdown`.

- [ ] #<PR1> — slice 01: <goal>
- [ ] #<PR2> — slice 02: <goal>
- ...

Spec: `specs/<slug>/`. Re-run with `/issue:breakdown <n>` to refresh.
<!-- END issue-breakdown:<slug> -->
```

The `<!-- BEGIN ... -->` / `<!-- END ... -->` sentinel comments delimit the conductor-managed re-edit zone. Anything outside this block in the issue body is preserved on re-runs. GitHub's native task-list-link feature auto-strikes `- [ ] #<PRn>` entries when the referenced PR closes — no polling required.

### Phase 2 — operational bot

`agents/operational/issue-breakdown-bot/PROMPT.md` is the source-of-truth prompt loaded by the scheduled GitHub Action. Same logic as the conductor agent, with these differences:

- Headless: no `AskUserQuestion`. Auto-picks "Open drafts" at confirm step; auto-picks "Resume" at idempotency check.
- Reads issue context from the GitHub Action environment (`GITHUB_EVENT_PATH` issue payload).
- On finish: removes `breakdown-me` label, comments `Created N draft PRs: #x #y …`.
- On error: comments error trace, leaves the label so the issue is visibly stuck.

Workflow `.github/workflows/issue-breakdown-bot.yml`:

```yaml
on:
  issues:
    types: [labeled]

jobs:
  decompose:
    if: github.event.label.name == 'breakdown-me'
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
      contents: write
    concurrency:
      group: issue-breakdown-${{ github.event.issue.number }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v4
      # Run Claude Code action with PROMPT.md + issue context.
```

Bot ships in a follow-up PR after the conductor stabilises. The two share `PROMPT.md` content via reference (bot's `PROMPT.md` includes the conductor agent body and overrides the gating sections).

## Data flow

```
GitHub issue #<n>
        │
        │ gh issue view
        ▼
issue-breakdown agent
        │
        ├─ reads ──► specs/<slug>/{workflow-state.md,
        │                          requirements.md,
        │                          design.md,
        │                          spec.md,
        │                          tasks.md}
        │
        ├─ dispatches ──► tracer-bullet skill
        │                       │
        │                       └─► slice list
        │
        ├─ writes ──► specs/<slug>/issue-breakdown-log.md  (audit)
        ├─ appends ─► specs/<slug>/workflow-state.md       (## Hand-off notes line)
        ├─ git push ─► origin feat/<slug>-slice-NN-...     (per slice)
        ├─ gh pr create ─► draft PR per slice
        │                       │
        │                       ▼
        │                  GitHub PRs (draft, body-only, 1 empty commit)
        │
        └─ gh issue edit ─► parent issue body
                                │
                                ▼
                         ## Work packages section (sentinel-bracketed)
```

## Edge cases

| Case | Handling |
|---|---|
| `tasks.md` not complete | Hard-stop, message: "run /spec:tasks first". |
| Issue closed | Hard-stop, refuse. |
| Issue already has `<!-- BEGIN issue-breakdown:<slug> -->` block | Idempotent re-edit (replace block contents); preserve outside. |
| Existing PRs `Refs #<n>` | Skip those slices; only open missing ones. Surface count to user. |
| Dirty working tree | Abort before any branch creation. Surface `git status` to user. |
| Branch name collides with existing remote | Append `-NN` numeric suffix. |
| `verify` hook fails on empty commit | Triage; never `--no-verify`. Empty commit means no source diff; failures indicate a hook misconfiguration to fix. |
| `gh pr create` fails (rate limit / perms) | Abort run; partial state recoverable via re-run idempotency. Audit log records what got created before the failure. |
| User has 2+ candidate `specs/<slug>/` matches | `AskUserQuestion` to disambiguate. |
| `tracer-bullet` returns 0 slices | Surface to user; abort. |
| `tracer-bullet` returns 1 slice | Confirm — single PR may not need this skill. Offer to abort. |
| Issue body has no `specs/` link AND no `spec:` label | `AskUserQuestion` lists all `tasks.md`-complete features. |
| User aborts confirmation | No git or gh side-effects. |

## Verify-gate impact

The new track adds files registered by these existing checks:

- `scripts/check-agents.ts` — register `issue-breakdown` agent.
- `scripts/check-command-docs.ts` — register `/issue:breakdown` command.
- `scripts/check-frontmatter.ts` — frontmatter on new templates + skill + agent + ADR.
- `scripts/check-adr-index.ts` — auto-indexed.
- `scripts/check-markdown-links.ts` — all new cross-links resolve.
- `scripts/check-token-budget.ts` — unaffected. Skill is on-demand, not always-loaded; not in `MEMORY.md`.

No new check scripts are required for v1.

## Decisions (filed via `/adr:new`)

ADR-NNNN — `add-issue-breakdown-track`. Required because the new track is not in the canonical 11-stage Specorator list (Article II separation), introduces a new conductor surface (touches `AGENTS.md`'s "agent classes" table), and adds a new sink for `specs/<slug>/issue-breakdown-log.md` (touches `docs/sink.md`).

ADR captures:

- **Context.** Multiple-implementer issue work today is manual; tasks.md → draft-PR translation has no integration.
- **Decision.** Add `issue-breakdown` as a *post-stage-6* opt-in track with conductor skill + slash command + agent + bot, mirroring the shape of `discovery`, `stock-taking`, `sales`, etc.
- **Alternatives.**
  1. Extend `/spec:tasks` to auto-open PRs (rejected: couples planning to GitHub).
  2. Operational bot only, no conductor (rejected: inconsistent with every other workflow's shape).
  3. Mechanical 1:1 task→PR (rejected: ignores blockedBy chains, produces tiny PRs).
- **Consequences.**
  - **Positive.** Standard surface for parallelisable work; preserves spec lineage in PR bodies; idempotent.
  - **Negative.** Extra skill+agent+bot to maintain; coupled to `tracer-bullet` shape (drift risk); empty-commit per slice is mildly noisy in `git log`.
  - **Neutral.** New audit-log artifact under `specs/<slug>/`; no schema change.

## Testing strategy

- **Unit-equivalent.** No new TS code in v1 (skill + templates + markdown). The `verify` gate covers frontmatter, links, agent registration, command registration, ADR indexing.
- **Integration.** Dogfood: open a tracking issue for *this* feature, run the workflow through `/orchestrate` to `/spec:tasks`, then run `/issue:breakdown <n>` against itself. The first slice PR will be the conductor skill + agent + slash command; subsequent slices will be templates, ADR, docs, bot. This exercises every code path on a real repo.
- **Idempotency.** Re-run `/issue:breakdown <n>` after first run; assert no duplicate PRs and parent issue body is unchanged outside the sentinel block.
- **Edge-case scripts.** Smoke-tests for the conductor against a fixture `specs/<slug>/` repo (under `examples/`) optional but not required for v1.

## Phasing

| Phase | Deliverable | PR |
|---|---|---|
| Phase 1 | Conductor skill + slash command + agent + templates + methodology doc + ADR | This feature |
| Phase 2 | Operational bot + Action workflow | Follow-up |
| Phase 3 | Optional refinements (e.g., GitHub Project board sync, CODEOWNERS-aware PR assignees) | Backlog |

## Open questions

None at design time. All material questions resolved during brainstorming. Surfaces to revisit during planning:

- Exact format of `tracer-bullet`'s output that the conductor parses (heading-based regex vs. structured emit).
- Whether the empty scaffold commit should be `chore(<area>):` or `scaffold(<area>):` (existing repo uses `chore` for non-functional commits — go with `chore`).
- Whether to emit the audit log in YAML frontmatter + body, or pure markdown (markdown for v1; promote to YAML if downstream tooling needs it).

## References

- `docs/specorator.md` — workflow contract.
- `docs/sink.md` — sink layout.
- `docs/discovery-track.md` — opt-in track shape (mirrored here).
- `.claude/skills/orchestrate/SKILL.md` — conductor pattern.
- `.claude/skills/_shared/conductor-pattern.md` — gating + escalation.
- `.claude/skills/tracer-bullet/SKILL.md` — slice decomposition (dispatched by this skill).
- `agents/operational/review-bot/` — operational-bot shape (mirrored for Phase 2).
- `templates/adr-template.md` — ADR template.
- `.claude/memory/feedback_pr_hygiene.md` — branch-per-concern rule.
- `.claude/memory/feedback_no_main_commits.md` — no direct commits to main.
