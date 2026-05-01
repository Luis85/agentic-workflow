---
name: github-project-setup
description: Set up a new GitHub repository as a manageable product/project workspace by creating labels, milestones, and baseline issues for repo setup, product vision, PRDs, use cases, UX/design, architecture, traceability, optional plugin shell work, and P3.express initiation up to kickoff. Use when a user asks to prepare a new repo, create a GitHub-backed project setup, make a product setup repeatable, or scaffold project-management issues for a new project.
argument-hint: owner/repo [project name]
---

# GitHub Project Setup

Use this skill to turn a blank or early GitHub repository into a manageable product/project workspace.

It creates a repeatable backlog baseline, not implementation code. The default setup includes:

- GitHub/repo environment readiness.
- Product setup: `PRODUCT_VISION.md`, PRDs, use cases, UX/design brief, architecture input, traceability.
- P3.express initiation through kickoff.
- Optional plugin-shell preparation for plugin products.

## Preconditions

- Resolve the target repository as `owner/name`.
- Confirm `gh auth status` works.
- Confirm the user expects GitHub writes. Label/milestone/issue creation is shared state.
- If the repo already has issues, list them first and avoid duplicating obvious existing setup work.

## Procedure

1. Classify the project profile:
   - `generic-product`: default for apps, libraries, SaaS, services, and internal tools.
   - `obsidian-plugin`: use for Obsidian plugin work or similar plugin-shell setup where isolated UI, marketplace readiness, and host bridge concerns matter.
2. Decide whether P3.express initiation applies:
   - Use P3 when the project needs explicit sponsor/PM roles, kickoff, follow-up registers, risks, go/no-go gates, or stakeholder communication.
   - Use `--no-p3` only for very small internal experiments where the user explicitly does not want governance.
3. Dry-run the plan:

   ```bash
   npm run project:setup:github -- --project-name "<Project Name>" --profile <generic-product|obsidian-plugin> --dry-run
   ```

4. Review the plan with the user when the target repo is not empty or when there is any risk of duplicate public issues.
5. Execute only after the plan is suitable:

   ```bash
   npm run project:setup:github -- --repo <owner/name> --project-name "<Project Name>" --profile <generic-product|obsidian-plugin> --execute
   ```

6. Read back created issues from GitHub:

   ```bash
   gh issue list --repo <owner/name> --state open --limit 100 --json number,title,milestone,labels,url
   ```

7. Summarize the created milestone structure and the recommended first issue to work.

## What The Tool Creates

The tool creates:

- Labels for setup, product, PRD, use cases, UX, architecture, traceability, CI, release, docs, and pages.
- Milestones:
  - `v1 repo setup`
  - `v1 product setup`
  - `v1 plugin shell` for `obsidian-plugin`
  - `P3 project initiation` unless `--no-p3`
- Issues covering:
  - README/license/docs and GitHub workflow.
  - CI, release, dependency, and branch-protection readiness.
  - GitHub Pages product page.
  - `PRODUCT_VISION.md`.
  - v1 PRD.
  - use case catalog.
  - UX/design and architecture handoff briefs.
  - traceability index.
  - plugin shell architecture when applicable.
  - P3 A01-A10 initiation and focused communication when enabled.

## Guardrails

- Do not run `--execute` against the wrong repository.
- Do not create duplicate planning issues if the target repo already has equivalent issues; update existing issues or create a smaller gap-filling set instead.
- Do not claim GitHub Projects fields/views were configured by the script. The tool creates labels, milestones, and issues. GitHub Project boards/views should be configured manually or by a future extension.
- Keep the setup backlog focused on readiness and product setup. Feature implementation issues come after the product baseline.

## References

- Tool: `scripts/github-project-setup.ts`
- Project management methodology: `docs/project-track.md`
- Existing local project track skill: `.claude/skills/project-run/SKILL.md`
