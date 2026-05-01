# Product Box — Design

**Status:** Draft for review.
**Date:** 2026-05-01.
**Author:** Brainstorming session, Specorator template repo.
**Related ADR:** `docs/adr/0017-add-product-box-feature.md` (to be filed alongside implementation).
**Pairs with:** [`product-page` skill](../../../.claude/skills/product-page/SKILL.md), [`product-page-designer` agent](../../../.claude/agents/product-page-designer.md).

---

## 1. Purpose

Specorator already maintains a public **product page** (`sites/index.html`) that explains a shipped or shipping product. Earlier in a project's life — between "raw idea" and "shippable thing" — there is no grounded product to describe, but stakeholders, contributors, and the team itself benefit from seeing **what the envisioned product looks like**.

The **product box** fills that gap. It is the early-stage visual companion to the product page: a literal "back-of-the-box" visualization of the envisioned product, generated as soon as the team has an idea or a chosen brief. It is intentionally aspirational; the product page remains grounded.

Both artifacts coexist: the box stands alone at `/box/`, and the product page (when present) embeds a compact card that links to it.

## 2. Goals

- Produce a public, deployable visualization of the envisioned product as soon as a brief, steering doc, or even just a conversation exists.
- Evolve the visualization through the Specorator lifecycle stages without manual rewrites.
- Let an adopter understand the product at a glance without reading the full README.
- Cooperate with `product-page` cleanly: one source of truth for envisioned content, embedded in the grounded product page through a stable contract.

## 3. Non-goals

- Replacing or competing with `product-page`. The box is concept-tier; the page is shipped-tier.
- Pixel-perfect 3D photorealistic packaging renders. CSS-only is sufficient.
- Multi-product or multi-feature boxes in one repo. Project-level only.
- Cross-browser matrix beyond modern evergreen.
- Visual regression testing.

## 4. Architecture

### 4.1 Component map

```
.claude/skills/product-box/SKILL.md         orchestrator: source resolution, prompts user, writes box.yml
.claude/agents/product-box-designer.md      renderer: reads box.yml, emits HTML/CSS/SVG, fills product-page slot
.claude/commands/product/box.md             slash /product:box -> invokes the skill
sites/box/box.yml                           canonical content cache (human-editable)
sites/box/index.html                        standalone product-box page (3D hero box)
sites/box/styles.css                        box-specific styles (lifts specorator-design tokens)
sites/box/og-card.svg                       static SVG mirror of the box front face for og:image
sites/index.html                            product page; gets <!-- product-box-embed --> slot + card link
docs/product-box.md                         methodology doc
docs/adr/0017-add-product-box-feature.md    decision record
```

### 4.2 Skill-orchestrates / agent-renders split

The skill owns content: it decides where data comes from, talks to the user when sources are missing, and writes `box.yml`. The agent owns rendering: given `box.yml`, it produces HTML, CSS, and SVG, and injects the embeddable card into `sites/index.html`. This separation makes the rendering step deterministic (a pure function of `box.yml`) and lets users edit `box.yml` directly without re-invoking the agent.

### 4.3 Trigger paths

1. **Slash command** — user runs `/product:box`. Invokes the skill.
2. **Natural-language skill trigger** — phrases like "draft the box", "visualize this idea", "show the envisioned product".
3. **Auto-hook from `orchestrate`** — fires after `/spec:idea`, `/discovery:handoff`, `/spec:requirements`. Fire-and-forget; failure logs warning, never blocks the originating stage.

### 4.4 End-to-end flow

```
trigger
  -> skill: resolve sources (chosen-brief.md > steering/product.md > README.md > conversation)
  -> skill: if no sources, prompt user inline for 4 fields
  -> skill: write/refresh sites/box/box.yml (preserves manual edits, refreshes metadata)
  -> skill: dispatch product-box-designer agent
  -> agent: invoke specorator-design skill (brand tokens)
  -> agent: render sites/box/index.html, sites/box/styles.css, sites/box/og-card.svg
  -> agent: inject card HTML into sites/index.html between markers (idempotent)
  -> verify gate: schema, marker integrity, token usage, asset references
  -> commit, deploy via existing pages.yml
```

### 4.5 Brand dependency

The agent invokes the `specorator-design` skill before any HTML or CSS write. All colors, typography, radii, and shadows come from `colors_and_type.css` tokens (`var(--ink)`, `var(--paper)`, `var(--accent)`, `var(--highlighter)`, …). No invented tokens. If a needed token is missing, propose adding it to `colors_and_type.css` in a separate PR before using it. The non-negotiable brand rules (no emoji, no icons in product surfaces, cream paper not white, sentence-case headlines, lane coding) apply.

## 5. Data: `box.yml`

