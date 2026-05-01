---
id: RTM-CLI-001
title: CLI Todo App — Traceability matrix
stage: review
feature: cli-todo
status: complete
owner: reviewer
inputs:
  - PRD-CLI-001
  - SPECDOC-CLI-001
  - TASKS-CLI-001
  - IMPL-LOG-CLI-001
  - TESTREPORT-CLI-001
generated: 2026-04-29 00:00
---

# Traceability matrix — CLI Todo App

## Forward chain

| REQ | Spec | Tasks | Code | Tests | Status |
|---|---|---|---|---|---|
| REQ-CLI-001 | SPEC-CLI-001 | T-CLI-007, T-CLI-008 | `internal/cli/add.go`, `internal/storage/save.go` | TEST-CLI-001, TEST-CLI-021, TEST-CLI-028, TEST-CLI-032 | pass |
| REQ-CLI-002 | SPEC-CLI-002 | T-CLI-007, T-CLI-008 | `internal/cli/list.go` | TEST-CLI-002, TEST-CLI-010 | pass |
| REQ-CLI-003 | SPEC-CLI-002 | T-CLI-007, T-CLI-008 | `internal/cli/list.go` | TEST-CLI-003, TEST-CLI-011 | pass |
| REQ-CLI-004 | SPEC-CLI-003 | T-CLI-007, T-CLI-008 | `internal/cli/done.go` | TEST-CLI-004, TEST-CLI-022 | pass |
| REQ-CLI-005 | SPEC-CLI-004 | T-CLI-007, T-CLI-008 | `internal/cli/rm.go` | TEST-CLI-005, TEST-CLI-028 | pass |
| REQ-CLI-006 | SPEC-CLI-005, SPEC-CLI-006, SPEC-CLI-007 | T-CLI-001, T-CLI-002 | `internal/cli/help.go`, `internal/cli/dispatch.go` | TEST-CLI-006, TEST-CLI-007, TEST-CLI-008, TEST-CLI-009 | pass |
| REQ-CLI-007 | SPEC-CLI-008, SPEC-CLI-009 | T-CLI-003, T-CLI-004 | `internal/storage/load.go`, `internal/storage/model.go` | TEST-CLI-001, TEST-CLI-021, TEST-CLI-028 | pass |
| REQ-CLI-008 | SPEC-CLI-008 | T-CLI-005, T-CLI-006 | `internal/storage/save.go` | TEST-CLI-018, TEST-CLI-033 | pass |
| REQ-CLI-009 | SPEC-CLI-009 | T-CLI-003, T-CLI-004 | `internal/storage/path.go` | TEST-CLI-019, TEST-CLI-020 | pass |
| REQ-CLI-010 | SPEC-CLI-003 | T-CLI-007, T-CLI-008 | `internal/cli/done.go` | TEST-CLI-014 | pass |
| REQ-CLI-011 | SPEC-CLI-004 | T-CLI-007, T-CLI-008 | `internal/cli/rm.go` | TEST-CLI-015 | pass |
| REQ-CLI-012 | SPEC-CLI-005, SPEC-CLI-008 | T-CLI-002, T-CLI-003, T-CLI-004 | `internal/cli/help.go`, `internal/storage/load.go` | TEST-CLI-023, TEST-CLI-024, TEST-CLI-025, TEST-CLI-026, TEST-CLI-027 | pass |
| REQ-CLI-013 | SPEC-CLI-001 | T-CLI-007, T-CLI-008 | `internal/cli/add.go` | TEST-CLI-012, TEST-CLI-013 | pass |
| NFR-CLI-001 | SPEC-CLI-010 | T-CLI-007 | `tests/integration/performance_test.go` | TEST-CLI-031 | pass |
| NFR-CLI-002 | SPEC-CLI-008 | T-CLI-005, T-CLI-006 | `internal/storage/save.go` | TEST-CLI-018, TEST-CLI-033 | pass |
| NFR-CLI-003 | SPEC-CLI-009, SPEC-CLI-010 | T-CLI-009 | `README.md` scope note | TEST-CLI-019, TEST-CLI-020 | pass |
| NFR-CLI-004 | SPEC-CLI-010 | T-CLI-009 | no network code path | TEST-CLI-029 | pass |
| NFR-CLI-005 | SPEC-CLI-010 | T-CLI-009 | source layout review | REVIEW-CLI-001 | pass |
| NFR-CLI-006 | SPEC-CLI-010 | T-CLI-009 | install notes | RELEASE-CLI-001 | pass |
| NFR-CLI-007 | SPEC-CLI-010 | T-CLI-009 | this matrix | REVIEW-CLI-001 | pass |

## Reverse coverage check

### Orphan tests

- None.

### Orphan tasks

- None.

### Orphan ADRs

- None. ADR-CLI-0001 traces to REQ-CLI-008 and NFR-CLI-002 through SPEC-CLI-008.

## Coverage summary

| Bucket | Total | Covered | Percent |
|---|---:|---:|---:|
| Functional REQs with spec/task/test links | 13 | 13 | 100% |
| NFRs with spec/task evidence | 7 | 7 | 100% |
| NFRs with automated `TEST-*` evidence | 7 | 4 | 57% |
| NFRs with review/release evidence instead of `TEST-*` | 7 | 3 | 43% |
| All requirements with canonical `TEST-*` evidence | 20 | 17 | 85% |
| Spec scenarios | 33 | 33 | 100% |

The three non-test NFRs are deliberate artifact checks: NFR-CLI-005 is reviewed through `REVIEW-CLI-001`, NFR-CLI-006 through `RELEASE-CLI-001`, and NFR-CLI-007 through this RTM plus `REVIEW-CLI-001`. They are not counted as automated `TEST-*` evidence by `quality:metrics`.

`quality:metrics` should report 100% requirement-to-spec coverage, 100% requirement-to-task coverage, 85% requirement-to-test coverage, and a 95% stage-aware traceability average for this completed example.

## Open items blocking review

- None.

## Quality gate

- [x] Every REQ row has downstream cells filled.
- [x] No orphan tests, tasks, or ADRs.
- [x] Coverage summary is complete.
