# Issue-breakdown Track Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Phase 1 of the issue-breakdown track — a new conductor skill `/issue:breakdown <n>` that decomposes a GitHub issue (post `/spec:tasks`) into independent draft PRs by parsing `tasks.md`, plus all supporting artifacts (subagent, slash command, ADR, methodology doc, PR/issue templates).

**Architecture:** Markdown-only deliverable. New conductor skill at `.claude/skills/issue-breakdown/SKILL.md` is dispatched by a thin `/issue:breakdown` slash command. The skill parses `specs/<slug>/tasks.md`'s `## Parallelisable batches` section into slices, opens one body-only draft PR per slice with an empty scaffold commit, edits the parent issue body to add a sentinel-bracketed `## Work packages` checklist, and appends a hand-off note + audit-log entry. Phase 2 (operational bot) is deferred to a follow-up plan.

**Tech Stack:** Markdown for all artifacts. `gh` + `git` invoked via Bash from the conductor agent. No new TypeScript code in v1. Verify gate via `npm run verify` validates frontmatter, agent registration, slash-command registration, ADR index, and link integrity.

**Spec:** `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md` (load before each task; the spec is the source of truth for shapes, edge cases, and naming conventions).

---

## File Structure

New files:

| Path | Owner | Lifecycle |
|---|---|---|
| `.claude/skills/issue-breakdown/SKILL.md` | conductor | versioned |
| `.claude/commands/issue/breakdown.md` | command author | versioned |
| `.claude/agents/issue-breakdown.md` | agent author | versioned |
| `docs/issue-breakdown-track.md` | this track's methodology doc | versioned |
| `docs/adr/0022-add-issue-breakdown-track.md` | ADR | immutable once accepted |
| `templates/issue-breakdown-pr-body-template.md` | template author | versioned |
| `templates/issue-breakdown-issue-section.md` | template author | versioned |

Updates:

| Path | Change |
|---|---|
| `.claude/commands/README.md` | Register `issue/` namespace + the new command. |
| `.claude/skills/README.md` | Register the new skill in the skills inventory. |
| `AGENTS.md` | Add `issue-breakdown` row to "Agent classes" table; add row to skills/conductors table if present. |
| `CLAUDE.md` | Add `issue-breakdown` row to "Other tracks (opt-in)" table. |
| `docs/sink.md` | Add Ownership-table row for `specs/<slug>/issue-breakdown-log.md`; extend `### Append-only` paragraph. |
| `.gitignore` | Add `.issue-breakdown-staging/`. |

No source code edits.

---

## Chunk 1: Foundation — branch, ADR, methodology doc, .gitignore

This chunk creates the immutable backbone artifacts (ADR, methodology doc, gitignore entry). They have no code dependencies and unblock every later chunk.

### Task 1.1: Confirm working tree and branch

**Files:** none.

- [ ] **Step 1: Check current branch**

```bash
git status
git rev-parse --abbrev-ref HEAD
```

Expected: clean working tree on branch `spec/issue-breakdown-design` (the brainstorm branch where the spec already lives) — or, if executing in a worktree, on a fresh topic branch off `main`.

- [ ] **Step 2: Confirm spec is reachable**

```bash
ls docs/superpowers/specs/2026-05-02-issue-breakdown-design.md
```

Expected: file exists. If not, abort — the spec is required to drive every subsequent task.

### Task 1.2: Add `.issue-breakdown-staging/` to `.gitignore`

**Files:** Modify `.gitignore`.

- [ ] **Step 1: Append the staging-dir ignore line**

Open `.gitignore` and append, after the existing `.worktrees/` block:

```text
# issue-breakdown skill — transient PR/issue body files staged for `gh ... --body-file`.
# Never committed; deleted at end of run. See docs/issue-breakdown-track.md.
.issue-breakdown-staging/
```

- [ ] **Step 2: Verify**

```bash
grep -n "issue-breakdown-staging" .gitignore
```

Expected: one match.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore(issue-breakdown): ignore .issue-breakdown-staging/ working dir"
```

### Task 1.3: File ADR-0022 — adopt issue-breakdown track

**Files:** Create `docs/adr/0022-add-issue-breakdown-track.md`.

- [ ] **Step 1: Confirm next ADR number**

```bash
ls docs/adr/0*.md | tail -1
```

Expected: latest is `0021-…`. If a higher number exists, use the next one and update every reference in this plan accordingly.

- [ ] **Step 2: Scaffold from template**

```bash
cp templates/adr-template.md docs/adr/0022-add-issue-breakdown-track.md
```

- [ ] **Step 3: Fill ADR body**

Replace the template scaffolding so the resulting file matches:

```markdown
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
```

- [ ] **Step 4: Verify ADR index picks it up**

```bash
npm run check:adr-index
```

Expected: passes (the index regenerator picks up `0022`). If `check:adr-index` auto-updates `docs/adr/README.md`, stage that too in step 5.

- [ ] **Step 5: Commit**

```bash
git add docs/adr/0022-add-issue-breakdown-track.md docs/adr/README.md
git commit -m "docs(adr): file ADR-0022 — adopt issue-breakdown track"
```

(Stage `docs/adr/README.md` only if `check:adr-index` regenerated it; otherwise omit.)

### Task 1.4: Write methodology doc `docs/issue-breakdown-track.md`

**Files:** Create `docs/issue-breakdown-track.md`.

- [ ] **Step 1: Read shape of an existing track doc**

```bash
head -60 docs/discovery-track.md
```

Expected: section order — frontmatter, intro, "When to use", "Inputs", "Outputs", flow diagram, "Constraints", "References". Mirror this shape.

- [ ] **Step 2: Write the file**

Create `docs/issue-breakdown-track.md` with:

```markdown
---
title: Issue-breakdown track
folder: docs
description: Post-/spec:tasks opt-in track that decomposes a GitHub issue into independent draft PRs.
entry_point: false
---

