---
id: IDEA-V08-001
title: Version 0.8 content-driven product page plan
stage: idea
feature: version-0-8-plan
status: accepted
owner: analyst
created: 2026-05-01
updated: 2026-05-01
---

# Idea - Version 0.8 content-driven product page plan

## Problem

The repository already treats a public product page as a living artifact, but the implementation is still a hand-maintained static HTML page under `sites/index.html`. That keeps hosting simple, but it makes product-page updates fragile as the workflow grows: claims, feature lists, personas, proof points, release notes, roadmap signals, and getting-started paths can drift from the Markdown artifacts that already describe the project.

Teams adopting the template need a better default: a product page that can be generated for GitHub Pages from repository-owned Markdown content, while still allowing dedicated marketing and page-composition files where the canonical workflow artifacts are not the right copy source.

## Target users

- Maintainers who need Specorator's public page to stay current with version plans, release evidence, and docs.
- Product-page designers who need a structured content source instead of editing one large HTML file.
- Downstream teams that want a ready-to-host GitHub Pages product page as part of the template.
- Reviewers who need deterministic checks that the page builds, links resolve, and claims map back to repo artifacts.

## Desired outcome

v0.8 should introduce a Markdown-driven static product-page generator that can build and deploy a polished GitHub Pages site from:

- curated page-purpose content files,
- selected project steering fields,
- release or version-plan summaries,
- proof/evidence artifacts,
- docs and getting-started links,
- optional manually curated highlights.

The implementation should keep the repo Markdown-native, make content ownership explicit, and preserve a directly accessible static output for GitHub Pages.

## Constraints

- The product page must remain hostable on GitHub Pages.
- Markdown artifacts remain the source of product truth; generated pages must not become the source of truth.
- Dedicated page content is allowed, but it must be clearly owned and reviewed like other artifacts.
- The generator must not require a database, CMS, server runtime, or external SaaS.
- The default path should be understandable to maintainers who are not frontend specialists.
- Existing product-page checks and upkeep expectations should be adapted, not discarded.

## Open questions

- Should v0.8 choose Astro as the default static-site generator, or compare Astro, Jekyll, and Hugo and defer the stack decision to implementation?
- Should generated HTML be committed under `sites/`, built only in GitHub Actions, or both?
- Which repo artifacts should feed the first version automatically: steering docs, version plans, release notes, docs index, quality metrics, or all of them?
- How should page-purpose copy be separated from workflow-source facts?
- How much visual customization should downstream adopters get before the generator becomes a theme system?
