---
id: TESTPLAN-CLI-001
title: CLI Todo App — Test plan
stage: testing
feature: cli-todo
status: complete
owner: qa
inputs:
  - SPECDOC-CLI-001
  - TASKS-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Test plan — CLI Todo App

## Strategy

The test plan follows the 33 scenarios already defined in `spec.md` and uses three layers:

- **Unit:** dispatcher parsing, path resolution, store validation, task model invariants.
- **Integration:** real filesystem storage, atomic rename behavior, SIGKILL mid-write simulation, performance budget.
- **E2E:** built binary invoked as a subprocess with stdout, stderr, exit code, and data file assertions.

## Coverage groups

- Command happy paths: TEST-CLI-001 through TEST-CLI-005.
- Help and dispatch: TEST-CLI-006 through TEST-CLI-009.
- Empty and validation errors: TEST-CLI-010 through TEST-CLI-017.
- Durability and path resolution: TEST-CLI-018 through TEST-CLI-027 and TEST-CLI-033.
- ID, routing, exit-code, performance, and text preservation: TEST-CLI-028 through TEST-CLI-032.

## Required gates

- Every REQ-CLI-NNN has at least one test scenario in `spec.md`.
- Every data-accessing error path proves the data store is unchanged.
- Atomic-write compliance cannot be waived; TEST-CLI-018 is the ADR-CLI-0001 gate.
- Help paths must pass even with a corrupt store.
- Performance test runs against a 10,000-task store.

## Quality gate

- [x] Every EARS clause has at least one test scenario.
- [x] Critical paths cover happy and edge cases.
- [x] Non-functional checks include durability and performance.
- [x] Failures are reproducible from this plan.
