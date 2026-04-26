---
id: IMPL-LOG-<AREA>-NNN
title: <Feature name> — Implementation log
stage: implementation
feature: <feature-slug>
status: in-progress  # in-progress | complete
owner: dev
inputs:
  - SPECDOC-<AREA>-NNN
  - TASKS-<AREA>-NNN
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Implementation log — <Feature name>

A running record of *what* was implemented, *why* a deviation was taken, and *what* was learned. Append-only during implementation; no rewriting history.

## Entry template

```
### YYYY-MM-DD — T-<AREA>-NNN — <short title>
- **Files changed:** path1:lines, path2:lines
- **Commit:** <SHA>
- **Spec reference:** SPEC-<AREA>-NNN §…
- **Outcome:** done | partial | blocked
- **Deviation from spec:** none | <describe + rationale + ADR if material>
- **Notes:** anything a future maintainer would want to know.
```

## Entries

### YYYY-MM-DD — T-<AREA>-001 — Scaffold module structure
- **Files changed:** …
- **Commit:** …
- **Spec reference:** SPEC-<AREA>-001
- **Outcome:** done
- **Deviation from spec:** none
- **Notes:** …

### YYYY-MM-DD — T-<AREA>-002 — Add failing test for password reset
- **Files changed:** …
- **Commit:** …
- **Spec reference:** SPEC-<AREA>-001
- **Outcome:** done (test red, as expected)
- **Notes:** …

---

## Deviations summary

> Any deviation from spec must be listed here, with link to ADR if material.

| Date | Task | Deviation | Reason | ADR |
|---|---|---|---|---|
| … | … | … | … | — |

## Quality gate

- [ ] All tasks accounted for (done, partial, blocked, or dropped).
- [ ] Every deviation has a rationale and (if material) an ADR.
- [ ] Lint, type checks, unit tests green for the changed surface.
- [ ] Commits reference task IDs.
