---
description: Sales Cycle — Bootstrap. Scaffold a new deal folder under sales/<deal-slug>/ with deal-state.md initialised.
argument-hint: <deal-slug> [client-name]
allowed-tools: [Read, Edit, Write]
model: sonnet
---

# /sales:start

Bootstrap a new deal folder.

1. Resolve the deal slug from `$1`. If not provided, derive it from the client name (`$2`) as `<client-kebab>-<project-kebab>`, ≤ 6 words.
2. Check that `sales/<deal-slug>/` does not already exist; if it does, report the existing state and exit.
3. Create the directory `sales/<deal-slug>/`.
4. Copy `templates/deal-state-template.md` → `sales/<deal-slug>/deal-state.md`. Replace all template placeholders:
   - `<deal-slug>` → the resolved slug
   - `<Client Name>` → the client name from `$2` (or `TBD` if not provided)
   - `YYYY-MM-DD` → today's date
5. Confirm creation: report the deal slug, the full path, and the next step: `/sales:qualify <deal-slug>`.
