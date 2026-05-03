---
title: "issue-breakdown-bot — operator notes"
folder: "agents/operational/issue-breakdown-bot"
description: "Operator entry point for the headless issue-breakdown routine triggered by the `breakdown-me` label."
entry_point: true
---
# issue-breakdown-bot — operator notes

This is the operator‑facing companion to [`PROMPT.md`](./PROMPT.md). The prompt is what the routine loads; this file explains how to wire and observe it.

## What it does

Headless variant of the interactive `/issue:breakdown` conductor (`.claude/skills/issue-breakdown/SKILL.md`). Triggered when the `breakdown-me` label is added to a GitHub issue. Decomposes a feature whose `tasks.md` is `complete` into one independent draft PR per parallelisable batch, edits the parent issue body to add a sentinel‑bracketed `## Work packages` checklist, opens a housekeeping PR with the audit log + hand‑off note, comments on the issue with the slice PR numbers, and removes the `breakdown-me` label.

The bot prompt is **stand‑alone** — it does not import the interactive conductor. Both surfaces are kept in sync by sharing the design spec at [`docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`](../../../docs/superpowers/specs/2026-05-02-issue-breakdown-design.md). See ADR-0022 ([`docs/adr/0022-add-issue-breakdown-track.md`](../../../docs/adr/0022-add-issue-breakdown-track.md)).

## Why a separate bot from the interactive conductor

The interactive `/issue:breakdown` conductor gates with `AskUserQuestion` and is single‑user‑per‑terminal by construction. The bot is headless: it auto‑picks the conservative branch on every gate and refuses (rather than guessing) on any ambiguity that the interactive conductor would surface for a user decision. Differences are enumerated in [`PROMPT.md`](./PROMPT.md) under "Behaviour differences".

## Outputs

- **Per slice:** one draft PR. Title `feat(<area>): <goal> (slice <NN>/<N>)`. Body carries the `<!-- issue-breakdown-slice: issue-<n>-<NN> -->` HTML comment for idempotency. One empty `chore(<area>): scaffold T-<AREA>-NNN slice` commit, no source diff.
- **Per run (success):** one `## Work packages` block injected into the parent issue body inside the `<!-- BEGIN issue-breakdown:<slug> -->` … `<!-- END issue-breakdown:<slug> -->` sentinel; one `chore(issue-breakdown): record run for issue #<n>` non‑draft housekeeping PR carrying the audit log + hand‑off note appends; one closing comment on the issue summarising the slice PRs and the housekeeping PR; `breakdown-me` label removed.
- **Per run (refusal):** one comment on the issue explaining the refusal cause; the `breakdown-me` label is **retained** so the issue is visibly stuck and re‑labelling triggers a re‑run after the operator fixes the cause.

## Setup checklist

Per‑project, before the first run:

1. **Create the `breakdown-me` label** on the repo.
2. **Keep the write-capable runner disabled by default.** The shipped workflow's default `placeholder` job only has `issues: write` permission and comments when the label is applied. It cannot push branches or open PRs.
3. **Wire a Claude Code runner.** Replace the guarded `Refuse until a model runner is wired` step in [`.github/workflows/issue-breakdown-bot.yml`](../../../.github/workflows/issue-breakdown-bot.yml) with your team's preferred Claude Code action (e.g. `anthropics/claude-code-action`), pointing it at [`PROMPT.md`](./PROMPT.md) and the issue payload from `${GITHUB_EVENT_PATH}`. Keep the workflow's trigger / `if:` / `concurrency` blocks unchanged. Keep the broader `contents: write` / `pull-requests: write` job permissions only on the gated runner job.
4. **Provision environment secrets.** Create the `issue-breakdown-bot` GitHub environment and store `ANTHROPIC_API_KEY` (or equivalent) there. Add reviewers or wait timers if your repo wants human approval before the write-capable runner receives the model secret. The runner uses `${{ secrets.GITHUB_TOKEN }}` for `gh` calls.
5. **Enable the write-capable runner intentionally.** Set repository variable `ISSUE_BREAKDOWN_BOT_ENABLED=true` only after the model runner step, environment, and secret are in place. Until that variable is set, applying `breakdown-me` cannot mint a write-capable token.
6. **Run with `DRY_RUN=1` once** (set `env: DRY_RUN: "1"` on the runner step) before enabling for real. Read the stdout dump in the Actions log.
7. **(Optional) Adopt the same trusted‑bot pattern as `dep-triage-bot`** if your repo restricts who may apply the `breakdown-me` label. The bot itself does not validate the labeller's identity — branch protection / label permissions are the trust boundary.

