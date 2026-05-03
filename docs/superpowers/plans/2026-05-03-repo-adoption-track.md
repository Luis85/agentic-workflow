# Repo Adoption Track Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Repo Adoption Track — clones a foreign git repository, mechanically installs the agentic-workflow scaffold, and opens a PR upstream via a four-phase gated pipeline (review → parity → enrich → push).

**Architecture:** New opt-in track parallel to Stock-taking and Project Scaffolding. State + artifacts live under `adoptions/<repo-slug>/`. The conductor skill `adopt-cycle` orchestrates phases and gates between them; the `repo-adopter` agent owns Review + Parity + Enrich (read-only writes into a gitignored working tree); the conductor (not the agent) executes git push and `gh pr create`. Three TypeScript scripts enforce parity, idempotency, and manifest correctness. Configurable presets (`template-only`, `steering-default` (default), `steering+baseline`) decide what is generated.

**Tech Stack:** TypeScript scripts under `scripts/` (existing pattern, ESM), Markdown artifacts (frontmatter conventions per `scripts/lib/frontmatter.ts`), `gh` CLI for PR creation, `git` CLI for clone/push, existing `scripts/lib/markdown-links.ts` for link validation.

**Spec:** [`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`](../specs/2026-05-03-repo-adoption-track-design.md) — locked decisions Q1–Q10.

**Sequencing decision:** ADR-0027 lands in a **predecessor PR** before any implementation work (default chosen for the open question §10.9 in the spec). Chunk 1 is that predecessor; Chunks 2–7 are implementation and depend on Chunk 1 being merged to `main`.

---

## Roadmap

| Chunk | Scope | Depends on | Estimated branches |
|---|---|---|---|
| 1 | Predecessor PR — ADR-0027, track docs, `adoptions/` scaffolding, `.gitignore`, taxonomy surface updates | none | 1 |
| 2 | Manifests + renderers — pure functions, fully unit-testable | Chunk 1 merged | 1 |
| 3 | Scripts — `check-adoption-parity.ts`, `check-adoption-idempotency.ts` | Chunks 1–2 | 1 |
| 4 | Agent + slash commands — `repo-adopter`, `/adopt:start`/`review`/`parity`/`enrich`/`push` | Chunks 1–3 | 1 |
| 5 | Conductor skill + push wiring — `adopt-cycle` skill, conductor lib, push helpers | Chunks 1–4 | 1 |
| 6 | Fixtures + integration tests — five fixture repos + snapshot tests | Chunks 1–5 | 1 |
| 7 | Documentation polish + product page + release notes | Chunks 1–6 | 1 |

Each chunk ships its own PR. Cross-chunk references use the file paths the chunk creates.

---

## Chunk 1: Predecessor PR — ADR + track docs + scaffolding

**Branch:** `docs/repo-adoption-track-adr` (cut fresh from `main`).

**Goal:** Land the policy decision (ADR-0027) plus all repository surfaces that point at the new track. After merge, every taxonomy doc lists Repo Adoption as a v1.1 opt-in track. No code, no agent, no scripts in this chunk — implementation chunks depend on this merging first.

**Files in this chunk:**

| Action | Path | Responsibility |
|---|---|---|
| Create | `docs/adr/0027-add-repo-adoption-track.md` | The amending ADR over ADR-0026 |
| Create | `docs/repo-adoption-track.md` | Full track methodology doc |
| Create | `adoptions/README.md` | Folder entry-point with frontmatter |
| Modify | `.gitignore` | Ignore `adoptions/*/repo/` (foreign code) |
| Modify | `AGENTS.md` | Add row to agent-class table |
| Modify | `CLAUDE.md` | List in opt-in tracks paragraph |
| Modify | `docs/specorator.md` | Track table update (find the section that mirrors ADR-0026) |
| Modify | `.claude/skills/README.md` | Note the new conductor skill placeholder |

### Task 1.1: Cut a clean topic branch from main

**Files:** none (workspace prep).

- [ ] **Step 1.1.1:** Confirm working tree clean.

```bash
git status
```

Expected: `nothing to commit, working tree clean` on `main` (or your current integration branch).

- [ ] **Step 1.1.2:** Pull the latest `main`.

