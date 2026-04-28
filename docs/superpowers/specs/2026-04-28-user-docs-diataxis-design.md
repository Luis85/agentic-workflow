# Design — User-Facing Documentation (Diátaxis)

**Date:** 2026-04-28
**Status:** Draft — pending user review
**Author:** Brainstormed with Claude
**Review history:** Spec reviewer pass 1 — issues found, addressed in this revision.

## Problem

The repo's `docs/` folder is heavy on workflow definitions, reference material, and steering content for AI agents. It lacks the two Diátaxis quadrants most useful to a *human visitor*: **tutorials** (learning by doing) and **how-to guides** (task recipes). A newcomer landing on the repo can read what Specorator is, but cannot easily follow a guided first-run, and a returning user cannot easily look up "how do I do X" without re-reading long explanatory files.

## Goal

Add a Diátaxis-shaped user-facing documentation layer to `docs/`:

- A documentation hub at `docs/README.md` that maps every existing and new doc into one of the four Diátaxis quadrants (Tutorial, How-to, Reference, Explanation).
- One canonical, runnable tutorial.
- Five MVP how-to recipes plus a copyable recipe template, plus an index that lists planned recipes as stubs.
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
│   └── first-feature.md               # NEW — full-lifecycle walkthrough
├── how-to/
│   ├── README.md                      # NEW — recipe index + roadmap
│   ├── _template.md                   # NEW — copyable recipe shape
│   ├── fork-and-personalize.md        # NEW
│   ├── resume-paused-feature.md       # NEW
│   ├── add-adr.md                     # NEW
│   ├── write-ears-requirement.md      # NEW
│   └── run-verify-gate.md             # NEW
└── [existing files — unchanged, categorized via hub]
```

**Total new files: 9. Total file moves: 0.**

The existing `docs/playbooks/` directory remains in place and is surfaced through the hub under How-to with its own sub-heading "Operational runbooks."

The top-level `README.md` gets a new short "Documentation" section placed *after* the role-targeted "Start here" sections and *before* "Common starting points."

## Quadrant mapping

The hub groups every file into a quadrant. The list below resolves several judgment calls flagged in spec review pass 1.

**Reference** (look-it-up, normative spec content):
- `specorator.md` — full workflow definition.
- `workflow-overview.md` — cheat sheet + slash-command list (a quick-lookup table, not narrative).
- `ears-notation.md` — requirement syntax.
- `traceability.md` — ID scheme.
- `sink.md` — artifact catalog (regenerable index — flagged in the hub).
- `quality-framework.md` — gates per stage.
- `adr/` — index page only. Individual ADR rationales are Explanation; the hub links to `adr/README.md` and labels it as a directory of decisions.

**Reference + How-to (dual-purpose, called out explicitly in the hub):**
- `verify-gate.md` — policy is Reference; procedure is How-to.
- `branching.md` — policy is Reference; procedure is How-to.
- `worktrees.md` — policy is Reference; procedure is How-to.

The hub lists each of these once, under Reference, with a one-line note pointing at the procedural recipes — `how-to/run-verify-gate.md`, `how-to/resume-paused-feature.md` — so dual-purpose readers find them either way.

**Explanation** (understanding-oriented, rationale and background):
- `discovery-track.md`
- `sales-cycle.md`
- `project-track.md`
- `portfolio-track.md`
- `stock-taking-track.md`
- `adr/` — individual ADR rationales (the index lives under Reference; the hub explains the split in one line).

**How-to** (task recipes):
- The five MVP recipes (see "How-to recipes" section).
- **Operational runbooks** sub-heading: links to `docs/playbooks/` and lists its `README.md` as the entry point. Playbooks remain at `docs/playbooks/` and are not moved.

**Tutorial** (learning-oriented):
- `tutorials/first-feature.md`.

`steering/` is excluded — it is agent configuration, not reading material. The hub mentions it once at the bottom with a pointer to `steering/README.md` for users who want to customize it.

## Tutorial — `tutorials/first-feature.md`

**Goal:** newcomer drives one feature through the full Specorator lifecycle and produces a real markdown change to the repo's glossary, with all 11 stage artifacts visible in `specs/<slug>/`.

**Audience:** never used Specorator. Has Claude Code installed and the repo cloned.

**Time:** **plan 60–90 minutes; budget two sittings if needed.** (Spec review flagged 30–45 min as not feasible across 11 stages with conversational gates. The full lifecycle is the learning objective — abridging it would undermine the Specorator value proposition.)

**Subject:** a markdown-only change (e.g., add a new term to the README glossary). Chosen because it has no language-stack assumption — readers on Windows, macOS, and Linux all reach the same end state. Disposable: the reader runs in a scratch branch and `git reset --hard` afterward.

**Section flow:**

1. Setup — clone, open Claude Code, create scratch branch.
2. Stage 1–3 — Idea → Research → Requirements via `/spec:start glossary-term` and conversational gates.
3. Stage 4 — Design — accept defaults from UX/UI/architect agents.
4. Stage 5–6 — Specify → Tasks — review generated `tasks.md`.
5. Stage 7 — Implement — `/spec:implement` produces the markdown diff.
6. Stage 8 — Test — manual verification, eyeball check.
7. Stage 9 — Review — `/spec:review`.
8. Stage 10 — Release — **explicitly out of tutorial scope**: deploy needs human authorization. Tutorial shows what release would do but does not run it.
9. Stage 11 — Retro — `/spec:retro`.
10. What to do next — links into the how-to and reference quadrants.

**Constraints:**

- Reader copies prompts verbatim; no improvisation needed.
- Each stage shows: command issued, expected file produced, "if you see X you are on track" line.
- No troubleshooting deep-dives — link out to how-tos for that.
- Tutorial is self-contained: reader does not need to read any other doc to finish it.

## How-to recipes

The recipe shape lives at `docs/how-to/_template.md` (a real file, not just a code block in this design doc). Contributors copy it to start a new recipe.

**Required headings (every recipe MUST have all of these):**

- `# How to <do thing>`
- `**Goal:**` — one sentence.
- `**When to use:**` — one sentence (trigger).
- `**Prerequisites:**` — bulleted list.
- `## Steps` — numbered, runnable; each step = one command or one decision.
- `## Verify` — single check confirming success.
- `## Related` — bulleted links to Reference, Explanation, and adjacent How-to.

