---
title: Issue-draft track — design
date: 2026-05-04
status: draft
authors:
  - Luis Mendez (with Claude Sonnet 4.6)
related:
  - docs/issue-breakdown-track.md
  - docs/specorator.md
  - .claude/skills/issue-breakdown/SKILL.md
  - docs/sink.md
  - AGENTS.md
---

# Issue-draft track — design

## Problem

Today, a GitHub issue and its associated Specorator workflow (`specs/<slug>/`) are decoupled until `/issue:breakdown` runs post-Stage 6. The issue accumulates freeform discussion while specs, requirements, and design artifacts develop in isolation. There is no canonical accumulation point for early ideas, no forcing function toward a PRD-shaped issue, and no feedback loop that surfaces spec progress back to collaborators watching the issue.

The result: contributors cannot see at a glance where a feature stands; external feedback arrives too late (post-spec, post-tasks); and the issue body remains informal prose rather than a living product requirements document.

We need a track that:

1. Opens a draft PR as soon as an issue has a first solution direction (`idea.md` complete).
2. Evolves both the issue body (toward PRD shape) and the draft PR body automatically as each Specorator stage completes.
3. Does so via a shared skill invoked by existing stage conductors — no parallel entry point, no duplication of sync logic.

## Goals

1. **`/issue:draft <n>` command.** Opens a draft PR seeded from `idea.md`; applies a PRD template to the issue body; records `draft_pr` and `draft_pr_branch` in `workflow-state.md`.
2. **`issue-pr-sync` shared skill.** Reusable skill invoked by each stage conductor (Stages 2–6) as its last step. Updates the draft PR body and the issue PRD section with the stage's new artifact. No-op if `draft_pr` absent — existing users unaffected.
3. **PRD-shaped issue body.** Sentinel-managed section in the issue that grows stage by stage: Problem → Research → Requirements → Design → Spec → Tasks → Work packages.
4. **Living draft PR body.** Also sentinel-managed; accumulates spec lineage links as stages complete; preserves free-form "Open questions / feedback welcome" section outside the sentinel block.
5. **Lifecycle handoff.** When `/issue:breakdown` opens slice PRs, `issue-pr-sync` updates the draft PR body to list them. The draft PR is then closed by human confirmation — not auto-closed.
6. **Complement `/issue:breakdown`, not replace it.** The draft PR is a discussion/feedback hub; `/issue:breakdown` slice PRs are implementation units. `/issue:breakdown` receives one additive final step (call `issue-pr-sync`) but is otherwise unchanged.

## Non-goals

- Replacing `/issue:breakdown` or `/spec:tasks`.
- Auto-closing the draft PR.
- Adding code scaffolding to the draft PR branch.
- Changing the order or content of any Specorator stage.
- Forcing every feature to use this track — it is opt-in (triggered by running `/issue:draft`).

## Architecture

### New surfaces

```
.claude/skills/issue-draft/SKILL.md           # conductor for /issue:draft <n>
.claude/commands/issue/draft.md               # slash command
.claude/agents/issue-draft.md                 # specialist subagent
.claude/skills/issue-pr-sync/SKILL.md         # shared sync skill (no slash command)
docs/issue-draft-track.md                     # methodology doc
templates/issue-prd-template.md               # PRD sentinel block template
templates/issue-draft-pr-body-template.md     # draft PR body skeleton
docs/adr/NNNN-add-issue-draft-track.md        # required ADR
```

### Modified surfaces

- `specs/<slug>/workflow-state.md` — two new optional YAML fields: `draft_pr` (PR number as integer), `draft_pr_branch` (branch name string). Fields are absent on all features that never run `/issue:draft`; no migration needed. This is an intentional relaxation of the "frontmatter schema is fixed" rule (see ADR rationale).
- Stage conductor skills (`spec:research`, `spec:requirements`, `spec:design`, `spec:specify`, `spec:tasks`) — one additive final step each: "invoke `issue-pr-sync` if `draft_pr` present in `workflow-state.md`." Stage 1 (`/spec:idea`) is **not** modified — the draft PR is opened by `/issue:draft` itself.
- `/issue:breakdown` conductor — one additive final step (after Step 9.5 housekeeping commit): "invoke `issue-pr-sync` to update the draft PR body and issue PRD with the slice PR list." All existing steps unchanged.
- `AGENTS.md` — new row in agent-classes table for `issue-draft`.
- `CLAUDE.md` — new entry in "Other tracks (opt-in)" table.
- `docs/sink.md` — new rows for new templates and new optional `workflow-state.md` fields (see Sink update).
- `.gitignore` — add `.issue-draft-staging/` (transient body render files; never committed).