```bash
git checkout main
git pull origin main
```

- [ ] **Step 1.1.3:** Create the topic branch.

```bash
git checkout -b docs/repo-adoption-track-adr
```

Expected: `Switched to a new branch 'docs/repo-adoption-track-adr'`.

### Task 1.2: Write ADR-0027

**Files:**
- Create: `docs/adr/0027-add-repo-adoption-track.md`

The ADR amends ADR-0026 (frozen v1.0 taxonomy) by adding a v1.1 row for Repo Adoption. ADR-0026 itself is **not** edited (ADR bodies are immutable per `templates/adr-template.md`); the amendment is recorded in the new ADR.

- [ ] **Step 1.2.1:** Read the template and a representative recent ADR.

```bash
cat templates/adr-template.md
cat docs/adr/0026-freeze-v1-workflow-track-taxonomy.md
```

- [ ] **Step 1.2.2:** Write the ADR. Required content:

```markdown
---
id: ADR-0027
title: Add the Repo Adoption Track as a v1.1 opt-in workflow
status: proposed
date: 2026-05-03
deciders:
  - human maintainer
consulted:
  - architect
  - reviewer
informed:
  - all agents
supersedes: []
superseded-by: []
tags: [workflow, tracks, adoption, v1.1]
---

# ADR-0027 — Add the Repo Adoption Track as a v1.1 opt-in workflow

## Status

Proposed

## Context

ADR-0026 froze the v1.0 workflow taxonomy at twelve first-party tracks. Since that
freeze, a recurrent need surfaced that none of those tracks address: a team wants to
take an *existing git repository they already own* and bring it under the
agentic-workflow template, end-to-end, without doing the install by hand. The
existing pre-workflow tracks all assume human-led work:

- **Stock-taking** investigates a *system* (which may or may not be one repo) and
  produces an inventory for downstream tracks. It is interview-driven and judgment-
  heavy.
- **Project Scaffolding** distils loose source material (notes, briefs) into a
  starter pack of canonical artifacts. It expects documents, not a live repo.
- **Discovery** assumes a blank page.
- The core lifecycle assumes a clean repo with the template already installed.

What is missing is a *mechanical install* path: clone a foreign repo, scan it,
diff it against the expected scaffold, fill the gaps from a versioned manifest,
and PR the result back. The brainstorming-stage spec at
[`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`](../superpowers/specs/2026-05-03-repo-adoption-track-design.md)
captures the full design.

ADR-0026 explicitly states that "no additional first-party track may enter the
v1.0 set without a superseding ADR." This ADR is that superseding decision —
specifically, an *amendment* that adds a thirteenth track at v1.1 without
re-opening v1.0.

## Decision

We add the **Repo Adoption Track** as a v1.1 opt-in workflow.

| # | Track | Type | Primary entry | State home | Source |
|---|---|---|---|---|---|
| 13 | Repo Adoption | Opt-in mechanical install | `/adopt:start <git-url>` | `adoptions/<repo-slug>/adoption-state.md` | This ADR + `docs/repo-adoption-track.md` |

The track is bound by the design decisions Q1–Q10 captured in the spec:
parallel-track placement, configurable presets, gate per phase, skip-and-report
on conflicts, three enforcement scripts, URL-or-path source, single PR back to
origin, direct push with patch fallback. Those decisions are immutable from
this ADR forward; subsequent ADRs are required to change them.

## Considered options

### Option A — Add Repo Adoption as a v1.1 opt-in track (chosen)

- Pros: Names a real adoption scenario already in user demand. Reuses existing
  patterns (parallel folder, conductor skill, narrow agent, gate per phase).
  Distinct from Stock-taking and Project Scaffolding without overlap.
- Cons: Expands the surface from twelve to thirteen tracks. Adopters must learn
  one more entry point.

### Option B — Extend Project Scaffolding with a "from-git-url" mode

- Pros: No new track. Smaller surface.
- Cons: Project Scaffolding is built around evidence-citation and human-led
  extraction. Bolting a mechanical-install pipeline onto it dilutes the
  scaffolder's scope and confuses the user-facing entry point.

### Option C — Extend Stock-taking with a clone-and-install mode

- Pros: No new track.
- Cons: Stock-taking is interview-driven inventory. Forcing it to do a
  mechanical install reverses its core stance ("inventory before intent") and
  produces low-quality output when run autonomously.

### Option D — Ship a separate `npx create-agentic-workflow` CLI instead

- Pros: Independent distribution channel. No track expansion.
- Cons: Different distribution channel, different audience (mostly net-new
  projects, not adopters of an existing repo). The "PR back to origin" loop is
  not a CLI fit. Could exist alongside the track later but doesn't replace it.

## Consequences

### Positive

- Adopters get an automated path from "we have a repo" to "we have a PR
  installing the template."
- Track surface remains coherent: each track has one clear job.
- The `.adopted` marker convention created by this track gives every adopted
  repo a deterministic version pin.

### Negative

- Track count grows from twelve to thirteen.
- A new conductor skill, agent, three scripts, and a folder convention must be
  maintained going forward.
- Future template updates require the adopted repo to opt into a refresh; v1.1
  ships only the one-shot path with retained state.

### Neutral

- Bi-directional sync, fork-PR mode, multi-PR phase split, and drift detection
  are explicitly deferred (see spec §9). They may become later ADRs.

## Compliance

- `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/specorator.md`, `.claude/skills/README.md`,
  and `sites/index.html` reference the new track and link back to
  `docs/repo-adoption-track.md`.
- The ADR index (`docs/adr/README.md`) lists this ADR; `scripts/check-adr-index.ts`
  enforces this on the verify gate.
- `scripts/check-adoption-parity.ts` (delivered in Chunk 3 of the implementation
  plan) enforces the manifest contract on every adoption.
- Reviewers treat any change to the ten locked decisions in spec §2 as
  requiring a superseding ADR.

## References

- [`docs/adr/0026-freeze-v1-workflow-track-taxonomy.md`](0026-freeze-v1-workflow-track-taxonomy.md) —
  the ADR this one amends.
- [`docs/superpowers/specs/2026-05-03-repo-adoption-track-design.md`](../superpowers/specs/2026-05-03-repo-adoption-track-design.md) —
  full design.
- [`docs/repo-adoption-track.md`](../repo-adoption-track.md) — track methodology
  doc landed in the same PR as this ADR.
- [`docs/stock-taking-track.md`](../stock-taking-track.md) — sister track.
- [`docs/project-scaffolding-track.md`](../project-scaffolding-track.md) — sister track.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR;
> only the predecessor's `status` and `superseded-by` pointer fields may be updated.
```

