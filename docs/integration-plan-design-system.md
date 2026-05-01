# Integration plan — Specorator design system → `agentic-workflow` repo

> A staged, reviewable rollout of the Specorator design system into the `Luis85/agentic-workflow` repository. Each phase is independently shippable, leaves the repo in a working state, and produces an artifact you can review.
>
> Follow Specorator's own conventions: branch per phase, ADR for any structural decision, retro after the rollout completes.

**Owner:** TBD (suggest: the `product-page-designer` agent + a human reviewer)
**Estimated total effort:** ~6 hours across four PRs, spread over a week.

---

## Phase 0 — Decide, then commit

Before any file moves, ratify the direction with a single ADR so future agents understand the intent.

**Branch:** `design-system/adr-tokens-source-of-truth`

**Files:**
- `docs/adr/0016-design-system-as-skill.md`

**ADR template content:**
- **Status:** Proposed → Accepted
- **Context:** The product page (`sites/`) is the only user-visible surface today. Brand decisions live as raw values in `sites/styles.css` and are re-derived ad-hoc whenever an agent generates a mock or slide.
- **Decision:** Adopt the `specorator-design` skill as the canonical brand source. Promote `colors_and_type.css` to a token file consumed by `sites/styles.css`. The skill is a peer to `.claude/agents/`, not a sub-folder of `sites/`.
- **Consequences:** New surfaces (docs, app, decks) inherit the brand for free. The `product-page-designer` agent gains a hard dependency. One change for one color, everywhere.
- **Alternatives considered:** Vendor a CSS-only build inside `sites/` (rejected — duplicates the source); ship as an external npm package (rejected — overhead doesn't pay back at this scale).

**Acceptance:** ADR merged to `main`. No code changes in this PR.

---

## Phase 1 — Drop the skill in (lightest touch, biggest unlock)

The skill is already cross-compatible. Copy it in and wire one agent to consume it. Nothing else changes.

**Branch:** `design-system/skill-drop-in`

**File moves:**

```
.claude/
  skills/
    specorator-design/
      SKILL.md
      README.md
      colors_and_type.css
      assets/
        specorator-mark.svg
        specorator-workflow.svg
      ui_kits/product-page/      ← reference impl, lift snippets from
      preview/                   ← specimen cards
      slides/                    ← deck system
```

**Steps:**
1. `git checkout -b design-system/skill-drop-in`
2. Download this project as a zip → unzip into `.claude/skills/specorator-design/`
3. Delete `.claude/skills/specorator-design/sites/` — duplicates the live source; keep the skill lean.
4. Delete `.claude/skills/specorator-design/INTEGRATION_PLAN.md` (this file) — it lives in `docs/`, not the skill.
5. Add `.claude/skills/specorator-design/CHANGELOG.md` with `## 0.1.0 — Initial import`
6. Update `.claude/agents/product-page-designer.md` — add to its preamble:

   > Before editing `sites/`, invoke the `specorator-design` skill. Lift values from `colors_and_type.css`; never invent new colors or weights. If a token is missing, propose an addition via PR before using it.

7. Add the skill to `docs/specorator.md` under "Skills" so humans discover it too.

**Acceptance:**
- `tree -L 2 .claude/skills/specorator-design/` shows the expected layout
- `npm run verify` passes
- A spot-check ask to the `product-page-designer` agent ("regenerate the hero CTA") references tokens by name, not hex codes.

**PR description should link:** ADR-0016, the live preview of the skill's `ui_kits/product-page/index.html`, and a screenshot of any specimen card.

---

## Phase 2 — Make `sites/styles.css` consume the tokens

Flip the relationship so `colors_and_type.css` is the source of truth. Backward-compatible — visual output is byte-identical.

**Branch:** `design-system/sites-uses-tokens`

**Steps:**
1. `git checkout -b design-system/sites-uses-tokens`
2. At the top of `sites/styles.css`, add:

   ```css
   @import url("../.claude/skills/specorator-design/colors_and_type.css");
   ```

3. Walk through `sites/styles.css` and replace literals with the `var(--token)` they correspond to:
   - `#17201b` → `var(--ink)`
   - `#fbfcf8` → `var(--paper)`
   - `#1b6f55` → `var(--accent)`
   - `#e6ff70` → `var(--highlighter)`
   - …etc, one block at a time
4. Keep the original `:root { ... }` block in `sites/styles.css` for now — it's a no-op once everything references vars, and removing it is a separate cleanup.
5. Diff the rendered page against `main` (Percy, Playwright snapshot, or a manual side-by-side) to prove zero visual drift.
6. **Optional cleanup commit:** delete the now-redundant `:root` declarations from `sites/styles.css`.

**Acceptance:**
- Visual diff: 0 pixel changes against `main`.
- `grep -c "#17201b" sites/styles.css` returns `0`
- `npm run verify` passes
- Lighthouse / Pages deploy succeeds

**Risk:** Relative `@import` from `sites/styles.css` to `.claude/skills/...` works locally and in GitHub Pages because both are static. Confirm by previewing the Pages deploy from the PR branch before merging.

---

## Phase 3 — Add a brand-review gate

Specorator's value is *gates*. Give the design system one too.

**Branch:** `design-system/brand-review-gate`

**Files:**

```
.claude/agents/
  brand-reviewer.md                ← new agent
templates/
  brand-review-checklist.md        ← new
docs/
  quality-framework.md             ← edit: add brand-review row
  specorator.md                    ← edit: mention in Stage 9
```

**`brand-reviewer.md` responsibilities:**

The agent runs at Stage 9 (Review) for any feature whose diff touches:
- `sites/`
- `.claude/skills/specorator-design/`
- any new HTML / CSS / JSX file producing user-visible UI

Its mechanical checklist (drives the agent's output):

1. ✅ Imports `colors_and_type.css` rather than redefining tokens
2. ✅ Uses `var(--paper)` for page backgrounds (never `#fff`)
3. ✅ Zero emoji in copy or markup
4. ✅ Zero icon imports unless an ADR justifies the addition
5. ✅ Headlines are sentence-case and end with a period
6. ✅ Em-dashes (`—`) used for asides; no en-dashes (`–`)
7. ✅ `--highlighter` used only for: brand mark, primary CTA, step numbers, code chips on dark backgrounds
8. ✅ Lane coding intact: Define = green, Build = blue, Ship = gold
9. ✅ Sentence-case mono used for slash commands and IDs
10. ✅ No new color introduced without addition to `colors_and_type.css`

The agent **delegates to** `reviewer` (doesn't replace it) and posts findings as PR review comments with file/line citations.

**Acceptance:**
- A deliberately broken PR (e.g. `background: #fff` in a new component) gets caught
- A clean PR passes silently
- `docs/quality-framework.md` lists "Brand review" as a Stage 9 gate with link to checklist

---

## Phase 4 — Promote design to a first-class track *(deferred)*

Open `/design:start` as an opt-in track alongside Discovery, Stock-taking, etc. Worth doing **only when a second user-visible surface exists** (docs site, app dashboard, onboarding flow). Until then, the skill + brand-reviewer cover the load.

**When to revisit:** the moment you have a second surface to design.

**Sketch:**

```
Phases: Frame → Sketch → Spec → Mock → Handoff
Agents: ux-designer, ui-designer, + specorator-design skill
Command: /design:start
```

Slot it into `docs/specorator.md` "Eight more tracks" → it becomes "Nine".

---

## Workflow conformance

This rollout itself follows the Specorator method. Each phase produces:

| Phase | Stage | Artifact                                                |
| ----- | ----- | ------------------------------------------------------- |
| 0     | 5     | `0016-design-system-as-skill.md`                        |
| 1     | 6→9   | `.claude/skills/specorator-design/` + agent prompt edit |
| 2     | 6→9   | `sites/styles.css` consumes tokens                      |
| 3     | 5+6→9 | `brand-reviewer` agent + checklist                      |
| 4     | TBD   | `/design:start` track                                   |

**Mandatory retro after Phase 3 merges.** Capture: what worked, where the brand-reviewer false-positives, whether the token consolidation surfaced inconsistencies the design system itself should resolve.

---

## Quick-reference: what to copy from this project

When you run Phase 1, these are the files that move into `.claude/skills/specorator-design/`:

```
README.md                          → skill README (already complete)
SKILL.md                           → skill descriptor (already cross-compatible)
colors_and_type.css                → root tokens
assets/                            → 2 svgs
preview/                           → 22 specimen cards (optional but useful)
ui_kits/product-page/              → reference React kit (read-only example)
slides/                            → 9-slide deck system + deck-stage.js
```

These do **not** move (project-only, not part of the skill):
- `sites/`           — duplicates what's already in the repo
- `INTEGRATION_PLAN.md` (this file)  — lives in `docs/` instead
- `.claude/`         — n/a, this project has no `.claude/`

---

## What I'd do first, if I were you

If you only have an hour: **Phase 0 + Phase 1.** Ship the ADR, drop the skill into `.claude/skills/`, wire one agent to consume it. Everything else is incremental polish on top.
