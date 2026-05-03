---
id: ADR-0031
title: Adopt issues/ folder as the canonical local mirror of feature issue tracking
status: accepted
date: 2026-05-03
deciders:
  - Luis Mendez
consulted: []
informed: []
supersedes: []
superseded-by: []
tags: [workflow, issues, github, tracking]
---

# ADR-0031 — Adopt issues/ folder as the canonical local mirror of feature issue tracking

## Status

Accepted

## Context

Every feature lifecycle in Specorator begins with a `specs/<slug>/workflow-state.md` that tracks internal stage progression. However, there is no canonical artifact that:

1. Records the external-facing **issue identity** (GitHub Issue number, URL) for a feature.
2. Exposes **roadmap status** (`planned`, `in-progress`, `in-review`, `shipped`, `cancelled`) independently of the internal stage machine.
3. Stays **in sync** with the remote issue tracker (GitHub Issues) so that labels, milestone, and state changes are not lost.

The absence of this record means:
- Teams must cross-reference GitHub to find which issue corresponds to which spec.
- Roadmap consumers (portfolio manager, roadmap manager) have no single queryable field for "is this shipped?".
- There is no enforced moment in the workflow where an issue is created, making issue hygiene optional and inconsistent.

## Decision

We adopt an `issues/` folder at the repository root as the canonical local mirror of feature issue tracking.

### §1 Folder layout

```
issues/
  README.md                   # entry point (frontmatter required)
  <number>-<slug>.md          # one file per issue; number = GitHub issue number
                              # use 0-<slug>.md for local-only (pre-push) issues
```

### §2 Frontmatter schema (required fields)

```yaml
---
issue_number: <integer | null>       # null until GitHub issue is created
title: "<string>"
feature_slug: <slug>                 # matches specs/<slug>/
type: feature | bug | chore | docs
roadmap_status: planned | in-progress | in-review | shipped | cancelled
stage: idea | research | requirements | design | spec | tasks | implementation | testing | review | release | learning | done
github_url: <url | null>            # null until GitHub issue is created
labels: []
milestone: <string | null>
assignees: []
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---
```

### §3 Roadmap status mapping

| `roadmap_status` | `stage` values |
|---|---|
| `planned` | idea, research, requirements, design, spec, tasks |
| `in-progress` | implementation |
| `in-review` | testing, review |
| `shipped` | release, learning, done |
| `cancelled` | any (set manually) |

### §4 Workflow integration

Issue creation is a step in `/spec:start`. After `workflow-state.md` is written:
1. `/spec:start` creates `issues/0-<slug>.md` from `templates/issue-template.md` with `roadmap_status: planned`.
2. If `gh` is available and the user confirms, it runs `gh issue create` and backfills `issue_number` and `github_url`.
3. Stage transitions update `stage` and `roadmap_status` in the issue file as a best-effort (agents may do this when updating `workflow-state.md`).

### §5 GitHub sync

`npm run sync:issues` pulls current state from GitHub Issues and updates local files:
- Updates `state` → maps to `roadmap_status`.
- Updates `labels`, `milestone`, `assignees`, `updated_at`.
- Does not create new local files from GitHub-only issues (no `feature_slug` context).
- Requires `gh` CLI authenticated with read access to the repository.

### §6 Drift check

`npm run check:issues` (warn-only, not in `npm run verify`):
- Warns for each `specs/<slug>/` that has no linked `issues/*.md`.
- Hard-fails (exit 1) on issue files with malformed or missing required frontmatter.

### §7 Package release

`issues/` ships with only its `README.md` in the released template package (same pattern as other intake folders: `inputs/`, `specs/`, `discovery/`, etc.). Per `docs/release-package-contents.md` and ADR-0021.

## Considered options

### Option A — Issue file inside `specs/<slug>/` (e.g., `specs/<slug>/issue.md`)

- Pros: Co-located with all other feature artifacts. Natural for per-feature view.
- Cons: No cross-feature roadmap view without scanning all `specs/`. Feature slug implied by directory; redundant for cross-linking.

### Option B — `issues/` at repo root with flat files (chosen)

- Pros: One place for all roadmap-state queries. Mirrors GitHub's own flat issue list. Decoupled from internal spec tree. Easy for scripts and roadmap tools to scan.
- Cons: Extra folder at repo root. Duplicate storage of some spec data (title, slug).

### Option C — No local files; query GitHub API on demand

- Pros: Single source of truth always.
- Cons: Requires network and authentication for any local roadmap view. No offline access. Cannot add local annotations (e.g., `feature_slug` link).

## Consequences

### Positive

- Every feature has a named, queryable roadmap entry from the first `/spec:start` call.
- `check:issues` gives drift visibility without blocking local development.
- `sync:issues` keeps local state consistent with GitHub after label or milestone changes.
- Portfolio manager and roadmap manager scripts can query `issues/*.md` for roadmap data without calling the GitHub API.

### Negative

- Adds a maintenance burden: issue files must be kept in sync (mitigated by `sync:issues`).
- Adds `issues/` to the sink, release-package, and frontmatter check surfaces.
- Agents that complete stage transitions must remember to update `stage` and `roadmap_status` in the issue file (or let `sync:issues` handle it on next pull).

### Neutral

- `issues/` is an intake folder for the template package; ships empty (README-only) like `inputs/`, `specs/`, etc.

## Compliance

- `npm run check:issues` validates frontmatter and warns on unlinked specs.
- `check:frontmatter` does not currently validate `issues/*.md` schema; `check:issues` owns that validation.
- `docs/sink.md` ownership table documents `issues/` mutability rules.
- `docs/release-package-contents.md` enumerates `issues/` as an intake folder.

## References

- [ADR-0021](0021-release-package-fresh-surface.md) — release package fresh-surface contract.
- [ADR-0026](0026-freeze-v1-workflow-track-taxonomy.md) — v1.0 track taxonomy freeze (this is not a new track; it is a cross-cutting artifact).
- [`docs/sink.md`](../sink.md) — artifact ownership.
- [`docs/release-package-contents.md`](../release-package-contents.md) — intake folder enumeration.
- `templates/issue-template.md` — blank issue template.
- `scripts/check-issues.ts` — drift check.
- `scripts/sync-issues.ts` — GitHub pull sync.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