- [ ] **Step 1.2.3:** Run the ADR index check. It must fail until the index is updated.

```bash
npx tsx scripts/check-adr-index.ts
```

Expected: non-zero exit complaining ADR-0027 is missing from the index.

- [ ] **Step 1.2.4:** Auto-update the ADR index.

```bash
npx tsx scripts/fix-adr-index.ts
```

Expected: `docs/adr/README.md` updated with the new entry.

- [ ] **Step 1.2.5:** Re-run the check.

```bash
npx tsx scripts/check-adr-index.ts
```

Expected: exit 0.

- [ ] **Step 1.2.6:** Commit.

```bash
git add docs/adr/0027-add-repo-adoption-track.md docs/adr/README.md
git commit -m "docs(adr): add ADR-0027 (Repo Adoption Track v1.1)"
```

### Task 1.3: Write the track methodology doc

**Files:**
- Create: `docs/repo-adoption-track.md`

Same structure as `docs/stock-taking-track.md` and `docs/project-scaffolding-track.md`. Sections: Why, Where it lives, The four phases, The repo-adopter agent, Method library, Quality gates, Handoff.

- [ ] **Step 1.3.1:** Read sister tracks for shape.

```bash
cat docs/stock-taking-track.md
cat docs/project-scaffolding-track.md
```

- [ ] **Step 1.3.2:** Create `docs/repo-adoption-track.md` with frontmatter + sections. Required sections (copy structure verbatim from sister tracks; substitute content per the spec):

