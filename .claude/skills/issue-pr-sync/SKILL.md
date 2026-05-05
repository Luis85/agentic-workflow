---
name: issue-pr-sync
description: >
  Shared skill invoked by stage conductors (Stages 2–6) and /issue:breakdown as a non-fatal last step.
  Reads draft_pr + issue_number from workflow-state.md and updates both the draft PR body and the issue
  PRD sentinel block with the just-completed stage's artifact. No-op when draft_pr is absent.
  No slash command — invoked by other conductors only.
---

# issue-pr-sync

Shared sync primitive. No slash command. Conductors invoke this as their **last step** after stage work completes.

## When to invoke

- After each stage conductor (Stages 2–6: `spec:research`, `spec:requirements`, `spec:design`, `spec:specify`, `spec:tasks`) completes its primary work.
- After `/issue:breakdown` Step 10.5 (housekeeping commit).
- **Never** invoked directly by the user. **Never** invoked by `/spec:idea` (Stage 1).

## Pre-condition check (no-op gate)

Read `specs/<slug>/workflow-state.md`. If `draft_pr` field is absent or empty, **exit silently** — this feature has not run `/issue:draft`. No warning, no side-effects.

## Inputs

Calling conductor passes:

| Input | Source |
|---|---|
| `draft_pr` | `workflow-state.md` — PR number (integer) |
| `issue_number` | `workflow-state.md` — GitHub issue number (integer) |
| `slug` | Feature slug (e.g. `auth`) |
| `stage` | Stage just completed (e.g. `research`, `requirements`, `design`, `specify`, `tasks`, `breakdown`) |
| `artifact_path` | Path to the new artifact (e.g. `specs/<slug>/requirements.md`) |

## Steps

### 1 — Verify draft PR still open

```bash
gh pr view <draft_pr> --json state --jq '.state'
```

If output is not `OPEN`, emit a warning: "draft PR #<n> is not open — skipping issue-pr-sync. Close the PR manually or update `draft_pr` in `workflow-state.md`." Return without further action.

### 2 — Fetch current PR body

```bash
gh pr view <draft_pr> --json body --jq '.body'
```

### 3 — Render updated PR body

Locate the `<!-- BEGIN issue-draft-pr:<slug> --> … <!-- END issue-draft-pr:<slug> -->` sentinel block.

Update `**Current stage:**` to the just-completed stage name.

Update the matching `- <Stage>: *(pending)*` line in the Spec lineage section to:

```
- <Stage>: `<artifact_path>`
```

If the stage is `breakdown`: add a human-readable note after the sentinel block (outside it):
```
*Implementation has moved to slice PRs. This draft PR is ready to close.*
```
Also populate the Tasks line with the slice PR list provided by `/issue:breakdown`.

**Sentinel block is always fully overwritten** — this is the always-overwrite contract (idempotent on re-run).

Preserve everything outside the sentinel block unchanged, especially the `## Open questions / feedback welcome` free-form section.

### 4 — Write updated PR body

```bash
# Render to staging file
mkdir -p .issue-draft-staging
# write rendered body to .issue-draft-staging/pr-<draft_pr>.md
gh pr edit <draft_pr> --body-file .issue-draft-staging/pr-<draft_pr>.md
rm .issue-draft-staging/pr-<draft_pr>.md
```

### 5 — Fetch current issue body

```bash
gh issue view <issue_number> --json body --jq '.body'
```

### 6 — Render updated issue PRD section

Locate the `<!-- BEGIN issue-draft:<slug> --> … <!-- END issue-draft:<slug> -->` sentinel block.

Update the section for the just-completed stage:

| Stage | Section updated |
|---|---|
| `research` | `## Research` — link to `specs/<slug>/research.md` |
| `requirements` | `## Requirements` — link to `specs/<slug>/requirements.md` with key REQ IDs if available |
| `design` | `## Design` — link to `specs/<slug>/design.md` |
| `specify` | `## Spec` — link to `specs/<slug>/spec.md` |
| `tasks` | `## Tasks & work packages` — link to `specs/<slug>/tasks.md` |
| `breakdown` | `## Tasks & work packages` — replace with `*See ## Work packages below (managed by /issue:breakdown).*` |

**Sentinel block always overwritten** — same always-overwrite contract.

Preserve everything outside the sentinel block.

### 7 — Write updated issue body

```bash
# write rendered body to .issue-draft-staging/issue-<issue_number>.md
gh issue edit <issue_number> --body-file .issue-draft-staging/issue-<issue_number>.md
rm .issue-draft-staging/issue-<issue_number>.md
```

Attempt `rmdir .issue-draft-staging` (will succeed silently if now empty, fail silently if not).

## Failure handling

Any `gh` command failure (auth, rate limit, network): emit a **warning** prefixed with `[issue-pr-sync] WARNING:` and **return without aborting the calling conductor**. The stage completion is not rolled back. Sync can be recovered by re-running the stage conductor (idempotent always-overwrite).

## Sentinel coexistence

Both `/issue:draft` (`<!-- BEGIN issue-draft:<slug> -->`) and `/issue:breakdown` (`<!-- BEGIN issue-breakdown:<slug> -->`) may place sentinel blocks in the same issue body. Their tags differ — they coexist without conflict. When invoked by `/issue:breakdown`, this skill updates the `issue-draft` sentinel's Tasks section to defer to the `issue-breakdown` block.

## References

- Methodology: `docs/issue-draft-track.md`.
- Design spec: `docs/superpowers/specs/2026-05-04-issue-draft-track-design.md`.
- Templates: `templates/issue-prd-template.md`, `templates/issue-draft-pr-body-template.md`.
