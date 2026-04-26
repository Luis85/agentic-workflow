# review-fix — turn a review finding into an isolated worktree + plan

## Purpose

Take a single finding from an automated review (the `reviewer` agent, an external review bot, or a manual `review.md` line item) and set up a fully isolated workspace for fixing it: a dedicated worktree, a topic branch, and a one‑page plan in `docs/plans/`.

This skill **owns plan creation only**. The agent then refines the plan, implements via TDD, runs verify, opens a PR, and lets the maintainer (or autonomous‑merge rule) merge.

## When to invoke

- The user names a specific finding ID (e.g. `R-API-007`, or a sha7‑prefixed `<sha7>.<idx>` from an external review bot).
- The user runs `/review-fix <id>` — single‑finding mode.
- The user runs `/review-fix` with no argument — sweep mode: process every still‑open finding from the most recent review.

## Pre‑flight checks (refuse if any fail)

1. The finding ID must exist in the source review artifact (`specs/<feature>/review.md`, an open tracker issue with the review label, etc.). Refuse free‑text descriptions.
2. The finding must not already be marked shipped (`[x]` and a PR/issue reference).
3. The target worktree path `.worktrees/fix-review-<slug>` must not already exist. If it does, the prior fix is in flight — do not clobber.
4. The integration branch must be reachable. `git fetch origin` first.

## How to use

For each finding in scope:

1. **Slugify** the finding's headline into kebab‑case, max ~40 chars. Prefix with `review-` for clarity.
2. **Create the worktree:**

   ```bash
   git worktree add .worktrees/fix-review-<slug> \
     -b fix/review-<slug> origin/<integration-branch>
   ```

3. **Bootstrap the worktree** for the project (`npm ci`, `uv sync`, `bundle install`, …). The verify skill assumes deps are installed.
4. **Scaffold the plan** at `docs/plans/<YYYY-MM-DD>-review-<slug>.md` using `templates/idea-template.md` adapted for a fix:
   - **Finding:** the original ID + verbatim quote.
   - **Diagnosis:** what's wrong, with file:line references.
   - **Approach:** the smallest change that fixes it.
   - **Test plan:** the failing test that demonstrates the bug, then the fix.
   - **Risk + rollback:** what could break, how to revert.
5. **Don't write code yet.** Plan only. The agent reviews the plan with the user, then proceeds to TDD.

## After the fix is implemented

The agent (not this skill) handles:

- Run the verify gate ([`verify`](../verify/SKILL.md)).
- Open the PR; include the canonical magic line in the PR body so the source review can auto‑flip. **Format must match exactly** (single space after the `#<number>`):
  ```
  Refs #<review-issue-number> finding:<sha7>.<idx>
  ```
  This is the same string the [`review-bot/PROMPT.md`](../../../agents/operational/review-bot/PROMPT.md#auto-flip-on-merge) "Auto‑flip on merge" section parses. Any deviation (`Refs <name>`, double space, missing `#`) breaks the auto‑flip.
- Wait for review approval + clean state, then merge per [`feedback_autonomous_merge.md`](../../memory/feedback_autonomous_merge.md).

## Post‑merge cleanup

```bash
git worktree remove .worktrees/fix-review-<slug>
git branch -d fix/review-<slug>      # from the main checkout
git worktree prune                   # if needed
```

## Reporting

**Single‑finding mode:**

```
Set up fix for <id>:
  worktree: .worktrees/fix-review-<slug>
  branch:   fix/review-<slug>
  plan:     docs/plans/<YYYY-MM-DD>-review-<slug>.md

Next: refine the plan, then implement via TDD inside the worktree.
```

**Sweep mode:** one of the above blocks per finding, plus a count summary at the end.

## Do not

- Do **not** close the source review issue or edit its body. The auto‑flip on merge handles that.
- Do **not** batch multiple findings into one PR. One finding, one PR — see [`feedback_pr_hygiene.md`](../../memory/feedback_pr_hygiene.md).
- Do **not** force‑create the branch (`-B`). If the branch already exists, the prior fix is in flight.
- Do **not** start implementation in this skill. Plan only.
