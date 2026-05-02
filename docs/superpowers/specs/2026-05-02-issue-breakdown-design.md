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
2. **Vertical-slice decomposition** of `tasks.md` rows into independent draft PRs by parsing `specs/<slug>/tasks.md` (which is itself produced by `tracer-bullet` during `/spec:tasks`). The conductor does **not** dispatch `tracer-bullet` — `tasks.md` is the canonical input and already contains the slice structure, dependency graph, IDs, acceptance criteria, and Definition of Done. See "Slicing input" below.
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
   ├─ Slice ─────────────── parse specs/<slug>/tasks.md
   │                        (already produced by tracer-bullet in /spec:tasks)
   │                        → [{ordinal, scope, goal, task_ids[], dod[], blocked_by[]}]
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
   ├─ Hand-off note ─────── append one line to specs/<slug>/workflow-state.md
   │                        ## Hand-off notes section
   │
   └─ Persist audit ──────── chore/issue-breakdown-audit-issue-<n>-<runid> branch
                             cut from <integration-branch>; commit + push +
                             open non-draft chore PR for the two appends so
                             working tree is clean for the next /issue:breakdown
                             run (Step 1's clean-tree gate would otherwise refuse).
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
- `docs/sink.md` — add row for `specs/<slug>/issue-breakdown-log.md` (lifecycle: append-only; owner: `issue-breakdown` agent).
- `CLAUDE.md` — link new track from "Other tracks (opt-in)" table.
- `.gitignore` — add `.issue-breakdown-staging/` so transient PR/issue body files never land in version control.

### Conductor skill (`.claude/skills/issue-breakdown/SKILL.md`)

Frontmatter: `name`, `description`, `argument-hint: <issue-number>`. Imports `_shared/conductor-pattern.md` for gating + escalation rules (consistent with `orchestrate`, `discovery-sprint`, `sales-cycle`).

Body sections:

1. Read first (state, references).
2. Pre-flight (auth, issue read).
3. Resolve spec lineage (3 fallback strategies).
4. Verify gate (`tasks.md` complete).
5. Idempotency check.
6. Parse `tasks.md` (no skill dispatch; see "Slicing input" below).
7. Confirm (single `AskUserQuestion`).
8. Per-slice loop (branch → empty commit → push → draft PR).
9. Update parent issue body (sentinel-bracketed re-edit zone).
10. Audit log + hand-off note.
11. Constraints (idempotent; never `--no-verify`; sequential; no `main` writes).
12. References.

### Slicing input — parsing `tasks.md`

`tasks.md` is produced by `tracer-bullet` during `/spec:tasks` and follows `templates/tasks-template.md`. It is **markdown**, not structured data. The conductor parses it directly using stable anchors the template actually contains.

**A slice is a parallelisable batch.** The template provides this primitive in its `## Parallelisable batches` section (e.g. "Batch 1: T-AUTH-001, T-AUTH-005"). Each batch is, by definition, a set of tasks with no inter-dependencies — exactly the property a draft PR needs. The conductor's mapping rule is:

- **One PR per `Batch N`** — slice ordinal `<NN>` = `N`.
- **Tasks-in-slice** = the `T-<AREA>-NNN` list on that batch's line.
- **`🪓 may slice` annotations** override the batch grouping for individual tasks: a task flagged `🪓` with a `**Slice plan:**` line is split out into its own slice (or sub-slices) regardless of which batch it sits in.

The conductor parses these template-guaranteed anchors:

| Field | Source in `tasks.md` |
|---|---|
| Slice ordinal `<NN>` | `## Parallelisable batches` body, line prefix `- **Batch N:**`, zero-padded to 2 digits. |
| Tasks in slice | Same line; comma-separated `T-<AREA>-NNN` tokens. |
| Per-task heading | `### T-<AREA>-NNN <emoji-block> — <short title>` — `<emoji-block>` is one or more legend emojis (`🧪 🔨 📐 📚 🚀 🪓`) in any order, with or without separating spaces. `templates/tasks-template.md` requires `🪓` to be added *in addition to* the task-type emoji on may-slice tasks (e.g. `### T-AUTH-014 🔨🪓 — Password reset`), so the parser must accept multi-emoji headings. Use a regex along the lines of `^### (T-[A-Z0-9]+-\d{3})\s+([🧪🔨📐📚🚀🪓\s]+?)\s+— (.+)$` and post-process the captured group to detect each flag. Goal = `<short title>`. |
| Per-task description | Bullet `- **Description:**` under the heading. |
| Per-task DoD | Bullet `- **Definition of done:**` followed by checklist items. |
| Per-task `Depends on` | Bullet `- **Depends on:**` (used to cross-check that the batch is actually independent — surface a warning if not). |
| `🪓 may-slice` flag | `🪓` appears anywhere in the captured `<emoji-block>` (alone or alongside a task-type emoji); the task is then expected to carry a `**Slice plan:**` bullet. |
| Slice goal (PR title) | Concatenation of in-batch task short titles, separated by " + ", truncated to 60 chars. If the batch is a single `🪓` task, the slice goal is that task's short title. |
| Slice DoD (PR body) | Aggregation of in-batch tasks' per-task DoD checklists, plus the spec's `## Quality gate` section as a final gate. |

There is **no** "Acceptance criteria" or "Test approach" section in the template — these are the planner's discretion inside `**Description:**` or `**Definition of done:**`. The conductor does not require them as anchors.

There is **no** whole-spec "Definition of done" section either — the analogous gate is the `## Quality gate` heading at the bottom of the template, which the conductor copies into the PR body's "Definition of done" block as the final gate.

**Legacy `tasks.md` support.** Every pre-template `tasks.md: complete` feature in the repo (e.g. `specs/version-0-6-plan/tasks.md`) uses the legacy heading shape `### T-V06-001 - Decide steering profile location` (no emoji, ASCII hyphen separator) and omits `## Task list`, `## Parallelisable batches`, and `## Quality gate` entirely. The parser must accept these so `/issue:breakdown` can act on already-shipped features without first migrating them to the new template. Be liberal in what is accepted; only the things genuinely required to compute slices are hard-stops.

**Hard requirements (refuse + surface offending location if missing):**

- The file exists and contains at least one `### T-<AREA>-NNN …` heading.
- Each task heading carries a `**Description:**` bullet underneath it.

**Optional anchors (synthesise sensible defaults when absent):**

| Anchor | If present | If absent |
|---|---|---|
| `## Task list` | Use it as the section boundary; only `### T-…` headings inside count. | Treat every `### T-<AREA>-NNN …` heading in the file as a task. |
| `## Parallelisable batches` | One slice per `- **Batch N:** T-…, T-…` line; zero-pad ordinal `<NN>`. | Synthesise a single batch containing every task in document order — yields one PR. Surface the synthesis to the conductor so the user can confirm or abort. |
| `## Quality gate` | Copied verbatim into every PR body's DoD block. | Use the default DoD shipped in `templates/issue-breakdown-pr-body-template.md` (verify green, all task IDs done, tests pass, docs updated, PR template complete). |
| `**Definition of done:**` per task | Aggregated into the slice DoD. | Skip the per-task aggregation; the slice DoD falls back to the (possibly-default) `## Quality gate`. |
| `**Depends on:**` per task | Cross-check that the batch is independent — surface a warning if not. | No cross-check. |
| `**Satisfies:**` per task | Surface in the slice's "Spec lineage" block. | Omit. |

**Per-task heading regex (legacy + canonical):** `^### (T-[A-Z0-9]+-\d{3})(?:\s+([🧪🔨📐📚🚀🪓\s]+?))?\s+[—-]\s+(.+)$`. Either em-dash (`—`) or ASCII hyphen-with-spaces (`-`) is accepted as the separator; the `<emoji-block>` capture is optional (legacy headings have none).

The error message names the offending location (file path + line number) and instructs the user to either fix `tasks.md` directly or re-run `/spec:tasks`.

**Deferred refinement.** A future `tasks.json` side-car (out of scope here) would replace this regex parser. Recorded in the ADR's "consequences".

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
- **Edit / Write** —
  - Write `specs/<slug>/issue-breakdown-log.md` (new artifact, owned by this agent — see "Sink update" below).
  - Append one dated line to the `## Hand-off notes` free-form section of `specs/<slug>/workflow-state.md`. The frontmatter schema is **not** modified. This append is sanctioned by the `### Append-only` paragraph in `docs/sink.md` ("the active feature's `workflow-state.md` gets a dated one-line entry appended … so the workflow has a paper trail") and is not exclusive to the orchestrator.
  - Stage transient PR/issue body files under `<repo-root>/.issue-breakdown-staging/` (gitignored; never committed). Files are deleted at end of run. The PR body is fed to `gh` via `--body-file`.
- **Bash** — `git`, `gh`. Pushes to `main` / `develop` already denied by `.claude/settings.json`. Branch pushes to `feat/*` allowed.
- **No Agent tool** — no further dispatch. `tasks.md` is parsed in-process; no sub-agent is spawned.

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

`agents/operational/issue-breakdown-bot/PROMPT.md` is the source-of-truth prompt loaded by the scheduled GitHub Action. **It is a stand-alone file**, not a transclusion of the conductor agent. The two are kept in sync by both being derived from the same design spec (this document) and by a smoke-test that runs the same fixture through both surfaces. This matches the existing operational-bot precedent (`agents/operational/review-bot/PROMPT.md` is also stand-alone).

Behaviour differences from Phase 1:

- Headless: no `AskUserQuestion`. Auto-picks "Open drafts" at confirm step; auto-picks "Resume" at idempotency check; refuses on any condition Phase 1 would surface as a clarification (missing sentinel, multiple spec candidates, dirty tree N/A in CI, etc.).
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
      contents: write          # branch push for feat/* only
    concurrency:
      group: issue-breakdown-${{ github.event.issue.number }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v4
      # Run Claude Code action with PROMPT.md + issue context.
```

Branch prefix is `feat/` (same as Phase 1) so a single set of branch-protection rules covers both. The GitHub Action's `GITHUB_TOKEN` is the credential — repo `.claude/settings.json` deny rules govern only Claude-driven local pushes; CI pushes go through the Action token, which inherits branch-protection rules but not the local Claude permission set.

**Phase 1 / Phase 2 coupling.** To keep the bot a follow-up rather than co-shipped, Phase 1 must:

- Centralise gating logic in clearly-marked sections of the conductor skill body (so Phase 2 can mirror the same step boundaries without copying gating UI).
- Avoid encoding Phase-2-only state (workflow run inspection, label removal) in Phase 1 surfaces.
- Document the contract between conductor and `tasks.md` (the "Slicing input" section above) so Phase 2 can implement the same parser independently.

**File-level boundary.** Phase 2 introduces only files under `agents/operational/issue-breakdown-bot/` and `.github/workflows/issue-breakdown-bot.yml`. It does **not** import, transclude, or reference any file under `.claude/skills/issue-breakdown/` or `.claude/agents/issue-breakdown.md`. There is no shared template file. The two surfaces are kept consistent by sharing this design spec, not by sharing source.

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
        │                          tasks.md}                ← parsed in-process
        │                                                     (slice list derived from
        │                                                      ## Parallelisable batches +
        │                                                      🪓 may-slice annotations)
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

## Naming, identifiers, and conventions

Three identifier schemes coexist; this section pins them to avoid ambiguity:

| Token | Domain | Example |
|---|---|---|
| `<NN>` | Conductor-assigned slice ordinal, 1-based, zero-padded to 2 digits. Document order in `tasks.md`. | `01`, `02` |
| `T-<AREA>-NNN` | Inner task ID(s) inside the slice, sourced from `tasks.md`. | `T-AUTH-014` |
| `<AREA>` | Uppercase area code from the spec's `workflow-state.md` (e.g. `AUTH`). Used in IDs. | `AUTH` |
| `<area>` | Lowercase Conventional Commits scope, derived as `<AREA>.toLowerCase()` unless the feature's `workflow-state.md` declares an override. | `auth` |
| `<short>` | Kebab-case short title, derived from slice goal: lowercase, ASCII-only, ≤32 chars. | `password-reset` |
| `<slug>` | Feature slug (matches `specs/<slug>/`). | `password-reset` |

Derived strings:

- **Branch name**: `feat/<slug>-slice-<NN>-<short>` — kebab-case, hard-capped at 60 chars; if exceeded, `<short>` is truncated.
- **PR title**: `feat(<area>): <goal> (slice <NN>/<N>)` — Conventional Commits scope (lowercase). Validated against `.github/workflows/pr-title.yml`.
- **Empty scaffold commit message**: `chore(<area>): scaffold <T-<AREA>-NNN> slice` — `chore`, not `scaffold`, to match repo's existing CC type set.
- **Slice tag** (PR body discriminator): `<!-- issue-breakdown-slice: issue-<n>-<NN> -->` — primary idempotency key (preferred over `Refs #<n>` which matches any PR mentioning the issue).

## CI implications of body-only / empty-commit PRs

The repo's verify gate is **manual** — no `.husky/` directory and no client-side `pre-commit` hook is installed. `npm run verify` is run by the human/agent before push. Empty commits therefore pass locally without ceremony.

CI gates that *do* run on PR open:

- **`pr-title.yml`** — Conventional Commits validation. PR title format above complies.
- **`verify.yml`** — runs `npm run verify` in CI on PR. With zero source diff, every check should be a no-op pass; nothing runs against changed files. The conductor does **not** suppress this CI run; reviewers expect it to be green.
- **`gitleaks.yml` / `typos.yml` / `actionlint.yml` / `zizmor.yml`** — secret scan, typo check, action-lint, GHA security. All no-op on empty diffs.
- **GitHub Pages deploy (`pages.yml`)** — only triggers on `main` writes; not affected.

If any CI gate fails on an empty PR, that's a CI misconfiguration to fix at the gate, not a reason to skip the gate (`--no-verify` remains forbidden by `.claude/settings.json` and `feedback_verify_gate.md`).

The conductor also does **not** create changesets. Empty PRs deliberately have no user-facing change to release-note. Implementers add changesets in their first real commit if the slice is user-visible.

## Sink update — `specs/<slug>/issue-breakdown-log.md`

Two updates to `docs/sink.md` (the real sink schema is `| Path | Owner | Mutability |` in the Ownership table, plus a separate prose "### Append-only" section — not the four-column shape used in earlier draft):

1. **Ownership table row** (in the existing 3-column shape):

   ```
   | `specs/<slug>/issue-breakdown-log.md` | `issue-breakdown` agent | Append-only — dated entries, never rewritten |
   ```

2. **Append-only paragraph extension** — add `specs/<slug>/issue-breakdown-log.md` to the existing list under the `### Append-only` heading of `docs/sink.md`, alongside `implementation-log.md` and the `## Hand-off notes` section. New text:

   > `docs/CONTEXT.md`, `docs/glossary/*.md` …, `specs/<slug>/implementation-log.md`, **`specs/<slug>/issue-breakdown-log.md`**, and the `## Hand-off notes` free-form section of `workflow-state.md` are append-only in spirit. …

The append-only contract mirrors `implementation-log.md`: dated entries, never rewritten, agents may refine wording but historical narrative survives.

## Idempotency — concurrency model and failure modes

The sentinel-bracketed re-edit zone is the conductor's idempotency primitive. Its limits, made explicit:

- **No optimistic lock.** `gh issue edit --body` is last-write-wins. Two concurrent runs (e.g. interactive conductor + label-triggered bot in Phase 2) can race. Phase 2 mitigates this with a workflow `concurrency.group: issue-breakdown-${{ github.event.issue.number }}` so a queued bot run waits for an earlier one. Phase 1 (interactive) is single-user-per-tty by construction; the conductor checks for an in-flight Phase 2 run by inspecting the workflow run list before proceeding, and **refuses** with a surfaced run URL if one is active. The user must wait for the workflow to finish (or cancel it manually) before re-running. There is no `--force-run` override at v1.
- **In-block edits are silently overwritten.** Anything a human writes between `<!-- BEGIN issue-breakdown:<slug> -->` and `<!-- END issue-breakdown:<slug> -->` is replaced on re-run. The block is conductor-owned. Humans annotate *outside* the block.
- **Missing block on a known-prior-run issue.** If `gh pr list --search "issue-breakdown-slice: issue-<n>" --state all` returns ≥ 1 PR but the issue body has no `BEGIN/END` block, the conductor **refuses** and surfaces: "prior run detected (PRs #x #y) but issue body block missing — restore manually or pass `--force-rebuild` to re-emit." It never silently appends a second block.
- **Discriminator.** Idempotency on the PR side keys off the `<!-- issue-breakdown-slice: issue-<n>-<NN> -->` HTML comment in the PR body — searched via `gh pr list --search`. `Refs #<n>` is informational only, not the key.
- **Search reliability caveat.** `gh pr list --search` queries GitHub's code-search index, which tokenises on word boundaries. The `:`, `<`, `>`, and `-` characters in the slice tag may not match as a literal phrase across all GitHub versions. The implementation plan must include a smoke-test that opens a known-tagged draft PR and confirms `gh pr list --search "issue-breakdown-slice issue-<n>"` (without colons) returns it. If the search proves unreliable, fall back to a brute-force scan: list all PRs that match `Refs #<n>` and grep the body locally for the exact tag.

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
| `tasks.md` parse yields 0 slices | Surface to user; abort. |
| `tasks.md` parse yields 1 slice | Confirm — single PR may be more friction than `gh pr create --draft` by hand. Offer to abort. |
| `tasks.md` parse missing required anchor (`## Parallelisable batches`, `### T-<AREA>-NNN` heading, `**Description:**`, `**Definition of done:**`) | Hard-stop. Surface offending heading. Direct user to fix `tasks.md` or re-run `tracer-bullet`. |
| Issue body has no `specs/` link AND no `spec:` label | `AskUserQuestion` lists all `tasks.md`-complete features. |
| User aborts confirmation | No git or gh side-effects. |
| Sentinel block in issue body deleted between runs | Refuse and surface (see Idempotency section). Offer `--force-rebuild`. |
| Concurrent run already in flight (Phase 2 active) | Refuse; report active workflow run; suggest waiting. |
| Empty PR's `verify.yml` CI passes but reviewer expects diff | Documented in PR template; reviewer-side education, not a defect. |

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
  - **Negative.** Extra skill+agent+bot to maintain; coupled to the heading layout of `templates/tasks-template.md` (drift risk if `tracer-bullet` rewrites the template — mitigated by the conductor's "refuse on missing anchor" rule); empty-commit per slice is mildly noisy in `git log`; sentinel-block re-edits are last-write-wins (documented above).
  - **Neutral.** New append-only audit-log artifact under `specs/<slug>/issue-breakdown-log.md`; no schema change to `workflow-state.md`.
  - **Deferred refinement.** A structured side-car (`specs/<slug>/tasks.json`) emitted by `tracer-bullet` would replace the regex parser. Out of scope for v1.

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

## Bootstrap — first-run caveat

The conductor doesn't exist when the work to *build it* starts. The dogfood plan ("first slice PR is the conductor itself, subsequent slices are templates / ADR / docs / bot") therefore requires:

1. Bootstrap by hand: open the tracking issue, run `/spec:start … /spec:tasks` through `/orchestrate`, then **manually open the first ~3 draft PRs** (conductor skill + slash command + agent) using `gh pr create --draft` from the user's terminal.
2. **Manually paste the slice tag** into the body of each bootstrapped PR (`<!-- issue-breakdown-slice: issue-<n>-<NN> -->`) so subsequent re-runs of `/issue:breakdown <n>` recognise them as already-existing slices. Without the tag, the discriminator falls back to `Refs #<n>` matching only and the conductor may produce duplicates.
3. Once those PRs merge and the conductor is on `main`, run `/issue:breakdown <n>` against the same tracking issue. Idempotency (sentinel-block check + slice-tag search) ensures the already-merged PRs are recognised and only the *remaining* slices are opened.

This is a one-time bootstrap; subsequent issues use the conductor end-to-end.

## Decisions confirmed during round-2 review

(Folded down from the prior "Open questions" section after round 2.)

- Empty scaffold commit message uses `chore(<area>):` (lowercase scope), mirroring the PR title.
- Audit log is plain markdown for v1; promotable to YAML frontmatter + body if downstream tooling needs it.
- `<area>` (lowercase) is derived mechanically as `<AREA>.toLowerCase()`. No new `workflow-state.md` field is added; if a feature genuinely needs a different scope value, it can override at the conductor's `AskUserQuestion` confirm step.
- `gitleaks` runs on the PR's commit range. An empty-commit PR has zero new content to scan — pass is fast. `pages.yml` triggers only on `main` writes; not relevant for slice draft PRs.

## References

- `docs/specorator.md` — workflow contract.
- `docs/sink.md` — sink layout.
- `docs/discovery-track.md` — opt-in track shape (mirrored here).
- `.claude/skills/orchestrate/SKILL.md` — conductor pattern.
- `.claude/skills/_shared/conductor-pattern.md` — gating + escalation.
- `.claude/skills/tracer-bullet/SKILL.md` — produces `tasks.md` upstream during `/spec:tasks`. This conductor consumes that artifact; it does not invoke the skill at runtime.
- `agents/operational/review-bot/` — operational-bot shape (mirrored for Phase 2).
- `templates/adr-template.md` — ADR template.
- `.claude/memory/feedback_pr_hygiene.md` — branch-per-concern rule.
- `.claude/memory/feedback_no_main_commits.md` — no direct commits to main.
