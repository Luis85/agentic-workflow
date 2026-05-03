---
id: ADR-0032
title: Adopt issue-first interaction model as recommended entry point for Standard-depth workflows
status: accepted
date: 2026-05-03
deciders:
  - Luis Mendez (product owner)
consulted:
  - analyst (idea.md, research.md)
  - pm (requirements.md)
informed:
  - all Specorator adopters
supersedes: []
superseded-by: []
tags: [workflow, entry-point, github-issues, interaction-model]
---

# ADR-0032 — Adopt issue-first interaction model as recommended entry point for Standard-depth workflows

## Status

Accepted

## Context

Specorator's current entry point (`/spec:start <slug>` or `/orchestrate`) anchors the user's intent in the chat transcript. There is no durable, GitHub-native artifact that records why a feature was started, what scope was debated, or what constraints the user supplied before kickoff. When a feature is revisited, when a second contributor joins, or when a PR reviewer asks "what was the original intent?", this information is either lost or scattered across chat history.

Research (RESEARCH-IFI-001) found that no existing GitHub-native workflow tool writes a live state mirror directly into the issue body as the primary mechanism; most use separate comments, labels, or external dashboards. The closest analogues (Release Please PR body rewrites, Zenhub pipeline sync) document the same root failure mode: concurrent updates produce stale state when the update is not fetch-then-replace and idempotent.

This ADR is architecturally load-bearing because it:
- Overloads the `/spec:start` command signature (slug vs. issue number)
- Introduces a new GitHub API dependency (`gh issue edit`) in the stage command flow
- Adds an optional `issue:` field to `workflow-state-template.md` (schema change)
- Locks the sentinel-block format, non-fatal sync contract, and track-to-commit-type mapping as stable interfaces that downstream scripts and stage commands will rely on

An ADR is required before the Design stage (release criterion in PRD-IFI-001).

## Decision

We adopt the issue-first interaction model as the **recommended** (not mandatory) entry point for Standard-depth Specorator workflows. The following sub-decisions are locked:

### 1. Ready signal

The transition from `status:draft` → `status:ready-for-spec` on a GitHub issue is a **manual user action**. No automation applies or removes this label. It is the user's explicit "go" signal.

### 2. Trigger

`/spec:start <issue-number>` is the trigger. The command reads issue body and labels to derive slug, area, depth, and track. The existing `/spec:start <slug>` form remains unchanged for small fixes and Lean/Spike workflows.

### 3. Slug derivation

Default slug = `<title-slug>-<issue-number>` (e.g., `adopt-issue-first-interaction-model-274`). The issue number suffix eliminates slug collisions by construction. User may override via `AskUserQuestion`.

### 4. Track-to-commit-type mapping

| Label | Branch prefix |
|---|---|
| `track:feature` | `feat` |
| `track:bug` | `fix` |
| `track:spike` | `spike` |
| `track:specorator-improvement` | `feat` |
| *(no track label)* | `feat` |

This table is the canonical reference. It lives in `docs/issue-first-interaction.md` and is referenced by the `/spec:start` implementation.

### 5. Sentinel-block mechanism

The issue body receives a thin mirror block delimited by HTML comment markers:

```
<!-- specorator-state:begin -->
**Stage:** <current-stage> | **Last gate:** <gate-name> | [workflow-state.md](<link>)
<!-- specorator-state:end -->
```

The block is:
- Written by `scripts/sync-issue-mirror.sh <slug>` as the **last step** of every `/spec:*` stage command. The script receives the **slug** (not the issue number); it reads `specs/<slug>/workflow-state.md` to obtain the `issue:` field and the current stage. This is the canonical interface — requirements referencing the script use the slug form.
- Thin: current stage + last gate + link to `workflow-state.md` only. Spec files are the source of truth.
- Located at the **end** of the issue body, appended once on first scaffold.
- Replaced idempotently on subsequent syncs (fetch body → splice between markers → write).

### 6. Non-fatal sync contract

`scripts/sync-issue-mirror.sh` **must exit 0** under all failure conditions (gh absent, not authenticated, 404, rate limit, missing markers, duplicate markers). The calling stage's exit code is never affected by sync failures. Failures are emitted as named warnings to stderr. This is non-negotiable: a GitHub API failure must not block a workflow stage.

