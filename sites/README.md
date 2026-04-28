---
title: "Product page source"
folder: "sites"
description: "Entry point for the static public product page source."
entry_point: true
---
# Product page source

`sites/index.html` is the canonical public product page entrypoint. It must stay directly openable from the filesystem and deployable as static files.

## Rules

- Keep the main page at `sites/index.html`.
- Put local media under `sites/assets/`.
- Keep CSS in `sites/styles.css` unless the project adopts a documented static-site stack.
- Prefer GitHub Pages via `.github/workflows/pages.yml`, deploying the whole `sites/` directory.
- Update this page in the same PR as product positioning, public onboarding, or user-visible capability changes. If a change does not affect the page, say so in the PR checklist.