```markdown
---
title: "Repo Adoption Track — Mechanical Template Install"
folder: "docs"
description: "Opt-in track that clones a foreign git repository, mechanically installs the agentic-workflow scaffold, and PRs the result back upstream via a gated four-phase pipeline."
entry_point: false
---

# Repo Adoption Track — Mechanical Template Install

**Version:** 0.1 · **Status:** Draft · **Stability:** Opt-in · **ADR:** [ADR-0027](adr/0027-add-repo-adoption-track.md)

[One-paragraph summary identical to spec §1.]

## Table of contents

1. [Why a Repo Adoption Track](#1-why-a-repo-adoption-track)
2. [Where it lives](#2-where-it-lives)
3. [The four phases](#3-the-four-phases)
4. [The repo-adopter agent](#4-the-repo-adopter-agent)
5. [Method library](#5-method-library)
6. [Quality gates](#6-quality-gates)
7. [Handoff](#7-handoff)
8. [Sources and further reading](#8-sources-and-further-reading)
```

Body content cribbed from spec §1, §3, §4, §5, §6, §7. Keep it methodology-focused, not implementation-focused; implementation details belong in the agent and skill docs created in Chunks 4–5.

- [ ] **Step 1.3.3:** Run frontmatter and link checks.

```bash
npx tsx scripts/check-frontmatter.ts
npx tsx scripts/check-markdown-links.ts
```

Expected: both exit 0. If any link broken, fix the path.

- [ ] **Step 1.3.4:** Commit.

```bash
git add docs/repo-adoption-track.md
git commit -m "docs(adoption): add repo-adoption-track methodology doc"
```

### Task 1.4: Create the `adoptions/` folder entry-point

**Files:**
- Create: `adoptions/README.md`

Folders below the repo root start with frontmatter (`title`, `folder`, `description`, `entry_point: true`) per `AGENTS.md` repo conventions. This README explains the folder convention to humans and agents.

- [ ] **Step 1.4.1:** Create `adoptions/README.md`:

```markdown
---
title: "adoptions/"
folder: "adoptions"
description: "Entry point for repo adoption engagements — one folder per foreign repository being onboarded to the agentic-workflow template."
entry_point: true
---

# adoptions/

One folder per foreign repository being adopted into the agentic-workflow
template. Used by the **Repo Adoption Track** (opt-in, mechanical install).

## When to create an adoption folder

Create a folder here when you want to bring an existing git repository under
this template by running the four-phase pipeline (review → parity → enrich →
push) and opening a PR upstream that installs the scaffold.

If you want to **investigate an existing system** before deciding what to
build, use Stock-taking instead. If you have **loose docs** but no live repo,
use Project Scaffolding instead. If you are starting from scratch, use
Discovery.

## How to start

```
/adopt:start <git-url-or-local-path> [--preset steering-default|template-only|steering+baseline]
```

Then drive the conductor skill `/adopt-cycle` conversationally, or invoke the
phase commands manually:

```
/adopt:review     → produces review.md
/adopt:parity     → produces parity.md
/adopt:enrich     → writes generated files into the working tree + enrich-preview.md
/adopt:push       → branches, commits, pushes, opens PR (or emits patch fallback)
```

## Folder structure

```
adoptions/
└── <repo-slug>/
    ├── adoption-state.md        # state machine — current phase, preset, push mode
    ├── review.md                # phase 1: repo signals
    ├── parity.md                # phase 2: gap table
    ├── enrich-preview.md        # phase 3: generated file index
    ├── push-record.md           # phase 4: PR url, sha, branch, fallback path
    └── repo/                    # foreign repo working tree (gitignored — never committed here)
```

## Methodology

See [`docs/repo-adoption-track.md`](../docs/repo-adoption-track.md) and
[ADR-0027](../docs/adr/0027-add-repo-adoption-track.md) for the design rationale.
```

- [ ] **Step 1.4.2:** Run frontmatter check.

```bash
npx tsx scripts/check-frontmatter.ts
```

Expected: exit 0.

- [ ] **Step 1.4.3:** Commit.

```bash
git add adoptions/README.md
git commit -m "docs(adoption): add adoptions/ folder entry-point"
```

### Task 1.5: Update `.gitignore` to exclude foreign-repo working trees

**Files:**
- Modify: `.gitignore`

The foreign-repo clone lives at `adoptions/<slug>/repo/` and must never be committed to this repository. Phase artifacts (`*.md`) under `adoptions/<slug>/` *are* committed.