**Diátaxis discipline (enforced via acceptance criteria):**

- No section other than `## Steps` may exceed two sentences.
- Recipes contain no theory, rationale, or "why" content. Why-content lives in Explanation; it is linked from `## Related`.

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

The index also links to `_template.md` so contributors can find the recipe shape without reading the design doc.

## Hub — `docs/README.md`

Single-page index that groups every doc by Diátaxis quadrant. Layout:

- 📚 Tutorials — learning by doing.
- 🛠 How-to guides — task recipes (five MVP links + "more recipes" pointer to `how-to/README.md` + Operational runbooks sub-heading linking `docs/playbooks/`).
- 📖 Reference — authoritative specifications, with explicit dual-purpose call-outs for `verify-gate.md`, `branching.md`, `worktrees.md`.
- 💡 Explanation — background and rationale, including individual ADR rationales.

Bottom note explains `steering/` is for agents, not readers, and points to `steering/README.md` for customization.

## Top-level README integration

Insert one new section **after** the role-targeted "Start here — pick your role" block and **before** the "Common starting points" section:

```text
## Documentation

Full user guide is in `docs/` (docs/README.md), organized by what you need:

- Learning -> tutorials
- Doing -> how-to recipes
- Looking up -> reference
- Understanding -> explanation
```

No other changes to the top-level README. The placement keeps role-targeted onboarding as the primary entry point, with the Diátaxis hub as a secondary landing for visitors who already know what they need.

## Maintenance and ownership

- **Hub ownership:** the hub at `docs/README.md` is the index of record. Any PR that adds, renames, or removes a file under `docs/` MUST update the hub in the same PR. This rule is added to `CONTRIBUTING.md` (a small edit, in scope for this work).
- **Tutorial ownership:** the tutorial is re-validated whenever any `/spec:*` command is added, removed, or renamed. The trigger is mechanical — adding it to the existing `docs-review-bot` operational agent's prompt is in scope for this work.
- **Recipe contributions:** contributors copy `docs/how-to/_template.md` to `docs/how-to/<slug>.md`, fill it in, and submit a PR. The template is the contribution path; no separate process needed.
- **Stub-recipe cadence:** stubs in the planned list are promoted to GitHub issues if not filled within 90 days. Tracked manually for now; a scheduled agent can be added later if the stub list grows.

## Trade-offs and rationale

