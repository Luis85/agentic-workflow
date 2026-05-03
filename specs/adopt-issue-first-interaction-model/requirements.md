---
id: PRD-IFI-001
title: Adopt issue-first interaction model
stage: requirements
feature: adopt-issue-first-interaction-model
status: accepted
owner: pm
inputs:
  - IDEA-IFI-001
  - RESEARCH-IFI-001
created: 2026-05-03
updated: 2026-05-03
---

# PRD — Adopt issue-first interaction model

## Summary

Specorator currently starts every workflow from a slash command whose intent exists only in the chat transcript. This feature makes a GitHub issue the durable entry point: a user opens a structured issue (feature, bug, or spike), then calls `/spec:start <issue-number>` and the workflow scaffolds itself from the parsed issue body. The issue receives a lightweight read-only mirror of workflow state after each stage, accumulates GitHub status labels, and is linked to the placeholder PR via `Closes #<n>` so it closes when that PR merges through GitHub's native auto-close behavior. The eleven workflow stages, all specialist agents, all quality gates, and all artifact schemas are unchanged. The issue layer is purely additive.

---

## Goals

- G1: Give every Specorator workflow run a durable, GitHub-native record of intent that outlives the chat transcript.
- G2: Enable `/spec:start <issue-number>` to derive the feature slug, area, depth, and track from a parsed, structured issue body — no re-entry of context by the user.
- G3: Keep the sentinel mirror block in the issue body up to date after each stage completion without ever blocking a stage.
- G4: Maintain a consistent set of GitHub labels that signal workflow status and track, usable for triage and filtering across features.
- G5: Remove legacy free-text issue templates and replace them with structured YAML forms for feature, bug, and spike types.
- G6: Provide bootstrap and ongoing label-sync tooling that adopters can run without a hosted service.

---

## Non-goals

- NG1: The issue body does not replace `specs/<slug>/` as the source of truth. Spec files remain authoritative.
- NG2: Closing a GitHub issue does not block or alter any workflow stage. Issue lifecycle is decoupled from workflow lifecycle. (R19)
- NG3: No webhook, daemon, or server-side component is introduced. No GitHub App is created. (idea.md constraint)
- NG4: `spec-discovery.yml` and `track:discovery` label integration are deferred to a follow-up. (idea.md)
- NG5: The feature does not add a new first-party workflow track. (ADR-0026)
- NG6: The issue-first entry path is not enforced for all users — a direct slug-mode entry without a linked issue remains available. (R9)
- NG7: The feature does not modify the eleven workflow stage agents or their artifact schemas. (idea.md constraint)

---

## Personas / stakeholders

| Persona | Need | Why it matters |
|---|---|---|
| Solo builder | Start a Specorator workflow from an existing GitHub issue without re-entering context | Reduces friction between idea capture and workflow start; chat transcript is fragile |
| Small product/engineering team | A shared, persistent record of why a feature was started and where it stands | Second contributor or PR reviewer can understand intent without reading chat history |
| Downstream adopter | Bootstrap and ongoing label tooling that installs cleanly into their repository | Adopters should not have to hand-craft the label set or write their own sync workflow |
| Human maintainer | The sentinel mirror stays current but never disrupts stage execution | A failed GitHub API call should not prevent a stage from completing |

---

## Jobs to be done

- When I have already opened a GitHub issue describing what I want to build, I want to start the Specorator workflow directly from that issue number, so I can avoid re-entering the title, area, and scope context I have already written.
- When a colleague asks why this feature exists or what the original scope was, I want to point them to the GitHub issue, so they can read the intent without needing access to my chat history.
- When I finish a workflow stage, I want the GitHub issue to reflect the current progress automatically, so I can filter and triage open features on the GitHub issues board without opening each spec folder.
- When I adopt Specorator into a fresh repository, I want a single command to install the required label set, so I am not blocked by missing labels when I run my first workflow.

---

## Functional requirements (EARS)

### Area: Issue form templates

---

#### REQ-IFI-001 — Structured issue form for feature requests

- **Pattern:** Ubiquitous
- **Statement:** The repository shall provide `spec-feature.yml` in `.github/ISSUE_TEMPLATE/` with exactly these fields (h3 heading strings fixed as shown): `### Problem Statement`, `### Desired Outcome`, `### Depth` (dropdown: lean/standard/spike), `### Track` (dropdown: feature/bug/spike/specorator-improvement).
- **Acceptance:**
  - Given the template is submitted by a contributor
  - When the rendered issue body is fetched
  - Then it contains the headings `### Problem Statement`, `### Desired Outcome`, `### Depth`, `### Track` in that order
  - And the template does not contain an `upload` field type
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q4), resolves CLAR-IFI-002

