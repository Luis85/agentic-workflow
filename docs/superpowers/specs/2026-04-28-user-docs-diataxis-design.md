# Design — User-Facing Documentation (Diátaxis)

**Date:** 2026-04-28
**Status:** Draft — pending spec review
**Author:** Brainstormed with Claude

## Problem

The repo's `docs/` folder is heavy on workflow definitions, reference material, and steering content for AI agents. It lacks the two Diátaxis quadrants most useful to a *human visitor*: **tutorials** (learning by doing) and **how-to guides** (task recipes). A newcomer landing on the repo can read what Specorator is, but cannot easily follow a guided first-run, and a returning user cannot easily look up "how do I do X" without re-reading long explanatory files.

## Goal

Add a Diátaxis-shaped user-facing documentation layer to `docs/`:

- A documentation hub at `docs/README.md` that maps every existing and new doc into one of the four Diátaxis quadrants (Tutorial, How-to, Reference, Explanation).
- One canonical, runnable tutorial.
- Five MVP how-to recipes plus an index that lists planned recipes as stubs.
- No relocation of existing files. The hub categorizes them in place.

## Non-goals

- No restructuring of existing files (no moves, no renames).
- No new reference or explanation content. The repo already has enough; the gap is tutorials and how-tos.
- No multilingual or video content.
- No documentation site generator (Docusaurus, MkDocs). Plain Markdown stays the format.

## Approach

**Hybrid Diátaxis adoption (option C from brainstorming):** add the missing quadrants, keep the existing files where they are, and link everything from a single hub page. This minimizes diff surface, preserves all incoming links, and lets the team adopt Diátaxis naming gradually.

## Structure

```
docs/
├── README.md                          # NEW — Diátaxis hub
├── tutorials/
│   └── first-feature.md               # NEW — 30-min walkthrough
├── how-to/
│   ├── README.md                      # NEW — recipe index + roadmap
│   ├── fork-and-personalize.md        # NEW
│   ├── resume-paused-feature.md       # NEW
│   ├── add-adr.md                     # NEW
│   ├── write-ears-requirement.md      # NEW
│   └── run-verify-gate.md             # NEW
└── [existing files — unchanged, categorized via hub]
```

Total new files: 8. Total file moves: 0.

The top-level `README.md` gets a new short "Documentation" section pointing at `docs/README.md` as the hub.

## Quadrant mapping

The hub groups every existing file into a quadrant:

**Reference** (look-it-up): `specorator.md`, `ears-notation.md`, `traceability.md`, `sink.md`, `quality-framework.md`, `verify-gate.md`, `branching.md`, `worktrees.md`, `adr/`.

**Explanation** (understanding-oriented): `workflow-overview.md`, `discovery-track.md`, `sales-cycle.md`, `project-track.md`, `portfolio-track.md`, `stock-taking-track.md`.

**How-to** (task recipes): the five MVP recipes plus pointers to existing `playbooks/`.

**Tutorial** (learning-oriented): `tutorials/first-feature.md`.

`steering/` is excluded — it is agent configuration, not reading material. The hub mentions it once with a pointer for users who want to customize it.

## Tutorial — `tutorials/first-feature.md`

**Goal:** newcomer drives one feature through the full Specorator lifecycle and produces a real markdown change to the repo's glossary, with all 11 stage artifacts visible in `specs/<slug>/`.

**Audience:** never used Specorator. Has Claude Code installed and the repo cloned.

**Time:** 30–45 minutes.

**Subject:** a markdown-only change (e.g., add a new term to the README glossary). Chosen because it has no language-stack assumption — readers on Windows, macOS, and Linux all reach the same end state. Disposable: the reader runs in a scratch branch and `git reset --hard` afterward.

**Section flow:**

1. Setup — clone, open Claude Code, create scratch branch (~2 min).
2. Stage 1–3 — Idea → Research → Requirements via `/spec:start glossary-term` and conversational gates (~10 min).
3. Stage 4 — Design — accept defaults from UX/UI/architect agents (~5 min).
4. Stage 5–6 — Specify → Tasks — review generated `tasks.md` (~5 min).
5. Stage 7 — Implement — `/spec:implement` produces the markdown diff (~5 min).
6. Stage 8 — Test — manual verification, eyeball check (~3 min).
7. Stage 9 — Review — `/spec:review` (~3 min).
8. Stage 10 — Release — **skipped with explicit note**: deploy needs human auth, out of tutorial scope (~1 min).
9. Stage 11 — Retro — `/spec:retro` (~5 min).
10. What to do next — links into the how-to and reference quadrants.

**Constraints:**

- Reader copies prompts verbatim; no improvisation needed.
- Each stage shows: command issued, expected file produced, "if you see X you are on track" line.
- No troubleshooting deep-dives — link out to how-tos for that.
- Tutorial is self-contained: reader does not need to read any other doc to finish it.

