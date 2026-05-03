# Issue-draft track — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the issue-draft track — a `/issue:draft <n>` command that opens an early draft PR seeded from `idea.md`, applies a PRD sentinel block to the issue body, and keeps both in sync via a shared `issue-pr-sync` skill invoked by each stage conductor as a non-fatal last step.

**Architecture:** Pure markdown delivery (skills, agents, templates, methodology doc, ADR). No TypeScript changes. The verify gate (`npm run verify`) acts as the test harness — each new file must pass frontmatter, link, agent, and command-docs checks before the task is committed. Files are created dependency-first so path references never point to missing targets.

**Tech Stack:** Markdown, YAML frontmatter, `gh` CLI, `git`, `npm run verify`, `npm run fix`

**Working directory:** `.worktrees/issue-draft-track/` (branch `feat/issue-draft-track`)

**Issue:** [#302](https://github.com/Luis85/agentic-workflow/issues/302) | **PR:** [#303](https://github.com/Luis85/agentic-workflow/pull/303)

**Design spec:** `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md`

---

## File map

### New files (create in this order — each is referenced by files created after it)

| # | Path | Purpose |
|---|---|---|
| 1 | `.gitignore` (edit) | Add `.issue-draft-staging/` |
| 2 | `docs/sink.md` (edit) | Add 5 new ownership rows |
| 3 | `templates/issue-prd-template.md` | PRD sentinel block template |
| 4 | `templates/issue-draft-pr-body-template.md` | Draft PR body skeleton |
| 5 | `docs/issue-draft-track.md` | Methodology doc |
| 6 | `docs/adr/0034-add-issue-draft-track.md` | ADR |
| 7 | `.claude/skills/issue-pr-sync/SKILL.md` | Shared sync skill (no command) |
| 8 | `.claude/agents/issue-draft.md` | Specialist subagent |
| 9 | `.claude/skills/issue-draft/SKILL.md` | Conductor skill |
| 10 | `.claude/commands/issue/draft.md` | Slash command |

### Modified files

| Path | Change |
|---|---|
| `.claude/commands/spec/research.md` | Add issue-pr-sync invocation as last step |
| `.claude/commands/spec/requirements.md` | Add issue-pr-sync invocation as last step |
| `.claude/commands/spec/design.md` | Add issue-pr-sync invocation as last step |
| `.claude/commands/spec/specify.md` | Add issue-pr-sync invocation as last step |
| `.claude/commands/spec/tasks.md` | Add issue-pr-sync invocation as last step |
| `.claude/skills/issue-breakdown/SKILL.md` | Add issue-pr-sync invocation as Step 9.75 (after Step 9.5, before Step 10) |
| `AGENTS.md` | Add `issue-draft` row to agent-classes table |
| `CLAUDE.md` | Add `/issue:draft` to "Other tracks" table |

---

## Chunk 1: Foundation — gitignore + sink + templates + docs

### Task 1: Confirm verify baseline is green

**Files:**
- Run: `npm run verify` in `.worktrees/issue-draft-track/`

- [ ] **Step 1: Run verify to confirm clean baseline**

```bash
cd .worktrees/issue-draft-track && npm run verify
```

Expected: exit 0, no errors. If failures, fix them before proceeding.

---

### Task 1.5: Copy design spec into worktree

**Files:**
- Create: `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md` (copy from main-branch tree)

The design spec lives in the primary working directory (`D:\Projects\agentic-workflow\docs\superpowers\specs\`) but is absent from the worktree. The methodology doc (Task 6) and conductor skill (Task 10) reference it by path — it must exist in the worktree before verify runs.

- [ ] **Step 1: Copy from the primary working tree**

```bash
cp ../../../docs/superpowers/specs/2026-05-04-issue-draft-track-design.md \
   docs/superpowers/specs/2026-05-04-issue-draft-track-design.md
```

(Run from `.worktrees/issue-draft-track/`. The `../../../` path resolves to the repo root.)

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-04-issue-draft-track-design.md
git commit -m "docs(workflow): add issue-draft track design spec to worktree"
```

---

### Task 2: Add `.issue-draft-staging/` to `.gitignore`

**Files:**
- Modify: `.gitignore`

The staging directory is used by `issue-pr-sync` to render body files before passing them to `gh`. It must never be tracked.

- [ ] **Step 1: Find the existing `.issue-breakdown-staging/` entry**

Open `.gitignore` and find the line containing `.issue-breakdown-staging/`.

- [ ] **Step 2: Add the new entry directly after it**

In `.gitignore`, add `.issue-draft-staging/` on the line immediately after `.issue-breakdown-staging/`. Both are siblings.

- [ ] **Step 3: Run verify**

```bash
npm run verify
```

Expected: exit 0 (gitignore changes are not validated by verify; this is just a sanity check).

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore(workflow): gitignore .issue-draft-staging/ staging directory"
```

---

### Task 3: Add sink rows for new artifacts

**Files:**
- Modify: `docs/sink.md`

Five new rows must be added to the ownership table in `docs/sink.md` — one per template file and three for new `workflow-state.md` optional fields.

- [ ] **Step 1: Open `docs/sink.md` and find the ownership table**

Locate the `| Path | Owner | Mutability |` table.

- [ ] **Step 2: Add rows for the new files and fields**

Append the following rows to the ownership table (after the existing `issue-breakdown-log.md` row):

```markdown
| `templates/issue-prd-template.md` | `issue-draft` conductor | Template (versioned; read-only after initial write) |
| `templates/issue-draft-pr-body-template.md` | `issue-draft` conductor | Template (versioned; read-only after initial write) |
| `specs/<slug>/workflow-state.md` `draft_pr` field | `issue-draft` agent | Write-once at `/issue:draft` time |
| `specs/<slug>/workflow-state.md` `draft_pr_branch` field | `issue-draft` agent | Write-once at `/issue:draft` time |
| `specs/<slug>/workflow-state.md` `issue_number` field | `issue-draft` agent | Write-once at `/issue:draft` time |
```

- [ ] **Step 3: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add docs/sink.md
git commit -m "docs(workflow): add sink rows for issue-draft track artifacts"
```

---

### Task 4: Create issue PRD template

**Files:**
- Create: `templates/issue-prd-template.md`

This template is rendered by `issue-draft` agent into the issue body sentinel block. It must have frontmatter (required by `check-frontmatter.ts`).

- [ ] **Step 1: Create the file**

Create `templates/issue-prd-template.md` with the following content:

```markdown
---
title: Issue PRD template
folder: templates
description: Sentinel block template applied to the issue body by /issue:draft. Grows stage by stage as Specorator workflow progresses.
entry_point: false
---

<!-- BEGIN issue-draft:<slug> -->
## Problem

<from idea.md>

## Solution direction

<from idea.md>

## Research

*(pending — populates after /spec:research)*

## Requirements

*(pending — populates after /spec:requirements)*

## Design

*(pending — populates after /spec:design)*

## Spec

*(pending — populates after /spec:specify)*

## Tasks & work packages

*(pending — populates after /spec:tasks and /issue:breakdown)*

## Status

`idea` → `research` → `requirements` → `design` → `spec` → `tasks` → `implementation`
<!-- END issue-draft:<slug> -->
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0. The `check-frontmatter.ts` script validates the frontmatter fields.

- [ ] **Step 3: Commit**

```bash
git add templates/issue-prd-template.md
git commit -m "feat(workflow): add issue PRD sentinel block template"
```

---

### Task 5: Create draft PR body template

**Files:**
- Create: `templates/issue-draft-pr-body-template.md`

- [ ] **Step 1: Create the file**

Create `templates/issue-draft-pr-body-template.md`:

```markdown
---
title: Issue-draft PR body template
folder: templates
description: Body skeleton for the early draft PR opened by /issue:draft. Sentinel block updated per stage by issue-pr-sync; free-form section preserved.
entry_point: false
---

<!-- BEGIN issue-draft-pr:<slug> -->
## Draft: <feature title>

Refs #<issue-number>

**Current stage:** `idea`

## Spec lineage

- Idea: `specs/<slug>/idea.md`
- Research: *(pending)*
- Requirements: *(pending)*
- Design: *(pending)*
- Spec: *(pending)*
- Tasks: *(pending)*
<!-- END issue-draft-pr:<slug> -->

---

## Open questions / feedback welcome

*(free-form — this section is never overwritten by automation)*
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add templates/issue-draft-pr-body-template.md
git commit -m "feat(workflow): add issue-draft PR body template"
```

---

### Task 6: Create methodology doc

**Files:**
- Create: `docs/issue-draft-track.md`

The methodology doc is the human-readable description of the track. It is referenced by the conductor skill, agent, and ADR — so it must exist before those files are created.

- [ ] **Step 1: Create the file**

Create `docs/issue-draft-track.md`:

```markdown
---
title: Issue-draft track
folder: docs
description: Opt-in track that opens an early draft PR after /spec:idea and evolves the issue body as a living PRD as each Specorator stage completes.
entry_point: false
---

# Issue-draft track

Opt-in track that runs *after* `/spec:idea`. Opens a draft PR seeded from `idea.md`, applies a PRD sentinel block to the parent issue body, and keeps both in sync via the `issue-pr-sync` shared skill as each subsequent stage completes.

Filed by ADR-0034 (`docs/adr/0034-add-issue-draft-track.md`).

## When to use

- A feature has reached `/spec:idea` (`idea.md` is `complete`).
- A GitHub issue exists for the feature.
- You want a draft PR as a discussion/feedback hub from the earliest point.
- You want the issue body to evolve into a living PRD as specs, requirements, and design are produced.

Not for:

- Features without a completed `idea.md` — run `/spec:idea` first.
- Issues with no GitHub presence — this track requires `gh` auth and an open issue.

## Inputs

- A GitHub issue number.
- A `specs/<slug>/` folder with `idea.md` status `complete`.

## Outputs

- One draft PR (`feat/<slug>-draft`) seeded from `idea.md`, with body maintained by `issue-pr-sync`.
- A PRD sentinel block (`<!-- BEGIN issue-draft:<slug> --> … <!-- END issue-draft:<slug> -->`) applied to the issue body and updated at each stage completion.
- Two new optional fields in `specs/<slug>/workflow-state.md`: `draft_pr` (PR number), `draft_pr_branch` (branch name), `issue_number`.

## Flow

```
/spec:idea completes → idea.md exists
    │
    ▼
/issue:draft <n>
    ├─ pre-flight: gh auth, issue open, idea.md complete
    ├─ create branch feat/<slug>-draft, push empty commit
    ├─ gh pr create --draft (seeded from idea.md)
    ├─ apply PRD sentinel block to issue body
    └─ write draft_pr, draft_pr_branch, issue_number to workflow-state.md
    │
    ▼
/spec:research → /spec:requirements → /spec:design → /spec:specify → /spec:tasks
    each (last step, non-fatal):
    issue-pr-sync skill:
        ├─ update draft PR body sentinel block
        └─ update issue PRD sentinel block
    │
    ▼
/issue:breakdown (additive final step after Step 10.5):
    issue-pr-sync: populate Tasks section of issue + draft PR body with slice PRs
    (human closes draft PR manually)
```

## Constraints

- `issue-pr-sync` is always the **last step** of each stage conductor — it never blocks stage completion.
- Sync failure is **non-fatal** — warn and skip; the stage still completes.
- Stage 1 (`/spec:idea`) is **not modified** — the draft PR is opened by `/issue:draft`.
- The draft branch carries **no source diff** — empty commit only.
- Sentinel blocks are last-write-wins. Humans annotate outside the block.
- The draft branch is created directly (not as a worktree) because it carries no source diff.

## References

- Design spec: `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md`.
- ADR: `docs/adr/0034-add-issue-draft-track.md`.
- Shared skill: `.claude/skills/issue-pr-sync/SKILL.md`.
- Companion track: `docs/issue-breakdown-track.md`.
- Sink: `docs/sink.md`.
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0. Link checker will validate all referenced paths exist. All should be green at this point.

- [ ] **Step 3: Commit**

```bash
git add docs/issue-draft-track.md
git commit -m "docs(workflow): add issue-draft track methodology doc"
```

---

### Task 7: Create ADR-0034

**Files:**
- Create: `docs/adr/0034-add-issue-draft-track.md`

- [ ] **Step 1: Create the file**

Create `docs/adr/0034-add-issue-draft-track.md`:

```markdown
---
id: ADR-0034
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

# ADR-0034 — Add issue-draft track for early draft PR and living PRD from /spec:idea

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
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0. The ADR index check auto-discovers the new file.

- [ ] **Step 3: Commit**

```bash
git add docs/adr/0034-add-issue-draft-track.md
git commit -m "docs(adr): ADR-0034 add issue-draft track"
```

---

## Chunk 2: Core skills and agent

### Task 8: Create `issue-pr-sync` shared skill

**Files:**
- Create: `.claude/skills/issue-pr-sync/SKILL.md`

This is the shared primitive. It is invoked by other conductors — not by any slash command. Key constraint from `check-agents.ts`: skills must have a frontmatter `name` field and either a frontmatter `description` or a top-level `#` heading.

The skill must not reference any path that doesn't yet exist (path validator). All paths it references (`docs/issue-draft-track.md`, templates) are already created.

- [ ] **Step 1: Create the skill directory and file**

Create `.claude/skills/issue-pr-sync/SKILL.md`:

```markdown
---
name: issue-pr-sync
description: >
  Shared skill invoked by stage conductors (Stages 2–6) and /issue:breakdown as a non-fatal last step.
  Reads draft_pr + issue_number from workflow-state.md and updates both the draft PR body and the issue
  PRD sentinel block with the just-completed stage's artifact. No-op when draft_pr is absent.
  No slash command — invoked by other conductors only.
---

# issue-pr-sync

Shared sync primitive. No slash command. Conductors invoke this as their **last step** after stage work completes.

## When to invoke

- After each stage conductor (Stages 2–6: `spec:research`, `spec:requirements`, `spec:design`, `spec:specify`, `spec:tasks`) completes its primary work.
- After `/issue:breakdown` Step 10.5 (housekeeping commit).
- **Never** invoked directly by the user. **Never** invoked by `/spec:idea` (Stage 1).

## Pre-condition check (no-op gate)

Read `specs/<slug>/workflow-state.md`. If `draft_pr` field is absent or empty, **exit silently** — this feature has not run `/issue:draft`. No warning, no side-effects.

## Inputs

Calling conductor passes:

| Input | Source |
|---|---|
| `draft_pr` | `workflow-state.md` — PR number (integer) |
| `issue_number` | `workflow-state.md` — GitHub issue number (integer) |
| `slug` | Feature slug (e.g. `auth`) |
| `stage` | Stage just completed (e.g. `research`, `requirements`, `design`, `specify`, `tasks`, `breakdown`) |
| `artifact_path` | Path to the new artifact (e.g. `specs/<slug>/requirements.md`) |

## Steps

### 1 — Verify draft PR still open

```bash
gh pr view <draft_pr> --json state --jq '.state'
```

If output is not `OPEN`, emit a warning: "draft PR #<n> is not open — skipping issue-pr-sync. Close the PR manually or update `draft_pr` in `workflow-state.md`." Return without further action.

### 2 — Fetch current PR body

```bash
gh pr view <draft_pr> --json body --jq '.body'
```

### 3 — Render updated PR body

Locate the `<!-- BEGIN issue-draft-pr:<slug> --> … <!-- END issue-draft-pr:<slug> -->` sentinel block.

Update `**Current stage:**` to the just-completed stage name.

Update the matching `- <Stage>: *(pending)*` line in the Spec lineage section to:

```
- <Stage>: `<artifact_path>`
```

If the stage is `breakdown`: add a human-readable note after the sentinel block (outside it):
```
*Implementation has moved to slice PRs. This draft PR is ready to close.*
```
Also populate the Tasks line with the slice PR list provided by `/issue:breakdown`.

**Sentinel block is always fully overwritten** — this is the always-overwrite contract (idempotent on re-run).

Preserve everything outside the sentinel block unchanged, especially the `## Open questions / feedback welcome` free-form section.

### 4 — Write updated PR body

```bash
# Render to staging file
mkdir -p .issue-draft-staging
# write rendered body to .issue-draft-staging/pr-<draft_pr>.md
gh pr edit <draft_pr> --body-file .issue-draft-staging/pr-<draft_pr>.md
rm .issue-draft-staging/pr-<draft_pr>.md
```

### 5 — Fetch current issue body

```bash
gh issue view <issue_number> --json body --jq '.body'
```

### 6 — Render updated issue PRD section

Locate the `<!-- BEGIN issue-draft:<slug> --> … <!-- END issue-draft:<slug> -->` sentinel block.

Update the section for the just-completed stage:

| Stage | Section updated |
|---|---|
| `research` | `## Research` — link to `specs/<slug>/research.md` |
| `requirements` | `## Requirements` — link to `specs/<slug>/requirements.md` with key REQ IDs if available |
| `design` | `## Design` — link to `specs/<slug>/design.md` |
| `specify` | `## Spec` — link to `specs/<slug>/spec.md` |
| `tasks` | `## Tasks & work packages` — link to `specs/<slug>/tasks.md` |
| `breakdown` | `## Tasks & work packages` — replace with `*See ## Work packages below (managed by /issue:breakdown).*` |

**Sentinel block always overwritten** — same always-overwrite contract.

Preserve everything outside the sentinel block.

### 7 — Write updated issue body

```bash
# write rendered body to .issue-draft-staging/issue-<issue_number>.md
gh issue edit <issue_number> --body-file .issue-draft-staging/issue-<issue_number>.md
rm .issue-draft-staging/issue-<issue_number>.md
```

Attempt `rmdir .issue-draft-staging` (will succeed silently if now empty, fail silently if not).

## Failure handling

Any `gh` command failure (auth, rate limit, network): emit a **warning** prefixed with `[issue-pr-sync] WARNING:` and **return without aborting the calling conductor**. The stage completion is not rolled back. Sync can be recovered by re-running the stage conductor (idempotent always-overwrite).

## Sentinel coexistence

Both `/issue:draft` (`<!-- BEGIN issue-draft:<slug> -->`) and `/issue:breakdown` (`<!-- BEGIN issue-breakdown:<slug> -->`) may place sentinel blocks in the same issue body. Their tags differ — they coexist without conflict. When invoked by `/issue:breakdown`, this skill updates the `issue-draft` sentinel's Tasks section to defer to the `issue-breakdown` block.

## References

- Methodology: `docs/issue-draft-track.md`.
- Design spec: `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md`.
- Templates: `templates/issue-prd-template.md`, `templates/issue-draft-pr-body-template.md`.
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0. The skill has `name` frontmatter + a top-level heading.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/issue-pr-sync/SKILL.md
git commit -m "feat(workflow): add issue-pr-sync shared skill"
```

---

### Task 9: Create `issue-draft` agent

**Files:**
- Create: `.claude/agents/issue-draft.md`

Agent file requirements (from `check-agents.ts`): YAML frontmatter with `name`, `description`, `tools` (non-empty array); body must contain `## Scope` heading.

- [ ] **Step 1: Create the file**

Create `.claude/agents/issue-draft.md`:

```markdown
---
name: issue-draft
description: >
  Opens an early draft PR seeded from idea.md and applies a PRD sentinel block to the parent issue body.
  Triggered by /issue:draft. Writes draft_pr, draft_pr_branch, and issue_number to workflow-state.md.
  Does not modify idea.md, requirements.md, design.md, spec.md, or tasks.md.
tools: [Read, Edit, Write, Bash, Grep, Glob]
model: sonnet
color: cyan
---

You are the **issue-draft** agent.

## Scope

You open one draft PR for a feature that has reached Stage 1 (`idea.md` complete). You read `specs/<slug>/idea.md` and `specs/<slug>/workflow-state.md`, create a branch, push an empty commit, open a draft PR seeded from the idea, apply the PRD sentinel block to the parent issue, and record `draft_pr`, `draft_pr_branch`, and `issue_number` into `workflow-state.md`.

You do **not** modify `idea.md`, `requirements.md`, `design.md`, `spec.md`, or `tasks.md`. You do not invoke `issue-pr-sync` — that skill is invoked by subsequent stage conductors.

## Read first

1. `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md` — source-of-truth design.
2. `docs/issue-draft-track.md` — methodology.
3. `templates/issue-draft-pr-body-template.md` — PR body to render.
4. `templates/issue-prd-template.md` — issue PRD sentinel to render.
5. `specs/<slug>/idea.md` — seed content for PR body and issue PRD.
6. `specs/<slug>/workflow-state.md` — confirm `idea.md` status is `complete`.

## Procedure

### Step 1 — Pre-flight

- `gh auth status` must succeed. Hard-stop if not.
- `gh issue view <n> --json number,title,body,labels,state` — hard-stop if `state != "OPEN"`.
- `git status --porcelain` — hard-stop if working tree is dirty.
- Detect the integration branch (same resolution as the `issue-breakdown` agent — see `docs/branching.md`):
  1. `git symbolic-ref --short refs/remotes/origin/HEAD` (strip `origin/` prefix).
  2. Prefer `develop` if that remote ref exists.
  3. Fall back to `main`.

### Step 2 — Resolve spec slug

1. Scan issue body for the first `specs/<slug>/` link. If found, use that slug.
2. Else scan issue labels for `spec:<slug>`. If found, use that slug.
3. Else surface to the conductor: list every `specs/*/workflow-state.md` whose `idea.md` artifact status is `complete`; conductor asks user to pick.

### Step 3 — Verify gate

Read `specs/<slug>/workflow-state.md`. Hard-stop if `idea.md` is not `complete`. Surface: "run `/spec:idea` first; `/issue:draft` requires `idea.md` complete."

### Step 4 — Idempotency check

Read `workflow-state.md`. If `draft_pr` already set, surface to conductor: "draft PR #<n> already exists for this feature. Open it or clear `draft_pr` from `workflow-state.md` to re-run." Return to conductor; do not proceed.

### Step 5 — Create branch and empty commit

```bash
# Detect integration branch (already resolved in Step 1)
BRANCH="feat/<slug>-draft"
git switch -c "${BRANCH}" <integration-branch>
git commit --allow-empty -m "chore(<area>): open draft discussion for <slug>"
git push -u origin "${BRANCH}"
```

If branch name collides on remote, append `-2` and retry once.

### Step 6 — Render and open draft PR

Strip frontmatter from `templates/issue-draft-pr-body-template.md` (drop everything up to and including the second `---` line). Substitute placeholders:

- `<slug>` → feature slug
- `<feature title>` → `title` field from `workflow-state.md` (or issue title)
- `<issue-number>` → issue number
- `<design-doc>` → path to design spec if present in `docs/superpowers/specs/`, else `(design spec pending)`

Write rendered body to `.issue-draft-staging/pr-body.md`.

```bash
mkdir -p .issue-draft-staging
gh pr create \
  --draft \
  --base <integration-branch> \
  --head "${BRANCH}" \
  --title "feat(<area>): <feature title> [draft]" \
  --body-file .issue-draft-staging/pr-body.md
rm .issue-draft-staging/pr-body.md
```

Capture the PR number as `<pr-number>`.

### Step 7 — Apply PRD sentinel block to issue body

Fetch current issue body:

```bash
gh issue view <n> --json body --jq '.body'
```

Strip frontmatter from `templates/issue-prd-template.md`. Substitute:

- `<slug>` → feature slug
- `<from idea.md>` in the Problem section → first paragraph of `idea.md` body after the frontmatter
- `<from idea.md>` in the Solution direction section → the "Solution direction" or "Proposed solution" section from `idea.md` if present, else the second paragraph

If the issue body already has a `<!-- BEGIN issue-draft:<slug> -->` block, replace it in-place. Otherwise append it at the end of the issue body.

Write rendered body to `.issue-draft-staging/issue-body.md`.

```bash
gh issue edit <n> --body-file .issue-draft-staging/issue-body.md
rm .issue-draft-staging/issue-body.md
```

Attempt `rmdir .issue-draft-staging` (silently ignore if non-empty).

### Step 8 — Record state in workflow-state.md

Append the three new optional fields to the YAML frontmatter of `specs/<slug>/workflow-state.md`:

```yaml
draft_pr: <pr-number>
draft_pr_branch: feat/<slug>-draft
issue_number: <n>
```

Use the Edit tool to add these lines. Never overwrite existing frontmatter fields.

### Step 9 — Report

Return to the conductor:

```
Draft PR #<pr-number> opened: feat(<area>): <feature title> [draft]
Branch: feat/<slug>-draft
Issue PRD block applied to #<n>
State recorded in specs/<slug>/workflow-state.md
```

## Constraints

- Never `--no-verify`. The empty commit must pass the verify gate.
- Never push to `main` or `develop` — `.claude/settings.json` deny rules will block this anyway.
- Never modify any spec artifact other than `workflow-state.md` (the three new fields only).
- Sequential — one PR, one branch.
- Staging files are always deleted after use; never commit them.

## Escalation

Return structured outcomes to the conductor:

- `ready` — PR opened, state recorded.
- `idempotent` — `draft_pr` already set; surface PR number.
- `pre-flight-failed` — auth / issue not open / dirty tree.
- `no-idea` — `idea.md` not complete.
- `aborted` — partial state; surface what succeeded.
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0. The `check-agents.ts` validates `name`, `description`, `tools`, and `## Scope` heading.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/issue-draft.md
git commit -m "feat(workflow): add issue-draft specialist agent"
```

---

### Task 10: Create `issue-draft` conductor skill

**Files:**
- Create: `.claude/skills/issue-draft/SKILL.md`

- [ ] **Step 1: Create the file**

Create `.claude/skills/issue-draft/SKILL.md`:

```markdown
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
- `docs/adr/0034-add-issue-draft-track.md` — rationale.
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
- ADR: `docs/adr/0034-add-issue-draft-track.md`.
```

- [ ] **Step 2: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/issue-draft/SKILL.md
git commit -m "feat(workflow): add issue-draft conductor skill"
```

---

### Task 11: Create slash command

**Files:**
- Create: `.claude/commands/issue/draft.md`

Mirrors the shape of `.claude/commands/issue/breakdown.md`.

- [ ] **Step 1: Create the file**

Create `.claude/commands/issue/draft.md`:

```markdown
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

See `docs/issue-draft-track.md` for the full methodology and `docs/adr/0034-add-issue-draft-track.md` for the rationale.
```

- [ ] **Step 2: Run `npm run fix` to regenerate command inventory**

```bash
npm run fix
```

This regenerates the `<!-- BEGIN GENERATED: command-inventory -->` block in `.claude/commands/README.md`, `docs/slash-commands.md`, and `docs/workflow-overview.md`.

- [ ] **Step 3: Run verify**

```bash
npm run verify
```

Expected: exit 0. The `check-command-docs.ts` validates the new command is registered.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/issue/draft.md .claude/commands/README.md docs/slash-commands.md docs/workflow-overview.md
git commit -m "feat(workflow): add /issue:draft slash command"
```

---

## Chunk 3: Integration — conductor edits + infrastructure + verify

### Task 12: Add `issue-pr-sync` step to stage conductors (Stages 2–6)

**Files:**
- Modify: `.claude/commands/spec/research.md`
- Modify: `.claude/commands/spec/requirements.md`
- Modify: `.claude/commands/spec/design.md`
- Modify: `.claude/commands/spec/specify.md`
- Modify: `.claude/commands/spec/tasks.md`

Each command gets one new numbered step appended at the end: "Invoke `issue-pr-sync`." The step is non-fatal — if `draft_pr` is absent in `workflow-state.md`, the skill exits silently.

**Pattern to add to each file** (substitute the stage name and artifact path):

```markdown
N. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: <stage-name>` and `artifact_path: specs/<slug>/<artifact>.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently. If `gh` fails, the skill warns and returns — do not abort stage completion.
```

- [ ] **Step 1: Edit `spec/research.md`**

Open `.claude/commands/spec/research.md`. The last numbered step is currently step 8. Add:

```markdown
9. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: research` and `artifact_path: specs/<slug>/research.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
```

- [ ] **Step 2: Edit `spec/requirements.md`**

Open `.claude/commands/spec/requirements.md`. Current last step is **8**. Confirm, then append:

```markdown
9. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: requirements` and `artifact_path: specs/<slug>/requirements.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
```

- [ ] **Step 3: Edit `spec/design.md`**

Open `.claude/commands/spec/design.md`. Current last step is **13**. Confirm, then append:

```markdown
14. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: design` and `artifact_path: specs/<slug>/design.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
```

- [ ] **Step 4: Edit `spec/specify.md`**

Open `.claude/commands/spec/specify.md`. Current last step is **9**. Confirm, then append:

```markdown
10. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: specify` and `artifact_path: specs/<slug>/spec.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
```

- [ ] **Step 5: Edit `spec/tasks.md`**

Open `.claude/commands/spec/tasks.md`. Current last step is **8**. Confirm, then append:

```markdown
9. **Post-stage sync (non-fatal)** — invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with `stage: tasks` and `artifact_path: specs/<slug>/tasks.md`. If `draft_pr` is absent in `workflow-state.md`, the skill exits silently.
```

- [ ] **Step 6: Run verify**

```bash
npm run verify
```

Expected: exit 0. The link checker will validate `.claude/skills/issue-pr-sync/SKILL.md` exists (it does, from Task 8).

- [ ] **Step 7: Commit**

```bash
git add .claude/commands/spec/research.md .claude/commands/spec/requirements.md \
        .claude/commands/spec/design.md .claude/commands/spec/specify.md \
        .claude/commands/spec/tasks.md
git commit -m "feat(workflow): add issue-pr-sync post-stage step to Stages 2–6 conductors"
```

---

### Task 13: Add `issue-pr-sync` step to `/issue:breakdown` conductor

**Files:**
- Modify: `.claude/skills/issue-breakdown/SKILL.md`

The step is added **after Step 9.5** (the housekeeping commit step). It must be clear this runs after the clean-tree gate, not before.

- [ ] **Step 1: Open `.claude/skills/issue-breakdown/SKILL.md`**

Find the `### Step 10 — Report` section.

- [ ] **Step 2: Insert new Step 9.75 between Step 9.5 and Step 10**

Add the following section between `### Step 9.5` and `### Step 10`:

```markdown
### Step 9.75 — Post-breakdown sync (non-fatal)

Invoke the `issue-pr-sync` skill (`.claude/skills/issue-pr-sync/SKILL.md`) with:

- `stage: breakdown`
- `slug: <slug>`
- `draft_pr`: read from `specs/<slug>/workflow-state.md`
- `issue_number`: read from `specs/<slug>/workflow-state.md`
- `slice_prs`: the list of PR numbers just opened (for populating the Tasks section)

If `draft_pr` is absent in `workflow-state.md`, the skill exits silently. If `gh` fails, the skill warns and returns — do not abort the `/issue:breakdown` run.

This step runs **after Step 9.5** (housekeeping commit). The working tree is already clean; no git state is affected.
```

- [ ] **Step 3: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/issue-breakdown/SKILL.md
git commit -m "feat(workflow): add issue-pr-sync post-breakdown step to /issue:breakdown conductor"
```

---

### Task 14: Update `AGENTS.md` agent-classes table

**Files:**
- Modify: `AGENTS.md`

Add a new row to the agent-classes table for `issue-draft`.

- [ ] **Step 1: Find the `Issue-breakdown` row in the table**

In `AGENTS.md`, locate the `| **Issue-breakdown** *(opt-in)* |` row.

- [ ] **Step 2: Add the `Issue-draft` row directly after it**

```markdown
| **Issue-draft** *(opt-in)* | `.claude/agents/issue-draft.md` | Post-Stage-1. Opens early draft PR from `idea.md`; evolves issue body as living PRD via `issue-pr-sync`. | [`docs/issue-draft-track.md`](docs/issue-draft-track.md) ([ADR-0034](docs/adr/0034-add-issue-draft-track.md)) |
```

- [ ] **Step 3: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): add issue-draft row to agent-classes table"
```

---

### Task 15: Update `CLAUDE.md` "Other tracks" table

**Files:**
- Modify: `CLAUDE.md`

Add `/issue:draft` to the "Other tracks" paragraph in the "How to work here" section.

- [ ] **Step 1: Find the "Other tracks" section**

In `CLAUDE.md`, locate the paragraph that lists opt-in tracks: "Besides the core lifecycle, opt-in / companion tracks are: Discovery …".

- [ ] **Step 2: Apply the exact replacement**

Find this text in CLAUDE.md:

```
Issue-breakdown (`/issue:breakdown`), and Specorator Improvement (`/specorator:update`).
```

Replace with:

```
Issue-breakdown (`/issue:breakdown`), Issue-draft (`/issue:draft`), and Specorator Improvement (`/specorator:update`).
```

- [ ] **Step 3: Run verify**

```bash
npm run verify
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(workflow): add /issue:draft to CLAUDE.md opt-in tracks list"
```

---

### Task 16: Final verify gate + push

**Files:**
- None (gate only)

- [ ] **Step 1: Run the full verify gate**

```bash
npm run verify
```

Expected: exit 0, 0 errors. If any failures, fix them before proceeding.

- [ ] **Step 2: Push branch**

```bash
git push origin feat/issue-draft-track
```

- [ ] **Step 3: Confirm PR #303 is up to date**

```bash
gh pr view 303 --json headRefName,commits
```

Expected: `headRefName` is `feat/issue-draft-track`; commits include all tasks above.

---

## Acceptance criteria

- [ ] `npm run verify` exits 0 with no errors after all tasks.
- [ ] `.claude/skills/issue-pr-sync/SKILL.md` exists with valid `name` frontmatter and `#` heading.
- [ ] `.claude/agents/issue-draft.md` exists with valid `name`, `description`, `tools` frontmatter and `## Scope` heading.
- [ ] `.claude/skills/issue-draft/SKILL.md` exists with valid `name` frontmatter.
- [ ] `.claude/commands/issue/draft.md` exists and is listed in the command-inventory generated block.
- [ ] `docs/issue-draft-track.md` exists with valid frontmatter.
- [ ] `docs/adr/0034-add-issue-draft-track.md` exists with valid frontmatter.
- [ ] `templates/issue-prd-template.md` and `templates/issue-draft-pr-body-template.md` exist with valid frontmatter.
- [ ] All five stage-conductor commands (research, requirements, design, specify, tasks) contain a `issue-pr-sync` invocation step.
- [ ] `.claude/skills/issue-breakdown/SKILL.md` contains Step 9.75.
- [ ] `AGENTS.md` contains the `Issue-draft` row.
- [ ] `CLAUDE.md` lists `/issue:draft` in the opt-in tracks paragraph.
- [ ] `.gitignore` contains `.issue-draft-staging/`.
- [ ] `docs/sink.md` contains the 5 new ownership rows.
- [ ] `/issue:draft` appears in the generated command-inventory block in `.claude/commands/README.md` (run `npm run fix` if absent).