---

#### REQ-IFI-002 — Structured issue form for bug reports

- **Pattern:** Ubiquitous
- **Statement:** The repository shall provide `spec-bug.yml` in `.github/ISSUE_TEMPLATE/` with exactly these fields: `### Steps to Reproduce`, `### Expected Behaviour`, `### Actual Behaviour`, `### Track` (dropdown: feature/bug/spike/specorator-improvement).
- **Acceptance:**
  - Given the template is submitted by a contributor
  - When the rendered issue body is fetched
  - Then it contains the headings `### Steps to Reproduce`, `### Expected Behaviour`, `### Actual Behaviour`, `### Track` in that order
  - And the template does not contain an `upload` field type
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q4), resolves CLAR-IFI-002

---

#### REQ-IFI-003 — Structured issue form for spikes

- **Pattern:** Ubiquitous
- **Statement:** The repository shall provide `spec-spike.yml` in `.github/ISSUE_TEMPLATE/` with exactly these fields: `### Question to Answer`, `### Time Box` (free text, e.g., "3 days"), `### Track` (dropdown: feature/bug/spike/specorator-improvement).
- **Acceptance:**
  - Given the template is submitted by a contributor
  - When the rendered issue body is fetched
  - Then it contains the headings `### Question to Answer`, `### Time Box`, `### Track` in that order
  - And the template does not contain an `upload` field type
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q4), resolves CLAR-IFI-002, CLAR-IFI-003

---

#### REQ-IFI-004 — Legacy markdown templates removed immediately

- **Pattern:** Ubiquitous
- **Statement:** The repository shall not contain any legacy `.md` issue template files (e.g., `feature_request.md`, `bug_report.md`) once the YAML form templates are introduced.
- **Acceptance:**
  - Given the YAML form templates have been added to `.github/ISSUE_TEMPLATE/`
  - When the repository is inspected for issue template files
  - Then no `.md` files exist in `.github/ISSUE_TEMPLATE/`
  - And no deprecation notice or redirect file for the legacy templates exists
- **Priority:** must
- **Satisfies:** IDEA-IFI-001 (constraint: "Replacing legacy `.md` issue templates must happen immediately")

---

#### REQ-IFI-005 — Issue form fields restricted to universally-supported types

- **Pattern:** Ubiquitous
- **Statement:** The repository's issue form templates shall use only the field types `textarea`, `input`, `dropdown`, and `checkboxes`.
- **Acceptance:**
  - Given any issue form template in `.github/ISSUE_TEMPLATE/`
  - When the template YAML is inspected
  - Then no field has `type: upload`
  - And every field type is one of: `textarea`, `input`, `dropdown`, `checkboxes`, or `markdown`
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (Q4, GHES compatibility)

---

### Area: Label set and tooling

---

#### REQ-IFI-006 — Canonical label set defined

- **Pattern:** Ubiquitous
- **Statement:** The repository shall define a canonical label set in `.github/labels.yml` covering: status labels for each workflow stage transition, depth labels (lean/standard/spike), track labels for each supported workflow track, and one `status:ready-for-spec` label. The `status:` labels shall be: `status:draft`, `status:ready-for-spec`, `status:in-progress`, `status:paused`, `status:blocked`, `status:done`. One label per status value; not one per stage.
- **Acceptance:**
  - Given `.github/labels.yml` exists in the repository
  - When the label set is enumerated
  - Then the six `status:` labels listed above exist
  - And `depth:lean`, `depth:standard`, and `depth:spike` labels exist
  - And a `track:` label exists for each supported workflow track (excluding `track:discovery`)
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, resolves CLAR-IFI-004, CLAR-IFI-006

---

#### REQ-IFI-007 — Bootstrap labels script is idempotent

- **Pattern:** WHEN a user runs the bootstrap labels script against a repository, the script shall create any absent labels and update the colour and description of any existing labels with differing values without deleting labels not in the canonical set.
- **Acceptance:**
  - Given the bootstrap script is run on a repository that already has some labels from the canonical set (possibly with stale colours)
  - When the script completes
  - Then all canonical labels defined in `.github/labels.yml` exist with correct names, colours, and descriptions
  - And labels that already existed with correct values are not modified
  - And labels outside the canonical set that already existed in the repository are not deleted
  - And running the script a second time produces no changes
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (RISK-IFI-010)

---

#### REQ-IFI-008 — Bootstrap labels script supports dry-run mode

- **Pattern:** WHEN the bootstrap labels script is invoked with a `--dry-run` flag, the script shall print the actions it would take without modifying any labels in the repository.
- **Acceptance:**
  - Given the bootstrap script is invoked with `--dry-run`
  - When the script completes
  - Then the output lists each label that would be created or updated
  - And no label is created, updated, or deleted in the repository
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (RISK-IFI-010)