# Issue-breakdown track

Opt-in track that runs *after* `/spec:tasks`. Decomposes a GitHub issue describing a product increment into N independent draft PRs (one per parallelisable batch from `tasks.md`), keeps the parent issue as the canonical progress dashboard, and is idempotent across re-runs.

Filed by [ADR-0022](adr/0022-add-issue-breakdown-track.md).

## When to use

- A feature has reached `/spec:tasks` (`tasks.md` is `complete`).
- A GitHub issue exists for the feature, and you want multiple people to pick up parallel work.
- You want each PR scoped to a vertical slice with full spec lineage in the body.

Not for:

- Features without a completed `tasks.md` — run `/spec:tasks` first.
- One-person work where a single PR is enough.
- Brownfield issues with no spec lineage at all — open `/spec:start` first or document the issue as `wontfix`/`needs-spec`.

## Inputs

- A GitHub issue number.
- A `specs/<slug>/` folder with `workflow-state.md`, `requirements.md`, `design.md`, `spec.md`, `tasks.md` all `complete`.
- Optional: an `inputs/` work package surfaced via the canonical intake gate (per `docs/inputs-ingestion.md`). The conductor consults `inputs/` only if the user explicitly references something there — there is no mandatory intake step in this track.

## Outputs

- N draft PRs (one per parallelisable batch in `tasks.md`), each with a generated body that cites spec lineage, task IDs, dependency chain, and DoD.
- A `## Work packages` section appended to the parent issue body inside a sentinel-bracketed re-edit zone.
- A new append-only `specs/<slug>/issue-breakdown-log.md` with one timestamped entry per run.
- One dated line appended to the `## Hand-off notes` free-form section of `specs/<slug>/workflow-state.md`.

## Flow

```
/issue:breakdown <n>
   │
   ├─ Pre-flight ────────── gh auth ok? issue open? read issue.
   ├─ Resolve spec ──────── issue body specs/ link → label spec:<slug>
   │                        → AskUserQuestion (list candidates).
   ├─ Verify gate ───────── workflow-state.md tasks.md == complete?
   ├─ Idempotency ───────── gh pr list --search slice-tag → resume / re-plan / abort.
   ├─ Parse tasks.md ────── ## Parallelisable batches → slice list.
   ├─ Confirm ──────────── AskUserQuestion (open / edit / abort).
   ├─ Per-slice loop ────── branch → empty commit → push → draft PR.
   ├─ Update issue body ─── sentinel-bracketed ## Work packages section.
   ├─ Audit log ────────── append specs/<slug>/issue-breakdown-log.md.
   └─ Hand-off note ────── append one line to workflow-state.md.
```

## Constraints

- **No `--no-verify`.** Empty scaffold commits must pass the verify gate cleanly. If they don't, fix the gate, not the commit.
- **No direct writes to `main`.** Slice branches use the `feat/<slug>-slice-<NN>-<short>` pattern.
- **One PR per parallelisable batch.** `🪓 may-slice` annotations override.
- **Sentinel-block discipline.** The `<!-- BEGIN issue-breakdown:<slug> --> … <!-- END issue-breakdown:<slug> -->` block in the parent issue body is conductor-owned; humans annotate outside it.
- **Phase 2 file boundary.** The operational bot (`agents/operational/issue-breakdown-bot/`) is a separate PR; it must not import or transclude any file under `.claude/skills/issue-breakdown/`.

## References

- Design spec: [`docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`](superpowers/specs/2026-05-02-issue-breakdown-design.md).
- ADR: [`docs/adr/0022-add-issue-breakdown-track.md`](adr/0022-add-issue-breakdown-track.md).
- Slicing primitive: [`.claude/skills/tracer-bullet/SKILL.md`](../.claude/skills/tracer-bullet/SKILL.md).
- Sink: [`docs/sink.md`](sink.md).
- Verify gate: [`docs/verify-gate.md`](verify-gate.md).
- Branching: [`docs/branching.md`](branching.md).
```

- [ ] **Step 3: Verify links repo-wide**

```bash
npm run check:links
```

Expected: green. The link checker walks the whole repo; it does not accept a single-file argument.

- [ ] **Step 4: Commit**

```bash
git add docs/issue-breakdown-track.md
git commit -m "docs(issue-breakdown): add methodology doc"
```

---

## Chunk 2: Templates — PR body and issue section

These are pure template files consumed by the conductor at runtime via `gh ... --body-file`. They have no runtime behavior of their own.

### Task 2.1: PR body template

**Files:** Create `templates/issue-breakdown-pr-body-template.md`.

- [ ] **Step 1: Write the file**

Create `templates/issue-breakdown-pr-body-template.md`:

```markdown
---
title: Issue-breakdown PR body template
folder: templates
description: Skeleton body for draft PRs opened by /issue:breakdown. Concatenated with .github/PULL_REQUEST_TEMPLATE.md at runtime.
entry_point: false
---

