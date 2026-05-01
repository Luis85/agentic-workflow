---
id: RESEARCH-V08-001
title: Version 0.8 content-driven product page plan - Research
stage: research
feature: version-0-8-plan
status: accepted
owner: analyst
inputs:
  - IDEA-V08-001
created: 2026-05-01
updated: 2026-05-01
---

# Research - Version 0.8 content-driven product page plan

## Context

Specorator already has a product-page skill, a `product-page-designer` agent, a `sites/index.html` public page, a GitHub Pages workflow expectation, and a deterministic product-page check. The gap is not whether the page exists; it is that the page is a manually edited presentation artifact instead of a built output from the Markdown content model that defines the product.

The relevant source material is already in the repo:

- `README.md` and `docs/steering/*` for positioning and audience.
- `docs/specorator.md` for workflow definition.
- `specs/version-*` for version-level requirements and release plans.
- `docs/adr/` for architectural decisions.
- `docs/quality-framework.md` and quality artifacts for trust signals.
- Dedicated product-page content can live under a new content directory when workflow artifacts are too detailed or too operational for public copy.

## Static generator options

### Astro

Astro is a strong fit for a content-driven product page because it supports static output by default, Markdown pages, content collections with typed frontmatter, and official GitHub Pages deployment guidance through the `withastro/action`. It also lets the implementation keep most of the site static while using small components for repeated sections such as features, proof points, release cards, and CTAs.

**Fit:** high.

**Tradeoff:** adds a Node-based frontend build stack and generated output path that the repo must document and verify.

### Jekyll

Jekyll has the simplest GitHub Pages story because GitHub Pages has built-in Jekyll support. It can consume Markdown and frontmatter directly and works well for conventional docs/blog style sites.

**Fit:** medium.

**Tradeoff:** Ruby dependency and theme/plugin constraints may feel less aligned with the repository's existing Node/TypeScript verification stack.

### Hugo

Hugo is fast, mature, Markdown-first, and strong for content-heavy static sites. It is a good option if build speed, multilingual content, or theme ecosystem maturity dominate.

**Fit:** medium.

**Tradeoff:** introduces a Go/Hugo toolchain that is separate from the repo's current Node-based checks.

## Recommendation

Choose Astro as the default v0.8 generator unless implementation discovers a blocking dependency or hosting constraint. Astro aligns with the existing Node toolchain, supports Markdown and content collections, can generate a fully static GitHub Pages site, and gives enough component structure to create a polished product page without turning the repo into a web app.

Keep the architecture generator-aware rather than generator-abstract. v0.8 should not design a multi-generator adapter layer for Astro, Jekyll, and Hugo. It should document why Astro was selected and leave room for downstream projects to replace the generator when their stack requires Jekyll or Hugo.

## Content model findings

The page needs two kinds of content:

| Source | Purpose | Example |
|---|---|---|
| Canonical workflow artifacts | Facts that should not be rewritten as marketing claims | active version plans, release evidence, docs links, ADR status |
| Page-purpose content | Curated copy and layout choices written for public reading | hero copy, CTA labels, feature grouping, proof-point summaries |

The build should merge both. Canonical artifacts provide facts and links; page-purpose files decide what to expose and how to say it.

## Recommended paths

| Path | Purpose |
|---|---|
| `sites/content/product-page/*.md` | Dedicated public-page copy and curated section data. |
| `sites/src/` | Astro source components, layouts, pages, and content loaders. |
| `sites/public/` | Static assets copied into the built page. |
| `sites/dist/` | Generated static output, ignored locally unless the project decides to commit it. |
| `.github/workflows/pages.yml` | Build and deploy generated output to GitHub Pages. |

The exact paths can change during implementation, but the ownership split should remain clear: Markdown content is authored; HTML is generated.

## Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|
| RISK-V08-001 | Generated public copy drifts from source artifacts. | high | Require source links or evidence references for claims surfaced from canonical artifacts. |
| RISK-V08-002 | Static-site tooling makes the template feel heavier. | medium | Keep generator opt-in for downstream projects or make the default scaffold minimal. |
| RISK-V08-003 | `sites/index.html` direct-open expectation conflicts with generated output. | medium | Decide whether to commit generated output or keep a static fallback/redirect with documented build workflow. |
| RISK-V08-004 | Product-page checks only validate old static HTML. | high | Update checks to validate content schema, build output, asset references, and Pages workflow. |
| RISK-V08-005 | Page-purpose content becomes a second product truth. | high | Document that dedicated files own public presentation, not workflow facts. |
| RISK-V08-006 | Generator-specific design locks out Jekyll/Hugo users. | low | Document replacement boundaries and keep canonical content in plain Markdown/frontmatter. |

## Sources

- Astro deploy docs, including GitHub Pages deployment: <https://docs.astro.build/en/guides/deploy/>
- Astro pages and Markdown docs: <https://docs.astro.build/en/basics/astro-pages/>
- Astro content collections docs: <https://docs.astro.build/en/guides/content-collections/>
- GitHub Pages Jekyll docs: <https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll>
- Hugo content formats docs: <https://gohugo.io/content-management/formats/>