- **Hybrid over strict restructure** because moving 15+ existing files would break every external link and every internal cross-reference, with little payoff over re-categorizing in place.
- **One tutorial, not many**, because Diátaxis treats tutorial quality as the foundation. Five mediocre tutorials do worse than one rock-solid one. Per-role and per-track tutorials can follow once the canonical one is proven.
- **All 11 stages in the tutorial, with extended time budget** because the lifecycle discipline IS the value proposition. An abridged tutorial (e.g., Stages 1–3 + 7 + 11) leaves the reader unable to map what they did to the real flow. Better to take 90 minutes once than to teach an incomplete model.
- **Markdown-change tutorial subject** to avoid stack assumptions. A code-feature tutorial would force a choice of language; the markdown subject works for everyone.
- **Stub-driven how-to roadmap** to set scope expectations and invite contributions, without committing to ship all recipes day one.
- **No file moves** to keep the diff small, preserve every link, and let adoption be incremental.

## Risks

- **Hub drift** — if new files land in `docs/` without a hub entry, the map goes stale. Mitigation: rule added to `CONTRIBUTING.md` requiring hub updates in the same PR; `docs-review-bot` flags PRs that touch `docs/` without touching `docs/README.md`.
- **Tutorial drift with workflow changes** — the tutorial assumes specific slash-command behavior. Mitigation: re-validation trigger added to `docs-review-bot`'s prompt — any PR that adds, removes, or renames a `/spec:*` command flags the tutorial for re-run.
- **How-to overlap with playbooks** — both are task-oriented. Mitigation: hub explicitly groups `playbooks/` under How-to with the "Operational runbooks" sub-heading so the difference (playbooks = SRE / operational / 2 a.m. runbooks; how-to recipes = workflow tasks for builders) is visible at the entry point.
- **Stub recipes signal abandonment** — nine planned-but-stub recipes will look like a stalled roadmap if untouched at six months. Mitigation: the 90-day promotion-to-issue cadence above; if stub list still exceeds five at the next docs review, drop the unfilled stubs entirely.
- **Maintenance fatigue** — without an owner, the docs layer rots. Mitigation: `CODEOWNERS` line for `docs/` is added in scope; release-manager re-checks the hub at every release.

## Acceptance criteria

**Hub:**

- `docs/README.md` exists.
- Every file directly under `docs/` (excluding `steering/`, including `playbooks/` as a directory link, including `adr/` split into Reference index + Explanation rationales) is listed in the hub under exactly one quadrant or in a clearly-labeled dual-purpose call-out.
- Every link in the hub resolves.

**Tutorial:**

- `docs/tutorials/first-feature.md` exists.
- It walks all 11 stages. Stage 10 (Release) is explicitly marked out of scope with rationale; every other stage shows a command issued, an expected artifact, and an "if you see X" check.
- The author re-runs the tutorial from a clean clone of `main` and reaches `/spec:retro` in **under 90 minutes**, with notes captured for any step that exceeded its budget.
- Every link in the tutorial resolves.

**How-to:**

- `docs/how-to/README.md` exists, links the five MVP recipes, links `_template.md`, and shows the planned roadmap.
- `docs/how-to/_template.md` exists with the required-headings list above.
- The five MVP recipe files exist.
- Every MVP recipe contains all required headings (Goal, When to use, Prerequisites, Steps, Verify, Related).
- No section in any MVP recipe other than `## Steps` exceeds two sentences.
- No MVP recipe contains theory or rationale; "why" content is replaced with a link to Explanation.
- Each MVP recipe is reachable from `docs/README.md` in one click and from `docs/how-to/README.md` in one click.
- Every link in every recipe resolves.

**Top-level README:**

- A new "Documentation" section exists, placed after "Start here — pick your role" and before "Common starting points."
- The existing role-targeted "Start here" sections are unchanged.

**Maintenance:**

- `CONTRIBUTING.md` includes a rule requiring hub updates in any PR that adds, renames, or removes a file under `docs/`.
- `CODEOWNERS` (or equivalent) names an owner for `docs/`.
- `agents/operational/docs-review-bot/PROMPT.md` includes the tutorial-drift trigger.

**Invariants:**

- No existing file under `docs/` is moved, renamed, or deleted by this change.
- Every link in every new file under `docs/` resolves.

## Out of scope (this design)

- Site generator, search index, theme.
- Per-role tutorials, per-track tutorials.
- Recipes beyond the MVP five (stubs only).
- Translation.
- Edits to existing reference / explanation files beyond optional cross-links.
- Restructuring of `templates/`, `examples/`, or `agents/operational/` (the docs-review-bot prompt edit is the only operational change in scope).
