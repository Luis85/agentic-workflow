# review-bot — operator notes

This is the operator‑facing companion to [`PROMPT.md`](./PROMPT.md). The prompt is what the routine loads; this file explains how to schedule and observe it.

## What it does

Runs daily against the integration branch. For every commit that landed since the last run, it produces an adversarial review and files findings on a single GitHub issue labelled `review-bot`. Optionally also commits a daily Markdown digest under `docs/daily-reviews/`.

## Outputs

- **GitHub issue:** title `Daily review YYYY-MM-DD — <head-sha7>`, label `review-bot`, body is a checklist where each item has a stable ID `<sha7>.<idx>`.
- **Optional daily digest:** `docs/daily-reviews/YYYY-MM-DD.md`, opened via a docs‑only PR. CI for that PR can skip the heavy verify stages (the diff is docs‑only) but should still run format check and security scans.

## How findings get closed

When a fix PR's body contains:

```
Refs #<review-issue-number> finding:<sha7>.<idx>
```

a project‑specific GitHub Action ticks `[x]` next to that checklist item on the issue and links the closing PR. The bot itself never edits prior issues — separation of writes makes the routine safe to retry.

## Setup checklist

Per‑project, before the first scheduled run:

1. Create the `review-bot` label.
2. (Optional) Add the `review-fix-shipped` GitHub Action that auto‑flips checklist items on merge. A starter is in [`.github/workflows/`](../../../.github/workflows/) — adopt as needed.
3. Wire the verify gate (`docs/verify-gate.md`) so the digest PR's CI is fast.
4. Run `DRY_RUN=1` twice manually before scheduling — once on a quiet day, once on a busy day — and read the stdout dump.
5. Update branch protection so the digest PR's CI gate is the only required check (or none at all — docs‑only diffs).
6. Schedule the run (typical: 06:00 UTC weekdays).

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
