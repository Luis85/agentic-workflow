---
id: ADR-0020
title: Adopt Shape A with release/vX.Y.Z branches for v0.5 releases
status: accepted
date: 2026-05-02
deciders:
  - architect
consulted:
  - pm
  - release-manager
informed:
  - dev
  - qa
  - sre
supersedes: []
superseded-by: []
tags: [release, branching, governance]
---

# ADR-0020 — Adopt Shape A with release/vX.Y.Z branches for v0.5 releases

## Status

Accepted

## Context

Version 0.5 introduces real GitHub Releases and (later) GitHub Packages publication. Until now the repository has run on Shape A alone (a single integration branch, `main`, with topic branches). `docs/branching.md` already lists Shape A and Shape B side by side, but does not commit to one for release operations.

The v0.5 plan forces the choice:

- **REQ-V05-001** requires the repository to define the branch model for versioned releases — integration branch, release branch, tag source, and promotion rules.
- **NFR-V05-002** requires every release artifact and package version to be traceable to a tag and commit SHA.
- **SPEC-V05-001** requires documentation that names where to branch from, where to merge, where to tag, and when to clean up release branches.
- **PRD-V05-001** explicitly states that `develop` is **not** introduced unless the strategy accepts Shape B, and that publishing is manually authorized (REQ-V05-002 / NFR-V05-001).
- **DESIGN-V05-001** recommends Shape A plus an explicit `release/vX.Y.Z` branch as the lower-risk first step, deferring Shape B until release cadence justifies the integration overhead.

CLAR-V05-001 in `specs/version-0-5-plan/workflow-state.md` flagged this as the open clarification blocking T-V05-003 (`.github/release.yml`), T-V05-004 (release readiness check), and T-V05-006 (manual release workflow). Those downstream tasks need a stable answer for "where do release commits live, and from which branch is the tag cut" before they can be implemented or tested.

Forces at play:

- Low current release cadence — v0.5 is the *first* tagged release with full automation.
- Single-maintainer governance — adding a permanent `develop` branch doubles the integration surface and the bot configuration without a current beneficiary.
- Existing `.claude/settings.json` already denies pushes to both `main` and `develop`, so adopting Shape B later remains cheap.
- v0.5 automation (release readiness check, manual release workflow, package publish path) needs one canonical answer to "which branch is the release source?" so it can validate it.

## Decision

We adopt **Shape A plus a dedicated `release/vX.Y.Z` topic-branch convention** as the v0.5 release branching strategy. Specifically:

1. `main` remains the single integration branch and is the **canonical release source**. Tags (`vX.Y.Z`) are cut from `main` only.
2. Release preparation happens on a short-lived topic branch named `release/vX.Y.Z` (one per planned release). It is cut from `main`, carries only release-prep commits (version bump in `package.json`, `CHANGELOG.md` entry, lifecycle `release-notes.md` finalization, any release-only doc updates), and merges back to `main` via a normal PR.
3. The release tag is created on `main` **after** the `release/vX.Y.Z` PR merges — never on the release branch itself, never on a feature branch, never via a force-push.
4. Publication of a GitHub Release and (when enabled) GitHub Package happens only through a `workflow_dispatch` workflow keyed off the tag on `main`, with explicit human authorization input (REQ-V05-002, SPEC-V05-002).
5. After the tag is cut and the release is published, the `release/vX.Y.Z` branch is deleted both locally and on the remote. It is not reused.
6. `develop` is **not** introduced in v0.5. The push deny on `develop` in `.claude/settings.json` stays in place as forward-compatibility insurance for Shape B.

This convention is documented in `docs/branching.md` and is the single answer release automation, the readiness check, and the operator guide are allowed to assume.

## Considered options

### Option A — Shape A plus `release/vX.Y.Z` (chosen)

- Pros:
  - Smallest deviation from current operating model — only release prep gets a new branch shape.
  - Tag source is unambiguous (`main`), which keeps NFR-V05-002 traceability simple: tag → commit on `main` → merged release PR → CHANGELOG entry → lifecycle release notes.
  - Release prep is reviewable as an ordinary PR; no special CI rules required.
  - Reversible — adopting Shape B later is a documentation + settings change, not a history rewrite.
  - Bots and operational agents continue to key off `main` without reconfiguration.
- Cons:
  - `main` carries pre-release prep commits (version bump, changelog) that are not yet released until the tag lands. Acceptable while cadence is low.
  - Multiple concurrent releases would collide on `main`. Acceptable while cadence is one release at a time.

### Option B — Shape B with permanent `develop`

- Pros:
  - `main` only ever carries promoted, tagged commits — cleanest release history.
  - Concurrent release prep on `develop` is straightforward.
  - Better long-term fit if cadence rises and multiple maintainers cut releases.