### 7. `issue:` frontmatter field

`templates/workflow-state-template.md` gains an optional `issue: <n>` field. When set, it is the authoritative link between the workflow and its GitHub issue. Its absence is valid (slug-mode runs).

### 8. Gate labels (opt-in)

Gate labels (`gate:clarify-after-requirements`, `gate:clarify-after-design`, `gate:analyze-after-tasks`) are opt-in. A stage command checks for them only if a linked issue exists; if absent, the stage proceeds normally.

### 9. Status label sync

`workflow-state.status` → GitHub label mapping:

| `workflow-state.status` | GitHub label |
|---|---|
| `active` | `status:in-progress` |
| `paused` | `status:paused` |
| `blocked` | `status:blocked` |
| `done` | `status:done` |

`status:draft` and `status:ready-for-spec` are managed manually by the user.

### 10. Scope decoupling

Closing a GitHub issue does not block or alter any workflow stage. `workflow-state.md` is the authoritative lifecycle record; the issue is a human-facing mirror.

## Considered options

### Option A — Issue body as canonical input, replacing `specs/`
- Pros: maximum GitHub nativeness; no file system artefacts
- Cons: breaks EARS-notation requirements, git traceability, quality gates, and every specialist agent's artifact schema. Dismantles Article I, II, V of the constitution.
- **Rejected.**

### Option B — Webhook/GitHub App triggered by label changes
- Pros: fully event-driven; no manual `/spec:start` call needed
- Cons: requires a server or hosted GitHub App; introduces race conditions (documented in Zenhub, Release Please); scope violates Specorator's local-first, no-server constraint.
- **Rejected for v1.** Revisit as an opt-in operational bot in v2.

### Option C (this ADR) — Additive issue-first layer; workflow unchanged
- Pros: zero changes to 11-stage workflow or agent scopes; reversible (slug mode still works); GitHub-native audit trail; no external server.
- Cons: introduces a GitHub API call in the stage command flow; `gh` becomes a soft dependency.
- **Accepted.**

## Consequences

### Positive

- Every Standard-depth workflow run has a durable, GitHub-native record of intent.
- Slug collisions eliminated by construction (issue number suffix).
- `status:*` labels give teams a triage board without extra tooling.
- Adopters get a one-command label bootstrap with `scripts/bootstrap-labels.sh`.

### Negative

- `gh` CLI becomes a soft dependency. Workflows without `gh` installed degrade gracefully (sync skipped, warning emitted) but lose the mirror feature.
- Issue body sentinel delimiters can be corrupted by user edits. The guard in `sync-issue-mirror.sh` detects this and fails loudly, but the user must restore the delimiters manually.
- Concurrent stage completions produce last-writer-wins state in the sentinel block. Acceptable for small teams (≤10 engineers); a future lock mechanism is needed for larger teams.

### Neutral

- `spec-discovery.yml` and `track:discovery` integration are deferred to a follow-up issue.
- The existing `/spec:start <slug>` form is unchanged.

## Compliance

- `scripts/sync-issue-mirror.sh` exit-code behaviour is tested by TEST-IFI-* (auth failure, missing markers, duplicate markers — all must exit 0).
- REQ-IFI-025 and NFR-IFI-001 are the acceptance criteria for the non-fatal contract.
- `workflow-state-template.md` schema change is verified by `npm run verify` (schema lint).
- Track-to-commit-type mapping is the canonical reference for branch-naming tests (REQ-IFI-019).

## References

- Issue #274 — canonical brief and grill output (R1–R20)
- PRD-IFI-001 (`specs/adopt-issue-first-interaction-model/requirements.md`)
- RESEARCH-IFI-001 (`specs/adopt-issue-first-interaction-model/research.md`)
- ADR-0026 — frozen v1 track taxonomy (this feature must not add a new track)
- `docs/issue-first-interaction.md` — full user guide (produced in Stage 7)
- Release Please race condition — https://github.com/googleapis/release-please/issues/1208

---

> **ADR bodies are immutable.** To change a decision, supersede it with a new ADR; only the predecessor's `status` and `superseded-by` pointer fields may be updated.