<!-- Generated by issue-breakdown skill. Edit freely after first real commit. -->
<!-- issue-breakdown-slice: issue-<issue-number>-<NN> -->

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

<!-- The conductor appends the verbatim contents of .github/PULL_REQUEST_TEMPLATE.md here at runtime. -->
```

- [ ] **Step 2: Verify frontmatter repo-wide**

```bash
npm run check:frontmatter
```

Expected: green. (Walks the whole repo — does not accept a single-file argument.)

- [ ] **Step 3: Commit**

```bash
git add templates/issue-breakdown-pr-body-template.md
git commit -m "feat(issue-breakdown): add PR body template"
```

### Task 2.2: Issue section template

**Files:** Create `templates/issue-breakdown-issue-section.md`.

- [ ] **Step 1: Write the file**

Create `templates/issue-breakdown-issue-section.md`:

```markdown
---
title: Issue-breakdown issue-section template
folder: templates
description: Sentinel-bracketed `## Work packages` block injected into the parent issue body by /issue:breakdown.
entry_point: false
---

## Work packages

<!-- BEGIN issue-breakdown:<slug> -->
Generated <YYYY-MM-DD> by `/issue:breakdown`.

- [ ] #<PR1> — slice 01: <goal>
- [ ] #<PR2> — slice 02: <goal>

Spec: `specs/<slug>/`. Re-run with `/issue:breakdown <n>` to refresh.
<!-- END issue-breakdown:<slug> -->
```

- [ ] **Step 2: Verify frontmatter repo-wide**

```bash
npm run check:frontmatter
```

Expected: green.

- [ ] **Step 3: Commit**

```bash
git add templates/issue-breakdown-issue-section.md
git commit -m "feat(issue-breakdown): add issue-section template"
```

---

## Chunk 3: Subagent — `.claude/agents/issue-breakdown.md`

The agent is the workhorse the conductor dispatches against. Tool list is intentionally narrow (Article VI).

### Task 3.1: Write agent definition

**Files:** Create `.claude/agents/issue-breakdown.md`.

- [ ] **Step 1: Read existing agent shapes for reference**

```bash
head -30 .claude/agents/reviewer.md
head -30 .claude/agents/release-manager.md
```

Expected: each starts with frontmatter (`name`, `description`, `tools`, `model`, `color`), then a body with sections like Scope / Read first / Procedure / Constraints.

- [ ] **Step 2: Write the file**

Create `.claude/agents/issue-breakdown.md`:

```markdown
---
name: issue-breakdown
description: Use for the issue-breakdown track. Decomposes a GitHub issue + completed tasks.md into vertical-slice draft PRs. Reads specs/<slug>/, edits the parent issue body, opens draft PRs via gh. Does not modify code, requirements, or design artifacts.
tools: [Read, Edit, Write, Bash, Grep, Glob]
model: sonnet
color: cyan
---

You are the **issue-breakdown** agent.

## Scope

You produce N draft PRs from a single GitHub issue whose feature has reached `/spec:tasks`. You read everything under `specs/<slug>/`, you edit only your own audit log + the parent issue body via `gh`, and you append a one-line hand-off note to `specs/<slug>/workflow-state.md`. You do **not** modify `requirements.md`, `design.md`, `spec.md`, `tasks.md`, code, or any other agent's artifacts.

## Read first

1. `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md` — the source-of-truth spec.
2. `docs/issue-breakdown-track.md` — methodology doc.
3. `templates/tasks-template.md` — the layout you parse.
4. `templates/issue-breakdown-pr-body-template.md` — the body you render per PR.
5. `templates/issue-breakdown-issue-section.md` — the block you inject into the parent issue.
6. The active feature's `specs/<slug>/workflow-state.md` (confirm `tasks.md` status is `complete`) and `specs/<slug>/tasks.md`.

## Procedure

### Step 1 — Pre-flight

- `gh auth status` must succeed.
- `gh issue view <n> --json number,title,body,labels,state,url` — refuse if `state != "OPEN"`.
- `git status --porcelain` — refuse if working tree is dirty.

### Step 2 — Resolve spec lineage

Try in order:

1. Scan issue body for the first `specs/<slug>/` link. If found, use that slug.
2. Else scan issue labels for `spec:<slug>`. If found, use that slug.
3. Else surface to the conductor: list every `specs/*/workflow-state.md` whose `tasks.md` artifact status is `complete`, and ask the user to pick.

### Step 3 — Verify gate

Read `specs/<slug>/workflow-state.md`. Hard-stop if `tasks.md` is not `complete`. Surface "run `/spec:tasks` first" and exit.

### Step 4 — Idempotency check

```bash
gh pr list --search "in:body issue-breakdown-slice issue-<n>" --state all --json number,headRefName,title,body
```

Search returns PRs whose body contains the slice-tag HTML comment. If any results, surface to the conductor for resume / re-plan / abort. The conductor calls back with the user's choice; default to *resume* (skip slices whose tag is already on a PR).