```yaml
# sites/box/box.yml
name: Specorator
tagline: Specs first, code second.
features:
  - Humans decide what; specialist agents handle how.
  - Every decision traceable across 11 stages.
  - Open-source template, MIT licensed.
target_user: Engineering teams shipping AI-assisted features.

# auto-managed metadata (skill writes; user may edit but skill is source of truth on next run)
status: envisioned   # concept | envisioned | spec'd | shipping
stage: 3             # specorator stage 1-11, or 0 for pre-discovery
sources:             # what skill read to fill content fields
  - docs/steering/product.md
  - README.md
generated_at: 2026-05-01
_skill_hash: <sha256 of name+tagline+features+target_user>
```

### 5.1 Field rules

- **`name`** — string, required.
- **`tagline`** — string, required, ≤ 80 characters (sentence-case, ends with period per brand rule).
- **`features`** — list of 1 to 3 strings, required. Hard cap at 3 enforced by validator.
- **`target_user`** — string, required.
- **`status`** — derived: `release-notes.md` present → `shipping`; `requirements.md` present → `spec'd`; `chosen-brief.md` present → `envisioned`; only `idea.md` or nothing → `concept`.
- **`stage`** — derived from latest `specs/*/workflow-state.md` if any feature is active, else `0`.
- **`sources`** — list of file paths, recorded for footer provenance.
- **`generated_at`** — ISO date, rewritten on every regen.
- **`_skill_hash`** — sha256 over the YAML-canonical serialization of `{name, tagline, features, target_user}` with sorted top-level keys, list elements preserved in order, UTF-8 encoded, no trailing newline. Used to detect manual edits.

### 5.2 Manual-edit preservation

On regen, the skill computes the hash of the four content fields and compares to `_skill_hash`. Mismatch means a human edited the file. Behavior: keep content fields verbatim, refresh `status` / `stage` / `sources` / `generated_at` / `_skill_hash`. Commit body notes `preserved manual edits to box.yml`.

### 5.3 Validation

Schema check at skill exit:
- All required fields present.
- `features` length 1-3.
- `tagline` ≤ 80 characters.
- Tokens / brand: no `<img>` references, no emoji in fields.

Failure → skill prompts user for the failing field, retries.

## 6. Rendering

### 6.1 Standalone page (`sites/box/index.html`)

- **Hero:** CSS-only 3D box, `transform: perspective(...) rotateX rotateY`. Three visible faces.
  - **Front face:** product `name` (large), `tagline` (medium), `status` pill top-right.
  - **Top face:** `target_user`, stage marker (`Stage 3 of 11`).
  - **Side face:** 3 feature bullets.
- **Footer:** `Generated 2026-05-01 from docs/steering/product.md, README.md. Stage 3 of 11.` When `stage` is `0`, footer reads `Pre-discovery.` instead.
- **Header:** minimal nav. Link back to `/` (product page) when `sites/index.html` exists. Link to repo.
- **Meta tags:** `og:image` points to `sites/box/og-card.svg`; `og:title` = name; `og:description` = tagline.
- **Accessibility:**
  - 3D box wrapper has `aria-label="Product visualization of <name>"`.
  - Face content is real DOM (not `background-image`); screen readers and crawlers see content.
  - `@media (prefers-reduced-motion: reduce)` disables `transform`, falls back to flat layout.
  - All face text meets WCAG AA contrast against face background.
  - Card link in product page is keyboard-focusable with visible focus ring.

### 6.2 Embeddable card (in product page)

Plain rectangular card, ~320 px wide, no 3D, brand frame. Shows `name`, `tagline`, `status` pill, link `View product box →` to `/box/`.

```html
<!-- product-box-embed:start -->
<a class="product-box-card" href="box/" aria-label="View product box for Specorator">
  <span class="status-pill status-envisioned">Envisioned</span>
  <h3>Specorator</h3>
  <p>Specs first, code second.</p>
  <span class="card-cta">View product box →</span>
</a>
<!-- product-box-embed:end -->
```

### 6.3 og-card SVG

Static SVG mirror of the front face: name, tagline, status pill. No 3D. Sized 1200 × 630 for social previews. Generated by the agent in the same pass; no headless browser required.

### 6.4 Slot injection rules

- Agent searches `sites/index.html` for paired markers `<!-- product-box-embed:start -->` and `<!-- product-box-embed:end -->`.
- Both present → replace everything between them. Idempotent.
- Both absent → append the start marker, card, and end marker after the `<main>` opening tag (or after the `<header>` if no `<main>`). Report the change explicitly in the PR summary.
- Start present without end (or vice versa) → refuse to write, surface error to user. Do not silently corrupt.
- The card itself links to `box/`; styles live in `sites/box/styles.css`, which `sites/index.html` `<link>`s.

### 6.5 Stylesheet ownership

Card styles ride with the product page → live in the root `sites/styles.css`. Standalone-box-page styles ride with `/box/` → live in `sites/box/styles.css`. The renderer never adds card styles to the box stylesheet or vice versa.

### 6.6 No invented tokens

Renderer outputs only colors / type / radii / shadows present in `colors_and_type.css`. CI enforces by parsing `var(--…)` keys against the canonical token list.

## 7. Error handling and edge cases

