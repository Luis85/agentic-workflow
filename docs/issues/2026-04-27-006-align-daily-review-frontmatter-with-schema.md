# Issue: Align daily review frontmatter with documented schema (`issue: #NNN`)

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Resolved
- **Area:** Operational review artifacts

## Summary
`docs/daily-reviews/README.md` defines `issue: <#NNN>` as the matching `review-bot` issue number, but `docs/daily-reviews/2026-04-27.md` currently uses `issue: local-doc-issues`.

## Why it matters
Schema drift prevents tooling from reliably correlating digest files with issue tracker records and weakens automated metrics/reporting based on frontmatter.

## Proposed fix
If a GitHub issue exists, set `issue` to its numeric reference (for example `#123`). If no GitHub issue exists yet, use an explicit nullable convention documented in `docs/daily-reviews/README.md` (for example `issue: null`) and update the README schema accordingly.

## Acceptance criteria
- `docs/daily-reviews/README.md` and daily review files use the same `issue` field contract.
- The `2026-04-27` digest uses a value valid under the documented contract.

## Resolution
Resolved in branch `fix/doc-review-issues` by documenting `issue: null` for local-only reviews and updating the 2026-04-27 digest to use that value.
