# Issue: Reconcile version/status labels between README and Specorator

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Resolved
- **Area:** Documentation versioning

## Summary
Top-level docs present conflicting version/status labels for the workflow:
- `README.md` advertises: `v0.2 — Foundation + Skills layer`
- `docs/specorator.md` declares: `Version: 0.1 · Status: Draft`

## Why it matters
Contributors use these docs as source-of-truth for workflow maturity. Conflicting version signals make it unclear which contract to follow and whether features in README are fully ratified.

## Proposed fix
Choose one canonical version and synchronize both documents in the same PR:
- either bump `docs/specorator.md` to match README, or
- downgrade README status text to match `docs/specorator.md`.

Also add a short note in `docs/specorator.md` changelog/header explaining what changed between 0.1 and 0.2.

## Acceptance criteria
- README and `docs/specorator.md` show the same version/status baseline.
- Any version bump rationale is documented in the same commit.

## Resolution
Resolved in branch `fix/doc-review-issues` by aligning the canonical workflow definition in `docs/specorator.md` with README's `v0.2 — Foundation + Skills layer` baseline and adding a one-sentence v0.2 rationale.