### Flow

```
/spec:idea completes → idea.md exists
    │
    ▼
/issue:draft <n>
    ├─ pre-flight: gh auth, issue open, idea.md complete
    ├─ dispatch issue-draft agent:
    │     ├─ create branch feat/<slug>-draft (not a worktree — no source diff)
    │     ├─ empty commit + push
    │     ├─ gh pr create --draft (title: feat(<area>): <feature title> [draft])
    │     ├─ apply PRD sentinel block to issue body
    │     └─ write draft_pr + draft_pr_branch to workflow-state.md
    │
    ▼
/spec:research → /spec:requirements → /spec:design → /spec:specify → /spec:tasks
    each ↓ (last step, non-fatal)
    issue-pr-sync skill:
        ├─ read draft_pr from workflow-state.md
        ├─ update PR body sentinel block (add stage artifact link)
        └─ update issue PRD sentinel block (populate stage section)
    │
    ▼
/issue:breakdown <n>  (additive — one final step added after Step 9.5)
    ├─ opens slice PRs (all existing steps unchanged)
    └─ issue-pr-sync: update issue PRD "Tasks & work packages" + draft PR body
           with slice PR list; draft PR body notes "ready to close"
           (human closes draft PR manually)
```

## Components

### `issue-draft` agent

```yaml
---
name: issue-draft
description: Opens an early draft PR seeded from idea.md and applies a PRD template to the parent issue body. Triggered by /issue:draft.
tools: [Read, Edit, Write, Bash, Grep, Glob]
---
```

Tool scoping rationale (Article VI):
- **Read / Grep / Glob** — read `specs/<slug>/idea.md`, `workflow-state.md`, templates.
- **Edit / Write** — update `workflow-state.md` (new `draft_pr` / `draft_pr_branch` fields); render body files to `.issue-draft-staging/` (gitignored, deleted after use).
- **Bash** — `git`, `gh`. Push to `feat/<slug>-draft` is covered by existing `feat/*` allowlist in `settings.json`. No new permission entries required.
- **No Agent tool** — no further dispatch.

### `issue-pr-sync` shared skill

The core reusable primitive. No slash command — invoked only by conductors.

**Inputs** (from `workflow-state.md` and caller context):
- `draft_pr` — PR number (read from `workflow-state.md`)
- `issue_number` — GitHub issue number (read from `workflow-state.md`; see "issue_number field" note below)
- `stage` — the stage that just completed (passed by the calling conductor)
- `artifact_path` — path to the new artifact (e.g. `specs/<slug>/requirements.md`)

**`issue_number` field:** The issue number is stored in `workflow-state.md` as `issue_number` (third new optional field). It is extracted from the `/issue:draft <n>` argument by the conductor and passed to the `issue-draft` agent — no interactive prompt required. It is not looked up from `issues/<n>-<slug>.md` at sync time to avoid cross-artifact coupling; `workflow-state.md` is the canonical state for this track.

**Steps:**
1. Read `workflow-state.md` → if `draft_pr` absent, exit silently (no-op).
2. Fetch current PR body via `gh pr view <draft_pr> --json body`.
3. Render updated sentinel block for the PR body with the new stage artifact link. **The sentinel block is always overwritten with the current artifact state.** This is intentional: if an artifact is revised post-stage, a re-run of the stage conductor will update the PRD block accordingly.
4. Preserve everything outside the sentinel block (especially the free-form "Open questions" section).
5. Write rendered body to `.issue-draft-staging/<pr>-body.md`; run `gh pr edit <draft_pr> --body-file <path>`; delete staging file.
6. Fetch current issue body via `gh issue view <issue_number> --json body`.
7. Render updated PRD sentinel block — populate the section for the just-completed stage. Preserve everything outside the `<!-- BEGIN issue-draft:<slug> --> … <!-- END issue-draft:<slug> -->` block.
8. Write rendered body to `.issue-draft-staging/<issue>-body.md`; run `gh issue edit <issue_number> --body-file <path>`; delete staging file.

**Failure mode:** If `gh` fails (auth, rate limit, closed PR), emit a warning and return. Never abort the parent stage.

