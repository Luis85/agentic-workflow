---
name: specorator-design
description: Use this skill to generate well-branded interfaces and assets for Specorator (the open-source agentic-workflow template), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map

- `README.md` — voice, content fundamentals, visual foundations, iconography rules.
- `colors_and_type.css` — every token: color, type, spacing, radius, shadow, motion. Drop this into any new HTML.
- `assets/` — `specorator-mark.svg` (logo), `specorator-workflow.svg` (workflow diagram).
- `ui_kits/product-page/` — pixel-faithful React recreation of the live product page. Read its components to learn idiomatic Specorator section/card/terminal patterns.
- `sites/` — pristine import of the live page; the canonical source of truth for the visual system.
- `preview/` — small specimen cards (colors, type, components) you can crib from.

## Non-negotiables

- **No emoji. No icons.** The brand uses zero iconography. Use monospace code chips, arrows in copy (`→`), middle-dots (`·`), and status pills instead.
- **Cream paper, not white.** Page backgrounds use `--paper` (#fbfcf8). White is for cards.
- **Chartreuse is a pop, not a wash.** `--highlighter` (#e6ff70) is reserved for the brand mark, the primary CTA, step-number circles, and inline code chips on dark backgrounds. Never as a body fill.
- **Sentence-case headlines that end with a period.** "A specialist for every stage."
- **Em-dashes glue thoughts; never en-dashes.**
- **Lane coding is intentional.** Define = green, Build = blue, Ship = gold. Reuse the right one.

## Default fonts

- Sans: **Inter** (weights 400–850, including the unusual 760).
- Mono: **JetBrains Mono** (substitute for the original system mono — flagged in README).

Load both from Google Fonts unless the project provides licensed files.