- [ ] **Step 1.5.1:** Add the ignore rule. Use Edit to insert after the existing Worktrees block.

Add these lines after the `.issue-breakdown-staging/` entry:

```gitignore

# Repo Adoption Track — foreign-repo working trees live under
# adoptions/<slug>/repo/. Phase artifacts (*.md) at adoptions/<slug>/ are
# committed; the cloned foreign code is not. See docs/repo-adoption-track.md.
adoptions/*/repo/
```

- [ ] **Step 1.5.2:** Verify the rule works against a dummy folder.

```bash
mkdir -p adoptions/example/repo
echo "test" > adoptions/example/repo/file.txt
git status --short
```

Expected: no `adoptions/example/repo/file.txt` listed (gitignored). `adoptions/example/` itself may show as untracked if no `.md` artifacts inside, which is fine — the README is already tracked by Task 1.4.

- [ ] **Step 1.5.3:** Clean up the dummy folder.

```bash
rm -rf adoptions/example
```

- [ ] **Step 1.5.4:** Commit.

```bash
git add .gitignore
git commit -m "build(gitignore): exclude adoptions/*/repo/ working trees"
```

### Task 1.6: Update `AGENTS.md` agent-class table

**Files:**
- Modify: `AGENTS.md`

Add a row for the new track in the Agent classes table. The agent itself does not exist yet (Chunk 4 creates it), but the table row points forward to the planned location and tracks the policy decision.

- [ ] **Step 1.6.1:** Read the current table to find the right insertion point.

```bash
grep -n "Issue-breakdown\|Design.*opt-in\|Specorator improvement" AGENTS.md
```

- [ ] **Step 1.6.2:** Insert a new row after the Design row, before the Specorator improvement row. Exact addition:

```markdown
| **Repo Adoption** *(opt-in, mechanical install)* | `.claude/agents/repo-adopter.md` | Clone foreign repo + mechanically install template scaffold + PR back to origin. State lives `adoptions/<slug>/`. | [`docs/repo-adoption-track.md`](docs/repo-adoption-track.md) ([ADR-0027](docs/adr/0027-add-repo-adoption-track.md)) |
```

- [ ] **Step 1.6.3:** Run the agent-doc surface check (will fail until Chunk 4 ships the agent).

```bash
npx tsx scripts/check-agents.ts
```

Expected: non-zero exit complaining `.claude/agents/repo-adopter.md` is referenced but missing. **This is expected.** Add a TODO comment in this commit's body so the gap is auditable, and accept the verify-gate failure for now — Task 1.10 below documents how to bypass for this predecessor PR (manifest-pending exception).

- [ ] **Step 1.6.4:** Commit.

```bash
git add AGENTS.md
git commit -m "docs(agents): list repo-adopter agent class (forward reference)"
```

### Task 1.7: Update `CLAUDE.md` opt-in-tracks paragraph

**Files:**
- Modify: `CLAUDE.md`

The "Other tracks" section in `CLAUDE.md` lists every opt-in / companion track conductor by entry-point command. Add the new one.

- [ ] **Step 1.7.1:** Find the current list.

```bash
grep -n "Discovery.*discovery:start\|opt-in / companion tracks are" CLAUDE.md
```

- [ ] **Step 1.7.2:** Edit the sentence so the comma-separated list includes Repo Adoption (`/adopt:start`). Insert it between Issue-breakdown and Specorator Improvement.

Before:

```markdown
Issue-breakdown (`/issue:breakdown`), and Specorator Improvement (`/specorator:update`).
```

After:

```markdown
Issue-breakdown (`/issue:breakdown`), Repo Adoption (`/adopt:start`), and Specorator Improvement (`/specorator:update`).
```

- [ ] **Step 1.7.3:** Commit.

```bash
git add CLAUDE.md
git commit -m "docs(claude): list Repo Adoption track in opt-in entry-points"
```

### Task 1.8: Update `docs/specorator.md` taxonomy reference

**Files:**
- Modify: `docs/specorator.md`

`docs/specorator.md` carries a track table aligned with ADR-0026. Update it to match the v1.1 amendment.

- [ ] **Step 1.8.1:** Locate the track table.

