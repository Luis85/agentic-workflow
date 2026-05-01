# Resume protocol

orchestrate skill must survive crashes, branch switches, long pauses. State lives in `specs/<slug>/workflow-state.md` (per `templates/workflow-state-template.md`); resume = read file, pick next pending stage.

Canonical workflow `status` enum: **`active | blocked | paused | done`** (set in YAML frontmatter). No invent values outside enum — other commands/skills parse state via documented schema.

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

Treat each status:

- **`active`** — resumable. Default candidate for "what's next?".
- **`paused`** — resumable. User paused explicit; orchestrator pause gate set this.
- **`blocked`** — surface blocker (from `## Blocks` section), ask user: proceed anyway, address blocker, or pause.
- **`done`** — do **not** auto-resume; `/spec:retro` set this when workflow finished. Offer "start new feature" instead. If user types slug explicit, ask: amend (start related new workflow) or just inspect.

## Decision flow

Picker considers all **resumable** statuses (`active`, `paused`, `blocked`) — never just `active`. User who paused feature then asks "what's next?" must see it offered.

1. **One resumable feature, no `$ARGUMENTS`:** offer resume as recommended option (annotate current status), plus "Start new feature" alternative.
2. **Multiple resumable features:** list each as `AskUserQuestion` option (annotate status), sort by `last_updated` desc. If >4, offer top 3 plus "Start new feature". Sort `active` ahead of `paused`, `paused` ahead of `blocked` on `last_updated` tie.
3. **`$ARGUMENTS` matches known slug:** resume that one no ask, regardless of resumable status. (For `done` slugs, follow `done` rule above, confirm intent first.)
4. **`$ARGUMENTS` is goal phrase, no match:** propose derive slug, start fresh.
5. **No resumable features, no `$ARGUMENTS`:** ask for goal.

## On resume

After pick feature to resume:

1. Read full `workflow-state.md`, report one-line summary to user (current stage, status, last agent, last update).
2. Read most recent stage artifact to confirm complete (no trust state alone — file may be deleted or edited).
3. Determine next pending stage from **YAML `artifacts:` map in frontmatter** (canonical machine-readable source per `templates/workflow-state-template.md` line 8). Human-readable status table below frontmatter is *view*, may drift; if table and frontmatter disagree, trust frontmatter, surface inconsistency to user. Walk `artifacts:` map in stage order, treat `complete` and `skipped` as passable; next stage = one whose owning artifact(s) still `pending`, `in-progress`, or `blocked`.
4. Ask via `AskUserQuestion`: `Continue from <next stage>` (Recommended) / `Re-run <current stage>` / `Run /spec:analyze first` / `Pause`.
5. On Continue, jump to Step 4 of `SKILL.md`. On Re-run, dispatch current stage slash command with feedback. On Pause, set `status: paused` in `workflow-state.md`, stop. (To abandon feature outright, user delete `specs/<slug>/` folder manually — schema no include `cancelled` status.)

## What not to do on resume

- **Don't** re-run earlier stages "to refresh context" — stage subagent reads upstream artifacts itself.
- **Don't** silent skip stage upstream marked `pending` — confirm with user.
- **Don't** mutate `workflow-state.md` beyond orchestrator-owned `status` field and free-form `## Hand-off notes` appends; stage transitions and artifact-status updates owned by slash commands.
- **Don't** invent frontmatter fields outside schema (`active | blocked | paused | done` for workflow status; `pending | in-progress | complete | skipped | blocked` for artifact status).
- **Don't** auto-resume `done` feature even if user types slug — confirm: amend or start related new one.

## Crash recovery

If artifact in `workflow-state.md` shows `in-progress` but file never written and `last_updated` older than typical stage runtime (~1 hour), assume previous orchestrator run crashed mid-stage. Surface to user:

> "The last run appears to have crashed during `<stage>` at `<timestamp>`. Do you want to re-run it from scratch, or has work since been done that I should re-detect?"

Offer two safe options only:

- `Re-run <stage>` (Recommended) — overwrite/re-run stage clean.
- `Inspect manually first` — exit so user can examine working tree, reconstruct partial work.

Do **not** offer "mark complete and continue" here. Artifact file missing on disk, resume logic downstream trusts artifact statuses to pick next stage; flip status to `complete` without actual file lets workflow advance with required inputs absent, silent corrupt later stages. If user genuine has off-disk work that should count as artifact, they must paste/reconstruct into artifact file first, then re-run stage to validate.