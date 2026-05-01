---
id: PRD-V08-001
title: Version 0.8 content-driven product page plan
stage: requirements
feature: version-0-8-plan
status: accepted
owner: pm
inputs:
  - IDEA-V08-001
  - RESEARCH-V08-001
created: 2026-05-01
updated: 2026-05-01
---

# PRD - Version 0.8 content-driven product page plan

## Summary

Plan v0.8 as the content-driven product-page release: introduce a static-site generator that builds a GitHub Pages-ready product page from repository Markdown artifacts and dedicated page content, while preserving traceable product truth and deterministic verification.

## Goals

- Generate the public product page from Markdown and frontmatter rather than hand-maintained HTML.
- Use repo-owned canonical artifacts for facts, evidence, and links.
- Add dedicated page-purpose content files for public copy, section ordering, and CTAs.
- Keep the site fully static and hostable on GitHub Pages.
- Update product-page agents, skills, docs, and checks so the new workflow is maintainable.
- Preserve a low-friction path for downstream projects that want a product page without adopting a full CMS.

## Non-goals

- No runtime CMS, database, server rendering, analytics platform, or external content service.
- No multi-generator abstraction layer in v0.8.
- No mandatory migration for downstream adopters unless explicitly accepted in a later release decision.
- No automatic public claim generation from private or draft artifacts.
- No replacement for the canonical workflow artifacts in `specs/`, `docs/`, `projects/`, `quality/`, or `roadmaps/`.

## Functional requirements (EARS)

### REQ-V08-001 - Select a default static-site generator

- **Pattern:** ubiquitous
- **Statement:** The repository shall select and document a default static-site generator for product-page builds.
- **Acceptance:** The decision compares Astro, Jekyll, and Hugo, records the selected default, and explains replacement boundaries for downstream projects.
- **Priority:** must
- **Satisfies:** IDEA-V08-001, RESEARCH-V08-001

### REQ-V08-002 - Build from Markdown content

- **Pattern:** ubiquitous
- **Statement:** The product-page system shall build public pages from Markdown and frontmatter content files.
- **Acceptance:** Page content can be edited without editing generated HTML, and the build consumes the committed content files.
- **Priority:** must
- **Satisfies:** IDEA-V08-001

### REQ-V08-003 - Consume canonical project artifacts

- **Pattern:** ubiquitous
- **Statement:** The product-page system shall consume selected canonical repository artifacts for product facts, evidence, and links.
- **Acceptance:** At minimum, the build or content model can reference README/docs links, version-plan summaries, and proof or quality artifacts without duplicating their full body copy.
- **Priority:** must
- **Satisfies:** IDEA-V08-001

### REQ-V08-004 - Separate page-purpose content from product truth

- **Pattern:** unwanted behavior
- **Statement:** When dedicated product-page content files are added, they shall not become an independent source of workflow truth.
- **Acceptance:** Documentation states which files own public presentation and which artifacts own product facts; public claims link back to source artifacts where practical.
- **Priority:** must
- **Satisfies:** RESEARCH-V08-001

### REQ-V08-005 - Generate GitHub Pages-ready output

- **Pattern:** ubiquitous
- **Statement:** The product-page build shall produce static output suitable for GitHub Pages hosting.
- **Acceptance:** The repository includes a documented local build and a GitHub Pages workflow or workflow update that deploys the generated static output.
- **Priority:** must
- **Satisfies:** IDEA-V08-001

### REQ-V08-006 - Preserve direct static access

- **Pattern:** unwanted behavior
- **Statement:** When the product page moves to generated output, the repository shall preserve a directly accessible static page or documented generated output path.
- **Acceptance:** Users can still open a static `index.html` output locally after build, and the old `sites/index.html` contract is either preserved, redirected, or explicitly superseded.
- **Priority:** must
- **Satisfies:** RESEARCH-V08-001

### REQ-V08-007 - Validate content schema and build output

- **Pattern:** ubiquitous
- **Statement:** The repository shall validate product-page content schema, local links, assets, and generated output.
- **Acceptance:** `npm run verify` or a targeted check fails for malformed page content, missing required sections, unresolved local links, broken asset references, or missing Pages build output.
- **Priority:** must
- **Satisfies:** RESEARCH-V08-001

### REQ-V08-008 - Update product-page workflow guidance

- **Pattern:** event-driven
- **Statement:** When the generator is introduced, product-page skills, agents, commands, and docs shall describe the new content and build workflow.
- **Acceptance:** `product-page` guidance tells maintainers where to edit content, how to build/verify, and when to update canonical source artifacts instead of page copy.
- **Priority:** must
- **Satisfies:** IDEA-V08-001

### REQ-V08-009 - Support downstream adoption

- **Pattern:** ubiquitous
- **Statement:** The product-page generator shall be usable by downstream projects adopting the template.
- **Acceptance:** Docs explain how a downstream project fills product-page content, points it at its own artifacts, customizes branding, and deploys to GitHub Pages.
- **Priority:** should
- **Satisfies:** IDEA-V08-001

### REQ-V08-010 - Keep generated pages static and dependency-light

- **Pattern:** unwanted behavior
- **Statement:** The product-page generator shall not require a runtime server, CMS, database, or external SaaS to render the hosted page.
- **Acceptance:** The default deploy publishes static files only, and all required build dependencies are local development or CI dependencies.
- **Priority:** must
- **Satisfies:** RESEARCH-V08-001

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-V08-001 | maintainability | Product-page content ownership must be obvious. | Public-page files and canonical artifact inputs have documented owners and review expectations. |
| NFR-V08-002 | portability | Canonical product truth must remain plain Markdown/frontmatter. | No content lock-in to a database or SaaS. |
| NFR-V08-003 | usability | A maintainer can update a product-page section without touching generated HTML. | Edit a Markdown content file, run build/check, and see output. |
| NFR-V08-004 | accessibility | Generated pages must preserve the existing product-page accessibility bar. | Responsive layout, keyboard focus, semantic headings, and WCAG AA contrast expectations. |
| NFR-V08-005 | verification | Build and content failures must be caught before PR review. | Targeted checks are wired into `npm run verify` or explicitly documented if deferred. |

## Success metrics

- A maintainer can change a public feature card by editing one Markdown file and running one documented check.
- The product page build uses at least one canonical artifact source and one page-purpose content source.
- GitHub Pages deploys generated static output without manual repository settings changes.
- Product-page verification catches malformed content and missing generated output.
- The product-page skill and designer agent no longer instruct maintainers to edit one large HTML page as the primary workflow.

## Quality gate

- [x] Functional requirements use EARS and stable IDs.
- [x] Acceptance criteria are testable.
- [x] Non-goals prevent v0.8 from becoming a CMS, analytics, or multi-generator framework release.
