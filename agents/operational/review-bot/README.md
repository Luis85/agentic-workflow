---
title: "review-bot — operator notes"
folder: "agents/operational/review-bot"
description: "Operator entry point for daily review scheduling, scope, and outputs."
entry_point: true
---
# review-bot — operator notes

This is the operator‑facing companion to [`PROMPT.md`](./PROMPT.md). The prompt is what the routine loads; this file explains how to schedule and observe it.

## What it does

Runs daily against the integration branch. For every commit that landed since the last run, it produces an adversarial review and files findings on a single GitHub issue labelled `review-bot`. **The routine is purely read‑only — it never opens a PR, commits a digest, or edits any file.**

## Outputs

- **GitHub issue:** title `Daily review YYYY-MM-DD — <head-sha7>`, label `review-bot`, body is a checklist where each item has a stable ID `<sha7>.<idx>`.

A separate optional pattern — committing a daily Markdown digest at `docs/daily-reviews/YYYY-MM-DD.md` — is described in [`docs/daily-reviews/README.md`](../../../docs/daily-reviews/README.md). That is **not** done by this routine; projects wanting a Markdown archive must implement it as a separate scheduled job (or commit by hand).

## How findings get closed

When a fix PR's body contains:

```
Refs #<review-issue-number> finding:<sha7>.<idx>
```

a project‑specific GitHub Action ticks `[x]` next to that checklist item on the issue and links the closing PR. The bot itself never edits prior issues — separation of writes makes the routine safe to retry.

## Setup checklist

Per‑project, before the first scheduled run:

1. Create the `review-bot` label.
2. (Optional) Author a `review-fix-shipped` GitHub Action that auto‑flips checklist items on merge. The contract is documented in [`PROMPT.md`](./PROMPT.md) ("Auto‑flip on merge" section) — implementation is project‑specific and is **not** scaffolded by this template. A starter may be added to a project's own `.github/workflows/` once the bot is adopted.
3. Run `DRY_RUN=1` twice manually before scheduling — once on a quiet day, once on a busy day — and read the stdout dump.
4. Schedule the run (typical: 06:00 UTC weekdays).

## Tuning

- **Cadence.** Daily is the default. Slower (weekly) means findings accumulate; faster (per‑push) usually generates more noise than signal.
- **Severity floor.** The prompt suppresses `[NIT]`s by default. Loosen to `[MINOR]` if your team wants more coverage.
- **Scope.** The default scope is the integration branch only. Some teams add the prior PR set as well; keep an eye on issue length if you do.

## Cost / noise tradeoff

A daily review on a busy repo can produce 5–15 findings per run. Most are `[MINOR]`. Without a follow‑through process (the `review-fix` skill, owner triage), the issue label fills up and gets ignored. Don't enable this routine until you have a follow‑through plan.

## See also

- [`.claude/skills/review-fix/SKILL.md`](../../../.claude/skills/review-fix/SKILL.md) — the consumer that turns one of these findings into an isolated worktree + plan.
- [`docs/branching.md`](../../../docs/branching.md) — what "integration branch" means here.
- [`feedback_pr_hygiene.md`](../../../.claude/memory/feedback_pr_hygiene.md) — the rules a fix PR must follow.