If `gh search` proves unreliable for the literal tag, fall back: `gh pr list --search "Refs #<n>" --state all --json number,body,headRefName`, then grep each body for the exact slice-tag.

### Step 5 — Parse tasks.md

Parse `specs/<slug>/tasks.md` per the spec's "Slicing input" section:

- Required headings: `## Parallelisable batches`, `## Task list`.
- Per-batch line: `- **Batch N:** T-<AREA>-NNN, T-<AREA>-NNN, …`. One slice per batch (zero-padded ordinal).
- Per-task heading: `### T-<AREA>-NNN <emoji> — <short title>`.
- Per-task fields: `**Description:**`, `**Definition of done:**`, `**Depends on:**`.
- `🪓 may-slice` tasks override the batch grouping — split into their own slice using the `**Slice plan:**` line.
- Final gate: `## Quality gate` (copied verbatim into each PR's DoD block).

Refuse if any required anchor is missing. Surface the offending heading.

### Step 6 — Render PR body and issue section

Stage rendered body files under `<repo-root>/.issue-breakdown-staging/` (gitignored). One file per slice plus one for the issue body.

The PR body file is the template at `templates/issue-breakdown-pr-body-template.md` with placeholders substituted, then concatenated with the verbatim contents of `.github/PULL_REQUEST_TEMPLATE.md`.

The issue body is rendered by reading the current issue body, finding the `<!-- BEGIN issue-breakdown:<slug> -->` … `<!-- END issue-breakdown:<slug> -->` block (if present), replacing its contents in-place; if absent, appending the template at the end. **Refuse** if a prior run is detected (slice-tag PRs exist) but the sentinel block is missing — surface the inconsistency.

### Step 7 — Per-slice loop (sequential)

For each slice in document order:

1. Compute branch name `feat/<slug>-slice-<NN>-<short>` (truncate `<short>` so total ≤ 60 chars).
2. `git switch -c <branch> main`. If branch exists remotely, append `-NN` numeric suffix and retry.
3. `git commit --allow-empty -m "chore(<area>): scaffold <T-<AREA>-NNN> slice"`.
4. `git push -u origin <branch>`.
5. `gh pr create --draft --base main --head <branch> --title "feat(<area>): <goal> (slice <NN>/<N>)" --body-file .issue-breakdown-staging/slice-<NN>.md`.
6. Capture the PR number; record into the run log.
7. `git switch main` before the next iteration so each slice branches off `main`.

If any step fails, abort the run. Partial state is recoverable on re-run via the idempotency check.

### Step 8 — Update parent issue body

```bash
gh issue edit <n> --body-file .issue-breakdown-staging/issue-body.md
```

### Step 9 — Audit log

Append to `specs/<slug>/issue-breakdown-log.md` (create if absent — no frontmatter required):

```markdown
## <YYYY-MM-DD HH:MM> — issue #<n>, run #<run-id>

Opened slices:
- slice 01 — feat/<slug>-slice-01-... → PR #<x>
- slice 02 — feat/<slug>-slice-02-... → PR #<y>

Skipped (prior run): none / [list]
Aborted: none / [list with reason]
```

### Step 10 — Hand-off note

Append one dated line to the `## Hand-off notes` free-form section of `specs/<slug>/workflow-state.md`:

```text
2026-05-02 (issue-breakdown): opened N draft PRs for issue #<n> (#<x>-#<y>).
```

### Step 11 — Cleanup

`rm -rf .issue-breakdown-staging/` at end of run.

## Constraints

- Never `--no-verify`. Empty commits must pass the verify gate cleanly.
- Never push to `main` or `develop`. The `.claude/settings.json` deny rules will block this anyway.
- Never invoke `tracer-bullet` at runtime. `tasks.md` is parsed in-process.
- Never modify `requirements.md`, `design.md`, `spec.md`, or `tasks.md`.
- Never modify the YAML frontmatter of `workflow-state.md`. Only the `## Hand-off notes` markdown section.
- Sequential — no parallel `gh pr create` (rate limits + clean git state per slice).

## Escalation

You **escalate to the conductor**, not to the user. The conductor surfaces choices via `AskUserQuestion`. You return a structured outcome:

- `ready` — slice list and confirmation needed.
- `prior-run-detected` — list of existing slice-tagged PRs; needs resume / re-plan / abort.
- `parse-error` — offending heading; cannot proceed.
- `concurrent-run` — Phase 2 workflow run in flight; cannot proceed.
- `done` — N PRs opened; issue body updated.
- `aborted` — partial state; recoverable on re-run.
```

- [ ] **Step 3: Verify agent registration**

```bash
npm run check:agents
npm run check:frontmatter
```

Expected: both green. `check:agents` validates frontmatter shape (`name`, `description`, non-empty `tools` list, `## Scope` heading). `check:frontmatter` walks the whole repo.

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/issue-breakdown.md
git commit -m "feat(issue-breakdown): add specialist subagent"
```

---

## Chunk 4: Slash command — `/issue:breakdown`

Thin wrapper that hands control to the conductor skill.

### Task 4.1: Create the `issue/` namespace folder and command

**Files:** Create `.claude/commands/issue/breakdown.md`.

- [ ] **Step 1: Confirm namespace doesn't already exist**

```bash
ls .claude/commands/issue/ 2>&1 | head -1
```

Expected: "No such file or directory". If it exists already, inspect contents before adding.

- [ ] **Step 2: Read an existing thin-wrapper command for shape**

```bash
cat .claude/commands/spec/start.md
```

Expected: very short file with frontmatter (`description`, `argument-hint`, `allowed-tools`, `model`) and one paragraph instructing the model what to do.

- [ ] **Step 3: Write the command**

Create `.claude/commands/issue/breakdown.md`:

```markdown
---
description: Decompose a GitHub issue into independent draft PRs from tasks.md. Runs the issue-breakdown conductor.
argument-hint: <issue-number>
allowed-tools: [Read, Edit, Write, Bash, Grep, Glob]
model: sonnet
---

# /issue:breakdown

Decompose GitHub issue #$ARGUMENTS into independent draft PRs.

Run the [`issue-breakdown`](../../skills/issue-breakdown/SKILL.md) skill against issue #$ARGUMENTS. The skill is the brain; this command is the entry point.

The skill enforces:

- The feature linked from the issue must have `tasks.md` status `complete` in its `workflow-state.md`. If not, it will tell you to run `/spec:tasks` first.
- Re-runs are idempotent: prior runs are detected by the `<!-- issue-breakdown-slice: issue-<n>-<NN> -->` HTML comment in PR bodies and the `<!-- BEGIN issue-breakdown:<slug> --> ... <!-- END issue-breakdown:<slug> -->` block in the parent issue body.

See [`docs/issue-breakdown-track.md`](../../../docs/issue-breakdown-track.md) for the full methodology and [ADR-0022](../../../docs/adr/0022-add-issue-breakdown-track.md) for the rationale.
```

- [ ] **Step 4: Verify command registration**

```bash
npm run check:commands
```

Expected: **fails** on this run, because `.claude/commands/README.md`, `README.md`, and `docs/workflow-overview.md` each contain auto-generated inventory blocks that need refreshing — Chunk 6 handles those. For now confirm the failure mode is *only* "generated block out of date", not a frontmatter or path issue. If the script complains about anything other than the BEGIN/END GENERATED blocks, fix that here before moving on.

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/issue/breakdown.md
git commit -m "feat(issue-breakdown): add /issue:breakdown slash command"
```

---

## Chunk 5: Conductor skill — `.claude/skills/issue-breakdown/SKILL.md`

This is the brain. The slash command is the entry point; the agent is the workhorse the skill dispatches.

### Task 5.1: Scaffold skill folder

**Files:** Create `.claude/skills/issue-breakdown/SKILL.md`.

- [ ] **Step 1: Read the canonical conductor shape**

```bash
sed -n '1,50p' .claude/skills/orchestrate/SKILL.md
sed -n '1,50p' .claude/skills/discovery-sprint/SKILL.md
```

Expected: both have frontmatter (`name`, `description`, `argument-hint`), a "Read first" section, a numbered procedure, a "Constraints" section, and a "References" section. Both link `_shared/conductor-pattern.md` for shared gating rules.

- [ ] **Step 2: Write the skill**

Create `.claude/skills/issue-breakdown/SKILL.md`:

```markdown
---
name: issue-breakdown
description: Conductor for the issue-breakdown track. Post-/spec:tasks. Decomposes a GitHub issue into independent draft PRs by parsing tasks.md, opens one draft PR per parallelisable batch, edits the parent issue body to track progress. Triggers "/issue:breakdown <n>", "break this issue down into draft PRs", "decompose issue".
argument-hint: <issue-number>
---

# Issue-breakdown conductor

You conduct the issue-breakdown track defined in [`docs/issue-breakdown-track.md`](../../../docs/issue-breakdown-track.md). Your job: **gate** between phases, **dispatch** the [`issue-breakdown`](../../agents/issue-breakdown.md) specialist agent, **never** do the agent's work yourself. Filed by [ADR-0022](../../../docs/adr/0022-add-issue-breakdown-track.md).

Shared rules (gating, escalation, intake-gate, constraints common to all conductors): [`_shared/conductor-pattern.md`](../_shared/conductor-pattern.md).

## Read first

- [`docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`](../../../docs/superpowers/specs/2026-05-02-issue-breakdown-design.md) — source-of-truth spec.
- [`docs/issue-breakdown-track.md`](../../../docs/issue-breakdown-track.md) — methodology.
- [`templates/tasks-template.md`](../../../templates/tasks-template.md) — the layout the agent parses.
- [`memory/constitution.md`](../../../memory/constitution.md) — Articles I, II, VI, IX especially.

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

Batch one `AskUserQuestion`:

> N slices computed from `## Parallelisable batches` in `tasks.md`:
>
> - 01 — <goal> (T-AUTH-001, T-AUTH-005)
> - 02 — <goal> (T-AUTH-002)
> - …
>
> Open N draft PRs against issue #<n>?

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

Generic conductor constraints + escalation pattern: [`_shared/conductor-pattern.md`](../_shared/conductor-pattern.md). Specifics for this skill:

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

- Design spec: [`docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`](../../../docs/superpowers/specs/2026-05-02-issue-breakdown-design.md).
- Methodology: [`docs/issue-breakdown-track.md`](../../../docs/issue-breakdown-track.md).
- ADR: [`docs/adr/0022-add-issue-breakdown-track.md`](../../../docs/adr/0022-add-issue-breakdown-track.md).
- Tasks template: [`templates/tasks-template.md`](../../../templates/tasks-template.md).
- Slicing primitive (consumed upstream by `/spec:tasks`): [`.claude/skills/tracer-bullet/SKILL.md`](../tracer-bullet/SKILL.md).
- Sink: [`docs/sink.md`](../../../docs/sink.md).
```

- [ ] **Step 3: Verify skill registration**

```bash
npm run check:agents
npm run check:frontmatter
npm run check:links
```

Expected: all green. `check:agents` also validates skill files (it discovers any `SKILL.md` under `.claude/skills/`). `check:links` walks the whole repo.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/issue-breakdown/SKILL.md
git commit -m "feat(issue-breakdown): add conductor skill"
```

> **Note on `inputs/` intake gate.** The shared conductor pattern (`_shared/conductor-pattern.md`) and `CLAUDE.md` both say "every conductor's scope phase lists `inputs/`". This conductor intentionally *skips* the mandatory intake step because the input is the GitHub issue + an already-completed `tasks.md`, not a new work package. The methodology doc at `docs/issue-breakdown-track.md` documents this deviation. Call it out in the PR description so reviewers reading the conductor pattern don't flag a missing intake step.

---

## Chunk 6: Cross-references — wire the new track into existing indexes

The check-scripts already pick up the new files automatically; this chunk only updates human-facing inventory pages so the track is discoverable.

### Task 6.1: Register `issue/` namespace + regenerate command-inventory blocks

**Files:** Modify `scripts/lib/commands.ts`, `.claude/commands/README.md`, `README.md`, `docs/workflow-overview.md`.

The slash-command inventory in three files is **auto-generated** between `<!-- BEGIN GENERATED: ... -->` / `<!-- END GENERATED: ... -->` markers. `npm run check:commands` regenerates the expected content and refuses if the file is out of sync. Touching the README tables by hand will fail verify.

- [ ] **Step 1: Add the new namespace label**

Open `scripts/lib/commands.ts`. Add an entry to the `labels` map (alphabetical insertion):

```ts
const labels = new Map([
  ["adr", "Decisions"],
  ["discovery", "Discovery Track"],
  ["issue", "Issue Breakdown Track"],   // NEW
  ["portfolio", "Portfolio Track"],
  ...
]);
```

- [ ] **Step 2: Regenerate the inventory blocks**

```bash
npm run check:commands
```

Expected: **fails the first time**, but the failure output prints the exact regenerated block expected for each of the three files. Read the failure carefully.

- [ ] **Step 3: Apply the regenerated blocks**

The repo ships a `fix:commands` alias that auto-writes the regenerated content. Run it:

```bash
npm run fix:commands
```

If `fix:commands` is not defined in `package.json`, paste the expected blocks from the `check:commands` failure output into:

- `.claude/commands/README.md` (between `<!-- BEGIN GENERATED: command-inventory -->` and `<!-- END GENERATED: command-inventory -->`).
- `README.md` (between `<!-- BEGIN GENERATED: slash-commands -->` and `<!-- END GENERATED: slash-commands -->`, around line 345).
- `docs/workflow-overview.md` (between `<!-- BEGIN GENERATED: slash-commands -->` and `<!-- END GENERATED: slash-commands -->`, around line 110).

- [ ] **Step 4: Verify**

```bash
npm run check:commands
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/commands.ts .claude/commands/README.md README.md docs/workflow-overview.md
git commit -m "docs(commands): register issue/ namespace and regenerate inventories"
```

### Task 6.2: Update `.claude/skills/README.md`

**Files:** Modify `.claude/skills/README.md`.

- [ ] **Step 1: Inspect the existing Workflow-conductors table**

```bash
sed -n '40,60p' .claude/skills/README.md
```

Expected: a 3-column markdown table headed `| Skill | Triggers when… | What it does |` listing each conductor (`orchestrate/`, `discovery-sprint/`, `sales-cycle/`, etc.). Add a new row matching the existing column shape — **not** a bullet.

- [ ] **Step 2: Add the table row**

Insert in alphabetical order:

```markdown
| [`issue-breakdown/`](issue-breakdown/SKILL.md) | post-/spec:tasks; "break this issue down", "decompose issue", `/issue:breakdown <n>` | Decompose a GitHub issue into independent draft PRs by parsing tasks.md `## Parallelisable batches`. |
```

- [ ] **Step 3: Verify links repo-wide**

```bash
npm run check:links
```

Expected: green.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/README.md
git commit -m "docs(skills): list issue-breakdown conductor"
```

### Task 6.3: Update `AGENTS.md`

**Files:** Modify `AGENTS.md`.

- [ ] **Step 1: Find the agent classes table**

```bash
grep -n "## Agent classes" AGENTS.md
```

Expected: one match, with a table listing each agent class.

- [ ] **Step 2: Add row**

Add a new row after the "Quality assurance" row (or in the closest logical position), mirroring the existing row shape:

```markdown
| **Issue-breakdown** *(opt-in, post-/spec:tasks)* | `.claude/agents/issue-breakdown.md` | Decompose a GitHub issue into independent draft PRs from `tasks.md`. State lives `specs/<slug>/issue-breakdown-log.md`. Reads `specs/`; never edits requirements, design, spec, or tasks artifacts. | [`docs/issue-breakdown-track.md`](docs/issue-breakdown-track.md) ([ADR-0022](docs/adr/0022-add-issue-breakdown-track.md)) |
```

- [ ] **Step 3: Update conductor-skill summary line**

Find the existing sentence: *"Ten workflow-conductor skills (`orchestrate`, `project-scaffolding`, `discovery-sprint`, `stock-taking`, `sales-cycle`, `project-run`, `roadmap-management`, `portfolio-track`, `quality-assurance`, `specorator-improvement`) are the conversational entry points."*

Change `Ten` to `Eleven` and append `, issue-breakdown` to the parenthesised list (after `specorator-improvement`).

- [ ] **Step 4: Verify links repo-wide**

```bash
npm run check:links
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): register issue-breakdown agent class"
```

### Task 6.4: Update `CLAUDE.md`

**Files:** Modify `CLAUDE.md`.

- [ ] **Step 1: Find the "Other tracks (opt-in)" table**

```bash
grep -n "Other tracks" CLAUDE.md
```

Expected: one match, with a table of opt-in tracks (Discovery, Stock-taking, Sales, Project Manager, Portfolio).

- [ ] **Step 2: Add row**

```markdown
| **Issue-breakdown** | post-`/spec:tasks`, decompose issue into draft PRs | [`issue-breakdown`](.claude/skills/issue-breakdown/SKILL.md) | `/issue:breakdown <n>` | [`docs/issue-breakdown-track.md`](docs/issue-breakdown-track.md) ([ADR-0022](docs/adr/0022-add-issue-breakdown-track.md)) |
```

Place it after the "Portfolio" row to preserve the existing pre-/post-Specorator ordering.

- [ ] **Step 3: Verify links repo-wide**

```bash
npm run check:links
```

Expected: green.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): register issue-breakdown opt-in track"
```

### Task 6.5: Update `docs/sink.md`

**Files:** Modify `docs/sink.md`.

- [ ] **Step 1: Find the Ownership table**

```bash
grep -n "^| Path" docs/sink.md
```

Expected: one match — the Ownership table header `| Path | Owner | Mutability |`. Note its exact column shape.

- [ ] **Step 2: Add Ownership row**

Insert after the existing `specs/<slug>/implementation-log.md` row:

```markdown
| `specs/<slug>/issue-breakdown-log.md` | `issue-breakdown` agent | Append-only — dated entries, never rewritten |
```

- [ ] **Step 3: Find the `### Append-only` paragraph**