```bash
grep -n "^|.*Track.*|" docs/specorator.md | head -20
```

- [ ] **Step 1.8.2:** Add a row for `Repo Adoption` after the row for `Specorator Improvement`. The row's columns must match the existing table schema; copy a sister row's column layout exactly. Reference cells:

- Track: `Repo Adoption`
- Type: `Opt-in mechanical install`
- Primary entry: `/adopt:start <git-url>`
- State home: `adoptions/<slug>/adoption-state.md`
- Source: `ADR-0027`

- [ ] **Step 1.8.3:** Run frontmatter + link checks.

```bash
npx tsx scripts/check-frontmatter.ts
npx tsx scripts/check-markdown-links.ts
```

Expected: both exit 0.

- [ ] **Step 1.8.4:** Commit.

```bash
git add docs/specorator.md
git commit -m "docs(specorator): add Repo Adoption to v1.1 track table"
```

### Task 1.9: Mention the new conductor skill in `.claude/skills/README.md`

**Files:**
- Modify: `.claude/skills/README.md`

The skills README catalogs conductor skills. The skill itself ships in Chunk 5; here we add a one-line forward reference so the doc surface stays in sync with the ADR.

- [ ] **Step 1.9.1:** Find the conductor-skill catalog section.

```bash
grep -n "conductor\|workflow conductor\|orchestrate" .claude/skills/README.md | head -10
```

- [ ] **Step 1.9.2:** Add a one-line entry:

```markdown
- **`adopt-cycle`** — Drive the Repo Adoption Track end-to-end (clone → review → parity → enrich → push). Ships in `.claude/skills/adopt-cycle/SKILL.md` (Chunk 5). See [`docs/repo-adoption-track.md`](../../docs/repo-adoption-track.md).
```

- [ ] **Step 1.9.3:** Commit.

```bash
git add .claude/skills/README.md
git commit -m "docs(skills): forward-reference adopt-cycle conductor skill"
```

### Task 1.10: Run the verify gate

**Files:** none (gate run).

The verify gate must pass before pushing. The known failure is `check-agents.ts` (the agent file does not exist yet). All other checks must be green.

- [ ] **Step 1.10.1:** Run the full gate.

```bash
npm run verify
```

Expected outcome: pass on `check-frontmatter`, `check-markdown-links`, `check-adr-index`, `check-content`, `check-workflow-docs`, `check-spec-state`. Failing on `check-agents.ts` is acceptable for this predecessor PR — but **stop and reconsider** if any other check fails. If `check-agents.ts` is the only failure, document the gap in the PR body (per AGENTS.md "Don't add `.claudeignore` exclusions silently — note them in `docs/steering/tech.md`" precedent: prefer noting in the PR description rather than silencing the check).

- [ ] **Step 1.10.2:** If any unexpected check fails, fix the underlying issue, re-run, and amend a focused commit. Do not bypass with `--no-verify`.

- [ ] **Step 1.10.3:** If only `check-agents.ts` fails: temporarily mark the new agent-class row in `AGENTS.md` with an HTML comment marker that the script ignores, **or** add a one-test-case allowlist entry to `scripts/check-agents.ts` covering this specific pending agent. Pick whichever is least invasive — the allowlist entry is preferred because it auto-removes when Chunk 4's agent ships. If the script has no such allowlist mechanism, add one as part of this task: a constant `PENDING_AGENTS: Set<string>` keyed by file path with a comment pointing to the chunk that resolves it.

- [ ] **Step 1.10.4:** Commit any allowlist change with:

```bash
git commit -m "build(check-agents): allowlist repo-adopter pending Chunk 4"
```

- [ ] **Step 1.10.5:** Re-run verify.

```bash
npm run verify
```

Expected: exit 0.

### Task 1.11: Open the predecessor PR

**Files:** none (push + PR open).

- [ ] **Step 1.11.1:** Push the branch.

```bash
git push -u origin docs/repo-adoption-track-adr
```

- [ ] **Step 1.11.2:** Open the PR.

