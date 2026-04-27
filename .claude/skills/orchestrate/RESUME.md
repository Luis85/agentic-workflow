# Resume protocol

The orchestrate skill must survive crashes, branch switches, and long pauses. State lives in `specs/<slug>/workflow-state.md` (per `templates/workflow-state-template.md`); resuming is a matter of reading that file and picking the next pending stage.

The canonical workflow `status` enum is **`active | blocked | paused | done`** (set in the YAML frontmatter). Do not invent values outside this enum — other commands and skills parse state using the documented schema.

## Detection

On invocation, list candidate features:

```bash
for f in specs/*/workflow-state.md; do
  [ -f "$f" ] || continue
  slug=$(basename "$(dirname "$f")")
  status=$(awk '/^status:/ {print $2}' "$f" | head -1)
  stage=$(awk '/^current_stage:/ {print $2}' "$f" | head -1)
  updated=$(awk '/^last_updated:/ {print $2}' "$f" | head -1)
  printf "%-40s %-12s %-15s %s\n" "$slug" "$status" "$stage" "$updated"
done
```

How to treat each status:

- **`active`** — resumable. Default candidate for "what's next?".
- **`paused`** — resumable. The user explicitly paused; the orchestrator's pause gate sets this.
- **`blocked`** — surface the blocker (from the `## Blocks` section) and ask the user whether to proceed anyway, address the blocker, or pause.
- **`done`** — do **not** auto-resume; `/spec:retro` set this when the workflow finished. Offer "start new feature" instead. If the user explicitly types the slug, ask whether they want to amend (start a related new workflow) or just inspect.

## Decision flow

The picker considers all **resumable** statuses (`active`, `paused`, `blocked`) — never just `active`. A user who paused a feature and later asks "what's next?" must see it offered.

1. **One resumable feature, no `$ARGUMENTS`:** offer to resume it as the recommended option (annotate with its current status), plus "Start new feature" alternative.
2. **Multiple resumable features:** list each as an `AskUserQuestion` option (annotated with status), sorted by `last_updated` desc. If there are >4, offer the top 3 plus "Start new feature". Sort `active` ahead of `paused`, and `paused` ahead of `blocked` when `last_updated` ties.
3. **`$ARGUMENTS` matches a known slug:** resume that one without asking, regardless of resumable status. (For `done` slugs, follow the `done` rule above and confirm intent first.)
4. **`$ARGUMENTS` is a goal phrase, no match:** propose deriving a slug and starting fresh.
5. **No resumable features and no `$ARGUMENTS`:** ask for the goal.

## On resume

After picking a feature to resume:

1. Read the full `workflow-state.md` and report a one-line summary to the user (current stage, status, last agent, last update).
2. Read the most recent stage's artifact to confirm it actually completed (don't trust state alone — the file may have been deleted or edited).
3. Determine the next pending stage from the **YAML `artifacts:` map in the frontmatter** (the canonical machine-readable source per `templates/workflow-state-template.md` line 8). The human-readable status table below the frontmatter is a *view* and may drift; if the table and the frontmatter disagree, trust the frontmatter and surface the inconsistency to the user. Walk the `artifacts:` map in stage order, treating `complete` and `skipped` as passable; the next stage is the one whose owning artifact(s) are still `pending`, `in-progress`, or `blocked`.
4. Ask via `AskUserQuestion`: `Continue from <next stage>` (Recommended) / `Re-run <current stage>` / `Run /spec:analyze first` / `Pause`.
5. On Continue, jump to Step 4 of `SKILL.md`. On Re-run, dispatch the current stage's slash command with feedback. On Pause, set `status: paused` in `workflow-state.md` and stop. (To abandon a feature outright, the user can delete the `specs/<slug>/` folder manually — the schema does not include a `cancelled` status.)

## What not to do on resume

- **Don't** re-run earlier stages "to refresh context" — the stage subagent reads upstream artifacts itself.
- **Don't** silently skip a stage that the upstream marked `pending` — confirm with the user.
- **Don't** mutate `workflow-state.md` beyond the orchestrator-owned `status` field and free-form `## Hand-off notes` appends; stage transitions and artifact-status updates are owned by the slash commands.
- **Don't** invent frontmatter fields outside the schema (`active | blocked | paused | done` for workflow status; `pending | in-progress | complete | skipped | blocked` for artifact status).
- **Don't** auto-resume a `done` feature even if the user types its slug — confirm whether they want to amend or start a related new one.

## Crash recovery

If an artifact in `workflow-state.md` shows `in-progress` but the file was never written and `last_updated` is older than the typical stage runtime (~1 hour), assume the previous orchestrator run crashed mid-stage. Surface this to the user:

> "The last run appears to have crashed during `<stage>` at `<timestamp>`. Do you want to re-run it from scratch, or has work since been done that I should re-detect?"

Offer two safe options only:

- `Re-run <stage>` (Recommended) — overwrite/re-run the stage cleanly.
- `Inspect manually first` — exit so the user can examine the working tree and reconstruct any partial work.

Do **not** offer "mark complete and continue" here. The artifact file is missing on disk, and resume logic downstream trusts artifact statuses to pick the next stage; flipping the status to `complete` without an actual file would let the workflow advance with required inputs absent, silently corrupting later stages. If the user genuinely has off-disk work that should count as the artifact, they must paste/reconstruct it into the artifact file first, then re-run the stage to validate.