**Sentinel coexistence:** Both `/issue:draft` and `/issue:breakdown` may place sentinel blocks in the same issue body. Their tags differ (`<!-- BEGIN issue-draft:<slug> -->` vs `<!-- BEGIN issue-breakdown:<slug> -->`). When `issue-pr-sync` is invoked by `/issue:breakdown`, the "Tasks & work packages" section within the `issue-draft` sentinel is updated to read `*See ## Work packages below (managed by /issue:breakdown).*` — it does not duplicate the slice list. The two sentinel blocks coexist without conflict.

### Issue body — PRD sentinel block

Applied at `/issue:draft` time. Grows as stages complete.

```markdown
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

Everything outside the sentinel block is preserved on every update.

### Draft PR body — sentinel block

Opened at `/issue:draft` time, seeded from `idea.md`.

```markdown
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

### `workflow-state.md` additions

Three new optional fields, written by `issue-draft` agent:

```yaml
draft_pr: 42
draft_pr_branch: feat/auth-draft   # stored for Phase 2 bot; not used in Phase 1 sync
issue_number: 7
```

`draft_pr_branch` is stored for future use (e.g. Phase 2 headless bot needs to check out the branch). In Phase 1, `issue-pr-sync` uses only `draft_pr` and `issue_number`.

### Branch and PR conventions

| Token | Value |
|---|---|
| Branch | `feat/<slug>-draft` |
| PR title | `feat(<area>): <feature title> [draft]` |
| Empty commit | `chore(<area>): open draft discussion for <slug>` |
| Idempotency tag | `<!-- issue-draft:<slug> -->` in PR body |

PR title uses `feat` — no new CC type, no `pr-title.yml` change needed. The `[draft]` suffix is free-form text that distinguishes it from implementation PRs in `git log` and the PR list; GitHub's "Draft" badge provides the primary visual indicator.

### Lifecycle end

When `/issue:breakdown` opens slice PRs (after Step 9.5 housekeeping commit):

1. `issue-pr-sync` is invoked by the `/issue:breakdown` conductor's final step.
2. The issue PRD "Tasks & work packages" section is updated: `*See ## Work packages below (managed by /issue:breakdown).*`
3. The draft PR body "Tasks" line in the spec lineage block is populated with links to the slice PRs.
4. A human-readable note is appended inside the draft PR sentinel: `*Implementation has moved to slice PRs. This draft PR is ready to close.*`
5. Human closes the draft PR. No auto-close.

## Data flow

```
GitHub issue #<n>
        │
        │ /issue:draft
        ▼
issue-draft agent
        ├─ reads ──► specs/<slug>/idea.md
        ├─ reads ──► specs/<slug>/workflow-state.md
        ├─ writes ─► specs/<slug>/workflow-state.md  (draft_pr, draft_pr_branch, issue_number)
        ├─ git push ─► origin feat/<slug>-draft
        └─ gh pr create --draft ─► GitHub draft PR

        (per subsequent stage — Stages 2–6 and /issue:breakdown)
        │
        │ issue-pr-sync skill
        ▼
        ├─ reads ──► specs/<slug>/workflow-state.md  (draft_pr, issue_number)
        ├─ writes ─► .issue-draft-staging/ (transient; deleted after gh call)
        ├─ gh pr edit ─► update draft PR sentinel block
        └─ gh issue edit ─► update issue PRD sentinel block
```

## Constraints

- `issue-pr-sync` is **always the last step** of a stage conductor. It never blocks stage completion.
- Sync failure is **non-fatal** — warn, skip, let stage complete.
- `issue-pr-sync` is a **no-op** when `draft_pr` absent in `workflow-state.md`.
- `/spec:idea` (Stage 1) conductor is **not modified** — `issue-pr-sync` is invoked by Stages 2–6 and `/issue:breakdown` only.
- Draft PR branch carries **no source diff** — empty commit only.
- **No `--no-verify`** on the empty commit.
- Sentinel blocks use the same last-write-wins contract as `/issue:breakdown`. Humans annotate outside the block.
- Draft branch is created directly (not as a worktree) because it carries no source diff and implementers do not check it out. Same exception as `/issue:breakdown` slice branches.

## Edge cases

| Case | Handling |
|---|---|
| `/issue:draft` run before `idea.md` exists | Hard-stop: "run `/spec:idea` first" |
| `draft_pr` in `workflow-state.md` but PR closed/merged | `issue-pr-sync` warns and skips update |
| Stage run without `/issue:draft` ever called | `issue-pr-sync` is no-op |
| `/issue:breakdown` run before `/issue:draft` | Existing behavior unchanged; `issue-pr-sync` called but exits as no-op |
| `draft_pr_branch` name collision on remote | Append `-2` numeric suffix |
| `gh auth` fails at sync step | Warn + skip; stage completes normally |
| `issue_number` not yet in `workflow-state.md` | Derived from `/issue:draft <n>` argument by conductor; passed to agent; stored on first run |
| Concurrent edit of issue or PR body | Last-write-wins; documented in methodology doc |
| Both `/issue:draft` and `/issue:breakdown` sentinel blocks in same issue | Coexistence documented; PRD "Tasks" section defers to `issue-breakdown` block rather than duplicating (see Sentinel coexistence) |