---

#### REQ-IFI-009 — CI label-sync workflow

- **Pattern:** Ubiquitous
- **Statement:** The repository shall provide a GitHub Actions workflow that reconciles the canonical label set on a schedule and on manual dispatch, applying the same idempotent logic as the bootstrap script.
- **Acceptance:**
  - Given the label-sync workflow file exists in `.github/workflows/`
  - When the workflow runs (scheduled or manually dispatched)
  - Then all canonical labels exist in the repository with correct names, colours, and descriptions after the run
  - And labels outside the canonical set are not deleted
  - And the workflow declares `permissions: issues: write` explicitly
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (technical consideration: CI secrets)

---

### Area: `/spec:start <issue-number>` overload

---

#### REQ-IFI-010 — Numeric argument triggers issue-first path

- **Pattern:** WHEN `/spec:start` is invoked with a positive integer argument, the `/spec:start` command shall treat the argument as a GitHub issue number and fetch the issue body before scaffolding.
- **Acceptance:**
  - Given the user runs `/spec:start 274`
  - When the command processes the argument
  - Then the command fetches issue #274 from the current repository
  - And the command does not prompt for a feature title, area, or depth that can be derived from the parsed issue body
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q3)

---

#### REQ-IFI-011 — Slug derived from issue title and number

- **Pattern:** WHEN `/spec:start` is invoked with a GitHub issue number, the `/spec:start` command shall derive the default feature slug as `<title-slug>-<issue-number>` where `<title-slug>` is the issue title converted to lowercase kebab-case with non-alphanumeric characters removed.
- **Acceptance:**
  - Given issue #274 has the title "Adopt issue-first interaction model"
  - When `/spec:start 274` is run without a slug override
  - Then the feature slug is `adopt-issue-first-interaction-model-274`
  - And the `specs/adopt-issue-first-interaction-model-274/` directory is scaffolded
- **Priority:** must
- **Satisfies:** IDEA-IFI-001 (constraint: deterministic collision handling), RESEARCH-IFI-001 (Q3, R1 revised)

---

#### REQ-IFI-012 — User can override the derived slug

- **Pattern:** WHEN `/spec:start` is invoked with a GitHub issue number and a slug override is requested, the `/spec:start` command shall use the user-supplied slug in place of the derived default.
- **Acceptance:**
  - Given the user runs `/spec:start 274` and provides a custom slug when prompted
  - When the scaffolding completes
  - Then the feature directory is created using the user-supplied slug
  - And the `workflow-state.md` `issue:` field is set to `274`
- **Priority:** should
- **Satisfies:** RESEARCH-IFI-001 (Q3, R1 revised)

---

#### REQ-IFI-013 — Area code derived from slug; commit-type from track label

- **Pattern:** WHEN `/spec:start` is invoked with a GitHub issue number, the `/spec:start` command shall derive (a) the feature area code from the first word of the slug (first 3 characters, uppercase) and (b) the branch commit-type from the `track:` label using the canonical mapping in `docs/issue-first-interaction.md`. The user is not prompted for either value but may override via `AskUserQuestion`.
- **Canonical track-to-commit-type mapping:** `track:feature` → `feat`; `track:bug` → `fix`; `track:spike` → `spike`; `track:specorator-improvement` → `feat`; no track label → `feat`.
- **Acceptance:**
  - Given issue #274 has `track:specorator-improvement` and slug `adopt-issue-first-interaction-model-274`
  - When `/spec:start 274` is run
  - Then the area code is `ADO` (first 3 chars of `adopt`)
  - And the branch prefix is `feat` (mapped from `track:specorator-improvement`)
  - And the user is not prompted for area or commit-type
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (R4, R20), resolves CLAR-IFI-012, CLAR-IFI-020

---

#### REQ-IFI-014 — Missing depth label defaults to standard

- **Pattern:** IF the issue body does not contain a `depth:` label, THEN the `/spec:start` command shall set the workflow depth to `standard` without prompting the user.
- **Acceptance:**
  - Given issue #274 has no `depth:` label applied
  - When `/spec:start 274` is run
  - Then the workflow depth is set to `standard`
  - And no prompt is shown asking the user to select a depth
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R4 locked)

---

#### REQ-IFI-015 — Malformed issue body fails with an actionable error

- **Pattern:** IF the parsed issue body is missing one or more required fields after `/spec:start` fetches it, THEN the `/spec:start` command shall print an actionable error message identifying the missing fields and exit without scaffolding.
- **Acceptance:**
  - Given issue #274 has a body where the problem-statement field is empty
  - When `/spec:start 274` is run
  - Then the command prints an error naming the missing field
  - And no `specs/` directory, `workflow-state.md`, or worktree is created
  - And the exit code is non-zero
