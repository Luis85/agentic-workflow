---
title: "dep-triage-bot — operator notes"
folder: "agents/operational/dep-triage-bot"
description: "Operator entry point for dependency triage scheduling, scope, and outputs."
entry_point: true
---
# dep-triage-bot — operator notes

Companion to [`PROMPT.md`](./PROMPT.md).

## What it does

Triages every open dependency‑update PR (Dependabot, Renovate, …). Auto‑merges the safe ones, leaves the risky ones for the owner with a clear comment, blocks anything that fails the verify gate. One summary issue per run.

## Outputs

- Per PR: comment + idempotency marker.
- Per run: summary issue (`dep-triage-bot` label) when at least one PR was triaged.

## Setup checklist

1. Create the `dep-triage-bot` label.
2. Configure your dependency tool (Dependabot config in `.github/dependabot.yml`, or Renovate config) so PRs land with consistent titles.
3. Define `ROUTINE_GH_LOGIN` so the routine knows which login is "itself" (PAT user vs. bot user).
4. **Define `TRUSTED_DEP_BOT_LOGINS`** — comma‑separated allowlist of dependency-bot author logins (e.g. `dependabot[bot],renovate[bot]`). The routine **refuses to run** without this. Without an identity allowlist, body-shape matching alone would let a spoofed PR walk all the way to the auto-merge decision after running the attacker's `postinstall` scripts on the privileged runner. See [`PROMPT.md`](./PROMPT.md#trusted-bot-allowlist) for the full rationale.
5. Run `DRY_RUN=1` against a busy day's PR list before enabling auto‑merge.
6. Schedule daily during weekdays (typical: 09:00 UTC).

## Tuning

- **Auto‑merge floor.** Default = dev‑deps patch/minor. Loosen to runtime‑patch only if your test coverage is high enough that you trust verify alone.
- **Approval policy for runtime patches.** Default = comment only, owner merges. Some teams flip this to auto‑merge for runtime patches with high CI coverage; do this only after a few weeks of observation.
- **Major bumps.** Always owner‑review by default. Do not loosen.

## Cost / noise tradeoff

Dependency PRs are pure noise on a quiet day and a small flood on a busy week. The bot's value is preventing the flood from sitting unmerged. Skip this bot on a project with no scheduled dependency tool.

## See also

- [`docs/verify-gate.md`](../../../docs/verify-gate.md) — the contract verify must satisfy for this bot's "verify green" decision to be trustworthy.
- [`feedback_autonomous_merge.md`](../../../.claude/memory/feedback_autonomous_merge.md) — the constitutional basis for this bot being allowed to merge at all.
