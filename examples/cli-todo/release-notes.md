---
id: RELEASE-CLI-001
title: CLI Todo App — Release notes
stage: release
feature: cli-todo
version: example-v1
status: complete
owner: release-manager
inputs:
  - REVIEW-CLI-001
created: 2026-04-29
updated: 2026-04-29
---

# Release notes — CLI Todo App

## Summary

The `cli-todo` worked example now demonstrates a complete 11-stage Specorator lifecycle for a tiny command-line todo app. It is intended for learning the workflow, not for production use.

## Changes

### New

- Complete task decomposition from the implementation-ready spec.
- Implementation log with requirement-to-code evidence.
- Test plan and report covering all 33 spec scenarios.
- Review, traceability matrix, release notes, and retrospective.

### Improved

- Example status now reflects a complete lifecycle rather than a partial stage walkthrough.

## User-visible impact

- Readers can follow one small feature from idea through retrospective.
- No installable binary is shipped by this repository.
- Windows remains out of scope for the example.

## Known limitations

- Code paths in the implementation log and traceability matrix are illustrative anchors, not files shipped in this repository.
- The usability north-star metric is described but not validated with participant testing.

## Verification steps

1. Read `examples/cli-todo/workflow-state.md`.
2. Follow artifacts in lifecycle order from `idea.md` to `retrospective.md`.
3. Confirm `traceability.md` has no orphan task, test, or ADR entries.

## Rollback plan

- Revert the example artifact completion PR if the example proves misleading.
- No runtime data or deployed service exists.

## Observability

- Not applicable; this is a documentation example.

## Communication

- `examples/README.md` is the public entry point for this example.

## Quality gate

- [x] Summary written for readers.
- [x] User-visible impact stated.
- [x] Known limitations disclosed.
- [x] Verification steps documented.
- [x] Rollback plan documented.
- [x] Communication plan ready.