- **Priority:** must
- **Satisfies:** IDEA-IFI-001 (constraint: hard-fail on malformed body), RESEARCH-IFI-001 (RISK-IFI-004, R15)

---

#### REQ-IFI-016 — Silent resume on matching issue number

- **Pattern:** IF `/spec:start <issue-number>` is invoked and a `specs/` directory already exists whose `workflow-state.md` `issue:` field matches the given issue number, THEN the `/spec:start` command shall resume the existing workflow silently without re-scaffolding.
- **Acceptance:**
  - Given `specs/adopt-issue-first-interaction-model-274/workflow-state.md` has `issue: 274`
  - When `/spec:start 274` is run again
  - Then the command resumes from the current stage recorded in `workflow-state.md`
  - And no directory, file, or worktree is recreated or overwritten
  - And no prompt is shown
- **Priority:** must
- **Satisfies:** IDEA-IFI-001 (constraint: silent resume on `issue:` match), RESEARCH-IFI-001 (Q3)

---

#### REQ-IFI-017 — Prompt on slug mismatch

- **Pattern:** IF `/spec:start <issue-number>` is invoked and a `specs/` directory already exists whose `workflow-state.md` `issue:` field contains a **different** issue number than the one provided, THEN the `/spec:start` command shall present the user with a prompt identifying the conflict before taking any action.
- **Acceptance:**
  - Given `specs/fix-login-bug-301/workflow-state.md` has `issue: 301`
  - When the user runs `/spec:start 99` (a different issue that also produces base slug `fix-login-bug`)
  - Then the derived slug `fix-login-bug-99` does not collide with `fix-login-bug-301` (unique by number suffix, no conflict)
  - But if the user runs `/spec:start 99` and `specs/fix-login-bug-99/` exists with `issue: 42` (a prior run with a different issue number), THEN the command prints the conflict and asks whether to rename or abort
  - And no change is made until the user confirms a choice
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (Q3, R18), resolves CLAR-IFI-017

---

#### REQ-IFI-018 — Worktree and draft PR created on fresh start

- **Pattern:** WHEN `/spec:start <issue-number>` successfully scaffolds a new feature, the `/spec:start` command shall create a Git worktree for the feature branch and open a draft PR linked to the issue.
- **Acceptance:**
  - Given `/spec:start 274` has parsed the issue body, derived the slug, and created the `specs/` directory
  - When the scaffold step completes
  - Then a Git worktree exists at `.worktrees/<slug>/`
  - And a draft PR exists on GitHub with the branch `<commit-type>/<slug>` linked to issue #274
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R8, R20)

---

#### REQ-IFI-019 — Branch name derived from track label

- **Pattern:** WHEN `/spec:start <issue-number>` creates the feature branch, the `/spec:start` command shall derive the branch prefix from the track label using the canonical track-to-commit-type mapping.
- **Acceptance:**
  - Given the issue carries `track:specorator-improvement`
  - When the branch is created
  - Then the branch name matches the pattern `<commit-type>/<slug>` where `<commit-type>` is the value mapped from `track:specorator-improvement`
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R20)

---

#### REQ-IFI-020 — Gate labels honored at stage-run time (opt-in)

- **Pattern:** WHEN any `/spec:*` stage command is run on a feature with a linked issue and a `gate:*` label is present on that issue for the current stage boundary, the stage command shall invoke the corresponding optional gate (`/spec:clarify` or `/spec:analyze`) before proceeding. If no `gate:*` label is present for the current stage, the command proceeds without running any gate.
- **Gate label set (v1):** `gate:clarify-after-requirements` (triggers `/spec:clarify` before Design), `gate:clarify-after-design` (triggers `/spec:clarify` before Specification), `gate:analyze-after-tasks` (triggers `/spec:analyze` before Implementation).
- **Acceptance:**
  - Given a feature has `issue: 274` and issue #274 carries `gate:clarify-after-requirements`
  - When `/spec:design` is about to run
  - Then the command invokes `/spec:clarify` first and waits for it to complete
  - Given the issue carries no `gate:*` labels
  - When `/spec:design` is run
  - Then the command proceeds without running any gate
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R16), resolves CLAR-IFI-021

---

### Area: `orchestrate` skill update

---

#### REQ-IFI-021 — Orchestrate accepts issue number as entry point

- **Pattern:** WHEN the `orchestrate` skill is invoked with a numeric argument, the `orchestrate` skill shall treat the argument as a GitHub issue number and dispatch `/spec:start <issue-number>` as the first stage command.
- **Acceptance:**
  - Given the user runs `orchestrate 274`
  - When the skill processes the argument
  - Then the skill dispatches `/spec:start 274`
  - And does not prompt for a feature slug or title that can be derived from the issue
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (R9)