```bash
grep -n "^### Append-only" docs/sink.md
```

Expected: one match. The next paragraph lists append-only artifacts inline.

- [ ] **Step 4: Extend the Append-only paragraph**

Edit the inline list to include `specs/<slug>/issue-breakdown-log.md` between `implementation-log.md` and the `## Hand-off notes` mention. The paragraph reads, after edit:

> `docs/CONTEXT.md`, `docs/glossary/*.md` …, `specs/<slug>/implementation-log.md`, `specs/<slug>/issue-breakdown-log.md`, and the `## Hand-off notes` free-form section of `workflow-state.md` are append-only in spirit. …

- [ ] **Step 5: Verify links repo-wide**

```bash
npm run check:links
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add docs/sink.md
git commit -m "docs(sink): register specs/<slug>/issue-breakdown-log.md as append-only"
```

---

## Chunk 7: Verify gate + dogfood smoke check

Final integration. The verify gate is the deterministic safety net; the smoke check confirms the new artifacts hang together.

### Task 7.1: Run the full verify gate

**Files:** none.

- [ ] **Step 1: Run verify**

```bash
npm run verify
```

Expected: green. Common failure modes and fixes:

| Failure | Fix |
|---|---|
| `check:frontmatter` flags a new file | Add the missing frontmatter fields (compare against a sibling file). |
| `check:commands` says inventory blocks are stale | Re-run Task 6.1 — the three generated blocks must be regenerated together. |
| `check:agents` says `issue-breakdown` is unregistered | Inspect the agent file's frontmatter (`name`, `description`, `tools` non-empty, `## Scope` heading present). |
| `check:links` reports a broken link | The slash-command file's relative path back to the skill is wrong (count `../` carefully — from `.claude/commands/issue/breakdown.md` to the skill is `../../skills/issue-breakdown/SKILL.md`). |
| `check:adr-index` says ADR-0022 isn't indexed | Re-run `npm run check:adr-index`; if it auto-updates `docs/adr/README.md`, stage that file in the fix-up commit. |
| `check:frontmatter` flags missing folder-level frontmatter | If a new doc folder was created (e.g. `docs/superpowers/plans/` if absent), add a `README.md` with `title`, `folder`, `description`, `entry_point` frontmatter. (This plan creates no new folders, so this should not fire.) |

