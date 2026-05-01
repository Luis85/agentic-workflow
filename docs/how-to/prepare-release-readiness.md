---
title: "How to prepare release readiness"
folder: "docs/how-to"
description: "Prepare a go/no-go guide for bringing a completed increment to production."
entry_point: false
---
# How to prepare release readiness

**Goal:** Produce a meeting-ready `release-readiness-guide.md` that supports a go/no-go decision for production.

**When to use:** Use this before `/spec:release` authorization when a release has stakeholder approvals, operational risk, customer impact, or conditions that should not be buried in release notes.

**Prerequisites:**

- The feature has passed `/spec:review` with `Approved` or `Approved with conditions`.
- You know the feature slug under `specs/<feature>/`.
- You can name the product, stakeholder, operational, and support approvers.

## Steps

1. Copy [`templates/release-readiness-guide-template.md`](../../templates/release-readiness-guide-template.md) to `specs/<feature>/release-readiness-guide.md`.
2. Fill `## Decision` with the target release, decision owner, required approvers, and decision deadline.
3. Fill `## Increment summary` from `requirements.md`, `review.md`, and the planned release notes.
4. Work through `## Readiness by perspective`; set each row to `satisfied`, `condition`, `gap`, or `not-applicable`.
5. Add stakeholder-specific approval needs under `## Stakeholder requirements`.
6. Move every `condition` or `gap` into `## Conditions and blockers` with severity, owner, due date, and release impact.
7. Record the go/no-go decision in `## Go / no-go record`.
8. Copy user-facing impact, limitations, verification, rollback, observability, and communication decisions into `release-notes.md`.
9. If evidence gaps need a formal execution-health review, run `/quality:start <slug> specs/<feature>` and continue through `/quality:review`.
10. Ask the human for explicit authorization before any irreversible production action.

## Verify

`release-readiness-guide.md` has no `gap` or `blocked` item without an owner, due date, and release impact, and `release-notes.md` reflects the final user-facing impact, rollback, observability, and communication decisions.

## Related

- [Release readiness guide](../release-readiness-guide.md)
- [Quality Assurance Track](../quality-assurance-track.md)
- [How to authorize a destructive release action](./authorize-destructive-release.md)
- [`/spec:release`](../../.claude/commands/spec/release.md)

Last desk-checked: 2026-05-01 on branch `docs/release-readiness-guide`.
