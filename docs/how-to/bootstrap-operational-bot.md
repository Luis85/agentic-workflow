# How to bootstrap a new operational bot

**Goal:** add a new bot under `agents/operational/<name>/` with the eight-section common shape, wired to the project's scheduling harness.

**When to use:** you have a recurring repo task — drift detection, dep triage, plan reconciliation, alert triage — that should run on a cron, not on demand.

**Prerequisites:**

- A clear answer to: what input the bot reads, what output it produces, on what cadence, and what severity scale it uses.
- An existing bot you can mirror (e.g. [`agents/operational/docs-review-bot/`](../../agents/operational/docs-review-bot/)).
- Working tree on a topic branch.

## Steps

1. Pick a slug. Convention — `<area>-<verb>-bot` (e.g. `pr-triage-bot`, `dep-bump-bot`).
2. Create `agents/operational/<slug>/` with two files: `PROMPT.md` (the source of truth the scheduled run loads) and `README.md` (the contributor-facing docs).
3. Open [`agents/operational/README.md`](../../agents/operational/README.md) and read the eight-section common shape. The required sections in `PROMPT.md` are — Role, Scope this run, Severity, What to flag, Process, Hard rules, Output, Idempotency, Failure handling, Dry-run mode, Do not.
4. Fill each section. Use the canonical four-tier severity scale (`[BLOCKER]` / `[MAJOR]` / `[MINOR]` / `[NIT]`) unless you have a documented reason to specialise it.
5. Wire the cron. Add a workflow under `.github/workflows/` modelled on the existing bots' workflows. The schedule is part of the workflow file, not the prompt.
6. Run a dry-run by setting the env var the bot uses (commonly `DRY_RUN=1`). Confirm output goes to stdout, not the live sink (issue, Slack, etc.).
7. Add the new bot to the index list in `agents/operational/README.md` — same row shape as the existing entries.
8. Commit; open a PR.

## Verify

`ls agents/operational/<slug>/` shows both `PROMPT.md` and `README.md`; the dry-run produces a non-empty plausible output; the new workflow file appears under `.github/workflows/`; the index in `agents/operational/README.md` lists the bot.

## Related

- Reference — [`agents/operational/README.md`](../../agents/operational/README.md) — the eight-section shape and severity scale.
- Reference — [`agents/operational/`](../../agents/operational/) — existing bots as examples.
- Explanation — [`docs/specorator.md`](../specorator.md) — where operational agents fit relative to lifecycle agents.