If any check fails, fix the root cause; never `--no-verify`.

- [ ] **Step 2: Commit any verify-driven fix-ups**

```bash
git status
git add -p   # review every hunk
git commit -m "fix(issue-breakdown): satisfy verify gate"
```

(Skip this step if `npm run verify` was clean on the first run.)

### Task 7.2: Smoke-check the slash command resolves

**Files:** none.

- [ ] **Step 1: Confirm the command file is discovered**

```bash
ls .claude/commands/issue/breakdown.md
grep -l "issue-breakdown" .claude/commands/README.md .claude/skills/README.md AGENTS.md CLAUDE.md README.md docs/workflow-overview.md docs/sink.md
```

Expected: the file exists; all seven index files mention `issue-breakdown` at least once.

- [ ] **Step 2: Confirm the conductor skill resolves the slash command**

```bash
grep -n "issue-breakdown" .claude/skills/issue-breakdown/SKILL.md | head -5
```

Expected: at least the frontmatter `name: issue-breakdown` and the cross-link to the agent.

### Task 7.3: Document bootstrap caveat for the dogfood run

**Files:** none — this is a runtime check, not an edit.

The spec's Bootstrap section says: when this feature itself is decomposed via `/issue:breakdown`, the bootstrapped PRs that built the conductor must have the slice-tag HTML comment pasted into their bodies *manually*, otherwise idempotency falls back to `Refs #<n>` matching only.