## How-to recipes

Each recipe follows a fixed shape (Diátaxis discipline — short, runnable, no theory):

```markdown
# How to <do thing>

**Goal:** one sentence.
**When to use:** one sentence (trigger).

**Prerequisites:**
- bullet
- bullet

## Steps

1. Numbered, runnable. Each step = one command or one decision.
2. Show expected output / state after step.

## Verify

How to confirm it worked. Single check.

## Related

- Reference: [link]
- Explanation: [link]
- Adjacent how-to: [link]
```

**MVP set (5 recipes):**

1. **`fork-and-personalize.md`** — clone the template, edit `memory/constitution.md`, fill `docs/steering/{product,tech,quality}.md`, first commit.
2. **`resume-paused-feature.md`** — `cat specs/<slug>/workflow-state.md`, identify next stage, dispatch the matching `/spec:*` command or use natural language.
3. **`add-adr.md`** — `/adr:new "title"`, fill the template from `templates/adr-template.md`, link the ADR from related artifacts, commit.
4. **`write-ears-requirement.md`** — pick an EARS pattern (ubiquitous / event / state / unwanted / optional), write the sentence, assign a `REQ-<AREA>-NNN` ID, link to the test placeholder.
5. **`run-verify-gate.md`** — invoke the `verify` skill, interpret pass/fail output, fix or proceed to push.

**Index — `how-to/README.md`** lists the five MVP recipes and the planned ones as stubs marked `🚧 planned`:

- skip discovery on a simple feature
- customize agent permissions
- adapt steering for your own stack
- trace a failing test back to a requirement
- switch from Claude Code to Codex / Cursor / Aider
- run a retrospective
- authorize a destructive release action
- bootstrap an operational bot
- migrate an existing project to Specorator

## Hub — `docs/README.md`

Single-page index that groups every doc by Diátaxis quadrant. Layout:

- 📚 Tutorials — learning by doing.
- 🛠 How-to guides — task recipes (five links + "more recipes" pointer to `how-to/README.md`).
- 📖 Reference — authoritative specifications.
- 💡 Explanation — background and rationale.

Bottom note explains `steering/` is for agents, not readers, and points to `steering/README.md` for customization.

## Top-level README integration

`README.md` already contains role-targeted "Start here" sections. Add a single new section near the top, before "Common starting points":

```markdown
## Documentation

Full user guide is in [`docs/`](docs/README.md), organized by what you need:

- **Learning** → tutorials
- **Doing** → how-to recipes
- **Looking up** → reference
- **Understanding** → explanation
```

No other changes to the top-level README.

## Trade-offs and rationale

- **Hybrid over strict restructure** because moving 15+ existing files would break every external link and every internal cross-reference, with little payoff over re-categorizing in place.
- **One tutorial, not many**, because Diátaxis treats tutorial quality as the foundation. Five mediocre tutorials do worse than one rock-solid one. Per-role and per-track tutorials can follow once the canonical one is proven.
- **Markdown-change tutorial subject** to avoid stack assumptions. A code-feature tutorial would force a choice of language; the markdown subject works for everyone.
- **Stub-driven how-to roadmap** to set scope expectations and invite contributions, without committing to ship all recipes day one.
- **No file moves** to keep the diff small, preserve every link, and let adoption be incremental.

## Risks

- **Hub drift** — if new files land in `docs/` without a hub entry, the map goes stale. Mitigation: the hub itself becomes the index of record, and reviewers can flag missing entries during PR review.
- **Tutorial brittleness** — the tutorial assumes specific slash-command behavior. Mitigation: cite the slash command name only; let the conversational orchestrator handle prompts. Re-run the tutorial when major workflow changes ship.
- **How-to overlap with playbooks** — the existing `docs/playbooks/` is also task-oriented. Mitigation: hub explicitly groups playbooks under how-to and links into them.

## Acceptance criteria

- `docs/README.md` exists and lists every other doc file in `docs/` (excluding `steering/` and ADRs which get a single grouped link) under exactly one quadrant.
- `docs/tutorials/first-feature.md` walks 11 stages with explicit commands and expected outputs at each step. A reader who has never used Specorator can complete it in under one hour without consulting any other doc.
- `docs/how-to/README.md` exists with five MVP recipes linked and the planned roadmap visible.
- The five MVP recipe files exist and follow the recipe template.
- Top-level `README.md` includes a "Documentation" section linking to `docs/README.md`.
- No existing file under `docs/` is moved, renamed, or deleted.
- Every link in the hub resolves.

## Out of scope (this design)

- Site generator, search index, theme.
- Per-role tutorials, per-track tutorials.
- Recipes beyond the MVP five (stubs only).
- Translation.
- Edits to existing reference / explanation files beyond optional cross-links.
