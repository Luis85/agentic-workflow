---
id: ADR-CLI-0001
title: Use atomic temp-file rename for writes; no lockfile in v1
status: accepted
date: 2026-04-27
deciders:
  - architect (cli-todo)
consulted:
  - analyst (RESEARCH-CLI-001)
  - pm (PRD-CLI-001)
informed:
  - dev (future)
  - qa (future)
supersedes: []
superseded-by: []
tags: [cli-todo, durability, concurrency, storage]
---

# ADR-CLI-0001 — Use atomic temp-file rename for writes; no lockfile in v1

## Status

Accepted

## Context

`todo` persists every task mutation to a single local data file (REQ-CLI-007). The
PRD requires that a crash or signal during a write must not corrupt the existing
data file (REQ-CLI-008, NFR-CLI-002). Research (RESEARCH-CLI-001, Q4 and RISK-003)
identified three credible postures for write durability and concurrent access:

1. **Atomic temp-file rename** — write a sibling temp file in the same directory,
   `fsync` it, then rename it over the target path. The rename is atomic on POSIX
   filesystems, so a partial write is never observed by readers, and a crash leaves
   either the old file or the new file fully intact.
2. **Lockfile / advisory locking** — acquire an exclusive lock before any read or
   write to serialise concurrent invocations.
3. **Last-writer-wins, no protection** — read-modify-write with no coordination;
   accept that two simultaneous mutations may lose one update.

The decision is architecturally significant because it constrains:

- the storage layer's write contract (every mutation goes through a single
  atomic-write helper, never an in-place edit);
- the test plan (the SIGKILL-mid-write scenario is required by REQ-CLI-008's
  acceptance criteria);
- the documented behaviour for concurrent invocations (the spec must be honest
  that v1 is last-writer-wins for the *update-update* race, not the
  *partial-write* race);
- the v2 evolution path (adding a lockfile later is additive and backwards-
  compatible; removing one would not be).

The tool is local-only and single-user. Two terminals racing on the same data
file is an edge case, not a primary scenario. The didactic goal (G4) penalises
complexity that does not earn its place in the example.

## Decision

We will use **atomic temp-file rename** as the sole write mechanism for the data
store, and we will **not** add a lockfile in v1.

Concretely:

- Every mutation reads the entire data store into memory, applies the change,
  serialises the result to a temp file in the same directory as the target,
  flushes it to disk, then renames the temp file over the target path.
- The temp file lives in the same directory as the target so that the rename
  stays within a single filesystem (cross-filesystem renames are not atomic).
- We do not acquire any lock, advisory or otherwise, before reading or writing.
- The spec documents the resulting concurrency posture in plain language:
  simultaneous invocations from separate terminals may lose one update
  (last-writer-wins for the read-modify-write race); the on-disk file is never
  left in a partial or zero-byte state.

## Considered options

### Option A — Atomic temp-file rename, no lockfile (chosen)

- Pros:
  - Eliminates the partial-write failure mode that REQ-CLI-008 targets.
  - Implementable with platform primitives only; no lock-management code.
  - Test plan is small and deterministic: one SIGKILL-mid-write scenario.
  - Honest about its limits: the spec can state the last-writer-wins caveat as
    a documented decision, not an omission.
- Cons:
  - Two simultaneous mutations from separate terminals can lose one update.
    Mitigated by being an unlikely scenario for a single-user local tool, and
    by being explicitly documented.

### Option B — Atomic rename plus an advisory lockfile

- Pros:
  - Eliminates both the partial-write *and* the update-update race.
  - Closer to what a production tool would do.
- Cons:
  - Adds stale-lock detection, lock-timeout policy, and a platform-specific
    locking primitive (advisory vs. mandatory) — all of which are larger than
    the bug they prevent for this tool.
  - Inflates the example beyond the 500-LOC counter-metric (NFR-CLI-005).
  - Pulls the didactic example toward production patterns that would dominate
    the source-reading experience.

### Option C — In-place write, no atomicity, no lock

- Pros:
  - Smallest possible implementation.
- Cons:
  - Fails REQ-CLI-008 outright. A SIGKILL mid-write produces a truncated or
    zero-byte data file, losing every task. Not viable.

## Consequences

### Positive

- Crash safety on the primary failure mode (signal or process kill mid-write)
  is a property of the write helper, not of every call site.
- The storage layer has a single write entry point; reviewers and the QA agent
  have one place to look for durability concerns.
- The v2 evolution path is open: adding a lockfile later is additive and does
  not change the on-disk format or any public contract.

### Negative

- The update-update race is unmitigated. Two terminals running `todo done 5`
  and `todo add "x"` at the same instant may persist only one of the two
  changes. The spec must state this plainly so users are not surprised.
- Cross-filesystem moves of the data file (e.g., `TODO_FILE` pointing into a
  bind-mounted volume) require the temp file to land in the same directory as
  the target; the implementation must use the *target's* directory for the
  temp file, not the system temp dir.

### Neutral

- The decision applies only to v1. A future iteration that adds multi-process
  safety (or multi-device sync) supersedes this ADR.
- Windows is not in v1 scope (NG10), so Windows-specific rename semantics are
  out of scope here.

## Compliance

- **Spec gate:** `spec.md` includes a write-path contract that names atomic
  rename as the sole mutation mechanism, and a documented concurrency note
  describing the last-writer-wins behaviour.
- **Test gate:** the QA agent's test plan includes a scenario that issues a
  SIGKILL during the write phase and asserts the on-disk file is the
  pre-mutation state, never partial.
- **Review gate:** `/spec:review` checks that the source's write helper is the
  only call site that mutates the data file path.

## References

- PRD-CLI-001 — REQ-CLI-007 (persistence), REQ-CLI-008 (atomic write),
  NFR-CLI-002 (data file integrity).
- RESEARCH-CLI-001 — Q4 (concurrent access), RISK-003 (data corruption on
  concurrent writes).
- DESIGN-CLI-001 — Part C, key decisions table.