- Cons:
  - Doubles the integration-branch surface immediately, with no current cadence to justify it.
  - Requires every operational bot, every contributor doc, and every existing topic-branch convention to learn a new default integration target.
  - Forces a one-time history split (`develop` cut from `main`) and ongoing promotion discipline that v0.5 maintainers have not asked for.
  - PRD-V05-001 explicitly states `develop` is not introduced unless this strategy accepts Shape B — adopting it would expand v0.5 scope.

### Option C — Hotfix-only release branches (cut `release/*` only when patching `main`)

- Pros:
  - Even smaller surface than Option A; treats releases as ordinary commits on `main` with a tag.
- Cons:
  - Loses the review boundary around release-prep commits (version bump, changelog, release notes finalization land directly on `main` via individual PRs with no shared "release X" framing).
  - Makes SPEC-V05-005 release readiness harder to scope — there is no single PR or branch where all release inputs converge for the readiness check to validate.
  - Provides no place to stage a release-candidate (REQ-V05-011 / SPEC-V05-009) without confusing it with a stable release.

## Consequences

### Positive

- Downstream tasks T-V05-003, T-V05-004, T-V05-006, T-V05-007, T-V05-008 can assume a single, named release source (`main`) and a single, named release-prep branch shape (`release/vX.Y.Z`).
- Release readiness validation (SPEC-V05-005) gets a clear checkpoint: it runs on the `release/vX.Y.Z` PR before merge, and again on `main` at the tag commit.
- Tag → commit → PR → changelog → release notes traceability (NFR-V05-002) is direct and survives audit.
- Existing branch protection (`.claude/settings.json` deny on `main` push) remains the backstop, unchanged.
- Future migration to Shape B remains cheap — only the release-source convention and the dispatcher need to be updated.

### Negative

- Until the tag is cut, `main` carries a "release prep merged but not yet released" window. Concurrent releases must serialize through this window.
- Maintainers must remember to delete the `release/vX.Y.Z` branch after the tag is cut. The operator guide (T-V05-008) covers this; the readiness check does not enforce it.
- Release prep commits (version bump, changelog) ride on `main` for the brief interval between PR merge and tag, which is visible in CI signal even though no release has been cut yet.

### Neutral

- `develop` stays denied in settings even though it is not used. That is intentional — re-enabling it later requires a deliberate ADR-tracked change rather than silent drift.
- `demo` (Shape B optional) is not introduced.

## Compliance

- `docs/branching.md` documents the `release/vX.Y.Z` convention, including when to cut, what lives on the branch, how it merges back, and tag source. Reviewers check release PRs against that doc.
- The release readiness check (T-V05-004 / SPEC-V05-005) validates the release source by asserting the tag commit is reachable from `main` and that the version on `main` matches the release tag.
- The manual release workflow (T-V05-006 / SPEC-V05-002) accepts `main` as its only release source; non-`main` tags fail readiness.
- Operator documentation (T-V05-008 / SPEC-V05-006) names the exact branch lifecycle and cleanup step.
- Revisit trigger: if cadence rises to more than one concurrent release prep at a time, or if maintainers want `main` to carry only promoted commits, supersede this ADR with a Shape B variant.

## References

- PRD-V05-001 — Version 0.5 release and distribution plan (`specs/version-0-5-plan/requirements.md`).
- DESIGN-V05-001 — Version 0.5 design (`specs/version-0-5-plan/design.md`).
- SPECDOC-V05-001 — Version 0.5 specification (`specs/version-0-5-plan/spec.md`).
- TASKS-V05-001 — Version 0.5 tasks (`specs/version-0-5-plan/tasks.md`).
- REQ-V05-001, REQ-V05-002, NFR-V05-001, NFR-V05-002, SPEC-V05-001, SPEC-V05-002.
- `docs/branching.md` — branch model.
- `.claude/settings.json` — push deny for `main` and `develop`.
- CLAR-V05-001 — open clarification resolved by this ADR.

## Errata

- **2026-05-02.** §Compliance reads "the readiness check validates the release source by asserting the tag commit is reachable from `main` and that the version on `main` matches the release tag." The first iteration of `scripts/lib/release-readiness.ts` implemented this with a strict `tag SHA == main HEAD SHA` comparison rather than reachability. During the v0.5.1 recovery dispatch (#233 prevention F) this strict reading tripped twice — once when an unrelated PR merged to `main` after the tag was cut, and again when a follow-up direct commit landed on `main` between the draft and stable dispatches. The check has been corrected to assert that the tag commit is on `main`'s **first-parent history** (one SHA per merge / direct commit, walking left parents from HEAD). This matches §Compliance's "reachable from `main`" wording and removes the tag-chase failure mode without weakening the rule that tags must originate on `main` proper — a tag on a feature-branch tip merged via a PR is still rejected because it sits on the second-parent edge. The decision recorded by this ADR — Shape A plus `release/vX.Y.Z`, with tags cut from `main` — is unchanged.

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
