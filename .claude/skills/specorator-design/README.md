---
title: "Specorator Design System"
folder: ".claude/skills/specorator-design"
description: "Canonical brand source for Specorator — tokens, voice, iconography rules, UI kit components, and reference deck system."
entry_point: true
---
# Specorator Design System

> An editorial, document-first visual language for **Specorator** — an open-source, spec-driven workflow template for agentic software development. The "product" is a repository of conventions, agents, skills, and slash commands; the public surface is a single product page (`sites/index.html`) that this design system distills into reusable primitives.

**Tagline:** _Stop letting AI write the wrong code._
**Positioning:** Specs first, code second. Humans decide _what_; specialist agents handle _how_; every decision stays traceable.

## Sources

| Source                                | What's there                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Luis85/agentic-workflow` (default `main`) | The whole template repo. Public page lives at `sites/`; brand assets at `sites/assets/`. |
| `Luis85/specorator`                   | Empty placeholder repo (LICENSE only).                                                       |
| Live site                             | <https://luis85.github.io/agentic-workflow/>                                                |
| Source product page                   | `sites/index.html`, `sites/styles.css` in this project                                      |

No Figma file; no design tokens file in the repo. The CSS in `sites/styles.css` is the canonical source of truth — every variable in `colors_and_type.css` derives from it.

---

## Index

| File                              | Purpose                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `README.md` *(this file)*         | Brand context, content fundamentals, visual foundations, iconography.            |
| `colors_and_type.css`             | All foundational tokens — color, type, spacing, radius, shadow, motion.          |
| `assets/`                         | `specorator-mark.svg` (logo glyph), `specorator-workflow.svg` (workflow diagram). |
| `preview/`                        | Design-system specimen cards (registered to the Design System tab).              |
| `ui_kits/product-page/`           | High-fidelity React UI kit — sections, cards, terminal, workflow rail.           |
| `slides/`                         | Sample 16:9 slides reusing the visual system.                                    |
| `SKILL.md`                        | Cross-compatible skill descriptor for use in Claude Code.                        |

---

## Content fundamentals

**Voice.** Direct, opinionated, lower-case-friendly headlines that turn into proper sentences. Specorator talks like a thoughtful senior IC, not a marketing department. Confident statements, occasional em-dash asides, and no hedging.

> _"Stop letting AI write the wrong code."_
> _"Specs first, code second."_
> _"You decide what to build; specialist agents handle how."_

**Person.** Second person ("you"), often imperative ("Clone or fork", "Read the workflow", "Get started"). Never "we" except in incidental copy. The product is "Specorator" or "the workflow" — capitalized when standalone, lowercase when used in the slug `agentic-workflow`.

**Casing.** Sentence case for headlines and titles ("A specialist for every stage."). Title-cased nouns only for established concepts: Discovery Track, Lifecycle Track, Quality Gate, Architecture Decision Record (ADR), EARS. Section headers end with a period — declarative statements, not labels.

**Tone words to favor.** _spec, traceable, owned, gated, opinionated, predictable, durable, hand-off, scope, intent._
**Words to avoid.** _seamless, magical, revolutionary, AI-powered, leverage, supercharge_.

**Emoji.** Never. There is no emoji anywhere in the product page or docs. Use text labels, lane chips (`Define`, `Build`, `Ship`), or monospace tokens (`/spec:start`) instead.

**Numerals & abbreviations.** Numerals for stage counts, agent counts, version numbers (`11 stages`, `30 agents`, `v0.2`). Spelled-out in body prose only when stylistic ("eight role families"). IDs are always uppercase-monospace: `REQ-CLI-001`, `T-AUTH-014`, `ADR-0009`.

**Examples (verbatim).**

- Eyebrows: `OPEN-SOURCE TEMPLATE` · `MIT · the agentic-workflow repo`
- CTAs: `Get started`, `Read the workflow`, `Browse every cli-todo artifact →`
- Card headlines: `11-stage lifecycle`, `Discovery track`, `Quality gates`, `Worktree discipline`
- Audience prompts: `"let's start a feature: user auth"`, `"continue the user-auth feature"`, `/adr:new "Switch to Postgres"`
- Slash commands: `/spec:start`, `/discovery:start`, `/quality:plan`

**Dashes & punctuation.** Em-dashes (`—`) glue thoughts; en-dashes never appear. Mid-dot (`·`) separates meta items in eyebrows. Right-arrow (`→`) ends "more" links; never the unicode `>`.