| Case | Behavior |
|---|---|
| All sources missing, no conversation context | Skill prompts user inline for 4 fields. User can abort cleanly; no `box.yml` written. |
| Multiple sources present | Highest-priority source wins. Lower ones recorded as `additional_sources` and shown in the footer. |
| Source file unreadable / malformed | Skill warns, falls through to next priority, records skip reason in commit body. |
| User edited `box.yml` | Content fields preserved verbatim; metadata refreshed. Commit body notes preservation. |
| Product-page slot markers missing | Agent appends slot after `<main>` opening tag; PR summary states the addition. |
| Product-page slot malformed (one marker missing) | Agent refuses to write; surfaces error to user. |
| Product page absent entirely | Box page deploys solo; commit body notes `product-page not present — box standalone`. Slot added on next regen once page exists. |
| Status downgrade (e.g. `requirements.md` deleted) | Status derives from current state; downgrade reflected; commit body explains. |
| Working tree dirty in `sites/` during auto-hook | Agent refuses; asks user to commit or stash first. |
| Auto-hook failure | Logs warning; never blocks the originating stage. User can re-run `/product:box` manually. |

## 8. Verify-gate additions

The existing verify gate adds:

- **`box.yml` schema lint** — yaml parse, required fields, `features` length 1-3, `tagline` ≤ 80, no emoji.
- **Slot-marker integrity** — `sites/index.html` has paired `product-box-embed:start`/`:end` markers (or neither).
- **Token usage** — `var(--…)` keys in `sites/box/styles.css` and any added card styles intersect the canonical token list. No invented tokens.
- **Asset reference resolution** — `og:image` and stylesheet paths in `sites/box/index.html` exist on disk.

Runs on PRs that touch `sites/box/**`, `sites/index.html`, or `sites/styles.css`.

## 9. Testing

### 9.1 Unit-ish (renderer is pure)

- Fixtures at `tests/product-box/fixtures/*.yml`, expected snapshots at `tests/product-box/snapshots/*.html`. `tests/product-box/` is a new test root; planning must confirm the repo's test runner / verify gate discovers it (add path to runner config if needed).
- Cases: minimal yaml, each `status` value, each representative `stage` (1, 3, 5, 10), reduced-motion fallback markup, accessibility labels present.

### 9.2 Integration (skill behavior)

- Source priority — stub each combination of source presence; assert correct citation in `box.yml`.
- Fresh-repo path — empty repo, simulated user answers → valid `box.yml`.
- Manual-edit preservation — write `box.yml`, mutate `name`, re-run skill; assert `name` preserved, metadata refreshed.
- Status derivation — scaffold each combination of artifact presence; assert correct `status`.
- Slot injection — product-page with markers (idempotent replace), without markers (append), malformed (refusal).

### 9.3 Manual one-shot

- Open `sites/box/index.html` in a browser. Eyeball the 3D box. Check responsiveness at 320 / 768 / 1280 px. Tab to the card link, confirm focus ring. Toggle `prefers-reduced-motion` in devtools, confirm flat fallback.
- Confirm `sites/box/og-card.svg` renders standalone in a browser.

### 9.4 Out of scope

- Visual regression / pixel-diff.
- Cross-browser matrix beyond modern evergreen.

## 10. File deltas

### 10.1 New

```
.claude/skills/product-box/SKILL.md
.claude/skills/product-box/README.md
.claude/agents/product-box-designer.md
.claude/commands/product/box.md
sites/box/box.yml                 (sample; regenerated on first run)
sites/box/index.html
sites/box/styles.css
sites/box/og-card.svg
docs/product-box.md
docs/adr/0017-add-product-box-feature.md
tests/product-box/fixtures/*.yml
tests/product-box/snapshots/*.html
tests/product-box/README.md
```

### 10.2 Modified

```
sites/index.html                       + marker comments, + link to box card styles
sites/styles.css                       + .product-box-card, status-pill variants if absent
.claude/agents/product-page-designer.md  + slot-ownership note in scope section
.claude/skills/orchestrate/SKILL.md    + auto-hook calls after /spec:idea (stage 1), /discovery:handoff, /spec:requirements (stage 3) — same three triggers as §4.3
.claude/skills/product-page/SKILL.md   + note on slot existence (do not strip on regen)
README.md                              + one-line entry under skills / tracks
.claude/memory/MEMORY.md               + one-line index entry
CLAUDE.md                              + table row if surfaced as track-style entry
docs/sink.md                           + sites/box/ + box.yml destinations
.claude/settings.json                  + permissions for /product:box if needed
```

## 11. ADR

ADR-0017 records:

- Rationale — early-stage envisioned-product visualization fills the gap before product page is grounded.
- New agent role + new slash namespace `product:box` (load-bearing per AGENTS.md).
- Marker-slot contract between `product-box-designer` and `product-page-designer`.
- Skill-orchestrates / agent-renders split.
- Source priority chain.
- Status-derivation rules.
- Auto-hook policy: fire-and-forget, non-blocking on origin stage.
- Project-level scope; explicitly defers feature-level boxes.

## 12. Open questions

None outstanding from brainstorming. Implementation plan can begin.