## Sink update

New rows for `docs/sink.md` ownership table:

| Path | Owner | Mutability |
|---|---|---|
| `templates/issue-prd-template.md` | `issue-draft` conductor | Template (versioned; read-only after initial write) |
| `templates/issue-draft-pr-body-template.md` | `issue-draft` conductor | Template (versioned; read-only after initial write) |
| `specs/<slug>/workflow-state.md` `draft_pr` field | `issue-draft` agent | Write-once at `/issue:draft` time |
| `specs/<slug>/workflow-state.md` `draft_pr_branch` field | `issue-draft` agent | Write-once at `/issue:draft` time |
| `specs/<slug>/workflow-state.md` `issue_number` field | `issue-draft` agent | Write-once at `/issue:draft` time |

## Verify-gate impact

New files registered by existing checks:

- `scripts/check-agents.ts` — register `issue-draft` agent.
- `scripts/check-command-docs.ts` — register `/issue:draft` command. Run `npm run fix` after adding the command to regenerate the generated command-inventory block in `.claude/commands/README.md`, `docs/slash-commands.md`, and `docs/workflow-overview.md`.
- `scripts/check-frontmatter.ts` — frontmatter on new skill, agent, templates, ADR.
- `scripts/check-adr-index.ts` — auto-indexed.
- `scripts/check-markdown-links.ts` — all new cross-links resolve.
- `AGENTS.md` agent-classes table — add `issue-draft` row; validated by `check-workflow-docs.ts` and `check-public-surfaces.ts`.
- `CLAUDE.md` "Other tracks" table — add `/issue:draft` entry.

No new check scripts required. No `pr-title.yml` change needed (`feat` type already allowed).

## ADR

Required because:
- New conductor surface touches `AGENTS.md` agent-classes table and `CLAUDE.md` opt-in track list.
- First shared-skill pattern in this repo (`issue-pr-sync` invoked by other skills, not by a conductor directly).
- New optional fields in `workflow-state.md` — intentional relaxation of the frontmatter-schema-is-fixed rule (mitigated by fields being purely additive and absent on non-draft features; `check:frontmatter` must allow unknown optional keys or be updated to do so).
- New sink rows in `docs/sink.md`.

## Testing strategy

- **Verify gate:** covers frontmatter, links, agent/command registration, ADR indexing.
- **Dogfood:** run `/issue:draft` against this feature's own tracking issue after `/spec:idea` completes; confirm PRD block appears in issue and draft PR body is created; run subsequent stages and assert sentinel blocks update correctly.
- **Idempotency:** re-run `issue-pr-sync` for the same stage; confirm sentinel block is overwritten with current artifact state (always-overwrite contract) and free-form sections outside the block are preserved.
- **No-op path:** run a stage conductor on a feature without `draft_pr` in `workflow-state.md`; assert no `gh` calls are made and no staging files are created.
- **Sentinel coexistence:** run both `/issue:draft` and `/issue:breakdown` on the same issue; confirm both sentinel blocks coexist in the issue body without collision; confirm PRD "Tasks" section defers correctly to `issue-breakdown` block.

## Phasing

| Phase | Deliverable |
|---|---|
| Phase 1 | `/issue:draft` conductor + agent + command + `issue-pr-sync` skill + templates + methodology doc + ADR + stage conductor additive steps + `/issue:breakdown` additive step |
| Phase 2 | Operational bot variant (headless, label-triggered, mirrors `/issue:breakdown`-bot pattern) |

## References

- `docs/issue-breakdown-track.md` — companion track; lifecycle end handoff.
- `docs/specorator.md` — workflow contract.
- `docs/sink.md` — sink layout.
- `.claude/skills/issue-breakdown/SKILL.md` — sentinel block pattern (mirrored here).
- `.claude/skills/_shared/conductor-pattern.md` — gating + escalation.
- `templates/issue-breakdown-pr-body-template.md` — PR body shape (referenced).
- `docs/adr/0022-add-issue-breakdown-track.md` — companion ADR.