---

## Visual foundations

### The mood
Editorial-paper-meets-developer-doc. A near-black ink on warm cream, a single accent forest green, a single signature chartreuse highlighter, plus four soft pastel surfaces (green, blue, yellow, orange) used to color-code panels by purpose. Layouts are document-like — wide gutters, thin hairline borders, clear rows — never card-graveyard SaaS.

### Color
- **Foreground / paper.** `--ink` (#17201B) and `--paper` (#fbfcf8) form the base. The cream paper is non-negotiable; do not substitute pure white at the page level.
- **Surface.** White (`--surface`) for crisp cards on cream; alt-band sections use `--surface-2` (#f5f7f1) or `--surface-3` (#eef1ea).
- **Accent.** `--accent` (#1b6f55) and `--accent-strong` (#12543f) for links, eyebrows, status pills, ID tokens. Never use a different green.
- **Highlighter.** `--highlighter` (#e6ff70) is the load-bearing brand color. Reserved for: the `S` brand-mark glyph, the primary CTA button (`.button.highlight`), step numbers in dark sections, and inline code chips on dark backgrounds. **Never** use for body text or fills > 200×200px — it's a pop, not a wash.
- **Soft surfaces by purpose.** Yellow = problem / gate. Green = solution / discovery / status-good. Blue = lifecycle / traceability. Orange = poor-fit. Purple = PR discipline (only in the workflow SVG). The mapping is intentional; reuse the right one.
- **Lane coding.** Define = green (#159166), Build = blue (#365fa3), Ship = gold (#d49a14). Each lane has a soft pill variant.

### Typography
- **Sans.** Inter, weights 400/500/650/700/760/800/850. The rare 760 and 850 weights matter — they're how the brand looks heavier than typical Inter use.
- **Mono.** JetBrains Mono (substitute for the original `ui-monospace` stack — _flagged_, see Substitutions below). Used for: code chips, slash commands, file paths, IDs, stage owners, "you'd say" labels.
- **Scale.** Display 84px → H2 58px → H2-panel 42px → H3-large 38px → H3 22px → Lead 24px → Body 16px → Caption 14px → Eyebrow 13px → Micro 11px. Headlines use clamp() to scale fluidly.
- **Tracking.** Display tightens (-0.015em). H3s tighten slightly (-0.01em). Eyebrows track wide (+0.11em). Lane chips track even wider (+0.12em).
- **Leading.** Display 0.98 (very tight). Body 1.5. Code 1.6.

### Spacing
- **Section gutter.** `clamp(56px, 8vw, 104px)` vertical padding inside `.section`.
- **Page gutter.** `clamp(20px, 5vw, 72px)` horizontal.
- **Card gap.** 14–18px in dense grids; 24px in 2-up splits.
- **Rule of 8.** All component padding lands on multiples of 2 (10/12/14/18/22/24/28/36).

### Radius
- 6px (code chips) → 8px (buttons, stages, panels, terminal pre) → 12px (audience/team/faq cards) → 14px (some cards) → 28px (hero-visual). The 8px panel is the dominant rhythm; resist extra-rounded blobs.

### Borders
- **Hairline.** 1px `--line` (#d8ded3) on light surfaces; rgba(216,222,211,.22) on dark.
- **Dashed.** 1px dashed for the "artifact-meta" annotation block — used sparingly to mark optional/derivative content.
- **Hover border.** Cards transition `border-color` → `--ink` on hover (200ms ease).

### Shadow & elevation
- **Card hover.** `0 12px 30px rgba(23,32,27,0.08)` + `translateY(-2px)`.
- **Hero artwork.** `0 24px 70px rgba(23,32,27,0.13)`.
- **Terminal.** `0 12px 28px rgba(0,0,0,0.35)` — heavier, dramatic.
- Inner shadows: not used. The system trusts hairlines + soft fills.

### Backgrounds
- Flat color-blocked sections; alternating `--paper`, `--surface-2`, `--surface-3`, `--ink` (dark sections). No gradients. No images. No textures. The hero artwork is one flat SVG diagram — that's the only "imagery" in the brand.
- The sticky site-header uses `rgba(251, 252, 248, 0.9)` + `backdrop-filter: blur(16px)` — the sole use of blur in the system.

### Motion
- **Duration.** 200ms.
- **Easing.** Default `ease`; cards `ease`; smooth-scroll for anchor nav.
- **Hover.** Cards lift 2px and tighten their border. Buttons darken (#0e1512). Links shift to ink color.
- **Press.** No press state defined; rely on `:active` UA defaults. Buttons retain the same color.
- **Reduced motion.** Honored — `scroll-behavior: auto` under the media query.
- **No bouncing, no scaling beyond 2px lift, no parallax, no scroll-triggered animation.**

### Component patterns
- **Buttons.** Solid `--ink` rect with 1px ink border; `.highlight` swaps to chartreuse fill; `.secondary` is transparent with ink text. Min-height 44px, 18px horizontal padding, weight 760, 8px radius.
- **Cards.** White surface, 1px `--line` border, 12–14px radius, 22–28px padding, hover lift. The `.team-card` adds a 3px top border in lane color (`#159166`/`#365fa3`/`#d49a14`).
- **Stages.** 8px radius pill-rectangles with two stacked labels (name + monospace owner). Color by track: yellow (gate), green (discovery), blue (lifecycle).
- **Terminal.** Macos-style chrome (3 traffic-light dots), `#0e1512` body, 14px mono text.
- **Pills (status, lane chips).** 999px radius, 10–12px padding, 11px micro type, uppercase, wide tracking.
- **Audience cards.** `data-num` attribute renders a giant `850`-weight numeral as a watermark in the top-right, 6% black opacity. Beautiful detail; use it.

### Layout rules
- **Sticky header** with backdrop blur. Skip-link reveals on focus.
- **Two-column hero** (0.82fr / 1fr) collapses to single column at 980px.
- **4-up grids** (`feature-grid`, `audience-grid`, `team-grid`, `track-grid`) collapse to 2-up at 980px, 1-up at 720px.
- Section headers use a flex row: H2 left, kicker right (max 410px), end-aligned. Collapse to stacked at 980px.
- Max line measure: ~17ch for h1, 760px for h2, 680px for body p, 720px for hero-proof grid.

### Transparency & blur
- Single use of blur: header backdrop.
- Subtle alphas: card hover shadow rgba(.08), big numeral watermark rgba(.06), card-on-dark `rgba(255,255,255,0.06)` fill, ink-tint code-chip `rgba(23,32,27,0.06)`.

### Imagery vibe
- The only "image" is `specorator-workflow.svg` — a flat editorial diagram. If new imagery is ever added, it should match: warm-paper background, hairline strokes, soft-pastel callout boxes, monospace-style annotations, no photography, no 3D, no gradients.

---

## Iconography

Specorator's product page uses **zero icons**. There are no SVG icons, no icon font, no Lucide / Heroicons / Phosphor / Feather — none. The brand voice _is_ the iconography: monospace code chips (`/spec:start`), arrows in copy (`→`), the `S` brand mark, status pills with a colored dot, and traffic-light circles in the terminal chrome.

**This is intentional and load-bearing.** Resist the urge to add icons.

When you must indicate something:

| Need              | Use                                                            |
| ----------------- | -------------------------------------------------------------- |
| "More" / next     | Trailing `→` (right arrow, U+2192) in link text                |
| Bullet separator  | `·` (middle dot, U+00B7) between meta items                    |
| Status            | A `.status-pill` with a 6×6 colored dot and uppercase label    |
| Command / file    | Monospace code chip (`.code-chip` or `.code-chip-dark`)        |
| Brand stamp       | `assets/specorator-mark.svg` — the chartreuse-on-ink "S" glyph |
| Workflow diagram  | `assets/specorator-workflow.svg` — the editorial map           |
| Process step      | A numbered `.step-number` circle (chartreuse fill, ink text)   |

**Substitution flag.** If a future surface genuinely needs a small icon set (settings, file tree, etc.), the closest CDN match is **Lucide** (1.5–2px stroke, geometric, no fills) — but flag it to the user before adding. Do **not** add emoji as a substitute.

---

## Substitutions to flag

- **Mono font.** The product page uses the system stack (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas`). This system loads **JetBrains Mono** from Google Fonts as a stable substitute. If the brand wants a specific licensed mono, swap it in `colors_and_type.css` and replace the `@import`.
- **Sans.** Inter is loaded from Google Fonts (used by the live site too). No substitution needed.
- **Workflow SVG.** Single asset, kept verbatim.
