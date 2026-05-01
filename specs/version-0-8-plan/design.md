---
id: DESIGN-V08-001
title: Version 0.8 content-driven product page plan - Design
stage: design
feature: version-0-8-plan
status: accepted
owner: architect
inputs:
  - PRD-V08-001
created: 2026-05-01
updated: 2026-05-01
---

# Design - Version 0.8 content-driven product page plan

## Product shape

v0.8 should turn the product page from a hand-authored static HTML file into a built static site:

1. **Content model:** page-purpose Markdown files describe public sections, CTAs, feature groupings, proof points, and visual references.
2. **Artifact readers:** build-time code reads selected canonical Markdown/frontmatter from the repo for facts and source links.
3. **Static generator:** Astro is the recommended first implementation because it fits the existing Node toolchain and GitHub Pages static output.
4. **Generated site:** the build emits static HTML/CSS/assets suitable for GitHub Pages.
5. **Verification:** checks validate content schema, artifact references, links, assets, and the deploy workflow.
6. **Workflow guidance:** product-page skills and agents tell maintainers to update content and canonical artifacts in the right place.

## Recommended architecture

```
Repository Markdown sources
├── README.md
├── docs/
├── specs/version-*/workflow-state.md
├── quality/
└── sites/content/product-page/
        │
        ▼
Build-time loaders and schemas
├── parse page-purpose content
├── read selected canonical frontmatter
├── validate required sections and source links
└── expose typed data to page components
        │
        ▼
Astro static site
├── layouts
├── components
├── generated routes
└── static assets
        │
        ▼
GitHub Pages artifact
└── static HTML/CSS/JS/assets
```

## Content model

The first implementation should keep the content model small and explicit.

| File | Purpose |
|---|---|
| `sites/content/product-page/home.md` | Hero copy, primary CTA, supporting CTA, and summary positioning. |
| `sites/content/product-page/features.md` | Curated feature groups with source references. |
| `sites/content/product-page/proof.md` | Evidence, verification, quality signals, and source links. |
| `sites/content/product-page/get-started.md` | Installation, first steps, and adoption-profile links. |
| `sites/content/product-page/navigation.md` | Header/footer links and public docs links. |

Implementation may split these into one-file-per-section or a small collection, but it should avoid a single large HTML file and avoid scattering public copy across component code.

## Canonical artifact inputs

The first build should read a constrained set of canonical artifacts:

| Artifact | Public use |
|---|---|
| `README.md` | Repository name, overview links, installation/getting-started anchors. |
| `docs/specorator.md` | Workflow definition and lifecycle summary links. |
| `specs/version-*/workflow-state.md` | Active and planned version cards. |
| `docs/adr/*.md` | Architecture decision count/status or selected decision links. |
| `docs/quality-framework.md` | Quality gate and verification positioning. |

Artifact readers should extract frontmatter and stable headings, not scrape arbitrary marketing sentences from bodies. Page-purpose files decide which extracted facts are shown.

## Generator decision

Use Astro as the default unless implementation discovers a blocker.

| Criterion | Astro | Jekyll | Hugo |
|---|---|---|---|
| Existing stack fit | Strong: Node-based | Weaker: Ruby | Weaker: Go/Hugo |
| Markdown/frontmatter | Strong | Strong | Strong |
| Typed content schema | Strong | Limited | Moderate |
| GitHub Pages | Supported through Actions | Built-in Pages path | Supported through Actions |
| Component layout | Strong | Theme/template-driven | Theme/template-driven |

If an ADR is required during implementation, it should record Astro as the default generator and explain that canonical content remains plain Markdown so downstream projects can replace the generator.

## Output strategy

Two output options are acceptable:

| Option | Behavior | Recommendation |
|---|---|---|
| Build-only output | CI builds and deploys `sites/dist/`; generated files are not committed. | Preferred if `sites/index.html` can become a source redirect or the direct-open contract is updated. |
| Committed generated output | Build writes static HTML under `sites/` and commits it. | Use only if direct file opening without a build remains non-negotiable. |

The implementation must make the contract explicit because the current skill says `sites/index.html` is directly openable. A generated site can preserve this by keeping a simple checked-in fallback that points maintainers to `npm run product-page:build`, or by committing generated `sites/index.html`.

## Verification model

The first implementation should add or update checks for:

- page-purpose content schema,
- required sections and CTAs,
- source references to canonical artifacts,
- local links and asset paths,
- successful static build,
- generated output presence,
- GitHub Pages workflow path,
- product-page accessibility smoke checks where practical.

`npm run check:product-page` should evolve from checking hand-authored HTML into checking the content/build contract.

## Agent and skill updates

Update these surfaces in the same implementation PR:

- `.claude/skills/product-page/SKILL.md`
- `.claude/agents/product-page-designer.md`
- `.claude/commands/product/page.md`
- `sites/README.md`
- `docs/sink.md`
- `docs/scripts/check-product-page/README.md` after generated docs refresh, if script behavior changes.

The guidance should tell maintainers:

- edit canonical artifacts when facts change,
- edit page-purpose content when presentation changes,
- run the product-page build/check before PR,
- record whether the page was updated or unaffected in PR summaries.

## Risks and mitigations

- RISK-V08-001: Require public claims to carry source references where practical.
- RISK-V08-002: Keep the generated site minimal and document opt-in/downstream setup.
- RISK-V08-003: Decide and document the `sites/index.html` contract before migration.
- RISK-V08-004: Update `check:product-page` and wire any new build check into verify.
- RISK-V08-005: Keep page-purpose content presentation-owned and source-linked.
- RISK-V08-006: Keep canonical content plain Markdown so Jekyll/Hugo replacements remain possible.
