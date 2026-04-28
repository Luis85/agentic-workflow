---
description: Create or maintain the public product page in sites/index.html, usually hosted by GitHub Pages.
argument-hint: [product or project name]
allowed-tools: [Read, Edit, Write, Bash, Grep]
model: sonnet
---

# /product:page

Create or refresh the project's public product page.

## Inputs

- `$1` — optional product or project name. If omitted, derive it from README and product steering.

## Procedure

1. Read `.claude/skills/product-page/SKILL.md`.
2. Dispatch the `product-page-designer` agent with:
   - the product/project name from `$1` when provided,
   - the current README and steering docs as source-of-truth inputs,
   - the instruction to create or update `sites/index.html`,
   - the default preference for GitHub Pages through Actions when available.
3. Require the agent to report:
   - files changed,
   - hosting path selected,
   - verification run,
   - any product-positioning clarifications still needed.

## Don't

- Don't deploy, merge, publish externally, or change repository Pages settings without explicit human authorization.
- Don't create a build-only site that lacks a directly accessible `sites/index.html`.