## How findings get closed

Each slice PR's body contains:

```
Refs #<issue-number>
<!-- issue-breakdown-slice: issue-<issue-number>-<NN> -->
```

GitHub's native task‑list‑link feature auto‑strikes the matching `- [ ] #<PRn>` entry in the parent issue's `## Work packages` block when the PR closes. The bot itself never edits the parent issue body after the initial run — re‑runs replace the sentinel block contents idempotently.

## Tuning

- **Trigger.** Default is `issues: types: [labeled]` filtered to `breakdown-me`. Some teams add `issue_comment` triggers for slash‑command‑on‑comment ergonomics — keep the `concurrency.group` keyed per issue if you do.
- **Concurrency.** `cancel-in-progress: false`. Two runs against the same issue queue rather than race the parent‑issue body edit. Do **not** flip this to `true` — `gh issue edit --body` is last‑write‑wins and not safe to interrupt mid‑write.
- **Permissions.** Default label-triggered runs stay on the low-permission placeholder path (`issues: write` only). The write-capable `decompose` job is gated by repository variable `ISSUE_BREAKDOWN_BOT_ENABLED=true`, uses the `issue-breakdown-bot` environment for model secrets, and should stay disabled until a real model runner and environment secret are configured.
- **Branch prefix.** Slice branches are `feat/*`; the housekeeping branch is `chore/*`. Both must be permitted by branch protection. The integration branch (`main` or `develop`, auto‑detected) is push‑denied per `.claude/settings.json` for local Claude — the workflow runs under `${{ secrets.GITHUB_TOKEN }}` and inherits branch protection from the GitHub side.
- **Fallback parser.** The bot uses the same liberal parser as the interactive conductor — accepts both the canonical `templates/tasks-template.md` shape *and* the legacy pre‑template shape (no emojis, hyphen separator, missing optional anchors). Drift in the template does not break the bot.

## Cost / noise tradeoff

A run on a feature with N parallelisable batches opens N draft PRs + 1 housekeeping PR + 1 issue comment + 1 issue edit. Empty PRs trigger the verify gate in CI but are no‑op (zero source diff). Real cost lives in the slice PRs once implementers pick them up. Don't enable this routine until your team has the bandwidth to actually pick up parallel slices — orphaned drafts pile up fast.

## See also

- [`.claude/skills/issue-breakdown/SKILL.md`](../../../.claude/skills/issue-breakdown/SKILL.md) — the interactive conductor (same contract, different surface).
- [`.claude/agents/issue-breakdown.md`](../../../.claude/agents/issue-breakdown.md) — the specialist subagent the interactive conductor dispatches.
- [`docs/issue-breakdown-track.md`](../../../docs/issue-breakdown-track.md) — methodology doc.
- [`docs/adr/0022-add-issue-breakdown-track.md`](../../../docs/adr/0022-add-issue-breakdown-track.md) — ADR.
- [`docs/superpowers/specs/2026-05-02-issue-breakdown-design.md`](../../../docs/superpowers/specs/2026-05-02-issue-breakdown-design.md) — design spec (Phase 1 + Phase 2).
- [`docs/branching.md`](../../../docs/branching.md) — Shape A vs Shape B integration branches.
- [`feedback_no_main_commits.md`](../../../.claude/memory/feedback_no_main_commits.md) — the rule the bot honours by branching off `<integration-branch>`.
