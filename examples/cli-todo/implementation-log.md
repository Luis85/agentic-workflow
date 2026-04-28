---
id: IMPL-LOG-CLI-001
title: CLI Todo App — Implementation log
stage: implementation
feature: cli-todo
status: complete
owner: dev
inputs:
  - TASKS-CLI-001
  - SPECDOC-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Implementation log — CLI Todo App

This worked example records implementation evidence as if the tiny CLI were built from the spec. Source paths are illustrative traceability anchors; this repository ships workflow artifacts, not the runnable binary.

## Summary

- Dispatcher, help, command handlers, path resolver, store loader, and atomic save helper were implemented as separate source units.
- All mutating commands route through the single atomic save helper required by ADR-CLI-0001.
- Help paths do not resolve or read the data store.
- Empty `TODO_FILE` falls back to the XDG default.
- No deviations from the spec were recorded.

## Evidence

| Task | Result | Illustrative code anchors |
|---|---|---|
| T-CLI-001 | Dispatcher and help tests added. | `tests/e2e/help_test.go`, `tests/e2e/dispatch_test.go` |
| T-CLI-002 | Dispatcher and help behavior implemented. | `cmd/todo/main.go`, `internal/cli/dispatch.go`, `internal/cli/help.go` |
| T-CLI-003 | Storage/path tests added. | `tests/integration/storage_load_test.go`, `tests/e2e/path_test.go` |
| T-CLI-004 | Path resolution and storage read validation implemented. | `internal/storage/path.go`, `internal/storage/load.go`, `internal/storage/model.go` |
| T-CLI-005 | Atomic-write tests added. | `tests/integration/atomic_write_test.go` |
| T-CLI-006 | Atomic save implemented. | `internal/storage/save.go` |
| T-CLI-007 | Command behavior tests added. | `tests/e2e/commands_test.go`, `tests/integration/performance_test.go` |
| T-CLI-008 | Task command handlers implemented. | `internal/cli/add.go`, `internal/cli/list.go`, `internal/cli/done.go`, `internal/cli/rm.go` |
| T-CLI-009 | Review and release artifacts completed. | `review.md`, `traceability.md`, `release-notes.md`, `retrospective.md` |

## Validation run

- Unit and e2e command behavior tests: pass.
- Storage and atomic-write integration tests: pass.
- Performance scenario with 10,000 tasks: pass under the 1 second budget.
- Traceability review: pass.

## Quality gate

- [x] Implementation matches spec.
- [x] Deviations documented; none found.
- [x] Tests cover changed behavior.
- [x] Requirement-to-code evidence is available for review.
