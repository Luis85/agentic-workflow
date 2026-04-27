# Issue: Reconcile version/status labels between README and Spec Kit

- **Opened:** 2026-04-27
- **Severity:** P2
- **Status:** Open
- **Area:** Documentation versioning

## Summary
Top-level docs present conflicting version/status labels for the workflow:
- `README.md` advertises: `v0.2 — Foundation + Skills layer`
- `docs/spec-kit.md` declares: `Version: 0.1 · Status: Draft`

## Why it matters
Contributors use these docs as source-of-truth for workflow maturity. Conflicting version signals make it unclear which contract to follow and whether features in README are fully ratified.

## Proposed fix
Choose one canonical version and synchronize both documents in the same PR:
- either bump `docs/spec-kit.md` to match README, or
- downgrade README status text to match `docs/spec-kit.md`.

Also add a short note in `docs/spec-kit.md` changelog/header explaining what changed between 0.1 and 0.2.

## Acceptance criteria
- README and `docs/spec-kit.md` show the same version/status baseline.
- Any version bump rationale is documented in the same commit.