---

#### REQ-IFI-022 — Soft nudge on Standard-depth slug-mode fresh starts

- **Pattern:** WHEN the `orchestrate` skill is invoked with a plain-text slug (not a numeric issue number) for a fresh start on a Standard-depth track, the `orchestrate` skill shall suggest opening a GitHub issue first and offer the user a choice to proceed with or without an issue.
- **Acceptance:**
  - Given the user runs `orchestrate my-feature-slug` on a Standard-depth track with no existing `specs/my-feature-slug/` directory
  - When the skill detects the slug-mode entry
  - Then the skill displays a message suggesting the user open a GitHub issue first
  - And the skill presents two options: open an issue then return, or continue without an issue
  - And the skill does not nudge on Lean or Spike depth
- **Priority:** should
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (R9)

---

### Area: Sentinel block and mirror sync

---

#### REQ-IFI-023 — Sentinel block written on first scaffold

- **Pattern:** WHEN `/spec:start` successfully scaffolds a new feature from a GitHub issue, the `/spec:start` command shall append a sentinel mirror block to the issue body delimited by `<!-- specorator-state:begin -->` and `<!-- specorator-state:end -->` HTML comment markers.
- **Acceptance:**
  - Given `/spec:start 274` has created the `specs/` directory and worktree
  - When the scaffold completes
  - Then issue #274 body contains exactly one `<!-- specorator-state:begin -->` marker
  - And exactly one `<!-- specorator-state:end -->` marker
  - And the block between the markers contains the current workflow stage and a link to `workflow-state.md`
  - And all user-authored content above the block is unchanged
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q1, R6)

---

#### REQ-IFI-024 — Mirror sync runs as last step of every stage

- **Pattern:** WHEN any `/spec:*` stage command completes successfully, the stage command shall invoke the mirror sync script as its final step.
- **Acceptance:**
  - Given a feature with slug `adopt-issue-first-interaction-model-274` and `issue: 274` in `workflow-state.md`
  - When `/spec:requirements` completes
  - Then `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` is called as the last operation
  - And the script reads `specs/adopt-issue-first-interaction-model-274/workflow-state.md` to obtain the issue number and current stage
  - And the sentinel block in issue #274 reflects the updated stage
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (R7)

---

#### REQ-IFI-025 — Mirror sync is non-fatal on `gh` absence or auth failure

- **Pattern:** IF `scripts/sync-issue-mirror.sh` cannot reach the GitHub API because the `gh` CLI is absent, not authenticated, or returns a non-zero exit code, THEN the script shall emit a named warning to stderr and exit with code 0.
- **Acceptance:**
  - Given `gh` is not installed on the machine
  - When `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` is run
  - Then the script prints a warning to stderr identifying the failure reason
  - And the script exits with code 0
  - And the calling stage's exit code is not affected
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (Q2, R7, RISK-IFI-003)

---

#### REQ-IFI-026 — Mirror sync preserves user-authored content

- **Pattern:** WHEN `scripts/sync-issue-mirror.sh` updates the sentinel block, the script shall replace only the content between the sentinel markers, leaving all content outside the markers unchanged.
- **Acceptance:**
  - Given issue #274 has user-authored content above and below the sentinel block
  - When `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` runs successfully
  - Then the content above `<!-- specorator-state:begin -->` is byte-for-byte identical to before the run
  - And the content below `<!-- specorator-state:end -->` is byte-for-byte identical to before the run
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (Q1, RISK-IFI-001)

---

#### REQ-IFI-027 — Mirror sync fails loudly on missing or duplicate sentinel markers

- **Pattern:** IF `scripts/sync-issue-mirror.sh` fetches the issue body and finds that the sentinel markers are absent or appear more than once, THEN the script shall emit a named error to stderr with instructions to restore the markers and exit without modifying the issue body.
- **Acceptance:**
  - Given the user has accidentally deleted the `<!-- specorator-state:begin -->` marker from issue #274
  - When `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` runs
  - Then the script prints an error identifying the missing marker and the corrective action
  - And the issue body is not modified
  - And the script exits with code 0 (non-fatal to the calling stage)
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (Q1, RISK-IFI-001)

---

#### REQ-IFI-028 — Sentinel block is thin

- **Pattern:** Ubiquitous
- **Statement:** The sentinel mirror block written by `scripts/sync-issue-mirror.sh` shall contain only the current workflow stage name, the last completed gate, and a relative link to `workflow-state.md`.
- **Acceptance:**
  - Given the sentinel block has been written or updated
  - When the block content is inspected
  - Then it contains the current stage name
  - And it contains the name of the last completed gate
  - And it contains a link to `workflow-state.md`
  - And it contains no spec file content, requirement text, or other artifact body
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R6)