- [ ] **Step 1: When opening the dogfood tracking issue, confirm:**

  - The first ~3 manually-opened bootstrap PRs (whichever PRs build the conductor itself) contain `<!-- issue-breakdown-slice: issue-<n>-<NN> -->` somewhere in their body.
  - The parent issue body is left bare for the very first `/issue:breakdown` run; the conductor will inject the sentinel block fresh.

This task has no commit. It's a runtime checklist to follow when this plan reaches GitHub.

### Task 7.4: Open the PR

**Files:** none.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin spec/issue-breakdown-design
```

(Or whichever branch the implementer is on. The push must not target `main` or `develop`; `.claude/settings.json` will block that.)

- [ ] **Step 2: Open a single PR for Phase 1**

```bash
gh pr create --base main --head spec/issue-breakdown-design --title "feat(issue-breakdown): Phase 1 — conductor + agent + ADR-0022" --body-file - <<'EOF'
## Summary

Phase 1 of the issue-breakdown track:

- New conductor skill `/issue:breakdown <n>` (`.claude/skills/issue-breakdown/SKILL.md`).
- Specialist agent (`.claude/agents/issue-breakdown.md`) with narrow tool list.
- PR-body and issue-section templates under `templates/`.
- Methodology doc `docs/issue-breakdown-track.md`.
- ADR-0022 — adopt issue-breakdown track.
- `.gitignore` entry for `.issue-breakdown-staging/`.
- Cross-references in `AGENTS.md`, `CLAUDE.md`, `.claude/skills/README.md`, `.claude/commands/README.md`, `docs/sink.md`.

