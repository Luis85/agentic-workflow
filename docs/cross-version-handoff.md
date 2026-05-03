---
title: Cross-version handoff convention
folder: docs
description: Rules for locating and linking release-quality handoff contracts consumed by a later version.
entry_point: false
---

# Cross-version handoff convention

Use a cross-version handoff when one release cycle produces quality signals,
operator contracts, generated data, or other release evidence that a later cycle
must consume.

The handoff contract lives with the consuming cycle, not the producing cycle.
The producing cycle's release notes name what was shipped; the consuming cycle's
handoff document names how downstream work must read and enforce it.

## Location

Place the handoff in the consuming version's specs folder:

```text
specs/<next-version-slug>/v<previous-version>-handoff.md
```

For example, the v0.4 to v0.5 release-quality handoff lives at
[`specs/version-0-5-plan/v04-handoff.md`](../specs/version-0-5-plan/v04-handoff.md).

## Naming

Use the producing version as the filename prefix and keep the subject narrow:

- `v04-handoff.md` for the main v0.4 to v0.5 release-quality handoff.
- `v06-security-handoff.md` if a later cycle needs a narrower source-backed
  security handoff from v0.6.

Do not append the consuming contract to the producing release notes. The release
notes are a ship record; the handoff is a forward-looking consumption contract.

## Required Links

A cross-version handoff must be linked in both directions:

- The producing cycle's `release-notes.md` links to the handoff from its
  validation baseline, known limitations, or changes section.
- The consuming handoff links back to the producing release notes section that
  identifies the shipped surface.
- Any consuming tasks, specs, release-readiness checks, or operator guides link
  to the handoff rather than re-describing the upstream contract.

The precedent is v0.4 to v0.5:

- Producing release notes:
  [`specs/version-0-4-plan/release-notes.md`](../specs/version-0-4-plan/release-notes.md)
  `## Validation baseline for v0.5`.
- Consuming handoff:
  [`specs/version-0-5-plan/v04-handoff.md`](../specs/version-0-5-plan/v04-handoff.md).

## Content

The handoff should state:

- what the consuming cycle must read;
- where the source-of-truth implementation or generated data lives;
- which values are blocking gates, advisory signals, or operator-waivable
  conditions;
- how test fixtures should represent the handoff surface; and
- what is deliberately deferred or out of scope.

If the handoff describes script exports, generated data, diagnostic codes, or
runtime semantics, reviewers should treat it as a doc-as-contract artifact and
verify claims against the referenced source files.