---

### Area: Status label lifecycle

---

#### REQ-IFI-029 — Status labels synced from `workflow-state.status`

- **Pattern:** WHEN `scripts/sync-issue-mirror.sh` runs and the issue is reachable, the script shall apply the status label corresponding to the current value of `workflow-state.status` to the issue and remove any previously applied label from the **managed set** `{status:in-progress, status:paused, status:blocked, status:done}` that no longer matches. The labels `status:draft` and `status:ready-for-spec` are **never** touched by this script.
- **Acceptance:**
  - Given `workflow-state.md` has `status: active` and `current_stage: requirements`
  - When `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` runs successfully
  - Then the `status:in-progress` label is applied to issue #274
  - And any prior label from `{status:paused, status:blocked, status:done}` is removed
  - And `status:ready-for-spec` (if still present) is left unchanged
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R17), resolves P2 Codex finding

---

#### REQ-IFI-030 — `/spec:start` swaps ready-for-spec → in-progress on scaffold

- **Pattern:** WHEN `/spec:start <issue-number>` successfully scaffolds a new feature, the `/spec:start` command shall replace the `status:ready-for-spec` label on the linked issue with `status:in-progress` as a one-time scaffold action.
- **Note:** This is the **only** automation that touches `status:ready-for-spec`. `scripts/sync-issue-mirror.sh` never applies or removes it (REQ-IFI-029).
- **Acceptance:**
  - Given issue #274 has `status:ready-for-spec` applied
  - When `/spec:start 274` completes scaffold successfully
  - Then `status:ready-for-spec` is removed from issue #274
  - And `status:in-progress` is applied to issue #274
  - Given `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` runs on any subsequent stage
  - Then `status:ready-for-spec` is not re-applied or removed by the script
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R17), resolves P2 Codex finding

---

### Area: Placeholder PR and `/issue:breakdown` interaction

---

#### REQ-IFI-031 — Placeholder PR transitions to integration PR on multi-slice breakdown

- **Pattern:** WHEN `/issue:breakdown` is run on a feature and the breakdown produces multiple implementation slices, the `/issue:breakdown` command shall convert the existing placeholder draft PR into the integration PR and create individual slice PRs as children.
- **Acceptance:**
  - Given a feature has a placeholder draft PR created by `/spec:start`
  - When `/issue:breakdown` is run and identifies more than one implementation slice
  - Then the existing placeholder PR is updated to serve as the integration PR
  - And at least one new slice-specific draft PR is opened against the integration branch
  - And the original placeholder PR is not deleted
- **Priority:** must
- **Satisfies:** RESEARCH-IFI-001 (R8)

---

### Area: `/spec:start` error paths (gaps)

---

#### REQ-IFI-037 — Non-existent issue number fails with actionable error

- **Pattern:** IF `/spec:start <issue-number>` is invoked and the GitHub API returns a 404 for the given issue number, THEN the `/spec:start` command shall print an error naming the issue number and exit without scaffolding.
- **Acceptance:**
  - Given issue #9999 does not exist in the repository
  - When `/spec:start 9999` is run
  - Then the command prints "issue #9999 not found" (or equivalent)
  - And no `specs/` directory, worktree, or PR is created
  - And the exit code is non-zero
- **Priority:** must
- **Satisfies:** resolves Gap-1

---

#### REQ-IFI-038 — Empty or whitespace-only issue title fails with actionable error

- **Pattern:** IF `/spec:start <issue-number>` is invoked and the fetched issue title is empty or contains only whitespace, THEN the `/spec:start` command shall print an error and exit without scaffolding.
- **Acceptance:**
  - Given issue #274 has a title of `"   "` (whitespace only)
  - When `/spec:start 274` is run
  - Then the command prints an error stating the title is unusable for slug derivation
  - And no `specs/` directory, worktree, or PR is created
  - And the exit code is non-zero
- **Priority:** must
- **Satisfies:** resolves Gap-4

---

#### REQ-IFI-039 — Sentinel block written to empty issue body

- **Pattern:** WHEN `scripts/sync-issue-mirror.sh` is run for the first time on an issue with a null or empty body, the script shall write the sentinel block as the entire issue body without prepending or appending any additional content.
- **Acceptance:**
  - Given issue #274 has an empty body
  - When `scripts/sync-issue-mirror.sh adopt-issue-first-interaction-model-274` runs for the first time
  - Then the issue body becomes exactly the sentinel block (markers + thin content)
  - And no extraneous text is added above or below the markers