Phase 2 (operational bot under `agents/operational/issue-breakdown-bot/`) is deferred to a follow-up PR.

## Notes for reviewers

- `/issue:breakdown` intentionally skips the canonical `inputs/` intake gate that the shared conductor pattern (`_shared/conductor-pattern.md`) requires of new conductors. Rationale: the input is the GitHub issue + an already-completed `tasks.md`, not a fresh work package. Documented in `docs/issue-breakdown-track.md`.
- ADR-0022 explains the trade-offs that led to a post-/spec:tasks track instead of extending `/spec:tasks` itself.

## Spec / design

- Spec: `docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`.
- Plan: `docs/superpowers/plans/2026-05-02-issue-breakdown.md`.
- ADR: `docs/adr/0022-add-issue-breakdown-track.md`.

## Test plan

- [x] `npm run verify` green locally.
- [x] `check:agents`, `check:commands`, `check:frontmatter`, `check:adr-index`, `check:links` all pass.
- [ ] Reviewer-driven dogfood: open a tracking issue, run the conductor against it, observe N draft PRs + an updated `## Work packages` section.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

The PR is **not** decomposed by `/issue:breakdown` itself (chicken-and-egg per the spec's Bootstrap section). It ships as one PR.

- [ ] **Step 3: Hand off**

Post a comment in the PR linking back to the spec + plan, requesting review. After merge to `main`, the conductor is available; subsequent issues use `/issue:breakdown <n>` end-to-end.

---

## Out of scope (Phase 2 / Phase 3)

Phase 2 — operational bot. Separate PR after Phase 1 stabilises:

- `agents/operational/issue-breakdown-bot/PROMPT.md`
- `agents/operational/issue-breakdown-bot/README.md`
- `.github/workflows/issue-breakdown-bot.yml` (label-triggered on `breakdown-me`)

Phase 3 — refinements (backlog):

- GitHub Project board sync (slice PRs auto-added to a project).
- CODEOWNERS-aware default reviewers per slice.
- `tasks.json` side-car emitted by `tracer-bullet` to retire the regex parser.

---

## References

- Spec: [`docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`](../specs/2026-05-02-issue-breakdown-design.md).
- ADR: [`docs/adr/0022-add-issue-breakdown-track.md`](../../adr/0022-add-issue-breakdown-track.md).
- Methodology: [`docs/issue-breakdown-track.md`](../../issue-breakdown-track.md).
- Conductor pattern: [`.claude/skills/_shared/conductor-pattern.md`](../../../.claude/skills/_shared/conductor-pattern.md).
- Tasks template: [`templates/tasks-template.md`](../../../templates/tasks-template.md).
- PR template: [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md).
- Verify gate: [`docs/verify-gate.md`](../../verify-gate.md).
- Branching rules: [`docs/branching.md`](../../branching.md).
