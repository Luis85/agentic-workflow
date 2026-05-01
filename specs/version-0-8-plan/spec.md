---
id: SPECDOC-V08-001
title: Version 0.8 content-driven product page plan - Specification
stage: specification
feature: version-0-8-plan
status: accepted
owner: architect
inputs:
  - DESIGN-V08-001
created: 2026-05-01
updated: 2026-05-01
---

# Specification - Version 0.8 content-driven product page plan

### SPEC-V08-001 - Generator decision record

- **Satisfies:** REQ-V08-001
- **Behavior:** The repository records the selected default static-site generator and the rationale comparing Astro, Jekyll, and Hugo.
- **Acceptance:** A maintainer can identify the default generator, the replacement boundaries, and whether an ADR was required.

### SPEC-V08-002 - Page-purpose content collection

- **Satisfies:** REQ-V08-002, REQ-V08-004, NFR-V08-001, NFR-V08-003
- **Behavior:** Product-page copy, section ordering, feature cards, proof summaries, and CTAs live in dedicated Markdown/frontmatter content files.
- **Acceptance:** A page-purpose content edit changes the built product page without requiring direct edits to generated HTML or component code.

### SPEC-V08-003 - Canonical artifact reader

- **Satisfies:** REQ-V08-003, REQ-V08-004, NFR-V08-002
- **Behavior:** Build-time code reads selected canonical repository artifacts for source facts, status, and links.
- **Acceptance:** The generated page can show at least version-plan or workflow evidence sourced from canonical Markdown/frontmatter, with links back to source artifacts.

### SPEC-V08-004 - Static GitHub Pages build

- **Satisfies:** REQ-V08-005, REQ-V08-006, REQ-V08-010
- **Behavior:** The product-page build emits static output and the GitHub Pages workflow deploys that output.
- **Acceptance:** The deployed artifact requires no server runtime, CMS, database, or external SaaS, and local maintainers can open a generated static `index.html` after build.

### SPEC-V08-005 - Product-page verification

- **Satisfies:** REQ-V08-007, NFR-V08-004, NFR-V08-005
- **Behavior:** Product-page checks validate content schema, required sections, source references, local links, assets, generated output, and Pages workflow configuration.
- **Acceptance:** Malformed content, missing required public sections, broken local references, or failed static builds fail local verification.

### SPEC-V08-006 - Workflow guidance update

- **Satisfies:** REQ-V08-008, REQ-V08-009
- **Behavior:** Product-page agent, skill, command, site docs, and sink ownership docs describe the content-driven build workflow.
- **Acceptance:** A downstream adopter can find where to edit page content, where to update canonical facts, how to customize branding, and how to deploy to GitHub Pages.

## Test scenarios

| ID | Requirement | Scenario | Expected result |
|---|---|---|---|
| TEST-V08-001 | REQ-V08-001 | A maintainer asks which generator v0.8 uses. | The selected default and Astro/Jekyll/Hugo comparison are documented. |
| TEST-V08-002 | REQ-V08-002 | A maintainer edits a feature card content file. | The static build updates the feature card without hand-editing generated HTML. |
| TEST-V08-003 | REQ-V08-003 | The page renders a version or proof signal. | The signal is sourced from a canonical artifact or includes a source link. |
| TEST-V08-004 | REQ-V08-004 | Page-purpose copy contradicts a source artifact. | Review guidance or validation surfaces the source-of-truth boundary. |
| TEST-V08-005 | REQ-V08-005 | GitHub Actions runs the Pages workflow. | The generated static output is uploaded as the Pages artifact. |
| TEST-V08-006 | REQ-V08-006 | A maintainer builds locally and opens the output. | A static `index.html` is available after build or the old contract is explicitly superseded. |
| TEST-V08-007 | REQ-V08-007 | Required content frontmatter is missing. | Product-page verification fails with an actionable error. |
| TEST-V08-008 | REQ-V08-008 | The product-page designer agent is invoked after v0.8. | It points to content files and build checks instead of editing one HTML file first. |
| TEST-V08-009 | REQ-V08-009 | A downstream project adopts the template. | Docs explain how to fill content, map artifact inputs, customize branding, and deploy. |
| TEST-V08-010 | REQ-V08-010 | The site is deployed. | The hosted page is static and has no runtime service dependency. |