- **Priority:** must
- **Satisfies:** resolves Gap-6

---

### Area: `workflow-state-template.md` schema update

---

#### REQ-IFI-032 — `issue` field added to workflow-state frontmatter

- **Pattern:** Ubiquitous
- **Statement:** The `workflow-state-template.md` template shall include an optional `issue` frontmatter field that, when set, holds the integer GitHub issue number linked to the workflow run.
- **Acceptance:**
  - Given `templates/workflow-state-template.md` is inspected
  - When the frontmatter is read
  - Then an `issue` key is present, documented as optional
  - And a comment or example shows the value format (integer)
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q3)

---

#### REQ-IFI-033 — `workflow-state.md` populated with issue number on scaffold

- **Pattern:** WHEN `/spec:start <issue-number>` successfully scaffolds a new feature, the generated `workflow-state.md` shall have the `issue` frontmatter field set to the provided issue number.
- **Acceptance:**
  - Given `/spec:start 274` has created `specs/adopt-issue-first-interaction-model-274/workflow-state.md`
  - When the frontmatter of that file is read
  - Then `issue: 274` is present
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (Q3)

---

### Area: Documentation

---

#### REQ-IFI-034 — Issue-first interaction guide published

- **Pattern:** Ubiquitous
- **Statement:** The repository shall contain a `docs/issue-first-interaction.md` file that explains the issue-first entry path, the sentinel block format, the slug derivation rule, and the known limitation that slug does not track issue title renames.
- **Acceptance:**
  - Given `docs/issue-first-interaction.md` exists
  - When a user reads the file
  - Then the file explains: how to open the correct issue form, how to invoke `/spec:start <issue-number>`, the slug derivation rule including the number suffix, how the sentinel block works and its delimiters, and a note that renaming the issue title after workflow start does not update the slug
- **Priority:** must
- **Satisfies:** IDEA-IFI-001, RESEARCH-IFI-001 (RISK-IFI-001, RISK-IFI-008)

---

#### REQ-IFI-035 — CLAUDE.md, AGENTS.md, and specorator.md reference the new entry path

- **Pattern:** Ubiquitous
- **Statement:** The `CLAUDE.md`, `AGENTS.md`, and `docs/specorator.md` files shall each include a reference to the issue-first entry path alongside the existing slash-command and conversational entry points.
- **Acceptance:**
  - Given `CLAUDE.md`, `AGENTS.md`, and `docs/specorator.md` have been updated
  - When each file is read
  - Then each file mentions `/spec:start <issue-number>` as a valid entry point
  - And each file links to or references `docs/issue-first-interaction.md`
- **Priority:** must
- **Satisfies:** IDEA-IFI-001

---

### Area: Memory

---

#### REQ-IFI-036 — Feedback note created for issue-first model

- **Pattern:** Ubiquitous
- **Statement:** The repository shall contain `.claude/memory/feedback_issue_first.md` documenting the issue-first workflow rule, and `.claude/memory/MEMORY.md` shall include a one-line bullet pointing to it.
- **Acceptance:**
  - Given `.claude/memory/feedback_issue_first.md` exists
  - When `.claude/memory/MEMORY.md` is read
  - Then a bullet referencing `feedback_issue_first.md` appears in the Workflow rules section
  - And `feedback_issue_first.md` states the rule that an issue should be opened before running `/spec:start` on Standard-depth tracks
- **Priority:** must
- **Satisfies:** IDEA-IFI-001

---

## Non-functional requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NFR-IFI-001 | reliability | `scripts/sync-issue-mirror.sh` must never propagate a non-zero exit code to the calling stage command | Exit code of the calling stage is unaffected by mirror sync failures in all tested failure scenarios |
| NFR-IFI-002 | reliability | Issue form templates must function correctly on GitHub Enterprise Server 3.9 and later | All three templates render without errors on GHES 3.9+ using only the four universally-supported field types |
| NFR-IFI-003 | correctness | Parsed issue body fields must be validated before any scaffolding action is taken | Zero spec directories are created from a malformed issue body; validation error is emitted to **stderr** before exit |
| NFR-IFI-004 | idempotency | `scripts/bootstrap-labels.sh` run N times against a repository produces the same label state as running it once | Running the script three consecutive times results in zero mutations on the second and third run |
| NFR-IFI-005 | idempotency | `scripts/sync-issue-mirror.sh` run N times against an issue with no workflow stage change produces an identical issue body | Running the script twice in succession without a stage change results in no net change to the issue body |
| NFR-IFI-006 | security | The label-sync CI workflow must declare the minimum required GitHub Actions permission | `sync-labels.yml` declares `permissions: issues: write` and no broader permission unless a separate justification is recorded |
| NFR-IFI-007 | compatibility | The feature must not modify the schema or interface of any existing eleven-stage artifact | All existing `requirements.md`, `spec.md`, `tasks.md`, and related templates remain structurally unchanged after this feature ships |
| NFR-IFI-008 | observability | All non-fatal failure paths in `scripts/sync-issue-mirror.sh` must emit a named warning to stderr | Each failure mode (gh absent, auth failure, missing delimiters, duplicate delimiters) produces a distinct named message on stderr |
| NFR-IFI-009 | maintainability | Issue body parsing logic must be isolated in a single parseable unit so a change to the h3-delimiter convention requires one edit point | The codebase contains exactly one location responsible for parsing the rendered issue body into structured fields |
| NFR-IFI-010 | documentation | The known race condition limitation (concurrent stage completions, last-writer-wins) must be documented | `docs/issue-first-interaction.md` contains a "Known limitations" section that names the race condition and states it is acceptable for v1 small-team usage |

