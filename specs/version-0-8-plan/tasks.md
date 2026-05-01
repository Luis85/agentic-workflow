---
id: TASKS-V08-001
title: Version 0.8 content-driven product page plan - Tasks
stage: tasks
feature: version-0-8-plan
status: complete
owner: planner
inputs:
  - PRD-V08-001
  - SPECDOC-V08-001
created: 2026-05-01
updated: 2026-05-01
---

# Tasks - Version 0.8 content-driven product page plan

### T-V08-001 - Decide product-page generator

- **Description:** Confirm Astro as the default static-site generator or record an alternate decision after comparing Astro, Jekyll, and Hugo; add an ADR if the decision changes repository architecture or the `sites/index.html` contract.
- **Satisfies:** REQ-V08-001, SPEC-V08-001
- **Owner:** architect
- **Estimate:** M

### T-V08-002 - Define the product-page content schema

- **Description:** Define required page-purpose content files, frontmatter fields, section IDs, CTA fields, proof/source references, and validation errors.
- **Satisfies:** REQ-V08-002, REQ-V08-004, NFR-V08-001, NFR-V08-003, SPEC-V08-002
- **Depends on:** T-V08-001
- **Owner:** pm
- **Estimate:** M

### T-V08-003 - Define canonical artifact inputs

- **Description:** Choose the initial canonical artifact readers for README/docs links, version-plan summaries, quality/proof references, and ADR or workflow status signals.
- **Satisfies:** REQ-V08-003, REQ-V08-004, NFR-V08-002, SPEC-V08-003
- **Depends on:** T-V08-002
- **Owner:** architect
- **Estimate:** M

### T-V08-004 - Scaffold the static site build

- **Description:** Add the selected generator configuration, source layout, scripts, dependencies, and local build command for the product page.
- **Satisfies:** REQ-V08-002, REQ-V08-005, REQ-V08-010, SPEC-V08-004
- **Depends on:** T-V08-001
- **Owner:** dev
- **Estimate:** L

### T-V08-005 - Migrate current product-page content

- **Description:** Move the current public page copy into page-purpose Markdown/frontmatter content files and implement components/layouts that render an equivalent or improved public page.
- **Satisfies:** REQ-V08-002, REQ-V08-004, NFR-V08-003, NFR-V08-004, SPEC-V08-002
- **Depends on:** T-V08-002, T-V08-004
- **Owner:** product-page-designer
- **Estimate:** L

### T-V08-006 - Implement artifact readers

- **Description:** Add build-time loaders that read selected canonical Markdown/frontmatter, expose stable data to page components, and preserve source links for public claims.
- **Satisfies:** REQ-V08-003, REQ-V08-004, NFR-V08-002, SPEC-V08-003
- **Depends on:** T-V08-003, T-V08-004
- **Owner:** dev
- **Estimate:** L

### T-V08-007 - Update GitHub Pages deployment

- **Description:** Update or replace the Pages workflow so it builds the product page and deploys generated static output from the selected output directory.
- **Satisfies:** REQ-V08-005, REQ-V08-006, REQ-V08-010, SPEC-V08-004
- **Depends on:** T-V08-004
- **Owner:** dev
- **Estimate:** M

### T-V08-008 - Resolve the direct static access contract

- **Description:** Decide whether generated output is committed, built locally only, or paired with a checked-in fallback/redirect; update `sites/README.md` and product-page guidance accordingly.
- **Satisfies:** REQ-V08-006, SPEC-V08-004
- **Depends on:** T-V08-004, T-V08-007
- **Owner:** architect
- **Estimate:** M

### T-V08-009 - Update product-page checks

- **Description:** Extend `check:product-page` or add companion checks for content schema, required sections, source references, local links, assets, static build, generated output, and Pages workflow path.
- **Satisfies:** REQ-V08-007, NFR-V08-004, NFR-V08-005, SPEC-V08-005
- **Depends on:** T-V08-002, T-V08-004, T-V08-006, T-V08-007
- **Owner:** qa
- **Estimate:** L

### T-V08-010 - Update product-page skill, agent, and command

- **Description:** Update `.claude/skills/product-page/SKILL.md`, `.claude/agents/product-page-designer.md`, and `.claude/commands/product/page.md` for the content-driven workflow.
- **Satisfies:** REQ-V08-008, REQ-V08-009, SPEC-V08-006
- **Depends on:** T-V08-002, T-V08-008, T-V08-009
- **Owner:** product-page-designer
- **Estimate:** M

### T-V08-011 - Update repository docs and ownership map

- **Description:** Update `sites/README.md`, `docs/sink.md`, README links if needed, and generated script docs after behavior changes.
- **Satisfies:** REQ-V08-008, REQ-V08-009, SPEC-V08-006
- **Depends on:** T-V08-008, T-V08-009, T-V08-010
- **Owner:** release-manager
- **Estimate:** M

### T-V08-012 - Document downstream customization

- **Description:** Add a downstream adoption guide for filling content, mapping source artifacts, customizing branding, replacing the generator if needed, and deploying to GitHub Pages.
- **Satisfies:** REQ-V08-001, REQ-V08-009, REQ-V08-010, SPEC-V08-006
- **Depends on:** T-V08-010, T-V08-011
- **Owner:** pm
- **Estimate:** M

### T-V08-013 - Verify v0.8 release readiness

- **Description:** Run content checks, build checks, link/product-page checks, relevant tests, and `npm run verify`; record any skipped browser/accessibility checks and remaining risks in implementation/test artifacts.
- **Satisfies:** REQ-V08-001, REQ-V08-002, REQ-V08-003, REQ-V08-004, REQ-V08-005, REQ-V08-006, REQ-V08-007, REQ-V08-008, REQ-V08-009, REQ-V08-010, SPEC-V08-001, SPEC-V08-002, SPEC-V08-003, SPEC-V08-004, SPEC-V08-005, SPEC-V08-006
- **Depends on:** T-V08-009, T-V08-011, T-V08-012
- **Owner:** qa
- **Estimate:** S