```bash
gh pr create --title "docs(adr): add ADR-0027 — Repo Adoption Track (v1.1)" --body "$(cat <<'EOF'
## Summary

- Adds ADR-0027 amending ADR-0026 to introduce the Repo Adoption Track at v1.1.
- Adds the `docs/repo-adoption-track.md` methodology doc.
- Creates `adoptions/` folder entry-point and `.gitignore` rule for foreign-repo working trees.
- Updates `AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, and `.claude/skills/README.md` to reference the new track.

This is the **predecessor PR**. Implementation (agent, skill, scripts, fixtures) lands in subsequent PRs gated on this merge. See plan: `docs/superpowers/plans/2026-05-03-repo-adoption-track.md`.

## Test plan

- [x] `npm run verify` passes (with `repo-adopter` allowlisted in `check-agents.ts` pending Chunk 4).
- [x] All new docs pass `check-frontmatter` and `check-markdown-links`.
- [x] ADR index includes 0027 (`check-adr-index` green).
- [x] `.gitignore` rule confirmed against dummy `adoptions/example/repo/` folder.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 1.11.3:** Record the PR URL.

```bash
gh pr view --json url -q .url
```

Save the URL — chunks 2–7 reference this PR's merge as their dependency.

### Chunk 1 acceptance criteria

- [ ] ADR-0027 lives at `docs/adr/0027-add-repo-adoption-track.md` and `check-adr-index.ts` passes.
- [ ] `docs/repo-adoption-track.md` exists with all eight sections from the methodology shape.
- [ ] `adoptions/README.md` has correct frontmatter and is the only file at `adoptions/`.
- [ ] `.gitignore` contains the `adoptions/*/repo/` rule.
- [ ] `AGENTS.md`, `CLAUDE.md`, `docs/specorator.md`, `.claude/skills/README.md` all reference the new track.
- [ ] `npm run verify` exits 0 on the branch (with the `check-agents.ts` allowlist in place).
- [ ] PR opened and linked to ADR-0026 in its body.

### Chunk 1 review notes for the next chunk

- The allowlist entry in `scripts/check-agents.ts` is a debt item that Chunk 4 must remove when it adds the real agent file.
- The forward reference in `.claude/skills/README.md` is a debt item that Chunk 5 must replace with a real entry once the conductor skill ships.
- The agent-class table row in `AGENTS.md` is a forward reference that Chunk 4 must verify still matches when the agent file lands.

---

## Chunk 2: Manifests + renderers

> **Status:** to be drafted after Chunk 1 review approves.

This chunk creates `scripts/lib/adoption-templates.ts` with the preset manifest types and the renderer registry. Renderers are pure functions taking a `ReviewSignals` shape and returning markdown content. This chunk is fully unit-testable — no I/O beyond reading templates from this repo. Subsequent chunks consume the manifest.

Detailed task breakdown to be filled in after Chunk 1 ships.

---

## Chunk 3: Scripts (parity + idempotency)

> **Status:** to be drafted after Chunk 2 ships.

`scripts/check-adoption-parity.ts` and `scripts/check-adoption-idempotency.ts`, plus their unit tests in `scripts/test-scripts.ts`.

---

## Chunk 4: Agent + slash commands

> **Status:** to be drafted after Chunk 3 ships.

`.claude/agents/repo-adopter.md`, `.claude/commands/adopt/start.md`, `review.md`, `parity.md`, `enrich.md`, `push.md`. This chunk also removes the `check-agents.ts` allowlist entry from Chunk 1.

---

## Chunk 5: Conductor skill + push wiring

> **Status:** to be drafted after Chunk 4 ships.

`.claude/skills/adopt-cycle/SKILL.md` plus `scripts/lib/adoption-conductor.ts` for shared push helpers (slug derivation, state read/write, push or patch fallback).

---

## Chunk 6: Fixtures + integration tests

> **Status:** to be drafted after Chunk 5 ships.

`scripts/fixtures/adoption/{empty,node-app,python-lib,partial-adoption,already-adopted}/` plus snapshot-based integration tests that run review → parity → enrich against each fixture and assert the generated tree.

---

## Chunk 7: Documentation polish + product page + release notes

> **Status:** to be drafted after Chunk 6 ships.

Update `sites/index.html` to surface the new track on the public product page, add release notes for the next version cut, and reconcile any documentation surfaces that drifted across chunks.