---

## Success metrics

- **North star:** The percentage of new Specorator workflow runs (on Standard-depth tracks) that are started from a linked GitHub issue reaches 80% within 90 days of the feature shipping, measured by the ratio of `workflow-state.md` files containing `issue: <n>` to total new workflow-state files created.
- **Supporting — label coverage:** All eleven stage status labels, three depth labels, and all track labels are present in the repository label set within 24 hours of an adopter running `bootstrap-labels.sh`.
- **Supporting — mirror freshness:** The sentinel block in a linked issue reflects the correct current stage within the same session as each stage completion in all manual test runs.
- **Supporting — zero stage blockage:** No stage in any test or production run fails to complete due to a `sync-issue-mirror.sh` error (the non-fatal exit requirement holds).
- **Counter-metric:** The number of GitHub issues whose sentinel delimiters are corrupted or missing within the first 30 days of the feature shipping should remain at zero. An increase indicates the sentinel guard logic (REQ-IFI-027) is insufficient or the documentation (REQ-IFI-034) is unclear.

---

## Release criteria

- [ ] All `must` requirements (REQ-IFI-001 through REQ-IFI-039 excluding `should`-priority items) pass their acceptance criteria in the test report.
- [ ] REQ-IFI-022 (soft nudge, `should` priority) either passes acceptance or is explicitly waived with a recorded rationale in `review.md`.
- [ ] REQ-IFI-012 (slug override, `should` priority) either passes acceptance or is explicitly waived with a recorded rationale in `review.md`.
- [ ] All NFRs (NFR-IFI-001 through NFR-IFI-010) are met or explicitly waived with an ADR.
- [ ] An ADR covering the sentinel-block mechanism, non-fatal sync contract, and `issue:` frontmatter field is recorded in `docs/adr/` before the Design stage begins.
- [ ] Legacy `.md` issue templates are absent from the repository.
- [ ] `npm run verify` passes in the feature worktree.
- [ ] `docs/issue-first-interaction.md` exists and covers all content specified in REQ-IFI-034.
- [ ] The known race-condition limitation is documented per NFR-IFI-010.
- [ ] Test plan executed; no critical bugs open; test report present.
- [ ] `sites/index.html` updated to reflect the issue-first entry path if that page references the workflow entry points.

---

## Open questions / clarifications

All grill decisions (R1–R20) from issue #274 are locked. R1 revised (number suffix default) incorporated. Seven critical clarifications from `/spec:clarify` resolved in-place (CLAR-IFI-002, -004, -006, -012, -017, -020, -021, -034). Three gap requirements added (REQ-IFI-037–039). Twenty-one deferrable clarifications recorded in `workflow-state.md` for the architect to address in spec.md.

---

## Out of scope

- `spec-discovery.yml` issue template and `track:discovery` label integration — deferred to a follow-up.
- Webhook or daemon automation triggered by label changes — deferred to v2.
- The eleven workflow stage agents and their artifact schemas — must not be modified by this feature.
- Hosted SaaS or server-side components of any kind.
- Enforcement of the issue-first model for Lean or Spike depth workflows — no nudge on those depths.
- Automatic closing of the GitHub issue by Specorator — issue lifecycle remains under human control.
- Issue sub-tasks or GitHub Projects board integration.

---

## Quality gate

- [x] Goals and non-goals explicit.
- [x] Personas / stakeholders named.
- [x] Jobs to be done captured.
- [x] Every functional requirement uses EARS and has an ID.
- [x] Acceptance criteria testable.
- [x] NFRs listed with targets.
- [x] Success metrics defined (including a counter-metric).
- [x] Release criteria stated.
- [x] No open clarifications — all grill decisions locked from issue #274.
