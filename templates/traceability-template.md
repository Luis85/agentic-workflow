---
id: RTM-<AREA>-NNN
title: <Feature name> — Traceability matrix
stage: review
feature: <feature-slug>
status: draft           # draft | complete
owner: qa
inputs:
  - PRD-<AREA>-NNN
  - SPEC-<AREA>-NNN
  - TASKS-<AREA>-NNN
  - TESTREPORT-<AREA>-NNN
generated: YYYY-MM-DD HH:MM
---

# Traceability matrix — <Feature name>

> Should be regenerable from artifact frontmatter. Any empty cell is a defect.

## Forward chain

| REQ | Spec | Tasks | Code | Tests | Status |
|---|---|---|---|---|---|
| REQ-<AREA>-001 | SPEC-<AREA>-001 | T-001, T-002, T-003 | `src/...:42-98` | TEST-001, TEST-002 | ✅ |
| REQ-<AREA>-002 | SPEC-<AREA>-002 | T-004, T-005 | `src/...:12-60` | TEST-003 | ⚠️ 1 failing |
| REQ-<AREA>-003 | SPEC-<AREA>-003 | T-006 | — | — | ❌ not started |

## Reverse coverage check

> Every test, task, and material code change must reference an upstream ID.

### Orphan tests (tests without a REQ ID)

- — none —

### Orphan tasks (tasks without a REQ / SPEC ID)

- — none —

### Orphan ADRs (decisions without a triggering artifact)

- — none —

## Coverage summary

| Bucket | Total | Covered | %% |
|---|---|---|---|
| Functional REQs | … | … | …% |
| NFRs | … | … | …% |
| Edge cases (from spec) | … | … | …% |

## Open items blocking review

- [ ] REQ-<AREA>-003 — implementation not started; planned for next cycle? Owner?

---

## Quality gate

- [ ] Every REQ row has all downstream cells filled or marked as accepted gap.
- [ ] No orphan tests / tasks / ADRs.
- [ ] Coverage summary shows the bar set in `docs/quality-framework.md` is met.
