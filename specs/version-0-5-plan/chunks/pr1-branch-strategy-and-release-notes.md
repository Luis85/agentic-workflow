# PR 1 — Branch strategy ADR + release notes config

Tasks: T-V05-001, T-V05-003  
Issue: #90

## T-V05-001 — Decide release branch strategy
Owner: architect | Estimate: M

Choose Shape A (`release/vX.Y.Z` branches) or Shape B (`develop`). Update `docs/branching.md`. File an ADR if branch roles change.

Satisfies: REQ-V05-001, NFR-V05-002, SPEC-V05-001

## T-V05-003 — Add `.github/release.yml`
Owner: dev | Estimate: S | Depends on: T-V05-001

Add categories and exclusions for GitHub-generated release notes.

Satisfies: REQ-V05-003, REQ-V05-004, SPEC-V05-003
