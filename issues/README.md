---
title: "Feature Issues"
folder: "issues"
description: "Canonical local mirror of feature issue tracking; one file per issue, synced with GitHub Issues."
entry_point: true
---

# Feature Issues

Local mirror of feature issue tracking. One Markdown file per issue, with structured frontmatter that maps to GitHub Issues and tracks roadmap state across the Specorator lifecycle.

## Purpose

- Provides a single queryable source of **roadmap status** (`planned → in-progress → in-review → shipped`) for all features.
- Mirrors **GitHub Issue metadata** (number, labels, milestone, assignees, URL) locally for offline access and scripting.
- Enforces that every feature started with `/spec:start` has a named issue record from day one.

## File naming

```
issues/<number>-<slug>.md
```

- `<number>` — GitHub Issue number. Use `0` as a placeholder until the GitHub issue is created.
- `<slug>` — must match the `feature_slug` in the file's frontmatter and the corresponding `specs/<slug>/` directory name.

**Examples:**

```
issues/42-issues-folder-sync.md
issues/0-offline-feature-draft.md    # not yet pushed to GitHub
```

## Frontmatter schema

```yaml
---
issue_number: 42            # integer, or null before GitHub creation
title: "Human-readable title"
feature_slug: my-feature    # matches specs/my-feature/
type: feature               # feature | bug | chore | docs
roadmap_status: planned     # planned | in-progress | in-review | shipped | cancelled
stage: idea                 # current lifecycle stage (mirrors workflow-state.md current_stage)
github_url: null            # filled after gh issue create
labels: []
milestone: null
assignees: []
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---
```

## Roadmap status

| Status | When |
|---|---|
| `planned` | stages: idea → research → requirements → design → specification → tasks |
| `in-progress` | stage: implementation |
| `in-review` | stages: testing → review |
| `shipped` | stages: release → learning → done |
| `cancelled` | set manually at any stage |

## Workflow

**Create** — `/spec:start` creates `issues/0-<slug>.md` automatically. If `gh` is available, it runs `gh issue create` and updates the placeholder with the real number and URL.

**Update** — Agents should update `stage` and `roadmap_status` when advancing `workflow-state.md`. The `sync:issues` script reconciles GitHub-side changes.

**Sync from GitHub** — `npm run sync:issues` pulls current label, milestone, assignee, and state from GitHub and updates local files.

**Drift check** — `npm run check:issues` warns for specs without a linked issue and hard-fails on malformed frontmatter.

## Retention

Issue files are permanent. Cancelled or shipped issues remain as historical record. Archive by setting `roadmap_status: cancelled` or `roadmap_status: shipped`.

## Package release

`issues/` ships with only this `README.md` in the released Specorator template package. Per [ADR-0021](../docs/adr/0021-release-package-fresh-surface.md) and [ADR-0030](../docs/adr/0030-adopt-issues-folder-for-canonical-issue-tracking.md).
