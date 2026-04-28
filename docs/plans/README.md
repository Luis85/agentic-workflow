---
title: "docs/plans/"
folder: "docs/plans"
description: "Entry point for dated working plans that do not fit a single feature spec."
entry_point: true
---
# `docs/plans/`

**Plans** are short‑lived, dated working documents for cross‑cutting work that doesn't fit neatly into a single feature spec under `specs/<slug>/`. Examples: a quality‑hardening sweep, a multi‑PR refactor, an automation routine being introduced, a migration to a new tool.

Per‑feature work belongs under `specs/<feature>/`, not here. Use this directory only when:

- The work spans multiple features or shared infrastructure.
- The work is bounded (has a clear "done") but bigger than a single PR.
- The work needs a place to track shipped/pending rows that several PRs flip independently.

## Naming

```
docs/plans/YYYY-MM-DD-<slug>.md
```

- **`YYYY-MM-DD`** — the UTC date the plan was authored. Doesn't change when the plan is edited.
- **`<slug>`** — short kebab‑case description, max ~40 chars. Examples: `pre-v1-polish`, `auth-hardening-sweep`, `extract-api-package`.

## Shape

Use [`templates/idea-template.md`](../../templates/idea-template.md) as a starting point and adapt. Every plan needs:

- A one‑paragraph **Goal**.
- A **Roadmap** table where each row is one PR / unit of work, with a status token: `[ ]` pending, `[x]` shipped, `superseded`.
- A pointer to the **tracker issue** (if any) that owns the work end‑to‑end.
- A **Risk + rollback** section.

Plans link to the related ADRs, specs, and steering files — they are coordination documents, not duplicates.

## Lifecycle

1. **Author.** Open a PR adding the plan file under `docs/plans/`. Get review like any other document.
2. **Execute.** Each row of the roadmap is a separate PR. As each PR merges, that PR flips its row from `[ ]` to `[x]` (in the same PR — see [`feedback_docs_with_pr.md`](../../.claude/memory/feedback_docs_with_pr.md)).
3. **Conflict resolution.** When two parallel PRs both flip rows, resolve the inevitable conflict via merge, not rebase ([`feedback_parallel_pr_conflicts.md`](../../.claude/memory/feedback_parallel_pr_conflicts.md)).
4. **Archive.** When every row is closed and the tracker issue is closed, the plan is archived to `docs/archive/plans/<original-filename>` via `git mv`. Archival can be:
   - **Manual** — the maintainer does it in a small docs PR.
   - **Automated** — the [`plan-recon-bot`](../../agents/operational/plan-recon-bot/) routine handles it weekly with a 14‑day quiet period.

Either way, the rule is the same: **archive moves files, never edits content**, except to prepend a single archival banner.

## What does NOT belong here

- **Per‑feature specifications.** Those go in `specs/<slug>/`.
- **ADRs.** Those go in `docs/adr/`.
- **Steering context.** That goes in `docs/steering/`.
- **PR descriptions.** Those go in the PR.
- **Personal todo lists.** Keep those out of the repo entirely.

## See also

- [`templates/idea-template.md`](../../templates/idea-template.md) — starter for plan bodies.
- [`docs/archive/README.md`](../archive/README.md) — what happens once a plan ships.
- [`agents/operational/plan-recon-bot/PROMPT.md`](../../agents/operational/plan-recon-bot/PROMPT.md) — automated archival.
