# `docs/daily-reviews/`

Optional secondary sink for [`review-bot`](../../agents/operational/review-bot/PROMPT.md). Every run that produces findings *may* commit a Markdown digest of the same body into `docs/daily-reviews/YYYY-MM-DD.md` (one file per run) via a tiny docs‑only PR.

## When to enable

Enable the digest sink if the project wants:

- A **searchable** archive of reviews, browseable inside the repo (issues alone are search‑filterable but not git‑diffable).
- A way for the **`docs-review-bot`** to detect drift between an old review and the current code state.
- A trail readers can traverse with `git log -- docs/daily-reviews/` after the GitHub issues have been closed and labels pruned.

Skip it if your team treats issues as the canonical archive — the bot's primary sink (one issue per run, label `review-bot`) covers the same content. There is no behaviour the digest unlocks beyond what the issue already provides.

## File shape

Every digest file follows this shape:

```markdown
---
date: YYYY-MM-DD
head_sha: <40-char SHA>
issue: <#NNN>           # the matching review-bot issue
finding_count: <N>
---

# Daily review YYYY-MM-DD — <head-sha7>

<verbatim copy of the review-bot issue body — the same checklist, the
 same finding IDs, the same severity tags>
```

The frontmatter lets later tools (e.g. a metrics dashboard) aggregate review counts without parsing prose.

## Why this is **not** the primary sink

Two reasons:

1. **Auto‑flip on merge** keys off the GitHub issue's checklist, not this file. When a fix PR contains the magic line `Refs #<issue> finding:<sha7>.<idx>`, the corresponding line in the issue gets ticked. The digest here is a snapshot; it doesn't update after creation.
2. **Closed issues drop off the label view** — exactly what you want for tracker discipline. Old digests stay here, browseable, without cluttering the active label.

## Anti‑patterns

- **Don't** edit a digest file after it lands. It is a snapshot of one run; a follow‑up review is a *new* file.
- **Don't** delete digest files when you close the matching issue. They are the historical record.
- **Don't** re‑number them or renumber the finding IDs. The IDs reference the head SHA at review time and must remain stable.

## Relationship to `docs-review-bot`

`docs-review-bot` audits `docs/` for drift (see its [`PROMPT.md`](../../agents/operational/docs-review-bot/PROMPT.md)). This directory is **excluded** from that audit by default — old reviews are expected to be stale relative to current code; that's their whole purpose.

If you do want `docs-review-bot` to flag stale review findings whose source code has been deleted or substantially rewritten, configure that as a separate routine — don't loosen the scope of the existing one.
